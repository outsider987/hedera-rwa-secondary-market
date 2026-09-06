// Pinned ATS 8.0.0 compatibility patch; upstream files retain Apache-2.0 notices.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const hash = value => createHash('sha256').update(value).digest('hex');
const marker = "// HoldBook: local read-only compatibility patch; see docs/evidence/017-sdk-readonly-trial.md.\n";
export const patches = [
  {
    "path": "build/esm/src/port/in/request/index.js",
    "originalSha256": "98c5961e0cb9f50273bb0da18d4efb7c061752816e32a6ca7fbe33c86aef6d29",
    "patchedSha256": "35f6f13842b13c3c006198513987799a1999ea7b3dff9f470cae6a1f761ce4e8",
    "edits": [],
    "append": "export { default as SetNetworkRequest } from \"./network/SetNetworkRequest\";\n"
  },
  {
    "path": "build/esm/src/port/in/request/index.d.ts",
    "originalSha256": "779c61b81bde8deaa5d6dd5bb1fc71492d378c8030c63cbc36a81f537bc56b43",
    "patchedSha256": "8633f9b97b8a6af6ac567e4a0f1b5c59f821c5ac6d7e4435e3e4b16e685e62bd",
    "edits": [],
    "append": "export { default as SetNetworkRequest } from \"./network/SetNetworkRequest\";\n"
  },
  {
    "path": "build/esm/src/domain/context/network/JsonRpcRelay.d.ts",
    "originalSha256": "45ac88578f51d23db077d99c8b0ec5ec027ac9e0e1e7148b092a102225c41a3e",
    "patchedSha256": "1cb5db20c576117292644ca2cc06b9df0d0fa7f6bcdd6cd0a389cdd22f37e90b",
    "edits": [
      [
        "    baseUrl: string;",
        "    baseUrl: string;\n    queryProvider?: import(\"ethers\").JsonRpcProvider;"
      ]
    ],
    "append": ""
  },
  {
    "path": "build/esm/src/port/out/rpc/RPCQueryAdapter.js",
    "originalSha256": "acb44b8e50493195e2f3d775f96428e49ef7107ab949509a14f303593c763592",
    "patchedSha256": "cef719cc850b00a415e38db6c7ff660d56e624668a6cff7c4953868397724a13",
    "edits": [
      [
        "async init(urlRpcProvider, apiKey)",
        "async init(urlRpcProvider, apiKey, queryProvider)"
      ],
      [
        "this.provider = new ethers.JsonRpcProvider(url);",
        "this.provider = queryProvider ?? new ethers.JsonRpcProvider(url);"
      ]
    ],
    "append": ""
  },
  {
    "path": "build/esm/src/port/out/rpc/RPCQueryAdapter.d.ts",
    "originalSha256": "e198a76353141bc5f64f5a9317f535d8f2cfd9f4c5c8c64c6f27ade86c8260fa",
    "patchedSha256": "873fabf25d255d210e5e0244254cf29e8f9ddeb683e2071172a83881a4191227",
    "edits": [
      [
        "init(urlRpcProvider?: string, apiKey?: string)",
        "init(urlRpcProvider?: string, apiKey?: string, queryProvider?: ethers.JsonRpcProvider)"
      ]
    ],
    "append": ""
  },
  {
    "path": "build/esm/src/app/usecase/command/network/setNetwork/SetNetworkCommandHandler.js",
    "originalSha256": "6969255d6ea25c76f34eac6dbfbccf98396f96389f7136851838236725721837",
    "patchedSha256": "3df21501a9fa8e9d13c131a9b0300b3c7eaf538e7773d29e42f625174ca8db73",
    "edits": [
      [
        ".init(this.networkService.rpcNode.baseUrl, this.networkService.rpcNode.apiKey)",
        ".init(this.networkService.rpcNode.baseUrl, this.networkService.rpcNode.apiKey, this.networkService.rpcNode.queryProvider)"
      ]
    ],
    "append": ""
  },
  {
    "path": "build/cjs/src/port/in/request/index.js",
    "originalSha256": "1880d64921d7336c81a15f6d48f75a7717e5bcfd900fb1292b0cc5ad393f1604",
    "patchedSha256": "89192d4eeef38b5eb5b1683d6e106fcf2f446f2e77eda0b73e4c3d5163ba2ba4",
    "edits": [],
    "append": "Object.defineProperty(exports, \"SetNetworkRequest\", { enumerable: true, get: function () { return require(\"./network/SetNetworkRequest\").default; } });\n"
  },
  {
    "path": "build/cjs/src/port/in/request/index.d.ts",
    "originalSha256": "779c61b81bde8deaa5d6dd5bb1fc71492d378c8030c63cbc36a81f537bc56b43",
    "patchedSha256": "8633f9b97b8a6af6ac567e4a0f1b5c59f821c5ac6d7e4435e3e4b16e685e62bd",
    "edits": [],
    "append": "export { default as SetNetworkRequest } from \"./network/SetNetworkRequest\";\n"
  },
  {
    "path": "build/cjs/src/domain/context/network/JsonRpcRelay.d.ts",
    "originalSha256": "45ac88578f51d23db077d99c8b0ec5ec027ac9e0e1e7148b092a102225c41a3e",
    "patchedSha256": "1cb5db20c576117292644ca2cc06b9df0d0fa7f6bcdd6cd0a389cdd22f37e90b",
    "edits": [
      [
        "    baseUrl: string;",
        "    baseUrl: string;\n    queryProvider?: import(\"ethers\").JsonRpcProvider;"
      ]
    ],
    "append": ""
  },
  {
    "path": "build/cjs/src/port/out/rpc/RPCQueryAdapter.js",
    "originalSha256": "681567cd82062a11f8ef81fbb52ea123e4bd6d941884ed868a0493f23f3a4bfb",
    "patchedSha256": "fffb7271ccc7a7cddaa10162e57e0d2c0bd4cea3ad4ca1ff513f83818741cbf2",
    "edits": [
      [
        "async init(urlRpcProvider, apiKey)",
        "async init(urlRpcProvider, apiKey, queryProvider)"
      ],
      [
        "this.provider = new ethers_1.ethers.JsonRpcProvider(url);",
        "this.provider = queryProvider ?? new ethers_1.ethers.JsonRpcProvider(url);"
      ]
    ],
    "append": ""
  },
  {
    "path": "build/cjs/src/port/out/rpc/RPCQueryAdapter.d.ts",
    "originalSha256": "e198a76353141bc5f64f5a9317f535d8f2cfd9f4c5c8c64c6f27ade86c8260fa",
    "patchedSha256": "873fabf25d255d210e5e0244254cf29e8f9ddeb683e2071172a83881a4191227",
    "edits": [
      [
        "init(urlRpcProvider?: string, apiKey?: string)",
        "init(urlRpcProvider?: string, apiKey?: string, queryProvider?: ethers.JsonRpcProvider)"
      ]
    ],
    "append": ""
  },
  {
    "path": "build/cjs/src/app/usecase/command/network/setNetwork/SetNetworkCommandHandler.js",
    "originalSha256": "653fb40211ae371a2c23e535f1ce8a0d5347f4069fc1f6e76e7163baa9ea44cc",
    "patchedSha256": "e70c0b499ae0b3da3451a78afeb3ec8f8c7d535baf0f1a4b6273522dccd649b8",
    "edits": [
      [
        ".init(this.networkService.rpcNode.baseUrl, this.networkService.rpcNode.apiKey)",
        ".init(this.networkService.rpcNode.baseUrl, this.networkService.rpcNode.apiKey, this.networkService.rpcNode.queryProvider)"
      ]
    ],
    "append": ""
  }
];

