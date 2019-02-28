/**
 * Created by Bien on 2018-02-03.
 */
import React from 'react';
import { Container, Row, Col } from 'reactstrap';
import { Steps, Button, message, Icon, Radio, Tooltip, Affix, Alert, Layout, Form, Modal, Divider} from 'antd';
const { Step } = Steps;
const { Header, Content, Sider} = Layout;
import ImageOptions from '../components/image-options';
import QuickEntries from '../components/quick-entries';
import AdditionalInstructions from '../components/additional-instructions';

const rightStyle = {
    backgroundColor: '#dcdcdc',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
};

class InstructionsStepTwo extends React.Component {
    render() {
        const numbers = [];
        const listItems = numbers.map((number) =>
            <li>Image: {number}</li>
        );

        return (
            <div>
                <Container>
                    <Row>
                        <Col xs="12" md="6" lg="7">
                            <div className="left">
                                <Row>
                                    <div className="project_name">
                                        Project Name: #9021929
                                        <Tooltip placement="left" title="Edit Name">
                                            <Button type="dashed" shape="circle" icon="edit" size="large" />
                                        </Tooltip>
                                    </div>
                                </Row>
                                <Row>
                                    <div className="project_name">
                                        You can set a project name to quickly identify or search your orders.
                                    </div>
                                </Row>
                                <Row>
                                    <div className="project_name">
                                        Quantity: 2
                                        <Tooltip placement="left" title="Add Photos">
                                            <Button type="dashed" shape="circle" icon="plus" size="large" />
                                        </Tooltip>
                                    </div>
                                </Row>
                                <Alert message="Notification" description="Any photos NOT for editing please set image as a reference below by clicking 'Set As Reference'." type="warning" closeText={<Icon type="close" />} showIcon />
                                <Row>
                                    <div className="image_options">
                                        <ImageOptions/>
                                    </div>
                                    <ul>
                                        {listItems}
                                    </ul>
                                </Row>
                            </div>
                        </Col>

                        <Col xs="12" md="4" lg="5">
                            <Affix offsetTop={140} onChange={affixed => console.log(affixed)}>
                                <div className="right">
                                    <Layout>
                                        <Header style={rightStyle}>Quick Entries</Header>
                                        <div className="content">
                                            <Content>
                                                <QuickEntries />
                                                <Divider><small>Additional Instructions</small></Divider>
                                                <AdditionalInstructions/>
                                                <div style={{margin: '20 0'}}/>
                                                <Button>Save Instructions</Button>
                                            </Content>
                                        </div>
                                    </Layout>
                                </div>
                            </Affix>
                        </Col>
                    </Row>
                </Container>
                <style jsx>{`

                        .left {
                            border: 1px solid #e9e9e9;
                            background-color: #ffffff;
                        }
                        .right {
                            height: 100%;
                            background-color: #ffffff;
                            border: 1px solid #e9e9e9;
                        }
                        div {
                            margin: 1rem 0;
                        }
                        .project_name {
                            display: flex;
                            justify-content: space-between;
                            align-items: center;
                            width: 100%;
                            padding: 0 1rem;
                        }
                        .content {
                            background-color: #ffffff;
                            margin: 0;
                            padding: 1rem;
                        }
                        .image_options {
                            display: flex;
                            justify-content: space-between;
                            align-items: center;
                            width: 100%;
                            padding: 0 1rem;
                        }

                    `}</style>
            </div>
        )
    }
}

export default InstructionsStepTwo;