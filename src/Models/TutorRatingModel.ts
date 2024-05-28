export interface TutorRatingsModel {
  rate_pk?: number;
  tutor_pk?: number;
  class_rating?: string;
  rating?: number;
  say?: string;
  student_pk?: number;
  encoded_at?: string | Date;
  encoded_by?: number;
}
