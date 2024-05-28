"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const DatabaseConfig_1 = require("../Configurations/DatabaseConfig");
const UseCollabFilter_1 = __importDefault(require("../Hooks/UseCollabFilter"));
const useDateParser_1 = require("../Hooks/useDateParser");
const useErrorMessage_1 = require("../Hooks/useErrorMessage");
const useFileUploader_1 = require("../Hooks/useFileUploader");
const useSearch_1 = require("../Hooks/useSearch");
const useSql_1 = __importDefault(require("../Hooks/useSql"));
const useValidator_1 = require("../Hooks/useValidator");
const StudentRepository_1 = __importDefault(require("./StudentRepository"));
const addTutor = (params, user_id) => __awaiter(void 0, void 0, void 0, function* () {
    const con = yield (0, DatabaseConfig_1.DatabaseConnection)();
    try {
        yield con.BeginTransaction();
        const user_param = {
            fullname: `${params.lastname}, ${params.firstname}`,
            username: params.email,
            password: `mymentor`,
            user_type: "tutor",
            encoder_pk: user_id,
        };
        const sql_insert_user = yield con.Insert(`INSERT users SET
      username=@username,
      password=AES_ENCRYPT(@password,@username),
      user_type=@user_type,
      fullname=@fullname,
      encoder_pk=@encoder_pk;
      `, user_param);
        if (sql_insert_user.insertedId > 0) {
            if (typeof params.picture !== "undefined" &&
                params.picture !== "" &&
                params.picture !== null) {
                const upload_result = yield (0, useFileUploader_1.UploadImage)({
                    base_url: "./src/Storage/Files/Images/",
                    extension: "jpg",
                    file_name: sql_insert_user.insertedId,
                    file_to_upload: params.picture,
                });
                if (upload_result.success) {
                    params.picture = upload_result.data.toString();
                }
                else {
                    return upload_result;
                }
            }
            const tutor_payload = Object.assign(Object.assign({}, params), { username: params.email, user_id: sql_insert_user.insertedId, encoder_pk: user_id, birth_date: (0, useDateParser_1.parseInvalidDateToDefault)(params.birth_date) });
            const sql_insert_tutor = yield con.Insert(`
        INSERT INTO tutors
        SET
        user_id=@user_id,
        username=@username,
        position=@position,
        picture=@picture,
        firstname=@firstname,
        middlename=@middlename,
        lastname=@lastname,
        birth_date=DATE_FORMAT(@birth_date,'%Y-%m-%d'),
        suffix=@suffix,
        bio=@bio,
        email=@email,
        mob_no=@mob_no,
        gender=@gender,
        complete_address=@complete_address,
        encoder_pk=@encoder_pk;
        `, tutor_payload);
            if (sql_insert_tutor.insertedId > 0) {
                con.Commit();
                return {
                    success: true,
                    message: "The tutor has been created successfully",
                };
            }
            else {
                con.Rollback();
                return {
                    success: false,
                    message: "Server error has occured. Tutor creation process was not successful.",
                };
            }
        }
        else {
            con.Rollback();
            return {
                success: false,
                message: "Server error has occured. User creation process was not successful.",
            };
        }
    }
    catch (error) {
        yield con.Rollback();
        console.error(`error`, error);
        return {
            success: false,
            message: (0, useErrorMessage_1.ErrorMessage)(error),
        };
    }
});
const updateTutor = (tutor_payload, user_id) => __awaiter(void 0, void 0, void 0, function* () {
    const con = yield (0, DatabaseConfig_1.DatabaseConnection)();
    try {
        yield con.BeginTransaction();
        tutor_payload.encoder_pk = user_id;
        tutor_payload.birth_date = (0, useDateParser_1.parseInvalidDateToDefault)(tutor_payload.birth_date);
        const sql_update_tutor = yield con.Modify(`
        UPDATE tutors SET
        position=@position,
        firstname=@firstname,
        middlename=@middlename,
        lastname=@lastname,
        suffix=@suffix,
        birth_date=DATE_FORMAT(@birth_date,'%Y-%m-%d'),
        email=@email,
        mob_no=@mob_no,
        gender=@gender,
        encoder_pk=@encoder_pk
        WHERE tutor_pk=@tutor_pk;
        `, tutor_payload);
        if (sql_update_tutor > 0) {
            const audit_log = yield con.Insert(`insert into audit_log set 
        user_pk=@user_pk,
        activity=@activity;
        `, {
                user_pk: tutor_payload.user_id,
                activity: `updated tutor ${tutor_payload.firstname} ${tutor_payload.lastname}`,
            });
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
                message: "The tutor information has been updated successfully",
            };
        }
        else {
            con.Rollback();
            return {
                success: true,
                message: "Server error has occured. The process was unsuccessful.",
            };
        }
    }
    catch (error) {
        yield con.Rollback();
        console.error(`error`, error);
        return {
            success: false,
            message: (0, useErrorMessage_1.ErrorMessage)(error),
        };
    }
});
const updateTutorImage = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const con = yield (0, DatabaseConfig_1.DatabaseConnection)();
    try {
        yield con.BeginTransaction();
        if ((0, useValidator_1.isValidPicture)(payload.picture)) {
            const upload_result = yield (0, useFileUploader_1.UploadImage)({
                base_url: "./src/Storage/Files/Images/",
                extension: "jpg",
                file_name: payload.user_id,
                file_to_upload: payload.picture,
            });
            if (upload_result.success) {
                payload.picture = upload_result.data;
                const sql_update_pic = yield con.Modify(`
            UPDATE tutors set
            picture=@picture
            WHERE
            tutor_pk=@tutor_pk;
          `, payload);
                if (sql_update_pic < 1) {
                    con.Rollback();
                    return {
                        success: false,
                        message: "There were no rows affected while updating the picture.",
                    };
                }
            }
            else {
                return upload_result;
            }
        }
        const audit_log = yield con.Insert(`insert into audit_log set 
      user_pk=@user_pk,
      activity=@activity;
      `, {
            user_pk: payload.user_id,
            activity: `updated profile picture.`,
        });
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
    }
    catch (error) {
        yield con.Rollback();
        console.error(`error`, error);
        return {
            success: false,
            message: (0, useErrorMessage_1.ErrorMessage)(error),
        };
    }
});
const toggleActiveStatus = (tutor_pk, user_pk) => __awaiter(void 0, void 0, void 0, function* () {
    const con = yield (0, DatabaseConfig_1.DatabaseConnection)();
    try {
        yield con.BeginTransaction();
        const tutor_active_status = yield con.QuerySingle(`
    select is_active from tutors where tutor_pk = @tutor_pk;
    `, {
            tutor_pk: tutor_pk,
        });
        const res_update_tutor_sts = yield con.Modify(`
        UPDATE tutors SET
        is_active=@is_active
        WHERE tutor_pk=@tutor_pk;
        `, {
            is_active: tutor_active_status.is_active === "y" ? "n" : "y",
            tutor_pk: tutor_pk,
        });
        if (res_update_tutor_sts > 0) {
            const audit_log = yield con.Insert(`insert into audit_log set 
        user_pk=@user_pk,
        activity=@activity;
        `, {
                user_pk: user_pk,
                activity: `${tutor_active_status.is_active === "y" ? "deactivated" : "activated"} tutor status`,
            });
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
                message: "The tutor information has been updated successfully",
            };
        }
        else {
            con.Rollback();
            return {
                success: true,
                message: "Server error has occured. The process was unsuccessful.",
            };
        }
    }
    catch (error) {
        yield con.Rollback();
        console.error(`error`, error);
        return {
            success: false,
            message: (0, useErrorMessage_1.ErrorMessage)(error),
        };
    }
});
const getTutorDataTable = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const con = yield (0, DatabaseConfig_1.DatabaseConnection)();
    try {
        yield con.BeginTransaction();
        const data = yield con.QueryPagination(`SELECT * FROM tutors
      WHERE
      is_dummy = 'n' AND
      (firstname like concat('%',@search,'%')
      OR lastname like concat('%',@search,'%')
      OR email like concat('%',@search,'%')
      OR mob_no like concat('%',@search,'%')
      OR position like concat('%',@search,'%'))
      AND position in @position
      AND is_active in @is_active
      ${useSql_1.default.DateWhereClause("encoded_at", ">=", payload.filters.encoded_from)}
      ${useSql_1.default.DateWhereClause("encoded_at", "<=", payload.filters.encoded_to)}
      `, payload);
        const hasMore = data.length > payload.page.limit;
        if (hasMore) {
            data.splice(data.length - 1, 1);
        }
        const count = hasMore
            ? -1
            : payload.page.begin * payload.page.limit + data.length;
        for (const tutor of data) {
            const pic = yield (0, useFileUploader_1.GetUploadedImage)(tutor.picture);
            tutor.picture = pic;
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
    }
    catch (error) {
        yield con.Rollback();
        console.error(`error`, error);
        return {
            success: false,
            message: (0, useErrorMessage_1.ErrorMessage)(error),
        };
    }
});
const getSingleTutor = (tutor_pk) => __awaiter(void 0, void 0, void 0, function* () {
    const con = yield (0, DatabaseConfig_1.DatabaseConnection)();
    try {
        yield con.BeginTransaction();
        const data = yield con.QuerySingle(` SELECT *, (SUM(rating)/COUNT(*)) 'average_rating' FROM (
       SELECT t.* , SUM(COALESCE(cr.mastery, 0) + COALESCE(cr.compentency, 0) + COALESCE(cr.helpfulness, 0) + COALESCE(cr.professionalism, 0))
       /(SELECT SUM(IF(cr.mastery > 0, 1, 0)) + SUM(IF(cr.compentency > 0, 1, 0)) + SUM(IF(cr.helpfulness > 0, 1, 0)) + SUM(IF(cr.professionalism > 0, 1, 0)))  
       /COUNT(*) 
       'rating'
       FROM class_rating cr 
       JOIN classes c ON c.class_pk = cr.class_pk 
       JOIN tutors t ON t.tutor_pk = c.tutor_pk
       WHERE t.tutor_pk = @tutor_pk 
       GROUP BY cr.class_pk, cr.student_pk)
       tutors`, {
            tutor_pk,
        });
        data.picture = yield (0, useFileUploader_1.GetUploadedImage)(data.picture);
        con.Commit();
        return {
            success: true,
            data: data,
        };
    }
    catch (error) {
        yield con.Rollback();
        console.error(`error`, error);
        return {
            success: false,
            message: (0, useErrorMessage_1.ErrorMessage)(error),
        };
    }
});
const getSingTutorToStudent = (tutor_pk, user_pk) => __awaiter(void 0, void 0, void 0, function* () {
    const con = yield (0, DatabaseConfig_1.DatabaseConnection)();
    try {
        yield con.BeginTransaction();
        const data = yield con.QuerySingle(`select * from tutors where tutor_pk = @tutor_pk`, {
            tutor_pk,
        });
        data.picture = yield (0, useFileUploader_1.GetUploadedImage)(data.picture);
        const favorited = yield con.QuerySingle(`
    select is_fav from tutor_fav where student_pk = (select student_pk from students where user_id=@user_pk limit 1) and tutor_pk=@tutor_pk
    `, {
            tutor_pk: tutor_pk,
            user_pk: user_pk,
        });
        if (favorited === null || favorited === void 0 ? void 0 : favorited.is_fav) {
            data.favorited = favorited === null || favorited === void 0 ? void 0 : favorited.is_fav;
        }
        else {
            data.favorited = "n";
        }
        const rating = yield con.QuerySingle(`
    SELECT t.tutor_pk,  c.class_pk,cr.student_pk, 
    COALESCE(cr.mastery, 0) mastery, COALESCE(cr.compentency, 0) compentency, COALESCE(cr.helpfulness, 0) helpfulness, COALESCE(cr.professionalism, 0) professionalism, cr.feedback
    FROM class_rating cr 
    join classes c on c.class_pk = cr.class_pk 
    join tutors t on t.tutor_pk = c.tutor_pk
    WHERE t.tutor_pk = @tutor_pk and student_pk = (select student_pk from students where user_id=@user_pk limit 1)
    GROUP BY cr.class_pk, cr.student_pk
    
    `, {
            tutor_pk: tutor_pk,
            user_pk: user_pk,
        });
        if (!!(rating === null || rating === void 0 ? void 0 : rating.mastery)) {
            data.mastery = rating === null || rating === void 0 ? void 0 : rating.mastery;
            data.compentency = rating === null || rating === void 0 ? void 0 : rating.compentency;
            data.helpfulness = rating === null || rating === void 0 ? void 0 : rating.helpfulness;
            data.professionalism = rating === null || rating === void 0 ? void 0 : rating.rating;
            data.feedback = rating.feedback;
        }
        else {
            data.mastery = 0;
            data.compentency = 0;
            data.helpfulness = 0;
            data.professionalism = 0;
            data.feedback = ``;
        }
        con.Commit();
        return {
            success: true,
            data: data,
        };
    }
    catch (error) {
        yield con.Rollback();
        console.error(`error`, error);
        return {
            success: false,
            message: (0, useErrorMessage_1.ErrorMessage)(error),
        };
    }
});
const searchTutor = (search) => __awaiter(void 0, void 0, void 0, function* () {
    const con = yield (0, DatabaseConfig_1.DatabaseConnection)();
    try {
        yield con.BeginTransaction();
        const data = yield con.Query(`SELECT * FROM (select tutor_pk id, concat(firstname,' ',lastname) label,picture from tutors where is_dummy='n') tmp  ${(0, useSearch_1.GenerateSearch)(search, " label ")} limit 50 `, {
            search,
        });
        for (const tutor of data) {
            tutor.picture = yield (0, useFileUploader_1.GetUploadedImage)(tutor.picture);
        }
        con.Commit();
        return {
            success: true,
            data: data,
        };
    }
    catch (error) {
        yield con.Rollback();
        console.error(`error`, error);
        return {
            success: false,
            message: (0, useErrorMessage_1.ErrorMessage)(error),
        };
    }
});
const getDummyTutors = (user_pk) => __awaiter(void 0, void 0, void 0, function* () {
    const con = yield (0, DatabaseConfig_1.DatabaseConnection)();
    try {
        yield con.BeginTransaction();
        const data = yield con.Query(`
      SELECT tutor_pk,'${user_pk}' student_pk,picture,concat(firstname,' ',lastname) name,bio, 0 as rating FROM tutors WHERE is_dummy = 'y'
      `, null);
        for (const tutor of data) {
            tutor.picture = yield (0, useFileUploader_1.GetUploadedImage)(tutor.picture);
        }
        con.Commit();
        return {
            success: true,
            data: data,
        };
    }
    catch (error) {
        yield con.Rollback();
        console.error(`error`, error);
        return {
            success: false,
            message: (0, useErrorMessage_1.ErrorMessage)(error),
        };
    }
});
const insertDummyTutorRatings = (payload, user_pk) => __awaiter(void 0, void 0, void 0, function* () {
    const con = yield (0, DatabaseConfig_1.DatabaseConnection)();
    try {
        yield con.BeginTransaction();
        const sql_update_student = yield con.Modify(`
      UPDATE students set rated_tutor=@rated_tutor where user_id=@user_id;
    `, { user_id: user_pk, rated_tutor: "y" });
        if (sql_update_student < 1) {
            con.Rollback();
            return {
                success: false,
                message: "There were no rows affected when trying to update the student.",
            };
        }
        for (const tutor of payload) {
            tutor.encoded_by = user_pk;
            const sql_insert_tutor = yield con.Insert(`
        INSERT INTO tutor_ratings SET
        tutor_pk=@tutor_pk,
        student_pk=(select student_pk from students where user_id=@encoded_by limit 1),
        rating=@rating,
        encoded_by=@encoded_by
          `, tutor);
            if (sql_insert_tutor.affectedRows < 1) {
                con.Rollback();
                return {
                    success: false,
                    message: "There were no rows affected when trying to save the tutor rating.",
                };
            }
        }
        con.Commit();
        return {
            success: true,
            message: "Your ratings has been saved successfully!",
        };
    }
    catch (error) {
        yield con.Rollback();
        console.error(`error`, error);
        return {
            success: false,
            message: (0, useErrorMessage_1.ErrorMessage)(error),
        };
    }
});
const getTotalTutors = () => __awaiter(void 0, void 0, void 0, function* () {
    const con = yield (0, DatabaseConfig_1.DatabaseConnection)();
    try {
        yield con.BeginTransaction();
        const res_sql_count = yield con.QuerySingle(`select count(*) as total from tutors  WHERE is_active='y' and is_dummy='n';`, {});
        con.Commit();
        return {
            success: true,
            data: res_sql_count.total,
        };
    }
    catch (error) {
        yield con.Rollback();
        console.error(`error`, error);
        return {
            success: false,
            message: (0, useErrorMessage_1.ErrorMessage)(error),
        };
    }
});
//logged-in tutors
const getLoggedInTutor = (user_pk) => __awaiter(void 0, void 0, void 0, function* () {
    const con = yield (0, DatabaseConfig_1.DatabaseConnection)();
    try {
        yield con.BeginTransaction();
        const data = yield con.QuerySingle(`select t.*,
      (SELECT SUM(rating)/COUNT(rating) FROM tutor_ratings WHERE tutor_pk = t.tutor_pk) as average_rating,
      (SELECT COUNT(tutor_pk) FROM tutor_fav WHERE  tutor_pk =t.tutor_pk) as fav_count
      from tutors t where user_id = @user_pk`, {
            user_pk,
        });
        data.picture = yield (0, useFileUploader_1.GetUploadedImage)(data.picture);
        con.Commit();
        return {
            success: true,
            data: data,
        };
    }
    catch (error) {
        yield con.Rollback();
        console.error(`error`, error);
        return {
            success: false,
            message: (0, useErrorMessage_1.ErrorMessage)(error),
        };
    }
});
const updateLoggedInTutorBio = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const con = yield (0, DatabaseConfig_1.DatabaseConnection)();
    try {
        yield con.BeginTransaction();
        const res_update_tutor_bio = yield con.Modify(`
      update tutors set bio=@bio where tutor_pk = @tutor_pk;
    `, payload);
        if (res_update_tutor_bio > 0) {
            const audit_log = yield con.Insert(`insert into audit_log set 
        user_pk=@user_pk,
        activity=@activity;
        `, {
                user_pk: payload.user_id,
                activity: `updated his/her biography.`,
            });
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
        }
        else {
            return {
                success: false,
                message: `There were no affected rows when trying to update the tutor's biography!`,
            };
        }
    }
    catch (error) {
        yield con.Rollback();
        console.error(`error`, error);
        return {
            success: false,
            message: (0, useErrorMessage_1.ErrorMessage)(error),
        };
    }
});
const rateTutor = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const con = yield (0, DatabaseConfig_1.DatabaseConnection)();
    try {
        yield con.BeginTransaction();
        const res_count_rating = yield con.QuerySingle(`
    SELECT rate_pk FROM tutor_ratings WHERE tutor_pk =@tutor_pk AND student_pk =(select student_pk from students where user_id=@encoded_by limit 1);`, payload);
        if (res_count_rating === null || res_count_rating === void 0 ? void 0 : res_count_rating.rate_pk) {
            payload.rate_pk = res_count_rating.rate_pk;
            const sql_update_student = yield con.Modify(`
        UPDATE tutor_ratings set rating=@rating where rate_pk=@rate_pk;
      `, payload);
            if (sql_update_student < 1) {
                con.Rollback();
                return {
                    success: false,
                    message: "There were no rows affected during the process.",
                };
            }
        }
        else {
            const sql_insert_rating = yield con.Insert(`
        INSERT into tutor_ratings set rating=@rating,encoded_by=@encoded_by,student_pk=(select student_pk from students where user_id=@encoded_by limit 1),tutor_pk=@tutor_pk;
      `, payload);
            if (sql_insert_rating.insertedId < 1) {
                con.Rollback();
                return {
                    success: false,
                    message: "There were no rows affected during the process.",
                };
            }
        }
        const audit_log = yield con.Insert(`insert into audit_log set 
      user_pk=@user_pk,
      activity=CONCAT('gave 5 ratings to tutor ',(select concat(firstname,' ',lastname) from tutors where tutor_pk=@tutor_pk limit 1));
      `, {
            user_pk: payload.encoded_by,
            tutor_pk: payload.tutor_pk,
        });
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
            message: `The rating has been saved successfully!`,
        };
    }
    catch (error) {
        yield con.Rollback();
        console.error(`error`, error);
        return {
            success: false,
            message: (0, useErrorMessage_1.ErrorMessage)(error),
        };
    }
});
const favoriteTutor = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const con = yield (0, DatabaseConfig_1.DatabaseConnection)();
    try {
        yield con.BeginTransaction();
        const res_existing_fav = yield con.QuerySingle(`
    SELECT tutor_fav_pk FROM tutor_fav WHERE tutor_pk =@tutor_pk AND student_pk =(select student_pk from students where user_id=@encoded_by limit 1);`, payload);
        if (res_existing_fav === null || res_existing_fav === void 0 ? void 0 : res_existing_fav.tutor_fav_pk) {
            payload.tutor_fav_pk = res_existing_fav.tutor_fav_pk;
            const sql_change_fav = yield con.Modify(`
        UPDATE tutor_fav set is_fav=if(is_fav = 'y', 'n','y') where tutor_fav_pk=@tutor_fav_pk;
      `, payload);
            if (sql_change_fav < 1) {
                con.Rollback();
                return {
                    success: false,
                    message: "There were no rows affected during the process.",
                };
            }
        }
        else {
            const sql_insert_fav = yield con.Insert(`
        INSERT into tutor_fav set is_fav='y',student_pk=(select student_pk from students where user_id=@encoded_by limit 1),tutor_pk=@tutor_pk;
      `, payload);
            if (sql_insert_fav.insertedId < 1) {
                con.Rollback();
                return {
                    success: false,
                    message: "There were no rows affected during the process.",
                };
            }
        }
        const audit_log = yield con.Insert(`insert into audit_log set 
      user_pk=@user_pk,
      activity=CONCAT('favorited tutor ',(select concat(firstname,' ',lastname) from tutors where tutor_pk=@tutor_pk limit 1));
      `, {
            user_pk: payload.encoded_by,
            tutor_pk: payload.tutor_pk,
        });
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
            message: `The process has been executed successfully!`,
        };
    }
    catch (error) {
        yield con.Rollback();
        console.error(`error`, error);
        return {
            success: false,
            message: (0, useErrorMessage_1.ErrorMessage)(error),
        };
    }
});
const getMostRatedTutors = () => __awaiter(void 0, void 0, void 0, function* () {
    const con = yield (0, DatabaseConfig_1.DatabaseConnection)();
    try {
        yield con.BeginTransaction();
        const tutor_table = yield con.Query(`
        SELECT * FROM 
        (
        SELECT *,
        COALESCE((SELECT  SUM(rating)/COUNT(*) FROM tutor_ratings WHERE tutor_pk = t.tutor_pk), 0) AS average_rating 
        FROM tutors t where is_dummy='n' 
        ) tmp
        where average_rating > 0 
        ORDER BY average_rating DESC LIMIT 15
      `, null);
        for (const tutor of tutor_table) {
            tutor.picture = yield (0, useFileUploader_1.GetUploadedImage)(tutor.picture);
        }
        con.Commit();
        return {
            success: true,
            data: tutor_table,
        };
    }
    catch (error) {
        yield con.Rollback();
        console.error(`error`, error);
        return {
            success: false,
            message: (0, useErrorMessage_1.ErrorMessage)(error),
        };
    }
});
const getRecommendedTutors = (user_pk) => __awaiter(void 0, void 0, void 0, function* () {
    const con = yield (0, DatabaseConfig_1.DatabaseConnection)();
    try {
        yield con.BeginTransaction();
        const student_res = yield con.QuerySingle(`select student_pk from students where user_id=@user_id limit 1;`, {
            user_id: user_pk,
        });
        //students primary key ->
        //dataset sa wala pa na rate na tutors
        const student_pk = student_res.student_pk;
        const unrated_tutors = yield con.Query(`SELECT t.tutor_pk FROM tutors t WHERE t.tutor_pk NOT IN (SELECT c.tutor_pk FROM class_rating cr JOIN classes c ON cr.class_pk = c.class_pk WHERE cr.student_pk  = @student_pk)
      `, {
            student_pk,
        }
        //
        );
        //dataset of ratings and tutor na na rate na ni student
        const student_ratings = yield con.Query(`SELECT *
      , SUM(class_rating)/COUNT(student_pk) rating
            FROM (
            SELECT t.tutor_pk, cr.student_pk , SUM(COALESCE(cr.mastery, 0) + COALESCE(cr.compentency, 0) + COALESCE(cr.helpfulness, 0) + COALESCE(cr.professionalism, 0))
            /(SELECT SUM(IF(cr.mastery > 0, 1, 0)) + SUM(IF(cr.compentency > 0, 1, 0)) + SUM(IF(cr.helpfulness > 0, 1, 0)) + SUM(IF(cr.professionalism > 0, 1, 0)))  
            /COUNT(*) 
            'class_rating'
            FROM class_rating cr 
            JOIN classes c ON c.class_pk = cr.class_pk 
            JOIN tutors t ON t.tutor_pk = c.tutor_pk
            GROUP BY   c.tutor_pk, cr.student_pk)
            tutors
            WHERE student_pk = 1
            GROUP BY student_pk, tutor_pk
           ORDER BY tutor_pk ASC;
        `, {
            student_pk,
        });
        const rated_tutors = yield con.Query(`SELECT tutor_pk
      FROM (
      SELECT t.tutor_pk, cr.student_pk , SUM(COALESCE(cr.mastery, 0) + COALESCE(cr.compentency, 0) + COALESCE(cr.helpfulness, 0) + COALESCE(cr.professionalism, 0))
      /(SELECT SUM(IF(cr.mastery > 0, 1, 0)) + SUM(IF(cr.compentency > 0, 1, 0)) + SUM(IF(cr.helpfulness > 0, 1, 0)) + SUM(IF(cr.professionalism > 0, 1, 0)))  
      /COUNT(*) 
      'rating'
      FROM class_rating cr 
      JOIN classes c ON c.class_pk = cr.class_pk 
      JOIN tutors t ON t.tutor_pk = c.tutor_pk
      GROUP BY cr.class_pk, cr.student_pk)
      tutors
      GROUP BY tutor_pk  ORDER BY tutor_pk`, {});
        const students = yield con.Query(`select student_pk
      from (
      SELECT t.tutor_pk, cr.student_pk , SUM(COALESCE(cr.mastery, 0) + COALESCE(cr.compentency, 0) + COALESCE(cr.helpfulness, 0) + COALESCE(cr.professionalism, 0))
      /(SELECT SUM(IF(cr.mastery > 0, 1, 0)) + SUM(IF(cr.compentency > 0, 1, 0)) + SUM(IF(cr.helpfulness > 0, 1, 0)) + SUM(IF(cr.professionalism > 0, 1, 0)))  
      /COUNT(*) 
      'rating'
      FROM class_rating cr 
      join classes c on c.class_pk = cr.class_pk 
      join tutors t on t.tutor_pk = c.tutor_pk
      GROUP BY cr.class_pk, cr.student_pk)
      tutors
      GROUP BY student_pk  ORDER BY student_pk
      `, {});
        const ratings = yield con.Query(`
      SELECT *, SUM(class_rating)/COUNT(student_pk) rating
      FROM (
      SELECT t.tutor_pk, cr.student_pk , SUM(COALESCE(cr.mastery, 0) + COALESCE(cr.compentency, 0) + COALESCE(cr.helpfulness, 0) + COALESCE(cr.professionalism, 0))
      /(SELECT SUM(IF(cr.mastery > 0, 1, 0)) + SUM(IF(cr.compentency > 0, 1, 0)) + SUM(IF(cr.helpfulness > 0, 1, 0)) + SUM(IF(cr.professionalism > 0, 1, 0)))  
      /COUNT(*) 
      'class_rating'
      FROM class_rating cr 
      JOIN classes c ON c.class_pk = cr.class_pk 
      JOIN tutors t ON t.tutor_pk = c.tutor_pk
      GROUP BY cr.class_pk, cr.student_pk)
      tutors
      GROUP BY student_pk, tutor_pk
      ORDER BY student_pk ASC
      `, {});
        const tutor_rating_prediction = [];
        for (const p of ratings) {
            delete p.class_rating;
            p.rating = parseFloat(p.rating + ``);
        }
        for (const p of student_ratings) {
            delete p.class_rating;
            p.rating = parseFloat(p.rating + ``);
        }
        // console.log(`unrated_tutors`, unrated_tutors);
        // console.log(`rated_tutors`, rated_tutors);
        // console.log(`students`, students);
        // console.log(`student_ratings`, student_ratings);
        // console.log(`ratings`, ratings);
        for (const ut of unrated_tutors) {
            const rating_prediction = yield UseCollabFilter_1.default.RatingPrediction(ut.tutor_pk, rated_tutors, students, ratings, student_ratings);
            // console.log(`rating_prediction`, ut.tutor_pk, rating_prediction);
            if (rating_prediction > 0) {
                tutor_rating_prediction.push({
                    tutor_pk: ut.tutor_pk,
                    rating: rating_prediction,
                });
            }
        }
        const sort_tutor_rating_pred = tutor_rating_prediction.sort((a, b) => a.rating < b.rating ? 1 : b.rating < a.rating ? -1 : 0);
        const recommended_tutors = [];
        for (const tutor of sort_tutor_rating_pred) {
            const tutor_info = yield con.QuerySingle(`select *, (SUM(rating)/COUNT(*)) 'average_rating' from (
          SELECT t.* , SUM(COALESCE(cr.mastery, 0) + COALESCE(cr.compentency, 0) + COALESCE(cr.helpfulness, 0) + COALESCE(cr.professionalism, 0))
          /(SELECT SUM(IF(cr.mastery > 0, 1, 0)) + SUM(IF(cr.compentency > 0, 1, 0)) + SUM(IF(cr.helpfulness > 0, 1, 0)) + SUM(IF(cr.professionalism > 0, 1, 0)))  
          /COUNT(*) 
          'rating'
          FROM class_rating cr 
          join classes c on c.class_pk = cr.class_pk 
          join tutors t on t.tutor_pk = c.tutor_pk
          WHERE t.tutor_pk = @tutor_pk 
          GROUP BY cr.class_pk, cr.student_pk)
          tutors`, {
                tutor_pk: tutor.tutor_pk,
            });
            // console.log(`tutor_info`, tutor_info);
            tutor_info.user_info = yield con.QuerySingle(`select * from vw_user_info where user_id=@user_id`, {
                user_id: tutor_info.user_id,
            });
            tutor_info.user_info.picture = yield (0, useFileUploader_1.GetUploadedImage)(tutor_info.user_info.picture);
            tutor_info.classes = yield con.Query(`
        SELECT c.* FROM classes c
        WHERE c.tutor_pk = @tutor_pk AND c.class_pk NOT IN (SELECT class_pk FROM class_students WHERE student_pk = @student_pk)
        `, {
                tutor_pk: tutor.tutor_pk,
                student_pk: student_pk,
            });
            recommended_tutors.push(tutor_info);
        }
        con.Commit();
        return {
            success: true,
            data: recommended_tutors,
        };
    }
    catch (error) {
        yield con.Rollback();
        console.error(`error`, error);
        return {
            success: false,
            message: (0, useErrorMessage_1.ErrorMessage)(error),
        };
    }
});
const getPreferredTutors = (user_pk) => __awaiter(void 0, void 0, void 0, function* () {
    const con = yield (0, DatabaseConfig_1.DatabaseConnection)();
    try {
        yield con.BeginTransaction();
        const student_res = yield con.QuerySingle(`select student_pk from students where user_id=@user_id limit 1;`, {
            user_id: user_pk,
        });
        //students primary key ->
        //dataset sa wala pa na rate na tutors
        const student_pk = student_res.student_pk;
        var student_preference = (yield StudentRepository_1.default.getStudentPreference(user_pk + ``)).data;
        if (student_preference == null) {
            return {
                success: true,
                data: [],
            };
        }
        const is_morning = student_preference.availability.includes(`m`);
        const is_afternoon = student_preference.availability.includes(`a`);
        const tutors = yield con.Query(`
      select 
      t.*
      from classes c  
      join tutors t on t.tutor_pk = c.tutor_pk
      WHERE c.class_type in @platform_compatibility
      ${is_morning && is_afternoon
            ? ``
            : `AND if(${is_morning}, c.start_time > '00:00:00' AND c.start_time <= '12:00:00', IF(${is_afternoon}, c.start_time > '12:00:00' AND c.start_time <= '24:00:00', FALSE))`}  
      AND  t.gender in @gender
      AND c.course_pk in @subject_experties
      `, {
            gender: student_preference.gender,
            platform_compatibility: student_preference.platform_compatibility,
            subject_experties: student_preference.subject_experties,
        }
        //
        );
        console.log(`tutors`, tutors);
        const recommended_tutors = [];
        for (const tutor of tutors) {
            const tutor_info = yield con.QuerySingle(`select *, (SUM(rating)/COUNT(*)) 'average_rating' from (
          SELECT t.* , SUM(COALESCE(cr.mastery, 0) + COALESCE(cr.compentency, 0) + COALESCE(cr.helpfulness, 0) + COALESCE(cr.professionalism, 0))
          /(SELECT SUM(IF(cr.mastery > 0, 1, 0)) + SUM(IF(cr.compentency > 0, 1, 0)) + SUM(IF(cr.helpfulness > 0, 1, 0)) + SUM(IF(cr.professionalism > 0, 1, 0)))  
          /COUNT(*) 
          'rating'
          FROM class_rating cr 
          join classes c on c.class_pk = cr.class_pk 
          join tutors t on t.tutor_pk = c.tutor_pk
          WHERE t.tutor_pk = @tutor_pk 
          GROUP BY cr.class_pk, cr.student_pk)
          tutors`, {
                tutor_pk: tutor.tutor_pk,
            });
            tutor_info.user_info = yield con.QuerySingle(`select * from vw_user_info where user_id=@user_id`, {
                user_id: tutor_info.user_id,
            });
            tutor_info.user_info.picture = yield (0, useFileUploader_1.GetUploadedImage)(tutor_info.user_info.picture);
            tutor_info.classes = yield con.Query(`
        SELECT c.* FROM classes c
        WHERE c.tutor_pk = @tutor_pk AND c.class_pk NOT IN (SELECT class_pk FROM class_students WHERE student_pk = @student_pk)
        `, {
                tutor_pk: tutor.tutor_pk,
                student_pk: student_pk,
            });
            recommended_tutors.push(tutor_info);
        }
        console.log(`recommended_tutors`, recommended_tutors);
        for (const p of recommended_tutors) {
            p.rating = parseFloat(p.rating + ``);
            p.average_rating = parseFloat(p.rating + ``);
        }
        // recommended_tutors.sort((p) => p.rating);
        recommended_tutors.sort((a, b) => parseFloat(b.rating + ``) - parseFloat(a.rating + ``));
        con.Commit();
        return {
            success: true,
            data: recommended_tutors,
        };
    }
    catch (error) {
        yield con.Rollback();
        console.error(`error`, error);
        return {
            success: false,
            message: (0, useErrorMessage_1.ErrorMessage)(error),
        };
    }
});
exports.default = {
    addTutor,
    updateTutor,
    getTutorDataTable,
    getSingleTutor,
    searchTutor,
    getDummyTutors,
    insertDummyTutorRatings,
    updateTutorImage,
    toggleActiveStatus,
    getTotalTutors,
    getLoggedInTutor,
    updateLoggedInTutorBio,
    rateTutor,
    favoriteTutor,
    getSingTutorToStudent,
    getMostRatedTutors,
    getRecommendedTutors,
    getPreferredTutors,
};
//# sourceMappingURL=TutorRepository.js.map