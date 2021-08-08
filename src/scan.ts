import { readdir } from 'fs/promises';

const dirPath = '';

// 遍历下面的文件
try {
  const files = await readdir(dirPath);
  for (const file of files) console.log(file);
} catch (err) {
  console.error(err);
}
