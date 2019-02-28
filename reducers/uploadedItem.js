/**
 * Created by Bien on 2018-01-24.
 */
import _ from 'lodash';
import {
    ADD_UPLOADED_ITEM,
    TOGGLE_UPLOADED_ITEM
} from '../actions/types';

export default function(state = null, action) {

    switch (action.type) {
        case ADD_UPLOADED_ITEM:
            //console.log('retrieving upload description ', action.payload);
            return (
                {
                    id: action.id,
                    payload: _.toArray(action.payload),
                    completed: false
                }
            );
        case TOGGLE_UPLOADED_ITEM:
            return state.map(todo =>
                (todo.id === action.id)
                    ? {...todo, completed: !todo.completed}
                    : todo
            );
        default:
            return state
    }
}