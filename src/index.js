import fs from 'fs';
import { join } from 'path';

/**
 * @module petu
 */

const files = fs.readdirSync(join(__dirname)).filter(file => (!file.startsWith('.') && file.endsWith('.js')));

const toExport = {};

files.forEach((file) => {
  toExport[file.slice(0, -3)] =
    require(join(__dirname, file)); // eslint-disable-line import/no-dynamic-require,global-require
});

export default toExport;
