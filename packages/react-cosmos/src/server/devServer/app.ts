import express from 'express';
import resolveFrom from 'resolve-from';
import { CosmosConfig } from '../cosmosConfig/types';
import { CosmosPluginConfig } from '../cosmosPlugin/getCosmosPluginConfigs';
import { PlatformType } from '../cosmosPlugin/types';
import { getDevPlaygroundHtml } from '../playgroundHtml';
import { getStaticPath } from '../staticServer';

export function createApp(
  platformType: PlatformType,
  cosmosConfig: CosmosConfig,
  pluginConfigs: CosmosPluginConfig[]
): express.Express {
  const app = express();

  const playgroundHtml = getDevPlaygroundHtml(
    platformType,
    cosmosConfig,
    pluginConfigs
  );
  app.get('/', (req: express.Request, res: express.Response) => {
    res.send(playgroundHtml);
  });

  app.get(
    '/_plugin/:scriptPath',
    (req: express.Request, res: express.Response) => {
      const { scriptPath } = req.params;
      if (!scriptPath) {
        res.sendStatus(404);
        return;
      }

      // TODO: Restrict which scripts can be opened based on plugin configs
      const cleanPath = `./${decodeURIComponent(scriptPath)}`;
      const absolutePath = resolveFrom.silent(cosmosConfig.rootDir, cleanPath);
      if (!absolutePath) {
        res.sendStatus(404);
        return;
      }

      res.sendFile(absolutePath);
    }
  );

  app.get('/_playground.js', (req: express.Request, res: express.Response) => {
    res.sendFile(require.resolve('react-cosmos-playground2/dist'));
  });

  app.get('/_cosmos.ico', (req: express.Request, res: express.Response) => {
    res.sendFile(getStaticPath('favicon.ico'));
  });

  return app;
}