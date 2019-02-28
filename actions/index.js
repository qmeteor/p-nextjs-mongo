/**
 * Created by Bien on 2018-01-18.
 */
import axios from 'axios'
import _ from 'lodash'
import { createStore, applyMiddleware } from 'redux'
import { composeWithDevTools } from 'redux-devtools-extension'
import thunkMiddleware from 'redux-thunk'



import { rootReducer } from '../reducers/index';

import {
    ADD_UPLOADED_ITEM,
    UPLOAD_FILE,
    TOGGLE_UPLOADED_ITEM,
    DO_NOTHING,
    TICK,
    ADD
} from './types';

const exampleInitialState = {
    lastUpdate: 0,
    light: false,
    count: 0
};

export const initStore = (initialState = exampleInitialState) => {
    return createStore(rootReducer, initialState, composeWithDevTools(applyMiddleware(thunkMiddleware)))
};

// ACTIONS
export const serverRenderClock = (isServer) => dispatch => {
    return dispatch({ type: TICK, light: !isServer, ts: Date.now() })
};

export const startClock = () => dispatch => {
    return setInterval(() => dispatch({ type: TICK, light: true, ts: Date.now() }), 800)
};

export const addCount = () => dispatch => {
    return dispatch({ type: ADD })
};

// GCS actions
export function getSignedUrlThenUploadToGCS(file, callback) {
    return function (dispatch) {
        axios.get(`/upload-images`)
    }
}

// AWS actions
export function getSignedRequestThenUploadToS3(file, callback) {

    return function (dispatch) {
        axios.get(`/s3/sign-s3?file-name=${file.name}&file-type=${file.type}`)   // TODO: tag file name with additional parameters to uniquely identify it to the user.
            .then((responseA) => {
                const signedUrl = responseA.data.signedRequest;
                const options = {
                    headers: {
                        'Content-Type': file.type
                    }
                };
                // TODO: is order guaranteed here?
                return Promise.all([
                    responseA,
                    axios.put(signedUrl, file, options)
                ]);
            })
            .then(([responseA, responseB]) => {
                // After finish uploading to S3 update database to contain
                // new url location of file and id of user associated with file.
                let values = {
                    originalFileName: file.name,
                    url: responseA.data.url
                };

                return Promise.all([
                    responseA,
                    responseB,
                    axios.post(`/upload/upload_document`, values)   // Store AWS S3 asset url location and relation to userID
                ]);
            })
            .then(([responseA, responseB, responseC]) => {

                return Promise.all([
                    responseA,
                    responseB,
                    responseC,
                    axios.get('/upload/fetch_documents')
                ]);
            })
            .then(([responseA, responseB, responseC,responseD]) => {
                // fire callback to notify that upload & data stored in database is complete on the UI.
                callback(responseC);
                // TODO: Create action to update UI with new item.
                let responseArray = _.toArray(responseD.data);
                dispatch({
                    type: ADD_UPLOADED_ITEM,
                    payload: responseArray
                });

                console.log('EHLLO', responseD);
            })
            .catch((err) => {
                console.log('Error: ', err.message);
            });

        dispatch({type: DO_NOTHING});
    }
}


