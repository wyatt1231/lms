import { DatabaseConnection } from "../Configurations/DatabaseConfig";
import { ErrorMessage } from "../Hooks/useErrorMessage";
import { GetUploadedImage, UploadImage } from "../Hooks/useFileUploader";
import { isValidPicture } from "../Hooks/useValidator";
import { PaginationModel } from "../Models/PaginationModel";
import { ResponseModel } from "../Models/ResponseModel";
import { StatusMasterModel } from "../Models/StatusMasterModel";
import { StudentModel, StudentPrefModel } from "../Models/StudentModel";
import { UserModel } from "../Models/UserModel";

import mysql from "mysql2";
import { GenerateSearch } from "../Hooks/useSearch";
import useSql from "../Hooks/useSql";
import { NotifModel } from "../Models/NotifModel";
const addStudent = async (
  payload: StudentModel,
  user_id: string
): Promise<ResponseModel> => {
  const con = await DatabaseConnection();
  try {
    await con.BeginTransaction();

    const user_param: UserModel = {
      fullname: `${payload.lastname}, ${payload.firstname}`,
      username: payload.user.username,
      password: payload.user.password,
      user_type: "student",
      encoder_pk: user_id,
      allow_login: "n",
    };

    const sql_insert_user = await con.Insert(
      `INSERT users SET
      username=@username,
      password=AES_ENCRYPT(@password,@username),
      user_type=@user_type,
      fullname=@fullname,
      allow_login=@allow_login;
      `,
      user_param
    );

    if (sql_insert_user.insertedId > 0) {
      if (isValidPicture(payload.picture)) {
        const upload_result = await UploadImage({
          base_url: "./src/Storage/Files/Images/",
          extension: "jpg",
          file_name: sql_insert_user.insertedId,
          file_to_upload: payload.picture,
        });

        if (upload_result.success) {
          payload.picture = upload_result.data;
        } else {
          return upload_result;
        }
      }

      const student_payload: StudentModel = {
        ...payload,
        user_id: sql_insert_user.insertedId,
        encoder_pk: user_id,
        username: payload.user.username,
      };

      const sql_create_student = await con.Insert(
        `INSERT INTO students SET
         user_id=@user_id,          
         username=@username,         
         grade=@grade,            
         picture=@picture,          
         firstname=@firstname,        
         middlename=@middlename,       
         lastname=@lastname,         
         suffix=@suffix,           
         email=@email,            
         mob_no=@mob_no,           
         gender=@gender;      
        `,
        student_payload
      );

      if (sql_create_student.insertedId > 0) {
        // const res = await UseSms.SendSms(tutor_info.mob_no, msg);

        const users: Array<UserModel> = await con.Query(
          `SELECT user_id FROM users where user_type ='admin'`,
          payload
        );

        for (const u of users) {
          const notif_payload: NotifModel = {
            body: `${student_payload.firstname} ${student_payload.lastname} student account needs approval. `,
            user_pk: parseInt(u.user_id),
            link: `/admin/student/${sql_create_student.insertedId}/calendar`,
            user_type: "admin",
          };

          console.log(`notif_payload`, notif_payload);

          const notif_res = await con.Insert(
            `INSERT INTO notif 
              SET
              body=@body,
              link=@link;`,
            notif_payload
          );

          notif_payload.notif_pk = notif_res.insertedId;

          await con.Insert(
            ` INSERT INTO notif_users 
            SET 
            notif_pk=@notif_pk,
            user_type=@user_type,
            user_pk=@user_pk;`,
            notif_payload
          );
        }

        con.Commit();
        return {
          success: true,
          message:
            "Your account has been created successfully. A message will be sent to you when the administrators takes an action for this request.",
        };
      } else {
        con.Rollback();
        return {
          success: false,
          message:
            "There were no affected rows when adding the new administrator",
        };
      }
    } else {
      con.Rollback();
      return {
        success: false,
        message: "The were no affected rows when adding the new user",
      };
    }
  } catch (error) {
    await con.Rollback();
    console.error(`error`, error);
    return {
      success: false,
      message: ErrorMessage(error),
    };
  }
};

