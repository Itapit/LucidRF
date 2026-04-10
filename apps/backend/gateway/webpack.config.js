const { NxAppWebpackPlugin } = require('@nx/webpack/app-plugin');
const { join } = require('path');

module.exports = {
  resolve: {
    alias: {
      '@LucidRF/api-clients': join(__dirname, '../../../libs/backend/api-clients/src/index.ts'),
      '@LucidRF/backend-common': join(__dirname, '../../../libs/backend/backend-common/src/index.ts'),
      '@LucidRF/common': join(__dirname, '../../../libs/common/src/index.ts'),
      '@LucidRF/files-contracts': join(__dirname, '../../../libs/backend/files-contracts/src/index.ts'),
      '@LucidRF/teams-contracts': join(__dirname, '../../../libs/backend/teams-contracts/src/index.ts'),
      '@LucidRF/ui': join(__dirname, '../../../libs/frontend/ui/src/index.ts'),
      '@LucidRF/users-contracts': join(__dirname, '../../../libs/backend/users-contracts/src/index.ts'),
    },
  },
  output: {
    path: join(__dirname, '../../../dist/apps/backend/gateway'),
    ...(process.env.NODE_ENV !== 'production' && {
      devtoolModuleFilenameTemplate: '[absolute-resource-path]',
    }),
  },
  plugins: [
    new NxAppWebpackPlugin({
      target: 'node',
      compiler: 'tsc',
      main: './src/main.ts',
      tsConfig: './tsconfig.app.json',
      assets: ['./src/assets'],
      optimization: false,
      outputHashing: 'none',
      generatePackageJson: true,
      sourceMaps: true,
      transformers: [
        {
          name: '@nestjs/swagger/plugin',
          options: {
            dtoFileNameSuffix: ['.dto.ts', '.entity.ts'],
            controllerFileNameSuffix: ['.controller.ts'],
            classValidatorShim: true,
            introspectComments: true,
          },
        },
      ],
    }),
  ],
};
