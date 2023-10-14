import { PathLike } from 'fs';
import fs from 'fs';

export default async function readFilePath(filename: PathLike) {
  try {
    const contents = await fs.promises.readFile(filename, 'utf-8');
    const arr = contents.split(/\r?\n/);

    return arr;
  } catch (err) {
    console.error(err);
  }
}
