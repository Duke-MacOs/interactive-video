/* eslint-disable import/prefer-default-export */
import { message } from 'antd';
import { resolve } from 'dns';

const fs = require('fs');
const MD5 = require('md5-file');
const path = require('path');

/**
 * 是否为文件夹
 * @param arg 地址
 */
export const isDirectory = (arg: string) => {
  const state = fs.lstatSync(arg);
  return state ? state.isDirectory() : false;
};

export const createFileAnyWhere = (file: string, data: string | Buffer) => {
  if (!file || !data) {
    message.error('创建文件失败');
    return;
  }
  // eslint-disable-next-line no-underscore-dangle
  fs.writeFileSync(`${file}`, data);
};

/**
 * 新建文件
 * @param file 文件地址
 * @param data 数据
 */
export const createFile = (file: string, data: string | Buffer) => {
  createFileAnyWhere(`${window.__WORK_DIR__}/${file}`, data);
};

/**
 * 文件/文件夹 是否存在
 * @param arg 地址
 */
export const exists = (arg: string) => {
  return new Promise((resolve, reject) => {
    fs.access(arg, fs.constants.F_OK, (err: any) => {
      if (err) {
        resolve(false);
      } else {
        resolve(true);
      }
    });
  });
};

/**
 * 文件/文件夹 是否存在
 * @param arg 地址
 */
export const existsSync = (arg: string) => {
  return fs.existsSync(arg);
};

/**
 * 同步读取数据
 * @param arg 地址
 */
export const readFileSync = (arg: string) => {
  return fs.readFileSync(arg);
};

/**
 * 同步写入数据
 * @param arg 写入地址
 * @param data 数据
 */
export const writeFileSync = (arg: string, data: string) => {
  fs.writeFileSync(arg, data);
};

/**
 * 获取文件 MD5 值
 * @param arg 文件地址
 */
export const getFileMd5 = (arg: string) => {
  console.log('arg: ', arg);
  let md5 = '';
  if (existsSync(arg) && typeof arg === 'string') {
    md5 = MD5.sync(arg);
  }
  return md5;
};

/**
 * 递归遍历文件夹内容
 * @param dir 文件夹地址
 * @param done 成功回调
 * @param fileTypeReg 文件类获取型
 */
export const getFiles = (dir: string, done: any, fileTypeReg?: RegExp) => {
  let results: any[] = [];
  fs.readdir(dir, (err: any, list: any[]) => {
    if (err) return done(err);
    let i = 0;
    // eslint-disable-next-line consistent-return
    (function next() {
      // eslint-disable-next-line no-plusplus
      let file = list[i++];
      if (!file) return done(null, results);
      file = path.resolve(dir, file);
      fs.stat(file, (err2: any, stat: { isDirectory: () => any }) => {
        if (stat && stat.isDirectory()) {
          getFiles(file, (err3: any, res: any) => {
            if (res && res.length) {
              if (fileTypeReg) {
                const len = res.length;
                let i = 0;
                while (i < len) {
                  if (fileTypeReg.test(res[i])) {
                    results = results.concat(res[i]);
                  }
                  i++;
                }
              } else if (!fileTypeReg) {
                results = results.concat(res);
              }
            }
            next();
          });
        } else {
          if (fileTypeReg) {
            if (fileTypeReg.test(file)) {
              results.push(file);
            }
          } else if (!fileTypeReg) {
            results.push(file);
          }
          next();
        }
      });
    })();
  });
};

/**
 * 异步获取文件夹内容
 * @param dir 文件夹地址
 * @param fileTypeReg 文件类获取型
 * @param isGetSingle 是否只返回一个文件
 */

export const getFilesAsync = async (
  dir: string,
  fileTypeReg: RegExp,
  isGetSingle = true
): Promise<string[]> => {
  const filePaths = (await new Promise((resolve, reject) => {
    let results: any[] = [];
    fs.readdir(dir, (err: any, list: any[]) => {
      if (err) return reject();
      let i = 0;
      // eslint-disable-next-line consistent-return
      (function next() {
        // eslint-disable-next-line no-plusplus
        let file = list[i++];
        if (!file) return resolve(results);
        file = path.resolve(dir, file);
        fs.stat(file, (err2: any, stat: { isDirectory: () => any }) => {
          if (stat && stat.isDirectory()) {
            getFiles(file, (err3: any, res: any) => {
              if (res && res.length) {
                if (fileTypeReg) {
                  const len = res.length;
                  let i = 0;
                  while (i < len) {
                    if (fileTypeReg.test(res[i])) {
                      if (isGetSingle) {
                        return resolve([res[i]]);
                      }
                      results = results.concat(res[i]);
                    }
                    i++;
                  }
                } else if (!fileTypeReg) {
                  results = results.concat(res);
                }
              }
              next();
            });
          } else {
            if (fileTypeReg) {
              if (fileTypeReg.test(file)) {
                if (isGetSingle) {
                  return resolve([file]);
                }
                results.push(file);
              }
            } else if (!fileTypeReg) {
              results.push(file);
            }
            next();
          }
        });
      })();
    });
  })) as string[];
  return filePaths;
};

/**
 * 复制文件
 * @param src 来源
 * @param dist 目标
 */
export const copyFile = (src: string, dist: string) => {
  if (existsSync(src)) {
    fs.createReadStream(src).pipe(fs.createWriteStream(dist));
  }
};

/**
 * 创建文件夹
 * @param path 创建路径
 */
export const mkdir = (path: string) => {
  return new Promise((resolve, reject) => {
    fs.mkdir(path, { recursive: true }, (err: any) => {
      if (err) reject(err);
      resolve('mkdir done');
    });
  });
};

/**
 * 读取文件信息
 */
export const statSync = (path: string) => {
  if (existsSync(path)) {
    return fs.statSync(path);
  }
};

/**
 * 删除文件（仅文件）
 */
export const deleteFile = (path: string) => {
  return new Promise((resolve, reject) => {
    if (existsSync(path)) {
      fs.unlink(path, (err: any) => {
        if (err) reject(err);
        resolve(true);
      });
    } else {
      reject(new Error('文件路径不存在'));
    }
  });
};
