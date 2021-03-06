/**
 * Created by Bien on 2018-01-26.
 */
import React from 'react'
import Router from 'next/router'
import Link from 'next/link'
import fetch from 'unfetch'
import { Row, Col, Form, FormGroup, Label, Input, Button, UncontrolledAlert,
    Card, CardImg, CardText, CardBody, CardTitle, CardSubtitle, CardLink
} from 'reactstrap'
import Page from '../components/page'
import Layout from '../components/layout'
import Session from '../components/session'
import Cookies from '../components/cookies'

/**
 * This modules uses 'unfetch', which works like fetch, except - unlike
 * isomorphic-fetch - it sends cookies so can be used with session based
 * authentication to make secure requests using HTTP only cookies.
 **/

export default class extends Page {

    static async getInitialProps({req, query}) {
        const value = await Session.getSession({force: true, req: req})
        return {
            session: await Session.getSession({force: true, req: req})
        }
    }

    constructor(props) {
        super(props);
        this.state = {
            session: props.session,
            isSignedIn: (props.session.user) ? true : false,
            name: '',
            email: '',
            company: '',
            address: '',
            mainContact: '',
            city: '',
            state: '',
            zip: '',
            country: '',
            phone: '',
            url: '',
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
            this.state.company = props.session.user.company;
            this.state.address = props.session.user.address;
            this.state.mainContact = props.session.user.mainContact;
            this.state.city = props.session.user.city;
            this.state.state = props.session.user.state;
            this.state.zip = props.session.user.zip;
            this.state.country = props.session.user.country;
            this.state.phone = props.session.user.phone;
            this.state.url = props.session.user.url;
        }
        this.handleChange = this.handleChange.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
        this.handleSignoutSubmit = this.handleSignoutSubmit.bind(this);
    }

    async componentDidMount() {
        const session = await Session.getSession({force: true});
        this.setState({
            session: session,
            isSignedIn: (session.user) ? true : false
        });

        // If the user bounces off to link/unlink their account we want them to
        // land back here after signing in with the other service / unlinking.
        Cookies.save('redirect_url', '/account');

        this.getProfile()
    }

