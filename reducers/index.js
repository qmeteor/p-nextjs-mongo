/**
 * Created by Bien on 2018-01-18.
 */
import { combineReducers } from 'redux';
import clockReducer from './clockReducer';
import uploadedItem from './uploadedItem';

export const rootReducer = combineReducers({
    clock: clockReducer,
    uploadedItem
});