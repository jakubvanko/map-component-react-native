import { combineReducers } from 'redux';
import {labelsReducer} from './labels/reducer';
import {generalReducer} from './general/reducer';
import {notificationsReducer} from './notifications/reducer';

export const rootReducer = combineReducers({
    general: generalReducer,
    labels: labelsReducer,
    notifications: notificationsReducer
});

export type AppState = ReturnType<typeof rootReducer>;
