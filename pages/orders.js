/**
 * Created by Bien on 2018-01-26.
 */
import React, { Component } from 'react'
import { DragDropContext } from 'react-dnd'
import HTML5Backend from 'react-dnd-html5-backend'
import { connect } from 'react-redux';
import withRedux from 'next-redux-wrapper'
import { compose, bindActionCreators } from 'redux';
import Router from 'next/router'
import Link from 'next/link'
import fetch from 'unfetch'
import { Row, Col, Form, FormGroup, Label, Input, Button, Badge, UncontrolledAlert, Card, CardImg, CardText, CardBody,
    CardTitle, CardSubtitle } from 'reactstrap'
import Page from '../components/page'
import Layout from '../components/layout'
import Session from '../components/session'
import Cookies from '../components/cookies'
import UploadTable from '../components/upload-table-bootstrap'
// Actions
import { initStore } from '../actions';
import {

} from '../actions/types';

/**
 * This modules uses 'unfetch', which works like fetch, except - unlike
 * isomorphic-fetch - it sends cookies so can be used with session based
 * authentication to make ssecure requests using HTTP only cookies.
 **/




export default class Upload extends Page {

    static async getInitialProps({req, query}) {
        return {
            session: await Session.getSession({force: true, req: req}),
            value: await Session.getSession({force: true, req: req})
        }
    }

    constructor(props) {
        super(props);
        this.state = {
            session: props.session,
            isSignedIn: (props.session.user) ? true : false,
            name: '',
            email: '',
            emailVerified: false,
            linkedWithFacebook: false,
            linkedWithGoogle: false,
            linkedWithTwitter: false,
            alertText: null,
            alertStyle: null,
            gotProfile: false
        };
        if (props.session.user) {
            this.state.name = props.session.user.name;
            this.state.email = props.session.user.email;
        }
        this.handleChange = this.handleChange.bind(this);
    }

    async componentDidMount() {
        const session = await Session.getSession({force: true})
        this.setState({
            session: session,
            isSignedIn: (session.user) ? true : false
        });

        // If the user bounces off to link/unlink their account we want them to
        // land back here after signing in with the other service / unlinking.
        Cookies.save('redirect_url', '/account')

        this.getProfile()
    }

    getProfile() {
        fetch('/account/user', {
            credentials: 'include'
        })
            .then(r => r.json())
            .then(user => {
                if (!user.name || !user.email) return
                this.setState({
                    name: user.name,
                    email: user.email,
                    emailVerified: user.emailVerified,
                    linkedWithFacebook: user.linkedWithFacebook,
                    linkedWithGoogle: user.linkedWithGoogle,
                    linkedWithTwitter: user.linkedWithTwitter,
                    gotProfile: true
                })
            })
    }

    handleChange(event) {
        this.setState({
            [event.target.name]: event.target.value
        })
    }


    async handleSignoutSubmit(event) {
        event.preventDefault();
        await Session.signout();
        Router.push('/')
    }

    render() {
        if (this.state.isSignedIn === true) {
            const alert = (this.state.alertText === null) ? <div/> : <UncontrolledAlert className={`alert ${this.state.alertStyle}`} role="alert">{this.state.alertText}</UncontrolledAlert>

            return (
                <Layout session={this.state.session} navmenu={false}>
                    <Row className="mb-1">
                        <Col xs="12">
                            <h2 className="display-5">Orders

                            </h2>
                            <p className="lead text-muted">
                                Drag and drop your images to upload.
                            </p>
                        </Col>
                    </Row>
                    {alert}
                    <Row className="mt-4">
                        <Col xs="12" md="12" lg="12">
                            <Form method="post" action="/account/user" onSubmit={this.onSubmit}>
                                <Input name="_csrf" type="hidden" value={this.state.session.csrfToken} onChange={()=>{}}/>
                                <UploadTable />
                            </Form>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <p>
                                Review completed images and if you are happy with the edits pick the images you wish to checkout.
                            </p>
                        </Col>
                    </Row>
                </Layout>
            )
        } else {
            return (
                <Layout session={this.props.session} navmenu={false}>
                    <Row>
                        <Col xs="12" className="text-center pt-5 pb-5">
                            <p className="lead">
                                <Link href="/auth/signin"><a>Sign in to view your account.</a></Link>
                            </p>
                        </Col>
                    </Row>
                </Layout>
            )
        }
    }
}
