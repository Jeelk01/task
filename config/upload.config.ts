export default () => ({
     upload: {
          maxFileSize: Number(process.env.UPLOAD_MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10 MB
     },
     cloudinary: {
          cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
          apiKey: process.env.CLOUDINARY_API_KEY || '',
          apiSecret: process.env.CLOUDINARY_API_SECRET || '',
          folder: process.env.CLOUDINARY_FOLDER || 'structo',
     }

})
