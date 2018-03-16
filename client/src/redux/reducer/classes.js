import * as types from "../actionTypes";
import initialState from "../initialState";

export default function(state = initialState.classes, action) {
  switch (action.type) {
    case types.SEMESTER_SET:
      return { ...state, semester: action.semester };
    case types.SEMESTER_RESET:
      return { ...state, semester: undefined };
    default:
      return state;
  }
}
