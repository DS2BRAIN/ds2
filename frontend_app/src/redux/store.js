import { createStore, applyMiddleware } from 'redux';
import createSagaMiddleware from 'redux-saga';
import { composeWithDevTools } from 'redux-devtools-extension';
import rootSaga from './sagas';
import rootReducer from './reducers';


const sagaMiddleware = createSagaMiddleware();

const store = !process.env.REACT_APP_DEPLOY ? createStore(
  rootReducer, composeWithDevTools(
    applyMiddleware(sagaMiddleware)
  )) : createStore(
    rootReducer, applyMiddleware(sagaMiddleware))

sagaMiddleware.run(rootSaga);

export default store;
