/**
 * Created by Bien on 2018-02-10.
 */
/**
 * Add routes for authentication
 *
 * Also sets up dependencies for authentication:
 * - Adds sessions support to Express (with HTTP only cookies for security)
 * - Configures session store (defaults to a flat file store in /tmp/sessions)
 * - Adds protection for Cross Site Request Forgery attacks to all POST requests
 *
 * Normally some of this logic might be elsewhere (like express.js) but for the
 * purposes of this example all server logic related to authentication is here.
 */
'use strict';
const aws = require('aws-sdk');
const _ = require('lodash');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const csrf = require('lusca').csrf();
const uuid = require('uuid/v4');
const passportStrategies = require('./passport-strategies');
const sendgrid = require('@sendgrid/mail');
const { check, validationResult } = require('express-validator/check');
const { matchedData, sanitize } = require('express-validator/filter');
const axios = require('axios');
const shortid = require('shortid');
shortid.characters('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ$@');


// Configure AWS region of the target bucket.
aws.config.region = 'us-east-1';
// Load the S3 information from the environment variables.
const S3_BUCKET = 'retouch-assets';



exports.configure = ({
    // Next.js App
    nextApp = null,
    // Express Server
    expressApp = null,
    // MongoDB connection to the user database
    userdb = null,
    // MongoDB connection to the image database
    imagedb = null,
    // URL base path for handling image routes
    path = '/orders',
    // Express Session Handler
    session = require('express-session'),
    // Secret used to encrypt session data on the server
    secret = 'change-me', // TODO: must change secret to random value maybe place in config folder remember to .gitignore it.
    // Sessions store for express-session (defaults to /tmp/sessions file store)
    store = null,
    // Max session age in ms (default is 7 days)
    // NB: With 'rolling: true' passed to session() the session expiry time will
    // be reset every time a user visits the site again before it expires.
    maxAge = 60000 * 60 * 24 * 7,
    // How often the client should revalidate the session in ms (default 60s)
    // Does not impact the session life on the server, but causes the client to
    // always refetch session info after N seconds has elapsed since last
    // checked. Sensible values are between 0 (always check the server) and a
    // few minutes.
    clientMaxAge = 60000,
    // URL of the server (e.g. 'http://www.example.com'). Used when sending
    // sign in links in emails. Autodetects to hostname if null.
    serverUrl = null,
    // Mailserver configuration for nodemailer (defaults to localhost if null)
    mailserver = null,
    // User DB Key. This is always '_id' on MongoDB, but configurable as an
    // option to make it easier to refactor the code below if you are using
    // another database.
    userDbKey = '_id'
} = {}) => {

    if (nextApp === null) {
        throw new Error('nextApp option must be a next server instance')
    }

    if (expressApp === null) {
        throw new Error('expressApp option must be an express server instance')
    }

    if (userdb === null) {
        throw new Error('userdb option must be provided')
    }

    if (imagedb === null) {
        throw new Error('imagedb option must be provided')
    }

    if (store === null) {
        // Example of store
        //const FileStore = require('session-file-store')(session)
        //store = new FileStore({path: '/tmp/sessions', secret: secret})
        throw new Error('express session store not provided')
    }

    // Load body parser to handle POST requests
    expressApp.use(bodyParser.json());
    expressApp.use(bodyParser.urlencoded({extended: true}));

    // Configure sessions
    expressApp.use(session({
        secret: secret,
        store: store,
        resave: false,
        rolling: true,
        saveUninitialized: false,
        httpOnly: true,
        cookie: {
            maxAge: maxAge
        }
    }));

    // This SECTION needs to be gone over to see if you can attach image info to the session.
    // Return session info for images
    expressApp.get(path + '/session', (req, res) => {
        let session = {
            maxAge: maxAge,
            clientMaxAge: clientMaxAge,
            csrfToken: res.locals._csrf
        };

        // Add image object to session if logged in
        if (req.user) {
            session.user = {
                name: req.user.name,
                email: req.user.email,
                company: req.user.company,
                address: req.user.address,
                mainContact: req.user.mainContact,
                city: req.user.city,
                state: req.user.state,
                zip: req.user.zip,
                country: req.user.country,
                phone: req.user.phone,
                url: req.user.url
            };

            // If logged in, export the API access token details to the client
            // Note: This token is valid for the duration of this session only.
            if (req.session && req.session.api) {
                session.api = req.session.api
            }
        }

        return res.json(session)
    });

    // AWS signed url
    expressApp.get('/sign-s3', (req, res, next) => {
        const s3 = new aws.S3();
        const fileType = req.query['file-type'];
        const projectId = req.query['project-id'];
        const fileName = req.user.id + '/' + projectId + '/' + req.query['file-name'];
        const inFifteenMinutes = new Date(new Date().getTime() + 15 * 60 * 1000);
        const s3Params = {
            Bucket: S3_BUCKET,
            Key: fileName,
            Expires: 60,
            ContentType: fileType,
            ContentDisposition: 'Attachment',
            ACL: 'public-read'
        };

            // Generate a URL to allow write permissions. This means anyone with this URL
            // can send a POST request with new data that will overwrite the file.

        s3.getSignedUrl('putObject', s3Params, (err, data) => {
            if(err){
                console.log(err);
                return res.end();
            }
            console.log('signedURL: ', data);
            const returnData = {
                signedRequest: data,
                url: `https://${S3_BUCKET}.s3.amazonaws.com/${fileName}`
            };
            res.write(JSON.stringify(returnData));
            res.end();
        });
        }
    );

    /**
     GET /abort
     handle abort upload
     **/
    expressApp.get('/aborted', (req, res, next) => {
        res.send('aborted');
    });
    /**
     * GET /orders/upload
     */
    // expressApp.get(
    //     path + '/upload',
    //     (req, res, next) => {
    //     const newProjectId = shortid.generate().toUpperCase().replace(/\W/g, '');
    //     const url = `/orders/upload/` + newProjectId;
    //     return res.redirect(url);
    //     }
    // );
    /**
     * GET /orders/upload/:id
     *
     * (
     * Display images uploaded for editing
     */
    expressApp.get(
        path + '/upload/'
        // ,
        // [
        //     check('id', 'Project id must be between 8, 9 characters.')
        //         .isLength({ min: 8, max: 9 })
        //         .matches(/^[a-z0-9]+$/i)
        //         .exists()
        // ]
        ,
        (req, res, next) => {
         const fullPath = path + '/upload';
         const queryParams = { id: req.params.id };
         //
         // let projectId;
         //
         // // get validation results
         // const errors = validationResult(req);
         // if(!errors.isEmpty()) {
         //     console.log('Validation failed. Regenerating id.');
         //     // console.log('project id: ', req.params.id);
         //     // console.log('user id: ', req.user.id);
         //
         //     // Generate new project Id and redirect
         //     projectId = shortid.generate().toUpperCase().replace(/\W/g, '');
         //     console.log('project id: ', projectId);
         //     console.log('user id: ', req.user.id);
         //     const url = `/orders/upload/`+ projectId;
         //     return res.redirect(url);
         // }

         // projectId = req.params.id;
         // console.log('validated id');
         // console.log(`searching images that belong to userId:${req.user.id} && projectId:${projectId} `);
         //TODO: if validation passes check find all images associated with the projectId.

        // nextApp.render(req, res, fullPath, queryParams);
            nextApp.render(req, res);
    });

    /**
     * GET /api/images
     *
     * (
     * Display images uploaded for editing
     */
    // expressApp.get(
    //     '/api/images',
    //     (req, res, next) => {
    //         console.log('body: ', req.body);
    //         console.log('user: ', req.user.id);
    //         console.log('params: ', req.params);
    //         console.log('query: ', req.query.projectId);
    //         console.log('xhr: ', req.xhr);
    //         const userId = req.user.id.toString();
    //         const projectId = req.query.projectId;
    //         const params = {
    //             params: {
    //                 userId: userId,
    //                 projectId: projectId
    //             }
    //         };
    //         const apiUrl = 'https://cctuj5uvye.execute-api.us-east-1.amazonaws.com/dev/image/test';
    //         axios.get(`${apiUrl}`, params)
    //             .then((response) => {
    //                 // console.log('server: ', response.data);
    //                 res.write(JSON.stringify(response.data));
    //                 res.end();
    //             })
    //             .catch(err => {
    //                 // console.log(err);
    //                 res.status(400);
    //                 res.end();
    //             });
    //
    //     });

    /**
     * DELETE /api/images
     *
     * (
     * Display images uploaded for editing
     */
    expressApp.post(
        '/api/delete-image',
        (req, res, next) => {
            console.log('body: ', req.body);
            console.log('user: ', req.user.id);
            console.log('params: ', req.params);
            console.log('query: ', req.query.projectId);
            console.log('xhr: ', req.xhr);
            const userId = req.user.id.toString();
            const projectId = req.query.projectId;
            const fileName = req.query.fileName;
            const params = {
                params: {
                    userId: userId,
                    projectId: projectId,
                    fileName: fileName
                }
            };
            const apiUrl = 'https://cctuj5uvye.execute-api.us-east-1.amazonaws.com/dev/image';
            axios.delete(`${apiUrl}`, params)
                .then((response) => {
                    // console.log('server: ', response.data);
                    res.write(JSON.stringify(response.data));
                    res.end();
                })
                .catch(err => {
                    // console.log(err);
                    res.status(400);
                    res.end();
                });

        });

    /**
     * POST /api/upload
     *
     * Trigger lambda function and insert image details to dynamodb.
     */
    expressApp.post(
        '/api/upload',
        (req, res, next) => {

            // console.log('body: ', req.body);
            // console.log('user: ', req.user);
            // console.log('params: ', req.params);
            // console.log('query: ', req.query);
            // console.log('xhr: ', req.xhr);
            const image = req.body;
            // get validation results
            const errors = validationResult(req);
            if(!errors.isEmpty()) {
                console.log('validation failed');
                return res.status(422).json({ errors: errors.mapped() });
            }
            const data = {
                userId: req.user.id,
                projectId: image.body.projectId,
                imageProperties: image.body.imageProperties
            };

            const params = 'testId';
            const apiUrl = 'https://cctuj5uvye.execute-api.us-east-1.amazonaws.com/dev/project';

            axios.put(`${apiUrl}/${params}`, data)
                .then((response) => {
                    res.send(
                        'function complete'
                    );
                })
                .catch(err => {
                    console.log(err);
                });
            // pass req.user projectId and filename object to lambda function http trigger to write to dynamodb
        }
    );

    /**
     * POST /api/upload/:id
     *
     * Update or Upload an image
     */
    expressApp.post(
        '/api/convert-image',
        (req, res, next) => {
            console.log('body: ', req.body);
            console.log('user: ', req.user);
            console.log('params: ', req.params);
            console.log('query: ', req.query);
            console.log('xhr: ', req.xhr);
            const image = req.body;
            // get validation results
            const errors = validationResult(req);
            if(!errors.isEmpty()) {
                console.log('validation failed');
                return res.status(422).json({ errors: errors.mapped() });
            }
            const data = {
                userId: req.user.id,
                projectId: image.body.projectId,
                originalName: image.body.originalName
            };

            axios.post('https://cctuj5uvye.execute-api.us-east-1.amazonaws.com/dev/image', data)
                .then((response) => {
                    res.send(
                        'conversion complete'
                    );
                })
                .catch(err => {
                    console.log(err);
                });

            // pass req.user projectId and filename object to lambda function http trigger to write to dynamodb
        }
    );



};



