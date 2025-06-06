import launchEditor from '@skidding/launch-editor';
import { Request, Response } from 'express';
import fs from 'fs';
import open from 'open';
import path from 'path';
import { CosmosServerPlugin } from '../cosmosPlugin/types.js';

type ReqQuery = { filePath: void | string; line: number; column: number };

export const openFilePlugin: CosmosServerPlugin = {
  name: 'openFile',

  devServer({ config, app }) {
    app.get('/_open', (req: Request, res: Response) => {
      const { filePath, line, column } = getReqQuery(req);
      if (!filePath) {
        res.status(400).send(`File path missing`);
        return;
      }

      const absFilePath = resolveFilePath(config.rootDir, filePath);
      if (!fs.existsSync(absFilePath)) {
        res.status(404).send(`File not found at path: ${absFilePath}`);
        return;
      }

      new Promise((resolve, reject) => {
        const file = `${absFilePath}:${line}:${column}`;
        launchEditor(file, (fileName, errorMsg) => reject(errorMsg));
        // If launchEditor doesn't report error within 500ms we assume it worked
        setTimeout(resolve, 500);
      })
        // Fall back to open in case launchEditor fails. launchEditor only works
        // when the editor app is already open, but is favorable because it can
        // open a code file on a specific line & column.
        .catch(err => open(absFilePath))
        .catch(err => {
          console.log(err);
          res.status(500).send('Failed to open file');
        })
        .then(() => res.send());
    });
  },
};

function getReqQuery(req: Request): ReqQuery {
  const { filePath, line, column } = req.query;
  if (typeof filePath !== 'string') throw new Error('filePath missing');
  return {
    filePath,
    line: typeof line === 'string' ? parseInt(line, 10) : 1,
    column: typeof column === 'string' ? parseInt(column, 10) : 1,
  };
}

function resolveFilePath(rootDir: string, filePath: string) {
  // This heuristic is needed because the open file endpoint is used for
  // multiple applications, which provide different file path types:
  // 1. Open fixture source button: Sends path relative to Cosmos rootDir
  // 2. react-error-overlay runtime error: Sends absolute path
  // 3. react-error-overlay compile error: Sends path relative to CWD
  if (path.isAbsolute(filePath)) {
    return filePath;
  }

  const cosmosRelPath = path.join(rootDir, filePath);
  const cwdRelPath = path.join(process.cwd(), filePath);
  return fs.existsSync(cosmosRelPath) ? cosmosRelPath : cwdRelPath;
}
