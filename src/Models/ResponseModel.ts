export interface ResponseModel {
  success: boolean;
  message?: string;
  data?: any;
  errors?: Array<string>;
}

export interface OptionModel {
  id: string;
  label: string;
}
