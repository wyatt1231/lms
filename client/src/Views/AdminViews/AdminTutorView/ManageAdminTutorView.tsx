import {
  Button,
  Chip,
  Container,
  Grid,
  Tooltip,
  useTheme,
} from "@material-ui/core";
import { Rating, Skeleton } from "@material-ui/lab";
import React, { FC, memo, useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Route, Switch, useParams } from "react-router";
import CustomAvatar from "../../../Component/CustomAvatar";
import LinkTabs from "../../../Component/LinkTabs";
import {
  InvalidDateTimeToDefault,
  InvalidDateToDefault,
} from "../../../Hooks/UseDateParser";
import { StringEmptyToDefault } from "../../../Hooks/UseStringFormatter";
import {
  setGeneralPrompt,
  setPageLinks,
} from "../../../Services/Actions/PageActions";
import TutorActions, {
  setSingleTutor,
} from "../../../Services/Actions/TutorActions";
import { RootStore } from "../../../Services/Store";
import EditTutorDialog from "./EditTutorDialog";
import EditTutorImageDialog from "./EditTutorImageDialog";
import TutorAssignedClassView from "./TutorAssignedClassView";
import TutorCalendarView from "./TutorCalendarView";
import TutorRatingView from "./TutorRatingView";

interface ManageAdminAdminProps {}

