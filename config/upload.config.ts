export default () => ({
     upload: {
          maxFileSize: Number(process.env.UPLOAD_MAX_FILE_SIZE) || 10 * 1024 * 1024, // 5 MB
     }

})
