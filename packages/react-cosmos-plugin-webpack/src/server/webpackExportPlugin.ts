import { ExportPluginArgs } from 'react-cosmos';
import webpack, { StatsCompilation } from 'webpack';
import { getWebpack } from './getWebpack.js';
import { getExportWebpackConfig } from './webpackConfig/getExportWebpackConfig.js';

export async function webpackExportPlugin({ config }: ExportPluginArgs) {
  const userWebpack = getWebpack(config.rootDir);
  if (!userWebpack) {
    return;
  }

  const webpackConfig = await getExportWebpackConfig(config, userWebpack);
  try {
    await runWebpackCompiler(userWebpack, webpackConfig);
  } catch (err) {
    const webpackError = err as WebpackCompilationError;
    if (webpackError.webpackErrors) {
      webpackError.webpackErrors.forEach(error => {
        console.error(`${error}\n`);
      });
    }
    throw webpackError;
  }
}

function runWebpackCompiler(
  userWebpack: typeof webpack,
  webpackConfig: webpack.Configuration
) {
  return new Promise((resolve, reject) => {
    const compiler = userWebpack(webpackConfig);
    compiler.run((err, stats) => {
      if (err) {
        reject(err);
      } else if (stats?.hasErrors()) {
        const error = new WebpackCompilationError();
        error.webpackErrors = stats.toJson().errors;
        reject(error);
      } else {
        resolve(stats);
      }
    });
  });
}

class WebpackCompilationError extends Error {
  webpackErrors?: StatsCompilation['StatsError'][];
  constructor() {
    super('Webpack errors occurred');
  }
}
