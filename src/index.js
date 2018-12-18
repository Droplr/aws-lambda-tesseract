const {unpack} = require('@shelf/aws-lambda-brotli-unpacker');
const {execFileSync, execSync} = require('child_process');
const path = require('path');
const isImage = require('is-image');

const unsupportedExtensions = new Set(['ai', 'emf', 'eps', 'gif', 'ico', 'psd', 'svg']);
const inputPath = path.join(__dirname, '..', 'bin', 'tt.tar.br');
const outputPath = '/tmp/tesseract/tesseract';

module.exports.getExecutablePath = async function() {
  return unpack({inputPath, outputPath});
};

module.exports.getTextFromImage = async function(filePath) {
  const ttBinary = process.env.TESSERACT_BINARY_PATH || (await unpack({inputPath, outputPath}));

  const stdout = execFileSync(ttBinary, [filePath, 'stdout', '-l', 'eng'], {
    cwd: '/tmp/tesseract',
    env: {
      LD_LIBRARY_PATH: process.env.TESSERACT_BINARY_PATH || './lib',
      TESSDATA_PREFIX: process.env.TESSDATA_PREFIX || './tessdata'
    }
  });

  execSync(`rm ${filePath}`);

  return stdout.toString();
};

module.exports.getWordsAndBounds = async function(filePath) {
  const ttBinary = process.env.TESSERACT_BINARY_PATH || (await unpack({inputPath, outputPath}));
  const stdout = execFileSync(ttBinary, [filePath, 'stdout', '-l', 'eng', 'tsv'], {
    cwd: '/tmp/tesseract',
    env: {
      LD_LIBRARY_PATH: process.env.TESSERACT_BINARY_PATH || './lib',
      TESSDATA_PREFIX: process.env.TESSDATA_PREFIX || './tessdata'
    }
  });
  execSync(`rm ${filePath}`);

  const object = tsvJSON(stdout.toString());
  return object;
};

module.exports.isSupportedFile = function(filePath) {
  // Reject all non-image files for OCR
  if (!isImage(filePath)) {
    return false;
  }

  return !isUnsupportedFileExtension(filePath);
};

function isUnsupportedFileExtension(filePath) {
  const ext = path
    .extname(filePath)
    .slice(1)
    .toLowerCase();

  return unsupportedExtensions.has(ext);
}

function tsvJSON(tsv) {
  const lines = tsv.split('\n');
  const result = [];
  const headers = lines[0].split('\t');

  for (let i = 1; i < lines.length; i++) {
    const obj = {};
    const currentline = lines[i].split('\t');
    for (let j = 0; j < headers.length; j++) {
      obj[headers[j]] = currentline[j];
    }
    result.push(obj);
  }
  return result;
}
