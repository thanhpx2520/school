import * as path from 'path';
import * as fs from 'fs-extra';
import { pipeline } from 'stream';
import { promisify } from 'util';
import { v4 as uuidv4 } from 'uuid';

const pump = promisify(pipeline);

const createFolderAndSaveFile = async (folder: string, file: any) => {
  const uploadDir = path.join(__dirname, '../..', `public/img/${folder}`);
  await fs.ensureDir(uploadDir);

  const ext = path.extname(file.filename);
  const newFilename = `${uuidv4()}${ext}`;

  const filePath = path.join(uploadDir, newFilename);
  await pump(file.file, fs.createWriteStream(filePath));

  console.log('Thêm ảnh thành công !');

  return {
    ...file,
    filename: newFilename,
    originalname: file.filename,
  };
};

const deleteImageFile = async (folder: string, filename: string) => {
  const filePath = path.join(
    __dirname,
    '../..',
    `public/img/${folder}`,
    filename,
  );

  try {
    const exists = await fs.pathExists(filePath);
    if (exists) {
      await fs.remove(filePath);
      console.log(`Đã xóa ảnh: ${filePath}`);
    } else {
      console.warn(`Ảnh không tồn tại: ${filePath}`);
    }
  } catch (error) {
    console.error(`Lỗi khi xóa ảnh: ${error}`);
  }
};

export { createFolderAndSaveFile, deleteImageFile };
