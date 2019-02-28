/**
 * Created by Bien on 2018-03-17.
 */
/* global window */
/* global localStorage */
// Using isomorphic-fetch as we already included it in this project
// (This class doesn't actually call fetch when run on the server.)
import fetch from 'isomorphic-fetch'
import axios from 'axios'

export default class {

    // We can't do async requests in the constructor so access is via async method
    static async getImage({
        req = null
    } = {}) {
        let image = {};
        // If on server do nothing, req object exists, true.
        if(req) {
            // do nothing
        } else {
            let url = window.location.pathname.split('/').filter(function(el){ return !!el; }).pop();
            const params = {
                params: {
                    projectId: url
                }
            };
            return axios.get('/api/images', params)
                .then(data => {
                    image = data;

                    return image
                })
                .catch(() => Error('Unable to get images'))
        }

    }

    static deleteImage({
        req = null,
        fileName = null,
        options = null
    } = {}) {
        let image = {};
        // If on server do nothing, req object exists, true.
        if(req) {
            // do nothing
        } else {
            let url = window.location.pathname.split('/').filter(function(el){ return !!el; }).pop();
            const params = {
                params: {
                    projectId: url,
                    fileName: fileName
                }
            };


            return axios.post('/api/delete-image', params, options)
                .then(data => {
                    console.log('success deleted images:', data);
                })
                .catch(() => Error('Unable to delete'))
        }

    }

    // The Web Storage API is widely supported, but not always available (e.g.
    // it can be restricted in private browsing mode, triggering an exception).
    // We handle that silently by just returning null here.
    static _getLocalStore(name) {
        try {
            return JSON.parse(localStorage.getItem(name))
        } catch (err) {
            return null
        }
    }

    static _saveLocalStore(name, data) {
        try {
            localStorage.setItem(name, JSON.stringify(data))
            return true
        } catch (err) {
            return false
        }
    }

    static _removeLocalStore(name) {
        try {
            localStorage.removeItem(name)
            return true
        } catch (err) {
            return false
        }
    }

}