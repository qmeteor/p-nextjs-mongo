/**
 * Created by Bien on 2018-01-28.
 */
import React from 'react'
import Link from 'next/link'
import axios from 'axios'
import filesize from 'filesize'
import _ from 'lodash'
import moment from 'moment'
import { Container, Row, Col } from 'reactstrap';
import { Steps, Button, message, notification, Icon, Radio, Tooltip, Affix, Alert, Layout, Form, Upload, Spin, Progress, Modal } from 'antd';
import Session from '../components/session'
import Image from '../components/image'
const { Step } = Steps;
const { Header, Content, Sider} = Layout;
const Dragger = Upload.Dragger;
const queryString = require('query-string');
const URL = require('url-parse');





// setup mid flight cancellations tokens.
let CancelToken = axios.CancelToken;
let cancel;



class UploadStepOne extends React.Component {

    static async getInitialProps({req, query: { id }}) {
        console.log('hello');
        return {
            session: await Session.getSession({force: true, req: req}),
        }
    }

    constructor(props) {
        super(props);
        this.state = {
            imageUploaded: false,
            session: props.session,
            isSignedIn: false,
            fileList: [],
            progress: 0,
            previewVisible: false,
            previewImage: ''
        };
    }

    async componentDidMount() {
        const image = await Image.getImage();
        const session = await Session.getSession({force: true});
        console.log('client image ', image.data);
        this.setState({
            session: session,
            fileList: image.data,
            isSignedIn: (session.user) ? true : false
        });
    }

    handleChange = (info) => {

        // const status = info.file.status;
        // if (status !== 'uploading') {
        //     //console.log(info.file, info.fileList);
        // }
        // if (status === 'done') {
        //     message.success(`${info.file.name} file uploaded successfully.`);
        // } else if (status === 'error') {
        //     message.error(`${info.file.name} file upload failed.`);
        // }
        //
        // let fileList = info.fileList;
        //
        // // 1. Limit the number of uploaded files
        // //    Only to show two recent uploaded files, and old ones will be replaced by the new
        // // fileList = fileList.slice(-2);
        //
        // // 2. read from response and show file link
        // fileList = fileList.map((file) => {
        //     if (file.response) {
        //         // Component will show file.url as link
        //         file.response.url = file.url;
        //         file.url = file.response.url;
        //     }
        //     return file;
        // });
        //
        // // 3. filter successfully uploaded files according to response from server
        // fileList = fileList.filter((file) => {
        //     if (file.response) {
        //         return file.response.status === 'success';
        //     }
        //     return true;
        // });
        //
        // console.log('fileList: ', fileList);
        //
        // // TODO: 4. remove duplicate file.name uploads from list.
        //
        // this.setState({ fileList });
    };

