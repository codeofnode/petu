import fs from 'fs';
import { join } from 'path';

/**
 * @module petu
 */

const files = fs.readdirSync(join(__dirname, 'lib')).filter(file => (!file.startsWith('.') && file.endsWith('.js')));

const toExport = {};

files.forEach((file) => {
  toExport[file] = require(join(__dirname, 'lib', file));
});

export default toExport;