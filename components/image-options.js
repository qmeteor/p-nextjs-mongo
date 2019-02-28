/**
 * Created by Bien on 2018-01-29.
 */
import React from 'react';
import { Layout, Card } from 'antd';
const { Header, Footer, Sider, Content } = Layout;
const { Meta } = Card;
const header = {
    backgroundColor: '#ffffff',
};
const sider = {
    backgroundColor: '#ffffff',
};
const content = {
    backgroundColor: '#ffffff',
};


class ImageOptions extends React.Component {
    render() {
        return (
            <div className="container">
            <Layout>
                <Sider style={sider}>
                    <Card
                        hoverable
                        style={{ width: 240 }}
                        cover={<img alt="example" src="https://os.alipayobjects.com/rmsportal/QBnOOoLaAfKPirc.png" />}
                    >
                        <Meta
                            title="A.i. response"
                            description=" or maybe identifying tags...here?"
                        />
                    </Card>
                </Sider>
                <Layout>
                    <Header style={header}>Header</Header>
                    <Content style={content}>--------services/pricing category buttons?</Content>
                    <Content style={content}>--------ai identifier tags?</Content>
                </Layout>
            </Layout>
            <style jsx>{`
                        .container {
                            width: 100%;
                            padding: 0;
                        }
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


export default ImageOptions;