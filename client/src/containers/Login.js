import axios from "axios";
import * as types from "actionTypes";
import { POST_LOGIN } from "api";
import { message } from "antd";

export function loginSuccess(user) {
  return {
    type: types.LOGIN_SUCCESS,
    user
  };
}

export function loginFailure() {
  return {
    type: types.LOGIN_FAILURE
  };
}

export function login(info) {
  return function(dispatch) {
    return axios
      .post(POST_LOGIN, info)
      .then(res => {
        console.log(res);
        dispatch(loginSuccess(res.data));
        message.success(res.data.message);
      })
      .catch(e => {
        console.error("login failure", e.response);
        dispatch(loginFailure());
        message.error(e.response.data);
      });
  };
}
