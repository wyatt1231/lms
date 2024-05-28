import {
  StudentReducerModel,
  StudentReducerTypes,
} from "../Types/StudentTypes";

const defaultState: StudentReducerModel = {
  fetching_selected_student: false,
  fetching_student_data_table: false,
  fetch_student_pref: false,
};

const StudentReducer = (
  state: StudentReducerModel = defaultState,
  action: StudentReducerTypes
): StudentReducerModel => {
  switch (action.type) {
    case "set_student_data_table": {
      return {
        ...state,
        student_data_table: action.student_data_table,
      };
    }
    case "fetching_student_data_table": {
      return {
        ...state,
        fetching_student_data_table: action.fetching_student_data_table,
      };
    }

    //--

    case "set_selected_student": {
      return {
        ...state,
        selected_student: action.selected_student,
      };
    }
    case "fetching_selected_student": {
      return {
        ...state,
        fetching_selected_student: action.fetching_selected_student,
      };
    }

    //--

    case "logged_student_info": {
      return {
        ...state,
        logged_student_info: action.logged_student_info,
      };
    }

    case "fetch_logged_student_info": {
      return {
        ...state,
        fetch_logged_student_info: action.fetch_logged_student_info,
      };
    }
    //
    case "set_student_pref": {
      return {
        ...state,
        student_pref: action.student_pref,
      };
    }
    case "fetching_student_pref": {
      return {
        ...state,
        fetch_student_pref: action.fetching_student_pref,
      };
    }
    //
    case "set_is_show_preferences": {
      return {
        ...state,
        is_show_preferences: action.is_show_preferences,
      };
    }

    default:
      return state;
  }
};

export default StudentReducer;
