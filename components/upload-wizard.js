/**
 * Created by Bien on 2018-01-19.
 */
import React from 'react';
import Link from 'next/link'
import { Container, Row, Col } from 'reactstrap';
import { Steps, Button, message, Icon, Radio, Tooltip, Affix, Alert, Layout, Form, Modal, Divider} from 'antd';
import UploadStepOne from './upload-step-1';
import InstructionsStepTwo from './instructions-step-2';


const { Step } = Steps;
const { Header, Content, Sider} = Layout;
const FormItem = Form.Item;


const steps = [{
    title: 'Upload',
    content: 'You can drag and drop photos here',
}, {
    title: 'Instructions',
    content: 'Add comments here',
}, {
    title: 'Select Service',
    content: 'Pick a package that suits your needs.',
}, {
    title: 'Checkout',
    content: 'Final check before you pay.',
}];


export default class UploadWizard extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            current: 0,
            status: 'process',
            imageUploaded: true,
            visible: false
        };
    }
    next() {
        // check imageUploaded state, if false set status to error else finish
        if(this.state.current === 0) {
            if (!this.state.imageUploaded) {
                this.setState({status: 'error'});
            } else {
                const current = this.state.current + 1;
                this.setState({ current });
                this.setState({status: 'process'});
                this.setState({description: ''});
            }
        }
    }
    prev() {
        if(this.state.current === 1) {
            if(!this.state.imageUploaded) {
                const current = this.state.current - 1;
                this.setState({ current });
                this.setState({status: 'error'});
            } else {
                const current = this.state.current - 1;
                this.setState({ current });
                this.setState({status: 'process'});
                this.setState({description: ''});
            }
        }

    }

    showModal = () => {
        this.setState({
            visible: true,
        });
    }
    handleOk = (e) => {
        console.log(e);
        this.setState({
            visible: false,
        });
    }
    handleCancel = (e) => {
        console.log(e);
        this.setState({
            visible: false,
        });
    }


    render() {
        const { current } = this.state;
        const uploadComponent = <UploadStepOne/>;
        const instructionsComponent = <InstructionsStepTwo/>;

        let currentStepsContainer;
        // map across the current state and set steps-container to appropriate component.
        // 1. Upload container
        // 2. Instructions container
        // 3. Select Service container
        // 4. Checkout

        switch (current) {
            case 0:
                currentStepsContainer = uploadComponent;
                break;
            case 1:
                currentStepsContainer = instructionsComponent;
                break;
            case 2:
                console.log('apricot');
                break;
            default:
                console.log('beans');
        }

        const getDescription = (item) => {
            if(item.title === 'Upload' && this.state.status === 'error') {
                return "You forgot to upload an image."
            }
        };

        return (
            <div className="container">
                <Steps size="small" current={current} status={this.state.status}>
                    {steps.map((item, description) => <Step key={item.title} title={item.title} description={getDescription(item, description)}/>)}
                </Steps>
                {currentStepsContainer}
                <div className="footer">Unable to upload? &nbsp;
                    <Link prefetch href="/contact-us">
                        <a href="/contact-us">Contact us</a>
                    </Link>&nbsp;for help</div>
                <div className="steps-action">
                    {
                        this.state.current < steps.length - 1
                        &&
                        <Button type="primary" onClick={() => this.next()}>Next</Button>
                    }
                    {
                        this.state.current === steps.length - 1
                        &&
                        <Button type="primary" onClick={() => message.success('Processing complete!')}>Done</Button>
                    }
                    {
                        this.state.current > 0
                        &&
                        <Button style={{ marginLeft: 8 }} onClick={() => this.prev()}>
                            Previous
                        </Button>
                    }
                </div>
                <style jsx>{`
                    .footer {
                        display: flex;
                        justify-content: center;
                    }
                `}</style>
            </div>
        );
    }
}


