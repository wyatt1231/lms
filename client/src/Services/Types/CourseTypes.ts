import { CourseModel } from "../Models/CourseModel";
import { OptionModel } from "../Models/PaginationModels";

interface CourseDataTableModel {
  limit: number;
  count: number;
  begin: number;
  table: Array<CourseModel>;
}

export type CourseReducerTypes =
  | {
      type: "set_course_data_table";
      course_data_table: CourseDataTableModel;
    }
  | {
      type: "fetching_course_data_table";
      fetching_course_data_table: boolean;
    }
  //
  | {
      type: "set_course_options";
      course_options: OptionModel[];
    }
  | {
      type: "fetching_course_options";
      fetching_course_options: boolean;
    }
  //
  | {
      type: "set_selected_course";
      selected_course: CourseModel;
    }
  | {
      type: "fetching_selected_course";
      fetching_selected_course: boolean;
    };

export interface CourseReducerModel {
  course_data_table?: null | CourseDataTableModel;
  fetching_course_data_table: boolean;
  //
  course_options?: OptionModel[];
  fetching_course_options: boolean;
  //
  selected_course?: CourseModel;
  fetching_selected_course: boolean;
}
