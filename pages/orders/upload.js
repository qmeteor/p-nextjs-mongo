/**
 * Created by Bien on 2018-01-10.
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
import Page from '../../components/page'
import Layout from '../../components/layout'
import Session from '../../components/session'
import Cookies from '../../components/cookies'
import UploadWizard from '../../components/upload-wizard'


// Actions
import { initStore } from '../../actions';
import {

} from '../../actions/types';

/**
 * This modules uses 'unfetch', which works like fetch, except - unlike
 * isomorphic-fetch - it sends cookies so can be used with session based
 * authentication to make ssecure requests using HTTP only cookies.
 **/




class Upload extends Page {

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
    }

    render() {
        if (this.state.isSignedIn === true) {
            const alert = (this.state.alertText === null) ? <div/> : <UncontrolledAlert className={`alert ${this.state.alertStyle}`} role="alert">{this.state.alertText}</UncontrolledAlert>

            return (
                <Layout session={this.state.session} navmenu={false}>
                    {alert}
                    <Row className="mt-4">
                        <Col xs="12" md="12" lg="12">
                            <UploadWizard />
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

const mapDispatchToProps = (dispatch) => {
    return {

    }
};

export default compose(
    withRedux(initStore, null, mapDispatchToProps),
    DragDropContext(HTML5Backend)
)(Upload);