const updateStudent = async (payload: StudentModel): Promise<ResponseModel> => {
  const con = await DatabaseConnection();
  try {
    await con.BeginTransaction();

    const sql_update_student = await con.Modify(
      `
        UPDATE students SET
        grade=@grade,            
        firstname=@firstname,        
        middlename=@middlename,       
        lastname=@lastname,         
        suffix=@suffix,           
        email=@email,            
        mob_no=@mob_no,           
        gender=@gender,           
        where user_id=@encoder_pk;     
        `,
      payload
    );

    if (sql_update_student > 0) {
      const audit_log = await con.Insert(
        `insert into audit_log set 
        user_pk=@user_pk,
        activity=@activity;
        `,
        {
          user_pk: payload.encoder_pk,
          activity: `updated his/her basic information`,
        }
      );

      if (audit_log.insertedId <= 0) {
        con.Rollback();
        return {
          success: false,
          message: "The activity was not logged!",
        };
      }

      con.Commit();
      return {
        success: true,
        message: "Your basic information has been updated!",
      };
    } else {
      con.Rollback();
      return {
        success: true,
        message: "Server error has occured. The process was unsuccessful.",
      };
    }
  } catch (error) {
    await con.Rollback();
    console.error(`error`, error);
    return {
      success: false,
      message: ErrorMessage(error),
    };
  }
};

const updateStudentImage = async (
  payload: StudentModel
): Promise<ResponseModel> => {
  const con = await DatabaseConnection();
  try {
    await con.BeginTransaction();

    if (isValidPicture(payload.picture)) {
      const upload_result = await UploadImage({
        base_url: "./src/Storage/Files/Images/",
        extension: "jpg",
        file_name: payload.user_id,
        file_to_upload: payload.picture,
      });

      if (upload_result.success) {
        payload.picture = upload_result.data;
        const sql_update_pic = await con.Modify(
          `
            UPDATE students set
            picture=@picture
            WHERE
            student_pk=@student_pk;
          `,
          payload
        );

        if (sql_update_pic < 1) {
          con.Rollback();
          return {
            success: false,
            message: "There were no rows affected while updating the picture.",
          };
        }
      } else {
        return upload_result;
      }
    }

    const audit_log = await con.Insert(
      `insert into audit_log set 
      user_pk=@user_pk,
      activity=@activity;
      `,
      {
        user_pk: payload.encoder_pk,
        activity: `updated his/her profile picture.`,
      }
    );

    if (audit_log.insertedId <= 0) {
      con.Rollback();
      return {
        success: false,
        message: "The activity was not logged!",
      };
    }

    con.Commit();
    return {
      success: true,
      message: "The process has been executed succesfully!",
    };
  } catch (error) {
    await con.Rollback();
    console.error(`error`, error);
    return {
      success: false,
      message: ErrorMessage(error),
    };
  }
};

const approveStudent = async (
  student_pk: string,
  user_id: string
): Promise<ResponseModel> => {
  const con = await DatabaseConnection();
  try {
    await con.BeginTransaction();

    const payload: StudentModel = {
      student_pk: parseInt(student_pk),
      sts_pk: "a",
      encoder_pk: user_id,
    };

    const sql_approve_student = await con.Insert(
      `UPDATE administrators SET
        sts_pk=@sts_pk
        WHERE student_pk=@student_pk;
        `,
      payload
    );

    if (sql_approve_student.insertedId > 0) {
      const sql_allow_login = con.Modify(
        `
        update users set allow_login ='y' where user_id = (select user_id from students where student_pk=@student_pk)
      `,
        {
          student_pk: student_pk,
        }
      );

      con.Commit();
      return {
        success: true,
        message: "The student has been approved successfully",
      };
    } else {
      con.Rollback();
      return {
        success: false,
        message: "Your account was not successfully created.",
      };
    }
  } catch (error) {
    await con.Rollback();
    console.error(`error`, error);
    return {
      success: false,
      message: ErrorMessage(error),
    };
  }
};

