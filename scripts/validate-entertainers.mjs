import { readFile } from 'node:fs/promises';
import { validateDirectory } from '../src/entertainers/validate.js';
validateDirectory(JSON.parse(await readFile(new URL('../src/entertainers/listings.json', import.meta.url), 'utf8')));
console.log('Entertainer directory is valid.');
