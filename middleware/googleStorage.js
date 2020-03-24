const { Storage } = require('@google-cloud/storage');
// const storage = new Storage({keyFilename: "auth/beliba-homa-reports-firebase.json"});
const storage = new Storage({credentials: JSON.parse(process.env.FIREBASE_CONFIG)});
const uploadFileToCloudStroage = async (req, res, next) => {
    const bucketName = 'beliba-homa-reports';
    const filename = `reports/${req.query.fullFilename}`;
    try {
      await storage.bucket(bucketName).upload(filename, {
        // Support for HTTP requests made with `Accept-Encoding: gzip`
        gzip: true,
        // By setting the option `destination`, you can change the name of the
        // object you are uploading to a bucket.
        metadata: {
          // Enable long-lived HTTP caching headers
          // Use only if the contents of the file will never change
          // (If the contents will change, use cacheControl: 'no-cache')
          cacheControl: 'public, max-age=31536000',
        },
      });
      console.log(`${filename} uploaded to ${bucketName}.`);

    } catch(e){
      console.log(e);
    }
    

    next();
};

module.exports = uploadFileToCloudStroage;

