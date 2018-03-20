import { createStore, applyMiddleware } from "redux";
import thunkMiddleware from "redux-thunk";
import promiseMiddleware from 'redux-promise-middleware';
import rootReducer from "./reducer";

// let middleware = [thunkMiddleware, promiseMiddleware];
let middleware = [thunkMiddleware];

function configureStore() {
  const store = createStore(
    rootReducer,
    applyMiddleware(...middleware)
  );

  return store;
}

export default configureStore;
