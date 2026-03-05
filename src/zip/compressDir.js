import fs from 'fs/promises';
import path from 'path';
import { createReadStream, createWriteStream } from 'fs';
import { pipeline } from 'stream/promises';
import zlib from 'zlib';
import { Readable } from 'stream';

async function compressDir() {
  try {
    const toCompressPath = path.join(process.cwd(), 'workspace', 'toCompress');
    const compressedDir = path.join(process.cwd(), 'workspace', 'compressed');
    const archivePath = path.join(compressedDir, 'archive.br');

    // Проверяем существование toCompress
    try {
      await fs.access(toCompressPath);
    } catch {
      throw new Error('FS operation failed');
    }

    // Создаем директорию compressed если её нет
    await fs.mkdir(compressedDir, { recursive: true });

    // Функция для создания потока с метаданными и содержимым файлов
    async function* generateFileStream() {
      // Рекурсивно обходим директорию
      async function* walk(dir, baseDir = dir) {
        const entries = await fs.readdir(dir, { withFileTypes: true });
        
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          const relativePath = path.relative(baseDir, fullPath);
          
          if (entry.isDirectory()) {
            // Отправляем метаданные о директории
            yield JSON.stringify({
              type: 'directory',
              path: relativePath
            }) + '\n';
            
            // Рекурсивно обходим поддиректорию
            yield* walk(fullPath, baseDir);
          } else {
            // Для файлов отправляем метаданные
            const stats = await fs.stat(fullPath);
            yield JSON.stringify({
              type: 'file',
              path: relativePath,
              size: stats.size
            }) + '\n';
            
            // Отправляем содержимое файла
            const fileStream = createReadStream(fullPath);
            for await (const chunk of fileStream) {
              yield chunk;
            }
          }
        }
      }
      
      yield* walk(toCompressPath);
    }

    // Создаем читаемый поток из генератора
    const readStream = Readable.from(generateFileStream());
    
    // Создаем Brotli компрессор и выходной поток
    const brotli = zlib.createBrotliCompress({
      params: {
        [zlib.constants.BROTLI_PARAM_QUALITY]: 11, // Максимальное сжатие
      }
    });
    
    const writeStream = createWriteStream(archivePath);

    // Соединяем все потоки
    console.log('Начинаем сжатие...');
    await pipeline(readStream, brotli, writeStream);
    
    console.log(`Архив успешно создан: ${archivePath}`);

  } catch (error) {
    if (error.message === 'FS operation failed') {
      throw error;
    }
    console.error('Ошибка при сжатии:', error);
    throw new Error('FS operation failed');
  }
}

await compressDir();