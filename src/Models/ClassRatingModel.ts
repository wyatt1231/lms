import { StudentModel } from "./StudentModel";

export interface ClassRatingModel {
  class_rate_pk?: number;
  class_pk?: number;
  student_pk?: number;
  compentency?: number;
  mastery?: number;
  professionalism?: number;
  helpfulness?: number;
  feedback?: string;
  rated_at?: string | Date;
  encoded_by?: number;
  student_info?: StudentModel;
  name?: string;
  bio?: string;
  position?: string;
  picture?: string;
}