    getProfile() {
        fetch('/account/user', {
            credentials: 'include'
        })
            .then(r => r.json())
            .then(user => {
                if (!user.name || !user.email) return;
                this.setState({
                    name: user.name,
                    email: user.email,
                    company: user.company,
                    address: user.address,
                    mainContact: user.mainContact,
                    city: user.city,
                    state: user.state,
                    zip: user.zip,
                    country: user.country,
                    phone: user.phone,
                    url: user.url,
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

    async onSubmit(e) {
        // Submits the URL encoded form without causing a page reload
        e.preventDefault();

        this.setState({
            alertText: null,
            alertStyle: null
        });

        const formData = {
            _csrf: await Session.getCsrfToken(),
            name: this.state.name || '',
            email: this.state.email || '',
            company: this.state.company || '',
            address: this.state.address || '',
            mainContact: this.state.mainContact || '',
            city: this.state.city || '',
            state: this.state.state || '',
            zip: this.state.zip || '',
            country: this.state.country || '',
            phone: this.state.phone || '',
            url: this.state.url || '',
        };

        // URL encode form
        // Note: This uses a x-www-form-urlencoded rather than sending JSON so that
        // the form also in browsers without JavaScript
        const encodedForm = Object.keys(formData).map((key) => {
            return encodeURIComponent(key) + '=' + encodeURIComponent(formData[key])
        }).join('&');

        fetch('/account/user', {
            credentials: 'include',
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: encodedForm
        })
            .then(async res => {
                if (res.status === 200) {
                    this.getProfile();
                    this.setState({
                        alertText: 'Changes to your profile have been saved',
                        alertStyle: 'alert-success',
                    });
                    // Force update session so that changes to name or email are reflected
                    // immediately in the navbar (as we pass our session to it)
                    this.setState({
                        session: await Session.getSession({force: true}),
                    })
                } else {
                    this.setState({
                        session: await Session.getSession({force: true}),
                        alertText: 'Failed to save changes to your profile',
                        alertStyle: 'alert-danger',
                    })
                }
            })
    }

    async handleSignoutSubmit(event) {
        event.preventDefault();
        await Session.signout();
        Router.push('/');
    }

    render() {

        if (this.state.isSignedIn === true) {
            const alert = (this.state.alertText === null) ? <div/> : <UncontrolledAlert className={`alert ${this.state.alertStyle}`} role="alert">{this.state.alertText}</UncontrolledAlert>;

            return (
                <Layout session={this.state.session} navmenu={false}>
                    <Row className="mb-1">
                        <Col xs="12">
                            <h2 className="display-5">Credit</h2>
                            <p className="lead text-muted">
                                Edit your profile and link your account
                            </p>
                        </Col>
                    </Row>
                    {alert}
                    <Row className="mt-4">
                        <Col xs="12" md="7" lg="8">
                            <Form method="post" action="/account/user" onSubmit={this.onSubmit}>
                                <Input name="_csrf" type="hidden" value={this.state.session.csrfToken} onChange={()=>{}}/>
                                <FormGroup row>
                                    <Label sm={2}>Name:</Label>
                                    <Col sm={10} md={8}>
                                        <Input name="name" value={this.state.name} onChange={this.handleChange}/>
                                    </Col>
                                </FormGroup>
                                <FormGroup row>
                                    <Label sm={2}>Email:</Label>
                                    <Col sm={10} md={8}>
                                        <Input name="email" value={(this.state.email.match(/.*@localhost\.localdomain$/)) ? '' : this.state.email} onChange={this.handleChange}/>
                                    </Col>
                                </FormGroup>
                                <FormGroup row>
                                    <Label sm={2}>Company:</Label>
                                    <Col sm={10} md={8}>
                                        <Input name="company" value={this.state.company} onChange={this.handleChange}/>
                                    </Col>
                                </FormGroup>
                                <FormGroup row>
                                    <Label sm={2}>Address:</Label>
                                    <Col sm={10} md={8}>
                                        <Input name="address" value={this.state.address} onChange={this.handleChange}/>
                                    </Col>
                                </FormGroup>
                                <FormGroup row>
                                    <Label sm={2}>Contact Person:</Label>
                                    <Col sm={10} md={8}>
                                        <Input name="mainContact" value={this.state.mainContact} onChange={this.handleChange}/>
                                    </Col>
                                </FormGroup>
                                <FormGroup row>
                                    <Label sm={2}>City:</Label>
                                    <Col sm={10} md={8}>
                                        <Input name="city" value={this.state.city} onChange={this.handleChange}/>
                                    </Col>
                                </FormGroup>
                                <FormGroup row>
                                    <Label sm={2}>State/Province:</Label>
                                    <Col sm={10} md={8}>
                                        <Input name="state" value={this.state.state} onChange={this.handleChange}/>
                                    </Col>
                                </FormGroup>
                                <FormGroup row>
                                    <Label sm={2}>Zip/Postal Code:</Label>
                                    <Col sm={10} md={8}>
                                        <Input name="zip" value={this.state.zip} onChange={this.handleChange}/>
                                    </Col>
                                </FormGroup>
                                <FormGroup row>
                                    <Label sm={2}>Country:</Label>
                                    <Col sm={10} md={8}>
                                        <Input name="country" value={this.state.country} onChange={this.handleChange}/>
                                    </Col>
                                </FormGroup>
                                <FormGroup row>
                                    <Label sm={2}>Phone:</Label>
                                    <Col sm={10} md={8}>
                                        <Input name="phone" value={this.state.phone} onChange={this.handleChange}/>
                                    </Col>
                                </FormGroup>
                                <FormGroup row>
                                    <Label sm={2}>Website:</Label>
                                    <Col sm={10} md={8}>
                                        <Input name="url" value={this.state.url} onChange={this.handleChange}/>
                                    </Col>
                                </FormGroup>
                                <FormGroup row>
                                    <Col sm={12} md={10}>
                                        <p className="text-right">
                                            <Button color="primary" type="submit">Save Changes</Button>
                                        </p>
                                    </Col>
                                </FormGroup>
                            </Form>
                        </Col>
                        <Col xs="12" md="5" lg="4">
                            <Card>
                                <CardBody>
                                    <CardTitle>{this.state.name}</CardTitle>
                                    <CardSubtitle>CEO</CardSubtitle>
                                </CardBody>
                                <img width="100%" src="https://placeholdit.imgix.net/~text?txtsize=33&txt=318%C3%97280&w=318&h=280" alt="Card image cap" />
                                <CardBody>
                                    <CardText>Professional fashion & editorial photographer.</CardText>
                                    <LinkedAccounts
                                        session={this.props.session}
                                        linkedWithFacebook={this.state.linkedWithFacebook}
                                        linkedWithGoogle={this.state.linkedWithGoogle}
                                        linkedWithTwitter={this.state.linkedWithTwitter}
                                        gotProfile={this.state.gotProfile}
                                    />
                                    <CardLink href="#">{this.state.url}</CardLink><br/>
                                    <small className="text-muted">Last updated 3 mins ago</small>
                                </CardBody>

                            </Card>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <h2>Sign out</h2>
                            <p>
                                If you sign out, you can sign in again at any time.
                            </p>
                            <Form id="signout" method="post" action="/auth/signout" onSubmit={this.handleSignoutSubmit}>
                                <input name="_csrf" type="hidden" value={this.state.session.csrfToken}/>
                                <Button type="submit" color="outline-secondary"><span className="icon ion-md-log-out mr-1"></span> Sign Out</Button>
                            </Form>
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

export class LinkedAccounts extends React.Component {
    render() {
        if (typeof window === 'undefined' || this.props.gotProfile !== true) {
            /**
             * Don't display if rendering server side or if we haven't fetch the
             * profile yet. Note: This requires JavaScript in the browser to be
             * enabled, but most oAuth providers only work with JavaScript enabled!
             */
            return null
        } else {
            return (
                <React.Fragment>
                    <LinkAccount provider="Facebook" session={this.props.session} linked={this.props.linkedWithFacebook}/>
                    <LinkAccount provider="Google" session={this.props.session} linked={this.props.linkedWithGoogle}/>
                    <LinkAccount provider="Twitter" session={this.props.session} linked={this.props.linkedWithTwitter}/>
                </React.Fragment>
            )
        }
    }
}

export class LinkAccount extends React.Component {
    render() {
        if (this.props.linked === true) {
            return (
                <Form action={`/auth/oauth/${this.props.provider.toLowerCase()}/unlink`} method="post">
                    <Input name="_csrf" type="hidden" value={this.props.session.csrfToken}/>
                    <p>
                        <Button block color="danger" outline type="submit">
                            Unlink from {this.props.provider}
                        </Button>
                    </p>
                </Form>
            )
        } else if (this.props.linked === false) {
            return (
                <p>
                    <a className="btn btn-block btn-outline-dark" href={`/auth/oauth/${this.props.provider.toLowerCase()}`}>
                        <span className="icon ion-md-link mr-1"></span> Link with {this.props.provider}
                    </a>
                </p>
            )
        } else {
            // Still fetching data
            return (<p/>)
        }
    }
}