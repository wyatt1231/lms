import { yupResolver } from "@hookform/resolvers/yup";
import { Button, CircularProgress } from "@material-ui/core";
import React, { FC, memo, useCallback } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import * as Yup from "yup";
import CustomAvatar from "../../../Component/CustomAvatar";
import FormDialog from "../../../Component/FormDialog/FormDialog";
import RatingHookForm from "../../../Component/HookForm/RatingFieldHookForm";
import TextFieldHookForm from "../../../Component/HookForm/TextFieldHookForm";
import ClassActions from "../../../Services/Actions/ClassActions";
import { setGeneralPrompt } from "../../../Services/Actions/PageActions";
import { ClassRatingModel } from "../../../Services/Models/ClassRatingModel";
import { RootStore } from "../../../Services/Store";
import { StyledRateTutorDialog } from "./styles";

interface IRateClassDialog {}

const form_rating_validate = Yup.object({
  compentency: Yup.number().min(1).nullable().required().label("Compentency"),
  mastery: Yup.number().min(0).nullable().label("Mastery"),
  professionalism: Yup.number()
    .min(0)
    .nullable()

    .label("Professionalism"),
  helpfulness: Yup.number().min(0).nullable().label("Helpfulness"),
  feedback: Yup.string().label("Feedback"),
});

export const RateClassDialog: FC<IRateClassDialog> = memo(() => {
  const dispatch = useDispatch();
  const class_rating = useSelector(
    (store: RootStore) => store.ClassReducer.class_rating
  );

  const fetch_class_rating = useSelector(
    (store: RootStore) => store.ClassReducer.fetch_class_rating
  );

  const handleCloseDialog = useCallback(() => {
    dispatch(ClassActions.getClassRating(null));
  }, [dispatch]);

  const form_rating = useForm({
    resolver: yupResolver(form_rating_validate),
    mode: "onBlur",
    defaultValues: {
      compentency: class_rating?.compentency ?? 0,
      mastery: class_rating?.mastery ?? 0,
      professionalism: class_rating?.professionalism ?? 0,
      helpfulness: class_rating?.helpfulness ?? 0,
      feedback: class_rating?.feedback ?? 0,
    },
  });

  console.log(`class_rating`, class_rating);

  const handleSubmit = useCallback(
    (data: ClassRatingModel) => {
      const payload: ClassRatingModel = {
        ...data,
        class_pk: class_rating.class_pk,
        class_rate_pk: class_rating.class_rate_pk,
      };

      console.log(`payload`, payload);

      dispatch(
        setGeneralPrompt({
          open: true,
          continue_callback: () =>
            dispatch(
              ClassActions.rateClass(payload, (msg: string) => {
                form_rating.reset();
                // dispatch(
                //   ClassSessionTaskActions.setAllClassTaskQues(
                //     task_ques.class_task_pk
                //   )
                // );
                handleCloseDialog();
              })
            ),
        })
      );
    },
    [dispatch, class_rating]
  );

  return (
    <>
      <FormDialog
        open={!!class_rating}
        title="Class Rating and Assessment"
        handleClose={handleCloseDialog}
        minWidth={500}
        maxWidth="md"
        body={
          <FormProvider {...form_rating}>
            <form
              id="form-rating"
              onSubmit={form_rating.handleSubmit(handleSubmit)}
              noValidate
            >
              <StyledRateTutorDialog>
                {fetch_class_rating ? (
                  <div
                    style={{
                      display: `grid`,
                      justifyContent: `center`,
                      justifyItems: `center`,
                      padding: `5em`,
                    }}
                  >
                    <CircularProgress size={30} />
                  </div>
                ) : (
                  <div className="tutor-info-container">
                    <CustomAvatar
                      src={class_rating?.picture}
                      heightSpacing={20}
                      widthSpacing={20}
                      errorMessage={class_rating?.name?.charAt(0)}
                    />

                    <div className="name">{class_rating?.name}</div>
                    {!!class_rating?.position && (
                      <div className="position">{class_rating?.position}</div>
                    )}

                    {!!class_rating.bio && (
                      <div className="bio">{class_rating?.bio}</div>
                    )}

                    <div className="info-group-container">
                      <div className="info-group bordered">
                        <div className="label">
                          <b>Competency</b>
                          <br />
                          <small>
                            Factors influencing tutoring effectiveness include
                            the tutor's depth of knowledge, clarity in
                            explaining concepts, and responsiveness to student
                            inquiries.
                          </small>
                        </div>
                        <div className="value">
                          <RatingHookForm
                            name="compentency"
                            defaultValue={class_rating.compentency}
                          />
                        </div>
                      </div>

                      <div className="info-group bordered">
                        <div className="label">
                          <b>Mastery</b>
                          <br />
                          <small>
                            Assess the tutor's subject mastery by gauging their
                            capacity for thorough explanations, adept
                            problem-solving, and provision of supplementary
                            insights beyond the standard curriculum.
                          </small>
                        </div>
                        <div className="value">
                          <RatingHookForm
                            name="mastery"
                            defaultValue={class_rating.mastery}
                          />
                        </div>
                      </div>

                      <div className="info-group bordered">
                        <div className="label">
                          <b>Professionalism</b>
                          <br />
                          <small>
                            Assess the tutor's professionalism in attending
                            sessions on time, calm attitude, and approachable.
                          </small>
                        </div>
                        <div className="value">
                          <RatingHookForm
                            name="professionalism"
                            defaultValue={class_rating.professionalism}
                          />
                        </div>
                      </div>

                      <div className="info-group bordered">
                        <div className="label">
                          <b>Overall helpfulness</b>
                        </div>
                        <div className="value">
                          <RatingHookForm
                            name="helpfulness"
                            defaultValue={class_rating.helpfulness}
                          />
                        </div>
                      </div>

                      <div className="info-group bordered">
                        <div className="label">
                          <b>Feedback</b>
                        </div>
                        <div className="value">
                          <TextFieldHookForm
                            name="feedback"
                            fullWidth
                            placeholder="Write your feedback here..."
                            variant="outlined"
                            required
                            multiline={true}
                            minRows={3}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </StyledRateTutorDialog>
            </form>
          </FormProvider>
        }
        actions={
          <>
            <Button
              type="submit"
              form="form-rating"
              variant="contained"
              color="primary"
            >
              {/* onClick={() => form_rating.handleSubmit(handleSubmit)} */}
              Submit Rating
            </Button>
          </>
        }
      />
    </>
  );
});

export default RateClassDialog;
