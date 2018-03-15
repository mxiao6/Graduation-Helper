import rootReducer from "./reducer";

function configureStore(initialState) {
  const store = createStore(rootReducer, initialState);

  return store;
}

export default configureStore;
