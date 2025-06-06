import path from 'node:path';
import {
  CosmosConfig,
  getCliArgs,
  importModule,
  moduleExists,
} from 'react-cosmos';
import webpack from 'webpack';
import { createWebpackCosmosConfig } from '../cosmosConfig/createWebpackCosmosConfig.js';
import { getDefaultWebpackConfig } from './getDefaultWebpackConfig.js';
import { getWebpackNodeEnv } from './getWebpackNodeEnv.js';

type WebpackConfig =
  | webpack.Configuration
  // Mirror webpack API for config functions
  // https://webpack.js.org/configuration/configuration-types/#exporting-a-function
  | ((
      env: unknown,
      _argv: {}
    ) => webpack.Configuration | Promise<webpack.Configuration>);

// Override arguments are inspired by react-app-rewired
// https://github.com/timarney/react-app-rewired/blob/b673379d32fe7b57c71667f4827f3b16e3717363/scripts/start.js#L22
type WebpackOverride = (
  baseConfig: webpack.Configuration,
  env: string
) => webpack.Configuration;

export async function getUserWebpackConfig(
  config: CosmosConfig,
  userWebpack: typeof webpack
) {
  const baseWebpackConfig = await getBaseWebpackConfig(config, userWebpack);
  const { overridePath } = createWebpackCosmosConfig(config);

  if (!overridePath || !moduleExists(overridePath)) {
    console.log(
      `[Cosmos] Learn how to override Webpack config for Cosmos: https://reactcosmos.org/docs/getting-started/webpack#webpack-config-override`
    );
    return baseWebpackConfig;
  }

  const relPath = path.relative(process.cwd(), overridePath);
  console.log(`[Cosmos] Overriding Webpack config at ${relPath}`);

  const module = await importModule<{ default: WebpackOverride }>(overridePath);
  const webpackOverride = module.default;

  return webpackOverride(baseWebpackConfig, getWebpackNodeEnv());
}

async function getBaseWebpackConfig(
  config: CosmosConfig,
  userWebpack: typeof webpack
) {
  const { rootDir } = config;
  const { configPath } = createWebpackCosmosConfig(config);

  if (!configPath || !moduleExists(configPath)) {
    console.log('[Cosmos] Using default Webpack config');
    return getDefaultWebpackConfig(userWebpack, rootDir);
  }

  const relPath = path.relative(process.cwd(), configPath);
  console.log(`[Cosmos] Using Webpack config found at ${relPath}`);

  const module = await importModule<{ default: WebpackConfig }>(configPath);
  const webpackConfig = module.default;

  // The --env flag matches the webpack CLI convention
  // https://webpack.js.org/api/cli/#env
  const cliArgs = getCliArgs();
  return typeof webpackConfig === 'function'
    ? await webpackConfig(cliArgs.env || getWebpackNodeEnv(), cliArgs)
    : webpackConfig;
}
