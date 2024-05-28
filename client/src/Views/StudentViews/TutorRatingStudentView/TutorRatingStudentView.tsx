import { Button, Grid } from "@material-ui/core";
import { Form, Formik, FormikProps } from "formik";
import React, {
  FC,
  memo,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import styled from "styled-components";
import * as Yup from "yup";
import FormDialog from "../../../Component/FormDialog/FormDialog";
import FormikCheckbox from "../../../Component/Formik/FormikCheckbox";
import CourseActions from "../../../Services/Actions/CourseActions";
import { setGeneralPrompt } from "../../../Services/Actions/PageActions";
import StudentActions from "../../../Services/Actions/StudentActions";
import TutorActions from "../../../Services/Actions/TutorActions";
import { StudentPrefModel } from "../../../Services/Models/StudentModel";
import { RootStore } from "../../../Services/Store";
import {
  DbClassAvailability,
  DbClassTypes,
  DbGender,
} from "../../../Storage/LocalDatabase";
interface TutorRatingStudentViewInterface {}

const form_scheme = Yup.object({
  availability: Yup.array().nullable().label("Availability"),
  subject_experties: Yup.array().nullable().label("Subject Expertise"),
  gender: Yup.array().nullable().label("Gender"),
  platform_compatibility: Yup.array()
    .nullable()
    .label("Platform Compatibility"),
});

export const TutorRatingStudentView: FC<TutorRatingStudentViewInterface> = memo(
  () => {
    const dispatch = useDispatch();
    const formRef = useRef<FormikProps<StudentPrefModel> | null>(null);

    const user = useSelector((store: RootStore) => store.UserReducer.user);
    const user_type = useSelector(
      (store: RootStore) => store.UserReducer.user?.user_type
    );

    const { course_options, fetching_course_options } = useSelector(
      (store: RootStore) => store.CourseReducer
    );

    const { student_pref, fetch_student_pref, is_show_preferences } =
      useSelector((store: RootStore) => store.StudentReducer);

    const [form_init, set_form_init] = useState({
      availability: student_pref?.availability ?? [],
      subject_experties: student_pref?.subject_experties ?? [],
      gender: student_pref?.gender ?? [],
      platform_compatibility: student_pref?.platform_compatibility ?? [],
    });

    console.log(`student_pref`, student_pref);

    const handleCloseDialog = useCallback(() => {
      dispatch(StudentActions.setShowPreferences(false));
    }, [dispatch]);

    const handleFormSubmit = async (form_values: any) => {
      console.log(`form_values`, form_values);
      dispatch(
        setGeneralPrompt({
          open: true,
          continue_callback: () =>
            dispatch(
              StudentActions.addOrUpdatePreference(
                form_values,
                (msg: string) => {
                  dispatch(StudentActions.setShowPreferences(false));
                  dispatch(TutorActions.getPreferredTutors());
                  dispatch(StudentActions.setStudentPreferences());
                }
              )
            ),
        })
      );
    };

    useEffect(() => {
      let mounted = true;

      const fetching = async () => {
        dispatch(StudentActions.setStudentPreferences());
        dispatch(CourseActions.setCourseOptions());
      };

      mounted && fetching();

      return () => {
        mounted = false;
      };
    }, [dispatch]);

    useEffect(() => {
      set_form_init({
        availability: student_pref?.availability ?? [],
        subject_experties: student_pref?.subject_experties ?? [],
        gender: student_pref?.gender ?? [],
        platform_compatibility: student_pref?.platform_compatibility ?? [],
      });
    }, [student_pref]);

    return fetch_student_pref || fetching_course_options ? null : (
      <FormDialog
        // open={!student_pref || success_dialog?.open === true}
        open={user_type === "student" && (!student_pref || is_show_preferences)}
        title="Fill in your Tutor Preferences"
        handleClose={handleCloseDialog}
        minWidth={900}
        maxWidth="md"
        body={
          <Formik
            initialValues={form_init}
            validationSchema={form_scheme}
            validateOnChange={true}
            validateOnBlur={true}
            onSubmit={handleFormSubmit}
            innerRef={formRef}
          >
            {({ values, errors, touched, setFieldValue, submitCount }) => (
              <Form
                className="clinic-adding-form"
                style={{
                  backgroundColor: `#fff`,
                  borderRadius: 10,
                  padding: `1em 2em`,
                }}
              >
                <div className="box-ctnr">
                  <div className="box-body">
                    <Grid container justify="center" spacing={3}>
                      <Grid xs={12} item>
                        <FormikCheckbox
                          row={true}
                          data={DbClassAvailability}
                          color="primary"
                          name="availability"
                          label="Availability"
                        />
                      </Grid>

                      <Grid xs={12} item>
                        <FormikCheckbox
                          row={true}
                          data={DbGender}
                          color="primary"
                          name="gender"
                          label="Gender"
                        />
                      </Grid>

                      <Grid xs={12} item>
                        <FormikCheckbox
                          row={true}
                          data={DbClassTypes}
                          color="primary"
                          name="platform_compatibility"
                          label="Platform Compatibility"
                        />
                      </Grid>

                      <Grid xs={12} item>
                        <FormikCheckbox
                          row={true}
                          data={course_options ?? []}
                          color="primary"
                          name="subject_experties"
                          label="Subject Experties"
                        />
                      </Grid>
                    </Grid>
                  </div>
                </div>
              </Form>
            )}
          </Formik>
        }
        actions={
          <>
            <Button
              // type="submit"
              form="form-preferences"
              variant="contained"
              color="primary"
              onClick={() => {
                formRef.current.handleSubmit();
              }}
            >
              Save Preferences
            </Button>
          </>
        }
      />
    );
  }
);

export default TutorRatingStudentView;

const StyledTutorRatingStudentView = styled.div`
  display: grid;
  justify-items: center;
  grid-gap: 1em;
  .pic {
    height: 220px;
    width: 350px;
  }
  .name {
    font-weight: 700;
  }
  .specialties {
    display: grid;
    grid-gap: 0.5em;
    grid-auto-flow: column;
  }
`;