const changeStudentStatus = async (
  student_pk: string,
  user_id: string,
  sts_pk: string,
  sts_desc: string
): Promise<ResponseModel> => {
  const con = await DatabaseConnection();
  try {
    await con.BeginTransaction();

    const payload: StudentModel = {
      student_pk: parseInt(student_pk),
      sts_pk: sts_pk,
    };

    if (sts_pk === "a") {
      const sql_allow_login = con.Modify(
        `
        update users set allow_login ='y' where user_id = (select user_id from students where student_pk=@student_pk)
      `,
        {
          student_pk: student_pk,
        }
      );
    }

    if (sts_pk === "x") {
      const sql_allow_login = con.Modify(
        `
        update users set allow_login ='n' where user_id = (select user_id from students where student_pk=@student_pk)
      `,
        {
          student_pk: student_pk,
        }
      );
    }

    const sql_approve_student = await con.Modify(
      `UPDATE students SET
        sts_pk=@sts_pk
        WHERE student_pk=@student_pk;
        `,
      payload
    );

    if (sql_approve_student > 0) {
      const audit_log = await con.Insert(
        `insert into audit_log set 
        user_pk=@user_pk,
        activity=@activity;
        `,
        {
          user_pk: user_id,
          activity: `changed student status to ${sts_desc}`,
        }
      );

      if (audit_log.insertedId <= 0) {
        con.Rollback();
        return {
          success: false,
          message: "The activity was not logged!",
        };
      }

      con.Commit();
      return {
        success: true,
        message: "The student has been approved successfully",
      };
    } else {
      con.Rollback();
      return {
        success: false,
        message: "The student status was not successfully updated!",
      };
    }
  } catch (error) {
    await con.Rollback();
    console.error(`error`, error);
    return {
      success: false,
      message: ErrorMessage(error),
    };
  }
};

// const updateAdmin = async (
//   payload: AdminModel,
//   user_id: string
// ): Promise<ResponseModel> => {
//   const con = await DatabaseConnection();
//   try {
//     await con.BeginTransaction();

//     if (isValidPicture(payload.picture)) {
//       const upload_result = await UploadImage({
//         base_url: "./src/Storage/Files/Images/",
//         extension: "jpg",
//         file_name: payload.user_id,
//         file_to_upload: payload.picture,
//       });

//       if (upload_result.success) {
//         payload.picture = upload_result.data;
//         const sql_update_pic = await con.Modify(
//           `
//             UPDATE administrators set
//             picture=@picture,
//             WHERE
//             admin_pk=@admin_pk;
//           `,
//           payload
//         );

//         if (sql_update_pic < 1) {
//           con.Rollback();
//           return {
//             success: false,
//             message: "There were no rows affected while updating the picture.",
//           };
//         }
//       } else {
//         return upload_result;
//       }
//     }

//     payload.encoder_pk = user_id;

//     const admin_updated_rows = await con.Modify(
//       `UPDATE administrators SET
//         position=@position,
//         firstname=@firstname,
//         middlename=@middlename,
//         lastname=@lastname,
//         suffix=@suffix,
//         prefix=@prefix,
//         birth_date=@birth_date,
//         email=@email,
//         mob_no=@mob_no,
//         gender=@gender,
//         encoder_pk=@encoder_pk
//         WHERE admin_pk=@admin_pk;
//         ;`,
//       payload
//     );

//     if (admin_updated_rows > 0) {
//       con.Commit();
//       return {
//         success: true,
//         message: "The administrator has been updated successfully!",
//       };
//     } else {
//       con.Rollback();
//       return {
//         success: true,
//         message: "The were no affected rows when updating the administrator!",
//       };
//     }
//   } catch (error) {
//     await con.Rollback();
//     console.error(`error`, error);
//     return {
//       success: false,
//       message: ErrorMessage(error),
//     };
//   }
// };

