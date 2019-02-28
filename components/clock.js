/**
 * Created by Bien on 2018-01-18.
 */

import React from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { startClock } from '../actions'

const format = t => `${pad(t.getUTCHours())}:${pad(t.getUTCMinutes())}:${pad(t.getUTCSeconds())}`

const pad = n => n < 10 ? `0${n}` : n

class AddCount extends React.Component {
    render () {

        return (
            <div className={this.props.count.light ? 'light' : ''}>
                {format(new Date(this.props.count.lastUpdate))}
                <style jsx>{`
        div {
          padding: 15px;
          display: inline-block;
          color: #82FA58;
          font: 50px menlo, monaco, monospace;
          background-color: #000;
        }

        .light {
          background-color: #999;
        }
      `}</style>
            </div>
        )
    }
}

function mapStateToProps(state) {
    return {
        count: state.clock
    };
}

const mapDispatchToProps = (dispatch) => {
    return {
        startClock: bindActionCreators(startClock, dispatch)
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(AddCount)