// Regenerate the two pinned packages from their original published schemas.
// Uses upstream pbjs flags; generated files remain in node_modules, not Git.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { readFileSync, writeFileSync, globSync, mkdtempSync, rmSync } from 'node:fs';
import { basename, dirname, join, relative, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const require = createRequire(join(root, 'package.json'));
const hash = value => createHash('sha256').update(value).digest('hex');
const inventory = JSON.parse(readFileSync(join(root,
  'docs/evidence/007-t01a-protobuf-rebuild-source-inventory.json'))).packages;

assert.equal(require('protobufjs-cli/package.json').version, '1.3.3');
assert.equal(require('protobufjs/package.json').version, '7.6.6');
for (const [name, version] of [['@hashgraph/sdk', '2.64.5'], ['@hiero-ledger/sdk', '2.79.0']]) {
  const manifest = require.resolve(`${name}/package.json`);
  assert.equal(require(manifest).version, version);
  assert.equal(createRequire(manifest)('protobufjs/package.json').version, '7.6.6');
}
const packages = inventory.map(entry => {
  const manifest = require.resolve(`${entry.name}/package.json`);
  const folder = dirname(manifest);
  assert.equal(require(manifest).version, entry.version);
  assert.equal(createRequire(manifest)('protobufjs/package.json').version, '7.6.6');
  const files = globSync('src/proto/**/*.proto', { cwd: folder }).sort();
  assert.deepEqual(files, entry.schemas.map(file => file.path).sort(), `${entry.name}: schema inventory`);
  for (const file of entry.schemas) {
    assert.equal(hash(readFileSync(join(folder, file.path))), file.sha256,
      `${entry.name}/${file.path}: original schema required`);
  }
  // The upstream unquoted ** pattern first undergoes shell expansion. For the
  // old archive it selects one directory level; in the flat archive it reaches
  // pbjs unexpanded. Retain all referenced deeper schemas through import loading.
  const shellMatches = globSync('src/proto/*/*.proto', { cwd: folder }).sort();
  const namespace = `${entry.name.startsWith('@hashgraph') ? 'hashgraph' : 'hiero'}_${entry.version.replaceAll('.', '_')}`;
  return { entry, folder, files, namespace, inputs: shellMatches.length ? shellMatches : files };
});

const pbjs = require('protobufjs-cli/pbjs');
const staging = mkdtempSync(join(tmpdir(), 'holdbook-proto-output-'));
const outputs = [];
const importMappings = [];
const loadedSchemas = [];
try {
  // Stage every output before replacing either package's generated files.
  for (const { entry, folder, files, namespace, inputs } of packages) {
    const paths = files.map(file => join(folder, file));
    const schema = new (require('protobufjs').Root)();
    schema.resolvePath = (origin, target) => {
      const direct = resolve(dirname(origin), target);
      if (paths.includes(direct)) return direct;
      let matches = paths.filter(path => path.endsWith(`/${target}`));
      if (!matches.length) matches = paths.filter(path => basename(path) === basename(target));
      assert.equal(matches.length, 1, `${entry.name}: unresolved or ambiguous import ${target}`);
      importMappings.push({ package: entry.name, from: relative(folder, origin),
        requested: target, resolved: relative(folder, matches[0]) });
      return matches[0];
    };
    // pbjs accepts reflection JSON; this preserves the parsed original schemas
    // while resolving only unambiguous files from the verified archive inventory.
    const descriptor = join(staging, `${outputs.length}.json`);
    schema.loadSync(inputs.map(file => join(folder, file))).resolveAll();
    loadedSchemas.push({ package: entry.name, namespace, inputs, loaded: schema.files.map(path =>
      path.startsWith(folder) ? relative(folder, path) : path).sort() });
    writeFileSync(descriptor, JSON.stringify(schema.toJSON({ keepComments: true })));
    for (const [wrapper, target] of [['es6', 'src/proto.js'], ['commonjs', 'lib/proto.js']]) {
      const output = join(staging, `${outputs.length}.js`);
      // Runtime deduplication must not merge the two packages' private registries.
      const args = ['-r', namespace, '-t', 'static-module', '-w', wrapper,
        '--force-long', '--no-beautify',
        '--no-convert', '--no-delimited', '--no-verify', '-o', output,
        descriptor];
      await new Promise((resolve, reject) => pbjs.main(args, error => error ? reject(error) : resolve()));
      const code = readFileSync(output);
      outputs.push({ path: join(folder, target), code });
    }
  }
  for (const { path, code } of outputs) writeFileSync(path, code);
  process.stdout.write(JSON.stringify({ compiler: 'protobufjs-cli 1.3.3', runtime: '7.6.6',
    importMappingCount: importMappings.length,
    packages: loadedSchemas.map(({ package: name, namespace, inputs, loaded }) =>
      ({ name, namespace, inputs: inputs.length, loaded: loaded.length })),
    outputs: outputs.map(({ path, code }) => ({ path: relative(root, path), sha256: hash(code), bytes: code.length })),
  }) + '\n');
} finally {
  rmSync(staging, { recursive: true, force: true });
}
