/**
 * Created by Bien on 2018-01-21.
 */
import React from 'react';
import BootstrapTable from 'react-bootstrap-table-next';

// Actions
import { } from '../actions';
import {
} from '../actions/types';


const columns = [{
    dataField: 'projectName',
    text: 'Project Name',
    headerStyle: {
        fontSize: '0.85em',
        backgroundColor: 'rgba(255, 255, 255, 1)',
        color: 'rgba(0, 0, 0, 1)'
    }
}, {
    dataField: 'dateUploaded',
    text: 'Last Updated',
    headerStyle: {
        fontSize: '0.85em',
        backgroundColor: 'rgba(255, 255, 255, 1)',
        color: 'rgba(0, 0, 0, 1)'
    }
}, {
    dataField: 'status',
    text: 'Status',
    headerStyle: {
        fontSize: '0.85em',
        backgroundColor: 'rgba(255, 255, 255, 1)',
        color: 'rgba(0, 0, 0, 1)'
    }
}, {
    dataField: 'service',
    text: 'Service',
    headerStyle: {
        fontSize: '0.85em',
        backgroundColor: 'rgba(255, 255, 255, 1)',
        color: 'rgba(0, 0, 0, 1)'
    }
}, {
    dataField: 'quantity',
    text: 'Total',
    headerStyle: {
        fontSize: '0.85em',
        backgroundColor: 'rgba(255, 255, 255, 1)',
        color: 'rgba(0, 0, 0, 1)'
    },
},  {
    dataField: 'total',
    text: 'Total',
    headerStyle: {
        fontSize: '0.85em',
        backgroundColor: 'rgba(255, 255, 255, 1)',
        color: 'rgba(0, 0, 0, 1)'
    },
}];

let products = [{
    fileName: 1,
    dateUploaded: "Item name 1",
    status: "complete",
    comments: 'comments',
    price: '$14.95',
    download: "download"
},{
    fileName: 2,
    dateUploaded: "Item name 1",
    status: "in progress",
    comments: 'comments',
    price: '$14.95',
    download: "download"
}];

const rowStyle = {
    fontSize: '0.8em',
    height: '1.5em',
    backgroundColor: 'rgba(255, 255, 255, 1)',
    color: 'rgba(0, 0, 0, 1)'
};


const indication = () => {
    return "Table is Empty. Upload an image to begin."
};

export default class UploadTable extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
        };

    }

    handleRowSelect(row, isSelected, e) {
        console.log(row, isSelected, e);
    }

    render() {
        const selectRow = {
            mode: 'checkbox',
            clickToSelect: false,
            style: {
                backgroundColor: '#eaecf7',
                fontSize: '0.8em',
                padding: '0',
                margin: '0'
            },
            clickToEdit: true,
            onSelect: this.handleRowSelect
        };

        return (
                <BootstrapTable
                    keyField="fileName"
                    data={ products }
                    columns={ columns }
                    bordered={ false }
                    noDataIndication={ indication }
                    selectRow={ selectRow }
                    rowStyle={ rowStyle }
                    hover
                />
        );
    }
}
