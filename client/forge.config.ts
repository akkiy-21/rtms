import type { ForgeConfig } from '@electron-forge/shared-types';
import { MakerSquirrel } from '@electron-forge/maker-squirrel';
import { MakerZIP } from '@electron-forge/maker-zip';
import { MakerDeb } from '@electron-forge/maker-deb';
import { MakerRpm } from '@electron-forge/maker-rpm';
import { AutoUnpackNativesPlugin } from '@electron-forge/plugin-auto-unpack-natives';
import { WebpackPlugin } from '@electron-forge/plugin-webpack';
import { FusesPlugin } from '@electron-forge/plugin-fuses';
import { FuseV1Options, FuseVersion } from '@electron/fuses';
import * as fs from 'fs';
import * as path from 'path';

import { mainConfig } from './webpack.main.config';
import { rendererConfig } from './webpack.renderer.config';

const config: ForgeConfig = {
  packagerConfig: {
    asar: true,
    extraResource: [
      './resources/bridge_x64_win',
      './resources/bridge_aarch64_linux'
    ],
  },
  hooks: {
    packageAfterCopy: async (_config, buildPath, _electronVersion, _platform, _arch) => {
      // Linux/macOS用のブリッジスクリプトに実行権限を付与
      const bridgePaths = [
        path.join(buildPath, 'resources', 'bridge_aarch64_linux', 'main.bin'),
        path.join(buildPath, 'resources', 'bridge_x64_linux', 'main.bin'),
        path.join(buildPath, 'resources', 'bridge_aarch64_darwin', 'main.bin'),
      ];

      for (const bridgePath of bridgePaths) {
        if (fs.existsSync(bridgePath)) {
          fs.chmodSync(bridgePath, 0o755);
          console.log(`Set executable permission for: ${bridgePath}`);
        }
      }
    },
  },
  rebuildConfig: {},
  makers: [
    new MakerSquirrel({}),
    new MakerZIP({}, ['darwin', 'linux']), // Linuxでもtar.gzを生成
    //new MakerRpm({
    //  options: {
    //    categories: ['Utility'],
    //  },
    //}),
    //new MakerDeb({}),
  ],
  plugins: [
    new AutoUnpackNativesPlugin({}),
    new WebpackPlugin({
      mainConfig,
      renderer: {
        config: rendererConfig,
        entryPoints: [
          {
            html: './src/index.html',
            js: './src/renderer.tsx',
            name: 'main_window',
            preload: {
              js: './src/preload.ts',
            },
          },
        ],
      },
    }),
    // Fuses are used to enable/disable various Electron functionality
    // at package time, before code signing the application
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
    }),
  ],
};

export default config;