const getStudentDataTable = async (
  payload: PaginationModel
): Promise<ResponseModel> => {
  const con = await DatabaseConnection();
  try {
    await con.BeginTransaction();

    console.log(`payload`, payload);

    const data: Array<StudentModel & StatusMasterModel> =
      await con.QueryPagination(
        `
      SELECT * FROM 
      (SELECT s.*,CONCAT(s.firstname,' ',s.lastname) fullname, sm.sts_desc,sm.sts_bgcolor,sm.sts_color FROM students s 
      JOIN status_master sm ON s.sts_pk = sm.sts_pk) tmp
      WHERE
      (firstname like concat('%',@search,'%')
      OR lastname like concat('%',@search,'%'))
      AND grade in @grade
      AND sts_pk in @sts_pk
      ${useSql.DateWhereClause(
        "encoded_at",
        ">=",
        payload.filters.encoded_from
      )}
      ${useSql.DateWhereClause("encoded_at", "<=", payload.filters.encoded_to)}
      `,
        payload
      );

    const hasMore: boolean = data.length > payload.page.limit;

    if (hasMore) {
      data.splice(data.length - 1, 1);
    }

    const count: number = hasMore
      ? -1
      : payload.page.begin * payload.page.limit + data.length;

    for (const row of data) {
      row.picture = await GetUploadedImage(row.picture);
    }

    con.Commit();
    return {
      success: true,
      data: {
        table: data,
        begin: payload.page.begin,
        count: count,
        limit: payload.page.limit,
      },
    };
  } catch (error) {
    await con.Rollback();
    console.error(`error`, error);
    return {
      success: false,
      message: ErrorMessage(error),
    };
  }
};

const getSingleStudent = async (student_pk: string): Promise<ResponseModel> => {
  const con = await DatabaseConnection();
  try {
    await con.BeginTransaction();

    const data: StudentModel = await con.QuerySingle(
      `select * from students where student_pk = @student_pk`,
      {
        student_pk: student_pk,
      }
    );

    data.status = await con.QuerySingle(
      `select * from status_master where sts_pk=@sts_pk`,
      {
        sts_pk: data.sts_pk,
      }
    );

    data.picture = await GetUploadedImage(data.picture);

    con.Commit();
    return {
      success: true,
      data: data,
    };
  } catch (error) {
    await con.Rollback();
    console.error(`error`, error);
    return {
      success: false,
      message: ErrorMessage(error),
    };
  }
};

const searchStudentNotInClass = async (
  search: string,
  class_pk: number
): Promise<ResponseModel> => {
  const con = await DatabaseConnection();
  try {
    await con.BeginTransaction();

    const data: any = await con.Query(
      `
      SELECT * FROM (
      SELECT student_pk id, CONCAT(firstname,' ',lastname) label FROM students 
      WHERE student_pk NOT IN (SELECT student_pk FROM class_students WHERE class_pk =${mysql.escape(
        class_pk
      )})
      ) tmp
       ${GenerateSearch(search, "label")} limit 50
      `,
      {
        search,
      }
    );

    for (const tutor of data) {
      tutor.picture = await GetUploadedImage(tutor.picture);
    }

    con.Commit();
    return {
      success: true,
      data: data,
    };
  } catch (error) {
    await con.Rollback();
    console.error(`error`, error);
    return {
      success: false,
      message: ErrorMessage(error),
    };
  }
};

const getTotalStudents = async (): Promise<ResponseModel> => {
  const con = await DatabaseConnection();
  try {
    await con.BeginTransaction();

    const res_sql_count = await con.QuerySingle(
      `select count(*) as total from students WHERE is_active='y';`,
      {}
    );

    con.Commit();
    return {
      success: true,
      data: res_sql_count.total,
    };
  } catch (error) {
    await con.Rollback();
    console.error(`error`, error);
    return {
      success: false,
      message: ErrorMessage(error),
    };
  }
};

const getLoggedStudentInfo = async (
  user_pk: number
): Promise<ResponseModel> => {
  const con = await DatabaseConnection();
  try {
    await con.BeginTransaction();

    const data: StudentModel = await con.QuerySingle(
      `select * from students where user_id = @user_pk`,
      {
        user_pk,
      }
    );

    data.picture = await GetUploadedImage(data.picture);

    con.Commit();
    return {
      success: true,
      data: data,
    };
  } catch (error) {
    await con.Rollback();
    console.error(`error`, error);
    return {
      success: false,
      message: ErrorMessage(error),
    };
  }
};

