// backend/src/utils/backblaze.js
const B2 = require('backblaze-b2');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs').promises;

// Configuration Backblaze B2
const b2 = new B2({
  applicationKeyId: process.env.B2_APPLICATION_KEY_ID,
  applicationKey: process.env.B2_APPLICATION_KEY,
});

let isAuthorized = false;

const authorizeB2 = async () => {
  if (isAuthorized) return;
  try {
    await b2.authorize();
    isAuthorized = true;
    console.log('✅ Backblaze B2 autorisé avec succès');
  } catch (error) {
    console.error('Erreur autorisation Backblaze B2:', error.message);
    throw error;
  }
};

const mimeTypes = {
  '.mp4': 'video/mp4', '.webm': 'video/webm', '.mov': 'video/quicktime',
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png',
  '.gif': 'image/gif', '.webp': 'image/webp'
};

const uploadToBackblaze = async (fileInput, originalName, bucketName = 'EPT-Content') => {
  await authorizeB2();
  try {
    const ext = path.extname(originalName).toLowerCase();
    const mimeType = mimeTypes[ext] || 'application/octet-stream';
    const uniqueFileName = `${uuidv4()}${ext}`;

    const { data: uploadUrlData } = await b2.getUploadUrl({ bucketId: process.env.B2_BUCKET_ID });

    const fileContent = Buffer.isBuffer(fileInput) ? fileInput : await fs.readFile(fileInput);

    const { data: uploadFileData } = await b2.uploadFile({
      uploadUrl: uploadUrlData.uploadUrl,
      uploadAuthToken: uploadUrlData.authorizationToken,
      fileName: uniqueFileName,
      data: fileContent,
      mime: mimeType,
      info: { originalName }
    });

    const baseUrl = process.env.BUNNY_CDN_URL || `https://f000.backblazeb2.com/file/${bucketName}`;
    const publicUrl = `${baseUrl}/${uniqueFileName}`;

    console.log(`✅ Upload Backblaze réussi : ${publicUrl}`);
    return { url: publicUrl, fileName: uniqueFileName, size: fileContent.length, mimeType };
  } catch (error) {
    console.error('Erreur upload Backblaze:', error.message);
    throw new Error(`Échec upload média : ${error.message}`);
  }
};


const deleteFromBackblaze = async (urlOrFileName, bucketName = 'EPT-Content') => {
  await authorizeB2();
  try {
    let fileName = urlOrFileName;
    if (urlOrFileName.includes('b-cdn.net') || urlOrFileName.includes('backblazeb2.com')) {
      fileName = urlOrFileName.split('/').pop();
    }

    const { data: fileInfo } = await b2.listFileNames({
      bucketId: process.env.B2_BUCKET_ID,
      startFileName: fileName,
      maxFileCount: 1
    });

    if (fileInfo.files.length === 0 || fileInfo.files[0].fileName !== fileName) {
      console.warn(`Fichier non trouvé sur Backblaze : ${fileName}`);
      return;
    }

    await b2.deleteFileVersion({
      fileId: fileInfo.files[0].fileId,
      fileName
    });

    console.log(`🗑️ Fichier supprimé avec succès sur Backblaze : ${fileName}`);
  } catch (error) {
    console.error('Erreur suppression Backblaze:', error.message);
  }
};

module.exports = {
  authorizeB2,
  uploadToBackblaze,
  deleteFromBackblaze
};