    handleRequest = ({ onProgress, onError, onSuccess, data, filename, file, withCredentials, action, headers }) => {
        // is this file a duplicate from the current list? if so reject.
        // let inputArray = this.state.fileList.slice();
        // let isDuplicate = false;
        //
        // let newArray = inputArray.map((image) => {
        //     if(image.originFileObj.name === file.name || image.name === file.name) {
        //         // change name
        //         // message.error(`${file.name} duplicate.`);
        //         console.log('duplicate');
        //         isDuplicate = true;
        //         return image;
        //     } else {
        //         console.log('not duplicate');
        //         return image;
        //     }
        // });
        //
        //
        // if(!isDuplicate) {
        //     let url = window.location.pathname.split('/').filter(function(el){ return !!el; }).pop();
        //
        //     // get signed url then upload
        //     axios.get(`/sign-s3?file-name=${file.name}&file-type=${file.type}&project-id=${url}`)
        //         .then((s3) => {
        //             const signedUrl = s3.data.signedRequest;
        //             const options = {
        //                 headers: {
        //                     'Content-Type': file.type,
        //                 },
        //                 onUploadProgress: (progressEvent) => {
        //                     let percent = Math.round(parseInt(progressEvent.loaded / progressEvent.total * 100));
        //
        //                     onProgress(percent);
        //
        //                     let progress = Math.round(progressEvent.loaded / progressEvent.total * 100) + '% done' + ' ' + filesize(progressEvent.loaded, {round: 1});
        //                     if (progressEvent.loaded / progressEvent.total === 1) {
        //                         progress = file.name;
        //                     }
        //
        //                     // find out which file is currently being processed.
        //                     // capture progress state values.
        //                     // console.log(`Currently active: ${file.name}: ${percent} `);
        //                     // update specific fileList object.
        //
        //                     let fileListCopy = this.state.fileList.slice();
        //
        //                     let fileListModified = fileListCopy.map((image) => {
        //                         if (image.originFileObj.name === file.name) {
        //                             image.percent = percent;
        //                             image.name = progress;
        //                             return image;
        //                         } else {
        //                             return image;
        //                         }
        //                     });
        //
        //
        //
        //                     this.setState({fileList: fileListModified});
        //                     //this.setUploadProgress(percent);
        //                 },
        //                 cancelToken: new CancelToken(function executor(c) {
        //                     cancel = c;
        //                 })
        //             };
        //
        //             return axios.put(signedUrl, file, options)
        //         })
        //         .then((records) => {
        //             // after successful direct upload to s3, trigger http lambda via express proxy and update dynamodb
        //             const image = {
        //                 error: 'undefined',
        //                 lastModified: moment().unix(),
        //                 lastModifiedDate: moment().format('llll'),
        //                 name: file.name,
        //                 originFileObj: {
        //                     lastModified: moment().unix(),
        //                     lastModifiedDat: moment().format('llll'),
        //                     name: file.name,
        //                     size: file.size,
        //                     type: file.type,
        //                     uid: file.uid
        //                 },
        //                 percent: 100,
        //                 response: undefined,
        //                 size: file.size,
        //                 status: "done",
        //                 type: file.type,
        //                 uid: file.uid
        //             };
        //
        //             const body = {
        //                 body: {
        //                     projectId: url,
        //                     imageProperties: image
        //                 }
        //             };
        //             const options = {
        //                 headers: {
        //                     'X-CSRF-Token': this.state.session.csrfToken,
        //                 }
        //             };
        //             return axios.post('/api/upload', body, options)
        //         })
        //         .then((response) => {
        //             // after successful update to dynamodb, trigger http lambda via express proxy and convert image and update dynamodb
        //
        //             const body = {
        //                 body: {
        //                     projectId: url,
        //                     originalName: file.name
        //                 }
        //             };
        //             const options = {
        //                 headers: {
        //                     'X-CSRF-Token': this.state.session.csrfToken,
        //                 }
        //             };
        //             return axios.post('/api/convert-image', body, options)
        //         })
        //         .then((obj) => {
        //             onSuccess();
        //         })
        //         .catch((err) => {
        //             if (axios.isCancel(err)) {
        //                 console.log('cancelled upload - from catch statement');
        //             } else {
        //                 console.log('Error: ', err.message);
        //             }
        //             onError();
        //         })
        // } else {
        //     axios.get('/aborted')
        //         .then(() => {
        //             console.log('aborted');
        //             this.openNotification();
        //             //this.handleRemove(file);
        //         })
        //         .catch((err) => {
        //             console.log('aborted error');
        //             //this.handleRemove(file);
        //         });
        // }
    };

    // This is now redundant to onProgress
    setUploadProgress = function(percent) {
        //let progress = Math.round(progressEvent.loaded/progressEvent.total*100) + '% done' + ' ' + filesize(progressEvent.loaded, {round: 1});
        // if (progressEvent.loaded/progressEvent.total === 1) {
        //     progress = 'completed' + ' ' + filesize(progressEvent.loaded, {round: 1});
        // }
        // let progress = percent;
        // this.setState({
        //     progress
        // });
    };

    handleRemove = (file) => {
        // console.log('handleRemove: api delete', file);
        // const uploaded = (file.percent === 100) ? true : false;
        // // TODO: handle request to delete item from database and storage
        //
        // if(uploaded) {
        //     message.info(`${file.originFileObj.name} removed.`);
        //     const options = {
        //         headers: {
        //             'X-CSRF-Token': this.state.session.csrfToken,
        //         }
        //     };
        //
        //     Image.deleteImage(file.originFileObj.name, options);
        //
        // } else {
        //     message.info(`${file.originFileObj.name} cancelled.`);
        // }
    };

    handlePreview = (file) => {
        // this.setState({
        //     previewImage: file.url || file.thumbUrl,
        //     previewVisible: true,
        // });
    };

    handleCancel = () => {
        // this.setState({ previewVisible: false })
    };

    handleProgress = (percent) => {
        // const progress = percent;
        // this.setState({
        //     progress
        // });
    };

    openNotification = () => {
        notification.config({
            placement: 'topRight',

        });

        notification.open({
            message: 'Oops!',
            description: 'Looks like you tried to upload a duplicate file. Try renaming.',
            icon: <Icon type="smile-circle" style={{ color: '#108ee9' }} />,
            key: '1'
        });
    };