//#region PREFERENCES
const getStudentPreference = async (
  user_pk: string
): Promise<ResponseModel> => {
  const con = await DatabaseConnection();
  try {
    await con.BeginTransaction();

    const student_preference: any = await con.QuerySingle(
      `
      select * from student_pref pf where pf.student_pk = (select student_pk from students where user_id = @user_pk ) 
        `,
      {
        user_pk,
      }
    );

    if (student_preference != null) {
      student_preference.availability = student_preference?.availability
        .toString()
        .split(`,`);

      student_preference.gender = student_preference?.gender
        .toString()
        .split(`,`);
      student_preference.platform_compatibility =
        student_preference?.platform_compatibility.toString().split(`,`);

      student_preference.subject_experties =
        student_preference?.subject_experties.toString().split(`,`);
    }

    con.Commit();
    return {
      success: true,
      data: student_preference,
    };
  } catch (error) {
    await con.Rollback();
    console.error(`error`, error);
    return {
      success: false,
      message: ErrorMessage(error),
    };
  }
};

const addOrUpdatePreference = async (
  payload: StudentPrefModel,
  user_pk: string
): Promise<ResponseModel> => {
  const con = await DatabaseConnection();
  try {
    await con.BeginTransaction();

    var student_preference_data = await getStudentPreference(user_pk);
    var student_preference: StudentPrefModel = student_preference_data.data;

    console.log(`student_preference`, student_preference);
    console.log(`payload`, payload);

    const availability = payload.availability?.join(`,`);
    const gender = payload.gender?.join(`,`);
    const platform_compatibility = payload.platform_compatibility?.join(`,`);
    const subject_experties = payload.subject_experties?.join(`,`);

    if (student_preference == null) {
      //insert
      const sql_insert = await con.Insert(
        `insert student_pref set 
        student_pk=(select student_pk from students where user_id = @user_pk),
        availability=@availability,
        gender=@gender,
        platform_compatibility=@platform_compatibility,
        subject_experties=@subject_experties,
        encoder_pk=@user_pk;
        `,
        {
          ...payload,
          availability: availability,
          gender: gender,
          platform_compatibility: platform_compatibility,
          subject_experties: subject_experties,
          user_pk: user_pk,
        }
      );

      if (sql_insert.insertedId > 0) {
        con.Commit();
        return {
          success: true,
          message: "The item has been added successfully",
        };
      } else {
        con.Rollback();
        return {
          success: false,
          message:
            "There were no rows affected while inserting the new record.",
        };
      }
    } else {
      //update

      const sql_update = await con.Modify(
        `
          UPDATE student_pref set 
          availability=@availability,
          gender=@gender,
          platform_compatibility=@platform_compatibility,
          subject_experties=@subject_experties
          where student_pref_pk=@student_pref_pk;
            `,
        {
          ...payload,
          availability: availability,
          gender: gender,
          platform_compatibility: platform_compatibility,
          subject_experties: subject_experties,
          user_pk: user_pk,
          student_pref_pk: student_preference.student_pref_pk,
        }
      );

      if (sql_update > 0) {
        con.Commit();
        return {
          success: true,
          message: "The item has been updated successfully",
        };
      } else {
        con.Rollback();
        return {
          success: false,
          message: "There were no rows affected while updating the new record.",
        };
      }
    }
  } catch (error) {
    await con.Rollback();
    console.error(`error`, error);
    return {
      success: false,
      message: ErrorMessage(error),
    };
  }
};

//#endregion

export default {
  addStudent,
  approveStudent,
  getStudentDataTable,
  getSingleStudent,
  searchStudentNotInClass,
  changeStudentStatus,
  getTotalStudents,
  getLoggedStudentInfo,
  updateStudentImage,
  updateStudent,
  getStudentPreference,
  addOrUpdatePreference,
};
