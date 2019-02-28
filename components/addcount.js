/**
 * Created by Bien on 2018-01-18.
 */
import React from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { addCount } from '../actions'

class AddCount extends React.Component {
    add = () => {
        this.props.addCount()
    }

    render () {
        const { count } = this.props
        return (
            <div>
                <style jsx>{`
          div {
            padding: 0 0 20px 0;
          }
      `}</style>
                <h1>AddCount: <span>{count}</span></h1>
                <button onClick={this.add}>Add To Count</button>
            </div>
        )
    }
}

function mapStateToProps(state) {
    return {
        count: state.clock.count
    };
}

const mapDispatchToProps = (dispatch) => {
    return {
        addCount: bindActionCreators(addCount, dispatch)
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(AddCount)