    render() {
        // custom ...loading spinner for csrf token
        const antIcon = <Icon type="loading" style={{ fontSize: 24 }} spin />;
        const { previewVisible, previewImage, fileList } = this.state;

        const props = {
            name: 'file',
            accept: 'image/*, .CR2, .mos, .NEF, .3FR', // TODO: Add all image types supported
            multiple: true,
            supportServerRender: true,
            headers: {
                // 'X-CSRF-Token': this.state.session.csrfToken,
            },
            listType: 'text', // options are { text, picture, picture-card }
            height: '100%'
        };

        if(!this.state.session || !this.state.session.csrfToken) {
            return (
                <div className="container">
                    <Dragger disabled>
                        <div className="ant-upload-drag-icon">
                            <Spin size="large" indicator={antIcon} />
                        </div>
                        <p className="ant-upload-text">Click or drag images to this area to upload</p>
                        <p className="ant-upload-hint">Single or multiple file upload.</p>
                    </Dragger>

                    <style jsx>{`
                        .container {
                            min-height: 200px;
                            max-width: 600px;
                            padding: 1rem;
                        }
                        .ant-upload-drag-icon {
                            min-height: 200px;
                            display: flex;
                            justify-content: center;
                            align-items: center;
                        }
                        .ant-upload-text {
                            display: flex;
                            justify-content: center;
                            align-items: center;
                        }
                        .ant-upload-hint {
                            display: flex;
                            justify-content: center;
                            align-items: center;
                        }
                        .steps-container {
                            display: flex;
                            width: 100%;
                            justify-content: center;
                            border: 1px dashed #e9e9e9;
                            margin: 0.5rem 0 0 0;
                        }
                        .steps-content {
                            display: flex;
                            width: 100%;
                            max-width: 600px;
                            height: 400px;
                            background-color: lightgrey;
                            justify-content: center;
                            align-items: center;
                            margin: 2rem 0;
                            border-radius: 0.2rem;

                        }
                    `}</style>
                </div>
            )
        }
        /*
         customRequest
         Allows for advanced customization by overriding default behavior in AjaxUploader. Provide your own XMLHttpRequest calls to interface with custom backend processes or interact with AWS S3 service through the aws-sdk-js package.

         customRequest callback is passed an object with:

         onProgress: (event: { percent: number }): void
         onError: (event: Error, body?: Object): void
         onSuccess: (body: Object): void
         data: Object
         filename: String
         file: File
         withCredentials: Boolean
         action: String
         headers: Object
         */

        return (
            <div className="container">
               <Dragger {...props}
                        onChange={this.handleChange}
                        customRequest={this.handleRequest}
                        onRemove={this.handleRemove}

                        onProgress={this.handleProgress}
                        fileList={this.state.fileList} >
                   <p className="ant-upload-drag-icon">
                       <Icon size="large" type="inbox" />
                   </p>
                   <p className="ant-upload-text">Click or drag images to this area to upload</p>
                   <p className="ant-upload-hint">Single or multiple file upload.</p>
                   {/*<Progress type="circle" percent={this.state.progress} width={50}/>*/}
               </Dragger>
                <Modal visible={previewVisible} footer={null} onCancel={this.handleCancel}>
                    <img alt="example" style={{ width: '100%' }} src={previewImage} />
                </Modal>
                <style jsx>{`
                        .container {
                            min-height: 200px;
                            max-width: 600px;
                            padding: 1rem;
                        }
                        .ant-upload-drag-icon {
                            min-height: 200px;
                            display: flex;
                            justify-content: center;
                            align-items: center;
                        }
                        .ant-upload-text {
                            display: flex;
                            justify-content: center;
                            align-items: center;
                        }
                        .ant-upload-hint {
                            display: flex;
                            justify-content: center;
                            align-items: center;
                        }
                        .steps-container {
                            display: flex;
                            width: 100%;
                            justify-content: center;
                            border: 1px dashed #e9e9e9;
                            margin: 0.5rem 0 0 0;
                        }
                        .steps-content {
                            display: flex;
                            width: 100%;
                            max-width: 600px;
                            height: 400px;
                            background-color: lightgrey;
                            justify-content: center;
                            align-items: center;
                            margin: 2rem 0;
                            border-radius: 0.2rem;

                        }
                    `}</style>
            </div>
        )
    }
}

export default UploadStepOne;