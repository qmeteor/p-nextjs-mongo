/**
 * Created by Bien on 2018-01-28.
 */
import React from 'react';
import { Input } from 'antd';
const { TextArea } = Input;

class AdditionalInstructions extends React.Component {
    render() {
        return (
            <div>
                <TextArea placeholder="Add additional instructions to clarify " autosize={{minRows: 2, maxRows: 15}} />
            </div>
        )
    }
}

export default AdditionalInstructions;