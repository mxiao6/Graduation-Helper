export const API_ROOT = `/api`;

// auth
export const POST_LOGIN = `/login`;
export const POST_SIGNUP = `/register`;
export const POST_SEND_EMAIL = `/sendemail`;
export const POST_RESET_PASSWORD = `/resetpassword`;

// class
export const GET_YEAR = `${API_ROOT}/years`;
export const GET_SEMESTER = `${API_ROOT}/semester`;
export const GET_SUBJECT = `${API_ROOT}/subject`;
export const GET_COURSE = `${API_ROOT}/course`;
export const GET_SECTION = `${API_ROOT}/section`;
export const GET_SECTION_DETAILS = `${API_ROOT}/sectionDetails`;

// schedule
export const POST_GENERATE_SCHEDULE = `/schedule/generate`;
export const POST_SAVE_SCHEDULE = `/saveschedule`;
