// Pinned ATS 8.0.0 adaptation; all upstream Apache-2.0 notices remain intact.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const hash = value => createHash('sha256').update(value).digest('hex');
const marker = "// HoldBook: managed wallet compatibility patch; see docs/evidence/023-nova-implementation.md.\n";
export const walletPatches = [
  {
    "path": "build/esm/src/index.js",
    "originalSha256": "c5649a7b3ed8d193906aa1cad053b2409aac5448034d38119d8dc9e6db34c153",
    "patchedSha256": "ec928a6b46678352d209a82f19b3d7bb2c2f090a480c0c5a20f98504c6977604",
    "edits": [],
    "append": "export { default as SetConfigurationRequest } from \"./port/in/request/management/SetConfigurationRequest\";\n"
  },
  {
    "path": "build/esm/src/index.d.ts",
    "originalSha256": "48a20bb92f6dae6bce54560da0f905640f6b10698b4465db79ebdc66bb0c334b",
    "patchedSha256": "2e1d059a94dd577326212b9d2e855acdd0db126700e8ecfe14be9ca535032560",
    "edits": [],
    "append": "export { default as SetConfigurationRequest } from \"./port/in/request/management/SetConfigurationRequest\";\n"
  },
  {
    "path": "build/esm/src/port/in/network/Network.js",
    "originalSha256": "cab5c16ebca7a7bc8354e4bf1e0730344d400767b11b448539d656568f518b06",
    "patchedSha256": "9def83b413e9e880187e8623f9a0fbc033015ba4eeec5aea7ef55017d3ce9a2b",
    "edits": [
      [
        "async connect(req) {",
        "async connect(req, options) {"
      ],
      [
        "        await this.commandBus.execute(new SetNetworkCommand(req.network, req.mirrorNode, req.rpcNode));",
        "        await this.commandBus.execute(new SetNetworkCommand(req.network, req.mirrorNode, req.rpcNode));\n        if (options?.provider) {\n            if (req.wallet !== SupportedWallets.METAMASK || !account?.evmAddress || req.debug || req.custodialWalletSettings || req.hwcSettings) throw new Error(\"Invalid managed MetaMask connection\");\n            const adapter = Injectable.resolve(RPCTransactionAdapter);\n            try { return await adapter.registerManaged(account, options.provider); }\n            catch (error) { await adapter.stop(); throw error; }\n        }"
      ]
    ],
    "append": ""
  },
  {
    "path": "build/esm/src/port/in/network/Network.d.ts",
    "originalSha256": "3e927c384e1ef70cddf090dc0f291975385e270628ee26b4f6af27b16b599cd0",
    "patchedSha256": "3780d5bcfa198c14b7bcf2bd3dc57622aad8611636f4476a6ac54b023aaf94b6",
    "edits": [
      [
        "interface INetworkInPort {\n    connect(req: ConnectRequest): Promise<InitializationData>;",
        "interface INetworkInPort {\n    connect(req: ConnectRequest, options?: { provider: import(\"ethers\").BrowserProvider }): Promise<InitializationData>;"
      ],
      [
        "    init(req: InitializationRequest): Promise<SupportedWallets[]>;\n    connect(req: ConnectRequest): Promise<InitializationData>;",
        "    init(req: InitializationRequest): Promise<SupportedWallets[]>;\n    connect(req: ConnectRequest, options?: { provider: import(\"ethers\").BrowserProvider }): Promise<InitializationData>;"
      ]
    ],
    "append": ""
  },
  {
    "path": "build/esm/src/port/out/rpc/RPCTransactionAdapter.js",
    "originalSha256": "a6c023fa328268fecc54309d9192a0301aad51e5c7e9f22767513eeba2eb27e0",
    "patchedSha256": "7a9b1ff87a2d3c54264ccae441b53cf6028a4de617143b1909d3e895fa90ff71",
    "edits": [
      [
        "        this.metamaskService = new MetamaskService(this.eventService, this.commandBus, this.networkService, this.mirrorNodeAdapter);\n        this.metamaskService.registerMetamaskEvents();",
        "        this.metamaskService = new MetamaskService(this.eventService, this.commandBus, this.networkService, this.mirrorNodeAdapter);"
      ],
      [
        "    async init(debug = false) {",
        "    async init(debug = false) {\n        this.metamaskService.registerMetamaskEvents();"
      ],
      [
        "    async register(account, debug = false) {",
        "    async registerManaged(account, provider) {\n        // Bound unchanged SDK Mirror reads on this managed connection.\n        this.mirrorNodeAdapter.instance.defaults.timeout = 10000;\n        return this.metamaskService.registerManaged(this, account, provider);\n    }\n    async register(account, debug = false) {\n        this.metamaskService.registerMetamaskEvents();"
      ]
    ],
    "append": ""
  },
  {
    "path": "build/esm/src/port/out/rpc/RPCTransactionAdapter.d.ts",
    "originalSha256": "6b06c7cbcc19773622c632b27890e630e93348236eb1dd068e620bc76f15db42",
    "patchedSha256": "3c6f310e9bd9eaf604503926b1b9c67723fab9c5ffe1f8858d0d1c519f804630",
    "edits": [
      [
        "    init(debug?: boolean): Promise<string>;",
        "    registerManaged(account: Account, provider: import(\"ethers\").BrowserProvider): Promise<InitializationData>;\n    init(debug?: boolean): Promise<string>;"
      ]
    ],
    "append": ""
  },
  {
    "path": "build/esm/src/app/service/wallet/metamask/MetamaskService.js",
    "originalSha256": "b6118f7c3469082c556abdb8f8713a4b8f13e3f88721c40b237e4cd155958f2e",
    "patchedSha256": "bd663fcdb0164f10872d939b210b8d586653dbd8608beede719c1c0bce5f6264",
    "edits": [
      [
        "    signerOrProvider;",
        "    signerOrProvider;\n    managedProvider;\n    eventsRegistered = false;"
      ],
      [
        "    async stop() {",
        "    async registerManaged(handler, account, provider) {\n        Injectable.registerTransactionHandler(handler);\n        this.managedProvider = provider;\n        this.account = account;\n        this.signerOrProvider = await provider.getSigner(account.evmAddress.toString());\n        return { account: this.account };\n    }\n    async stop() {\n        if (this.managedProvider) {\n            this.managedProvider.destroy();\n            this.managedProvider = undefined;\n            this.signerOrProvider = undefined;\n            this.account = undefined;\n            return true;\n        }"
      ],
      [
        "    registerMetamaskEvents() {",
        "    registerMetamaskEvents() {\n        if (this.eventsRegistered) return;"
      ],
      [
        "            const ethereum = globalThis.window.ethereum;",
        "            const ethereum = globalThis.window.ethereum;\n            this.eventsRegistered = true;"
      ]
    ],
    "append": ""
  },
  {
    "path": "build/esm/src/app/service/wallet/metamask/MetamaskService.d.ts",
    "originalSha256": "2ca8a8b545054864bc620b1ec4ddc3fd91b533b175119489b33898f9050b038c",
    "patchedSha256": "a4ef9904e8cd1c6810e24d6676f7e7cfb94d7b753209bf53ac1ff2a8d87c52c8",
    "edits": [
      [
        "    private signerOrProvider;",
        "    private signerOrProvider;\n    private managedProvider;\n    private eventsRegistered;"
      ],
      [
        "    stop(): Promise<boolean>;",
        "    registerManaged(handler: TransactionAdapter, account: Account, provider: import(\"ethers\").BrowserProvider): Promise<InitializationData>;\n    stop(): Promise<boolean>;"
      ]
    ],
    "append": ""
  },
  {
    "path": "build/cjs/src/index.js",
    "originalSha256": "1cbf3cbdb641e2c09b0b3d518425349b146975a6fc60e6ca712bb2ef4cab3e95",
    "patchedSha256": "ed5f032baf6bda9c308c7678bd32d7c81a9666004dd6fe9f46defe53296660e0",
    "edits": [],
    "append": "Object.defineProperty(exports, \"SetConfigurationRequest\", { enumerable: true, get: function () { return require(\"./port/in/request/management/SetConfigurationRequest\").default; } });\n"
  },
  {
    "path": "build/cjs/src/index.d.ts",
    "originalSha256": "48a20bb92f6dae6bce54560da0f905640f6b10698b4465db79ebdc66bb0c334b",
    "patchedSha256": "2e1d059a94dd577326212b9d2e855acdd0db126700e8ecfe14be9ca535032560",
    "edits": [],
    "append": "export { default as SetConfigurationRequest } from \"./port/in/request/management/SetConfigurationRequest\";\n"
  },
  {
    "path": "build/cjs/src/port/in/network/Network.js",
    "originalSha256": "d999cd7dd04bb89d93d0cca417b294b5af84b170aa977f819a300ca460ef42c6",
    "patchedSha256": "804cb178728aef95a402560cde388c51dc11d46dea24b48c59633d98a4d1662d",
    "edits": [
      [
        "async connect(req) {",
        "async connect(req, options) {"
      ],
      [
        "        await this.commandBus.execute(new SetNetworkCommand_1.SetNetworkCommand(req.network, req.mirrorNode, req.rpcNode));",
        "        await this.commandBus.execute(new SetNetworkCommand_1.SetNetworkCommand(req.network, req.mirrorNode, req.rpcNode));\n        if (options?.provider) {\n            if (req.wallet !== ConnectRequest_1.SupportedWallets.METAMASK || !account?.evmAddress || req.debug || req.custodialWalletSettings || req.hwcSettings) throw new Error(\"Invalid managed MetaMask connection\");\n            const adapter = Injectable_1.default.resolve(RPCTransactionAdapter_1.RPCTransactionAdapter);\n            try { return await adapter.registerManaged(account, options.provider); }\n            catch (error) { await adapter.stop(); throw error; }\n        }"
      ]
    ],
    "append": ""
  },
  {
    "path": "build/cjs/src/port/in/network/Network.d.ts",
    "originalSha256": "3e927c384e1ef70cddf090dc0f291975385e270628ee26b4f6af27b16b599cd0",
    "patchedSha256": "3780d5bcfa198c14b7bcf2bd3dc57622aad8611636f4476a6ac54b023aaf94b6",
    "edits": [
      [
        "interface INetworkInPort {\n    connect(req: ConnectRequest): Promise<InitializationData>;",
        "interface INetworkInPort {\n    connect(req: ConnectRequest, options?: { provider: import(\"ethers\").BrowserProvider }): Promise<InitializationData>;"
      ],
      [
        "    init(req: InitializationRequest): Promise<SupportedWallets[]>;\n    connect(req: ConnectRequest): Promise<InitializationData>;",
        "    init(req: InitializationRequest): Promise<SupportedWallets[]>;\n    connect(req: ConnectRequest, options?: { provider: import(\"ethers\").BrowserProvider }): Promise<InitializationData>;"
      ]
    ],
    "append": ""
  },
  {
    "path": "build/cjs/src/port/out/rpc/RPCTransactionAdapter.js",
    "originalSha256": "7ff9fedf4d403e9baf960389257aa4e71f7bf75b16076e3693168c668fc6c32c",
    "patchedSha256": "d8f83d6e4d4dbe7270449968dff29fb53d88f9d4679c9b5b1d30f077dbce37cc",
    "edits": [
      [
        "        this.metamaskService = new MetamaskService_1.default(this.eventService, this.commandBus, this.networkService, this.mirrorNodeAdapter);\n        this.metamaskService.registerMetamaskEvents();",
        "        this.metamaskService = new MetamaskService_1.default(this.eventService, this.commandBus, this.networkService, this.mirrorNodeAdapter);"
      ],
      [
        "    async init(debug = false) {",
        "    async init(debug = false) {\n        this.metamaskService.registerMetamaskEvents();"
      ],
      [
        "    async register(account, debug = false) {",
        "    async registerManaged(account, provider) {\n        // Bound unchanged SDK Mirror reads on this managed connection.\n        this.mirrorNodeAdapter.instance.defaults.timeout = 10000;\n        return this.metamaskService.registerManaged(this, account, provider);\n    }\n    async register(account, debug = false) {\n        this.metamaskService.registerMetamaskEvents();"
      ]
    ],
    "append": ""
  },
  {
    "path": "build/cjs/src/port/out/rpc/RPCTransactionAdapter.d.ts",
    "originalSha256": "6b06c7cbcc19773622c632b27890e630e93348236eb1dd068e620bc76f15db42",
    "patchedSha256": "3c6f310e9bd9eaf604503926b1b9c67723fab9c5ffe1f8858d0d1c519f804630",
    "edits": [
      [
        "    init(debug?: boolean): Promise<string>;",
        "    registerManaged(account: Account, provider: import(\"ethers\").BrowserProvider): Promise<InitializationData>;\n    init(debug?: boolean): Promise<string>;"
      ]
    ],
    "append": ""
  },
  {
    "path": "build/cjs/src/app/service/wallet/metamask/MetamaskService.js",
    "originalSha256": "ab7218afd0b8fc5c2642d73353203d757ab96c66f2dadc60874301c643f6c001",
    "patchedSha256": "42b6b55622abc373dfc19ed9ead2193966d0a2f827d4e7dae51545865e35d2e6",
    "edits": [
      [
        "    signerOrProvider;",
        "    signerOrProvider;\n    managedProvider;\n    eventsRegistered = false;"
      ],
      [
        "    async stop() {",
        "    async registerManaged(handler, account, provider) {\n        Injectable_1.default.registerTransactionHandler(handler);\n        this.managedProvider = provider;\n        this.account = account;\n        this.signerOrProvider = await provider.getSigner(account.evmAddress.toString());\n        return { account: this.account };\n    }\n    async stop() {\n        if (this.managedProvider) {\n            this.managedProvider.destroy();\n            this.managedProvider = undefined;\n            this.signerOrProvider = undefined;\n            this.account = undefined;\n            return true;\n        }"
      ],
      [
        "    registerMetamaskEvents() {",
        "    registerMetamaskEvents() {\n        if (this.eventsRegistered) return;"
      ],
      [
        "            const ethereum = globalThis.window.ethereum;",
        "            const ethereum = globalThis.window.ethereum;\n            this.eventsRegistered = true;"
      ]
    ],
    "append": ""
  },
  {
    "path": "build/cjs/src/app/service/wallet/metamask/MetamaskService.d.ts",
    "originalSha256": "2ca8a8b545054864bc620b1ec4ddc3fd91b533b175119489b33898f9050b038c",
    "patchedSha256": "a4ef9904e8cd1c6810e24d6676f7e7cfb94d7b753209bf53ac1ff2a8d87c52c8",
    "edits": [
      [
        "    private signerOrProvider;",
        "    private signerOrProvider;\n    private managedProvider;\n    private eventsRegistered;"
      ],
      [
        "    stop(): Promise<boolean>;",
        "    registerManaged(handler: TransactionAdapter, account: Account, provider: import(\"ethers\").BrowserProvider): Promise<InitializationData>;\n    stop(): Promise<boolean>;"
      ]
    ],
    "append": ""
  }
];

export function patchAtsWallet(directory = fileURLToPath(new URL('../node_modules/@hashgraph/asset-tokenization-sdk/', import.meta.url)), checkOnly = false) {
  const manifest = JSON.parse(readFileSync(join(directory, 'package.json')));
  assert.equal(manifest.name, '@hashgraph/asset-tokenization-sdk');
  assert.equal(manifest.version, '8.0.0', 'Only pinned ATS 8.0.0 may be patched');
  // Validate every file before writing any; a partial prior application is recoverable.
  const pending = walletPatches.map(entry => {
    const file = join(directory, entry.path), source = readFileSync(file, 'utf8');
    const digest = hash(source);
    if (digest === entry.patchedSha256) return { file, source, changed: false };
    assert.equal(digest, entry.originalSha256, `Unexpected SDK file: ${entry.path}`);
    assert.equal(checkOnly, false, `Managed SDK patch missing: ${entry.path}`);
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
  console.log(JSON.stringify(patchAtsWallet(undefined, process.argv.includes('--check'))));
}
