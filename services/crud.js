// Copyright 2017, Google, Inc.
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const images = require('./images');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const cookieParser = require('cookie-parser');

function getModel () {
    return require(`./model-${require('../config').get('DATA_BACKEND')}`);
}

const router = express.Router();

router.use(cookieParser());
// Automatically parse request body as form data
router.use(bodyParser.urlencoded({ extended: false }));

// Set Content-Type for all responses for these routes
router.use((req, res, next) => {
    res.set('Content-Type', 'text/html');
    next();
});

const sessionStore = new MongoStore({
    url: process.env.SESSION_DB_CONNECTION_STRING,
    autoRemove: 'interval',
    autoRemoveInterval: 10, // Removes expired sessions every 10 minutes
    collection: 'sessions',
    stringify: false
});

const maxAge = 60000 * 60 * 24 * 7;
// Configure sessions
router.use(session({
    secret: process.env.SESSION_SECRET,
    store: sessionStore,
    resave: false,
    rolling: true,
    saveUninitialized: false,
    httpOnly: true,
    cookie: {
        maxAge: maxAge
    }
}));

/**
 * GET /images
 *
 * Display a page of books (up to ten at a time).
 */
router.get('/dsasdfkmfljkflkja', (req, res, next) => {
    getModel().list(10, req.query.pageToken, (err, entities, cursor) => {
        if (err) {
            next(err);
            return;
        }
        res.render('books/list.pug', {
            books: entities,
            nextPageToken: cursor
        });
    });
});


/**
 * POST /images/upload
 *
 * Upload & create an image mongoDB document.
 */
// [START add]
router.post(
    '/upload',
    images.multer.single('file'),
    images.sendUploadToGCS,
    (req, res, next) => {
        let data = req.body;

        // Was an image uploaded? If so, we'll use its public URL
        // in cloud storage.
        // if (req.file && req.file.cloudStoragePublicUrl) {
        //     data.imageUrl = req.file.cloudStoragePublicUrl;
        // }

        // Save the data to the database.
        // getModel().create(data, (err, savedData) => {
        //     if (err) {
        //         next(err);
        //         return;
        //     }
        //     res.redirect(`${req.baseUrl}/${savedData.id}`);
        // });
        res.status(200);
        res.send(req.file);
    }
);
// [END add]

/**
 * GET /books/:id/edit
 *
 * Display a book for editing.
 */
router.get('/:book/edit', (req, res, next) => {
    getModel().read(req.params.book, (err, entity) => {
        if (err) {
            next(err);
            return;
        }
        res.render('books/form.pug', {
            book: entity,
            action: 'Edit'
        });
    });
});

/**
 * POST /books/:id/edit
 *
 * Update a book.
 */
router.post(
    '/:book/edit',
    images.multer.single('image'),
    images.sendUploadToGCS,
    (req, res, next) => {
        let data = req.body;

        // Was an image uploaded? If so, we'll use its public URL
        // in cloud storage.
        if (req.file && req.file.cloudStoragePublicUrl) {
            req.body.imageUrl = req.file.cloudStoragePublicUrl;
        }

        getModel().update(req.params.book, data, (err, savedData) => {
            if (err) {
                next(err);
                return;
            }
            res.redirect(`${req.baseUrl}/${savedData.id}`);
        });
    }
);

/**
 * GET /books/:id
 *
 * Display a book.
 */
router.get('/:book', (req, res, next) => {
    getModel().read(req.params.book, (err, entity) => {
        if (err) {
            next(err);
            return;
        }
        res.render('books/view.pug', {
            book: entity
        });
    });
});

/**
 * GET /books/:id/delete
 *
 * Delete a book.
 */
router.get('/:book/delete', (req, res, next) => {
    getModel().delete(req.params.book, (err) => {
        if (err) {
            next(err);
            return;
        }
        res.redirect(req.baseUrl);
    });
});

/**
 * Errors on "/books/*" routes.
 */
router.use((err, req, res, next) => {
    // Format error and forward to generic error handler for logging and
    // responding to the request
    err.response = err.message;
    next(err);
});

module.exports = router;
