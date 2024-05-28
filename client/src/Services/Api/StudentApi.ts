import { PostFetch } from "../../Hooks/UseFetch";
import IServerResponse from "../Interface/IServerResponse";
import { PaginationModel } from "../Models/PaginationModels";
import { StudentModel, StudentPrefModel } from "../Models/StudentModel";

const BASE_URL = `api/student/`;

const getStudentDataTableApi = async (
  payload: PaginationModel
): Promise<IServerResponse> => {
  const response = await PostFetch(BASE_URL + "getStudentDataTable", payload);
  return response;
};

const addStudentApi = async (
  payload: StudentModel
): Promise<IServerResponse> => {
  const response = await PostFetch(BASE_URL + "addStudent", payload);
  return response;
};

const updateStudent = async (
  payload: StudentModel
): Promise<IServerResponse> => {
  const response = await PostFetch(BASE_URL + "updateStudent", payload);
  return response;
};

const updateStudentImage = async (
  payload: StudentModel
): Promise<IServerResponse> => {
  const response = await PostFetch(BASE_URL + "updateStudentImage", payload);
  return response;
};

const getSingleStudentApi = async (
  student_pk: string
): Promise<IServerResponse> => {
  const response = await PostFetch(BASE_URL + "getSingleStudent", {
    student_pk,
  });
  return response;
};

const approveStudent = async (student_pk: number): Promise<IServerResponse> => {
  const response = await PostFetch(BASE_URL + "approveStudent", {
    student_pk,
  });
  return response;
};

const blockStudent = async (student_pk: number): Promise<IServerResponse> => {
  const response = await PostFetch(BASE_URL + "blockStudent", {
    student_pk,
  });
  return response;
};

const getTotalStudents = async (): Promise<IServerResponse> => {
  const response = await PostFetch(BASE_URL + "getTotalStudents", {});
  return response;
};

const getLoggedStudentInfo = async (): Promise<IServerResponse> => {
  const response = await PostFetch(BASE_URL + "getLoggedStudentInfo", {});
  return response;
};

//#region PREFERENCES

const getStudentPreference = async (): Promise<IServerResponse> => {
  const response = await PostFetch(BASE_URL + "getStudentPreference", {});
  return response;
};

const addOrUpdatePreference = async (
  payload: StudentPrefModel
): Promise<IServerResponse> => {
  const response = await PostFetch(BASE_URL + "addOrUpdatePreference", payload);
  return response;
};

//#endregion

export default {
  getStudentDataTableApi,
  addStudentApi,
  getSingleStudentApi,
  approveStudent,
  blockStudent,
  getTotalStudents,
  getLoggedStudentInfo,
  updateStudent,
  updateStudentImage,
  getStudentPreference,
  addOrUpdatePreference,
};