// @TODO Argument validation
// function sendVerificationEmail({mailserver, fromEmail, toEmail, url}) {
//
//     sendgrid.setApiKey(process.env.SENDGRID_KEY);
//
//     const msg = {
//         to: toEmail,
//         from: fromEmail,
//         subject: 'Sending with SendGrid is Fun',
//         text: 'Use the link below to sign in:\n\n' + url + '\n\n',
//         html: '<strong>Use the link to sign in:</strong></br>Use the link below to sign in:</br></br>' + url + '</br></br>',
//     };
//
//     sendgrid.send(msg, (err) => {
//         // @TODO Handle errors
//         if (err) {
//             console.log('Error sending email to ' + toEmail, err)
//         }
//     });
//     if (process.env.NODE_ENV === 'development') {
//         console.log('Generated sign in link ' + url + ' for ' + toEmail)
//     }
//
//     // nodemailer
//     // .createTransport(mailserver)
//     // .sendMail({
//     //   to: toEmail,
//     //   from: fromEmail,
//     //   subject: 'Sign in link',
//     //   text: 'Use the link below to sign in:\n\n' + url + '\n\n'
//     // }, (err) => {
//     //   // @TODO Handle errors
//     //   if (err) {
//     //     console.log('Error sending email to ' + toEmail, err)
//     //   }
//     // });
//     // if (process.env.NODE_ENV === 'development')  {
//     //   console.log('Generated sign in link ' + url + ' for ' + toEmail)
//     // }
// }