/**
 * Created by Bien on 2018-03-06.
 */
//
// const Storage = require('@google-cloud/storage');
//
// const config = require('../config');
//
// const CLOUD_BUCKET = config.get('CLOUD_BUCKET');
//
// const storage = Storage({
//     projectId: config.get('GCLOUD_PROJECT')
// });
//
// const myBucket = storage.bucket(CLOUD_BUCKET);

// Note: gsutils cors settings must be set on bucket to METHOD being applied
// gcsConfig must match signature to put command in this case contentType

// expressApp.get('/sign-gcs', (req, res, next) => {
//         const fileName = req.query['file-name'];
//         const fileType = req.query['file-type'];
//         const gcs = myBucket.file(fileName);
//         const inFifteenMinutes = new Date(new Date().getTime() + 15 * 60 * 1000);
//         const gcsConfig = {
//             action: 'write',
//             expires: inFifteenMinutes,
//             contentType: fileType,
//             'x-goog-acl': 'project-private'
//         };
//
//         // Generate a URL to allow write permissions. This means anyone with this URL
//         // can send a POST request with new data that will overwrite the file.
//
//         gcs.getSignedUrl(gcsConfig, function(err, url) {
//             if (err) {
//                 console.error(err);
//                 return res.end();
//             }
//             console.log('signed_url: ', url);
//             const returnData = {
//                 signedRequest: url
//             };
//             res.write(JSON.stringify(returnData));
//             res.end();
//
//         });
//
//     }
// );