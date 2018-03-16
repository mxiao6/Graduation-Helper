import * as types from "actionTypes";

export function semesterSet(semester) {
  return {
    type: types.SEMESTER_SET,
    semester
  };
}

export function semesterReset() {
  return {
    type: types.SEMESTER_RESET
  };
}

export function setSemester(semester) {
  return function(dispatch) {
    dispatch(semesterSet(semester));
  };
}

export function resetSemester() {
  return function(dispatch) {
    dispatch(semesterReset());
  };
}
