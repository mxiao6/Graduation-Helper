import * as types from "actionTypes";
import { message } from "antd";

export function logoutSuccess() {
  return {
    type: types.LOGOUT_SUCCESS
  };
}

export function logout() {
  return function(dispatch) {
    dispatch(logoutSuccess());
    message.success("Logout successful");
  };
}
