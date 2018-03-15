import axios from "axios";
import * as types from "actionTypes";
import { POST_LOGIN } from "api";

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
      .post(USER_LOGIN, info)
      .then(res => {
        dispatch(loginSuccess(res.data));
      })
      .catch(error => {
        console.log("login failure", error.response);
        if (error.response.data.error === "User Nonexist") {
          Alert.alert("未识别到该账号，请注册或绑定已有账号");
        }
        dispatch(loginFailure());
      });
  };
}

export function updateSession(info) {
  return function(dispatch) {
    dispatch(loginSuccess(info));
  };
}
