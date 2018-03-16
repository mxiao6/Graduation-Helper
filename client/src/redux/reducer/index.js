import { combineReducers } from "redux";
import auth from "./auth";
import classes from "./classes";

const rootReducer = combineReducers({
  auth,
  classes
});

export default rootReducer;
