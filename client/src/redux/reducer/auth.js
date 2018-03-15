import * as types from "../actionTypes";
import initialState from "../initialState";

export default function(state = initialState.auth, action) {
  switch (action.type) {
    case types.LOGIN_SUCCESS:
      return { ...state, user: action.user };
    case types.LOGOUT_SUCCESS:
    case types.SESSION_EXPIRED:
      return { ...state, user: undefined };
    default:
      return state;
  }
}