export const ManageAdminAdminView: FC<ManageAdminAdminProps> = memo(() => {
  const dispatch = useDispatch();
  const params = useParams<any>();
  const theme = useTheme();

  const user_type = useSelector(
    (store: RootStore) => store.UserReducer.user?.user_type
  );

  const selected_tutor = useSelector(
    (store: RootStore) => store.TutorReducer.single_tutor
  );

  const fetching_selected_tutor = useSelector(
    (store: RootStore) => store.TutorReducer.fetching_single_tutor
  );

  const [open_edit_tutor, set_open_edit_tutor] = useState(false);
  const handleOpenEditTutor = useCallback(() => {
    set_open_edit_tutor(true);
  }, []);
  const handleCloseEditTutor = useCallback(() => {
    set_open_edit_tutor(false);
  }, []);

  const [open_change_image, set_open_change_image] = useState(false);
  const handleOpenChangeImage = useCallback(() => {
    set_open_change_image(true);
  }, []);
  const handleCloseChangeImage = useCallback(() => {
    set_open_change_image(false);
  }, []);

  const handleToggleActive = useCallback(() => {
    if (selected_tutor?.tutor_pk) {
      dispatch(
        setGeneralPrompt({
          open: true,
          continue_callback: () =>
            dispatch(
              TutorActions.toggleActiveStatus(
                parseInt(selected_tutor.tutor_pk),
                (msg: string) => {
                  dispatch(setSingleTutor(selected_tutor.tutor_pk));
                }
              )
            ),
        })
      );
    }
  }, [dispatch, selected_tutor]);

  useEffect(() => {
    if (params.tutor_pk) {
      dispatch(setSingleTutor(params.tutor_pk));
    }
  }, [dispatch, params.tutor_pk]);

  useEffect(() => {
    dispatch(
      setPageLinks([
        {
          link: "/admin/tutor",
          title: "Tutors",
        },
        {
          link: window.location.pathname,
          title: "Manage Tutor",
        },
      ])
    );
  }, [dispatch]);

  let ButtonOptions: Array<any> = [];

  if (user_type === "admin") {
    ButtonOptions = [
      {
        text: "Edit Details",
        color: "primary",
        handleClick: () => {
          handleOpenEditTutor();
        },
      },
      {
        text: "Change Image",
        color: "primary",
        handleClick: () => {
          handleOpenChangeImage();
        },
      },
      {
        text:
          selected_tutor?.is_active === "y"
            ? "Set to Inactive"
            : "Set to Active",
        color: "primary",
        handleClick: () => {
          handleToggleActive();
        },
      },
    ];
  }

  return (
    <>
      <Container maxWidth="xl">
        <Grid container spacing={3}>
          <Grid item xs={12} md={4} lg={3}>
            <div className="manage-container">
              <Grid
                container
                spacing={2}
                alignItems="center"
                alignContent="center"
              >
                <Grid item xs={10}>
                  <div className="container-title">Tutor Information</div>
                </Grid>
                {/* <Grid item xs={2}>
                  <IconButtonPopper
                    buttonColor="primary"
                    buttons={ButtonOptions}
                  />
                </Grid> */}
              </Grid>

              {fetching_selected_tutor && !selected_tutor ? (
                <Skeleton
                  variant="rect"
                  animation="wave"
                  width={`100%`}
                  height={500}
                />
              ) : (
                <>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <div className="profile">
                        <CustomAvatar
                          style={{
                            height: 150,
                            width: 150,
                            margin: `.5em`,
                          }}
                          variant="circle"
                          src={selected_tutor?.picture}
                          errorMessage="No image found!"
                        />

                        <div className="title">
                          {selected_tutor?.firstname}{" "}
                          {selected_tutor?.middlename}{" "}
                          {selected_tutor?.lastname} {selected_tutor?.suffix}{" "}
                        </div>
                        <div className="sub-title">
                          {selected_tutor?.position}
                        </div>

                        <div
                          style={{
                            display: `grid`,
                            gridGap: `.5em`,
                            marginTop: `1em`,
                            alignContent: `center`,
                            alignItems: `center`,
                            justifyItems: `center`,
                            borderTop: `.01em solid rgba(0,0,0,.1)`,
                            height: `100%`,
                          }}
                        >
                          <Button
                            color="primary"
                            onClick={() => handleOpenEditTutor()}
                          >
                            Edit Details
                          </Button>

                          <Button
                            color="primary"
                            onClick={() => handleOpenChangeImage()}
                          >
                            Change Image
                          </Button>

                          <Button
                            color="primary"
                            onClick={() => handleToggleActive()}
                          >
                            {selected_tutor?.is_active === "y"
                              ? "Set to Inactive"
                              : "Set to Active"}
                          </Button>
                        </div>
                      </div>
                    </Grid>

                    <Grid item xs={12}>
                      <div className="remarks">
                        {StringEmptyToDefault(
                          selected_tutor?.bio,
                          "Nothing in bio!"
                        )}
                      </div>
                    </Grid>

                    <Grid item xs={12}>
                      <div className="info-container">
                        <div className="form-group">
                          <div className="label">Average Rating</div>
                          <div className="value">
                            <Tooltip
                              title={selected_tutor?.average_rating + " stars"}
                            >
                              <Rating
                                readOnly
                                name="rating"
                                value={selected_tutor?.average_rating}
                              />
                            </Tooltip>
                          </div>
                        </div>
                        <div className="form-group">
                          <div className="label">Active</div>
                          <div className="value">
                            {selected_tutor?.is_active === "y" ? (
                              <Chip
                                label="Yes"
                                style={{
                                  color: `#b71c1c`,
                                  backgroundColor: `#ffcdd2`,
                                }}
                              />
                            ) : (
                              <Chip
                                label="No"
                                style={{
                                  color: `#0d47a1`,
                                  backgroundColor: `#bbdefb`,
                                }}
                              />
                            )}
                          </div>
                        </div>

                        <div className="form-group">
                          <div className="label">Gender</div>
                          <div className="value">
                            {selected_tutor?.gender === "m" ? "Male" : "Female"}
                          </div>
                        </div>

                        <div className="form-group">
                          <div className="label">Date of Birth</div>
                          <div className="value">
                            {InvalidDateToDefault(
                              selected_tutor?.birth_date,
                              "-"
                            )}
                          </div>
                        </div>

                        <div className="form-group">
                          <div className="label">Email Address</div>
                          <div className="value">{selected_tutor?.email}</div>
                        </div>

                        <div className="form-group">
                          <div className="label">Mobile Number</div>
                          <div className="value">{selected_tutor?.mob_no}</div>
                        </div>

                        <div className="form-group">
                          <div className="label">Home Address</div>
                          <div className="value">
                            {selected_tutor?.complete_address}
                          </div>
                        </div>

                        <div className="form-group">
                          <div className="label">Registered At</div>
                          <div className="value">
                            {InvalidDateTimeToDefault(
                              selected_tutor?.encoded_at,
                              "-"
                            )}
                          </div>
                        </div>
                      </div>
                    </Grid>
                  </Grid>
                </>
              )}
            </div>
          </Grid>

          <Grid item xs={12} md={8} lg={9}>
            <div className="manage-container ">
              <LinkTabs
                tabs={[
                  {
                    label: "Calendar",
                    link: `/${user_type}/tutor/${params.tutor_pk}/calendar`,
                  },
                  {
                    label: "Assigned Classes",
                    link: `/${user_type}/tutor/${params.tutor_pk}/assigned-classes`,
                  },
                  // {
                  //   label: "Ratings",
                  //   link: `/${user_type}/tutor/${params.tutor_pk}/ratings`,
                  // },
                ]}
                RenderSwitchComponent={
                  <Switch>
                    <Route
                      path={`/${user_type}/tutor/${params.tutor_pk}/calendar`}
                      exact
                    >
                      <TutorCalendarView tutor_pk={params.tutor_pk} />
                    </Route>
                    <Route
                      path={`/${user_type}/tutor/${params.tutor_pk}/assigned-classes`}
                      exact
                    >
                      <TutorAssignedClassView tutor_pk={params.tutor_pk} />
                    </Route>
                    <Route
                      path={`/${user_type}/tutor/${params.tutor_pk}/ratings`}
                      exact
                    >
                      <TutorRatingView tutor_pk={params.tutor_pk} />
                    </Route>
                  </Switch>
                }
              />
            </div>
          </Grid>
        </Grid>

        {selected_tutor && (
          <>
            <EditTutorDialog
              initial_form_values={selected_tutor}
              open={open_edit_tutor}
              handleClose={handleCloseEditTutor}
            />
            <EditTutorImageDialog
              initial_form_values={selected_tutor}
              open={open_change_image}
              handleClose={handleCloseChangeImage}
            />
          </>
        )}
      </Container>
    </>
  );
});

export default ManageAdminAdminView;
