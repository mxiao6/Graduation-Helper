import { createStore, applyMiddleware } from 'redux';
import { createLogger } from 'redux-logger';
import thunkMiddleware from 'redux-thunk';
import promiseMiddleware from 'redux-promise-middleware';
import rootReducer from './reducer';

// let middleware = [thunkMiddleware, promiseMiddleware];
let middleware;
if (process.env.NODE_ENV === 'production') {
  middleware = [thunkMiddleware];
} else {
  middleware = [thunkMiddleware, createLogger()];
}

function configureStore() {
  const store = createStore(rootReducer, applyMiddleware(...middleware));
  return store;
}

export default configureStore;
