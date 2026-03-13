import fs from 'fs';
import { resolvePath, validateFileExists, validateIsFile } from '../utils/pathResolver.js';

export async function jsonToCsv(currentDir, inputPath, outputPath) {
  const resolvedInput = resolvePath(currentDir, inputPath);
  const resolvedOutput = resolvePath(currentDir, outputPath);

  if (!validateFileExists(resolvedInput) || !validateIsFile(resolvedInput)) {
    return false;
  }

  try {
    const fileContent = await fs.promises.readFile(resolvedInput, 'utf8');
    const data = JSON.parse(fileContent);

    if (!Array.isArray(data) || data.length === 0) {
      return false;
    }

    const headers = Object.keys(data[0]);
    const csvLines = [headers.join(',')];

    for (const item of data) {
      const row = headers.map(header => {
        const value = item[header] || '';
        return value.includes(',') ? `"${value}"` : value;
      });
      csvLines.push(row.join(','));
    }

    await fs.promises.writeFile(resolvedOutput, csvLines.join('\n'));
    return true;
  } catch {
    return false;
  }
}