export function patchAtsReadonly(directory = fileURLToPath(new URL('../node_modules/@hashgraph/asset-tokenization-sdk/', import.meta.url)), checkOnly = false) {
  const manifest = JSON.parse(readFileSync(join(directory, 'package.json')));
  assert.equal(manifest.name, '@hashgraph/asset-tokenization-sdk');
  assert.equal(manifest.version, '8.0.0', 'Only pinned ATS 8.0.0 may be patched');
  // Validate every file before writing any; a partial prior application is recoverable.
  const pending = patches.map(entry => {
    const file = join(directory, entry.path), source = readFileSync(file, 'utf8');
    const digest = hash(source);
    if (digest === entry.patchedSha256) return { file, source, changed: false };
    assert.equal(digest, entry.originalSha256, `Unexpected SDK file: ${entry.path}`);
    assert.equal(checkOnly, false, `SDK patch missing: ${entry.path}`);
    let output = source;
    for (const [before, after] of entry.edits) {
      assert.equal(output.split(before).length, 2, `Patch anchor: ${entry.path}`);
      output = output.replace(before, after);
    }
    output = marker + output + entry.append;
    assert.equal(hash(output), entry.patchedSha256, `Patch output: ${entry.path}`);
    return { file, source: output, changed: true };
  });
  for (const item of pending) if (item.changed) writeFileSync(item.file, item.source);
  return { version: manifest.version, checked: pending.length, changed: pending.filter(item => item.changed).length };
}
if (import.meta.main) {
  assert.ok(process.argv.slice(2).every(arg => arg === '--check'), 'Only --check is supported');
  console.log(JSON.stringify(patchAtsReadonly(undefined, process.argv.includes('--check'))));
}
