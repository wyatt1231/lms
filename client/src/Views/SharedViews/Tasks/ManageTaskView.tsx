import {
  Button,
  Container,
  Grid,
  useMediaQuery,
  useTheme,
} from "@material-ui/core";
import React, { FC, memo, useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import CustomTab from "../../../Component/CustomTabs";
import FileViewer from "../../../Component/FileViewer";
import FormDialog from "../../../Component/FormDialog/FormDialog";
import { parseDateTimeOrDefault } from "../../../Hooks/UseDateParser";
import ClassSessionTaskActions from "../../../Services/Actions/ClassSessionTaskActions";
import { setGeneralPrompt } from "../../../Services/Actions/PageActions";
import { SessionTaskModel } from "../../../Services/Models/ClassSessionTaskModels";
import { RootStore } from "../../../Services/Store";
import EditTaskDialog from "./EditTaskDialog";
import ManageTaskQuesView from "./ManageTaskQuesView";
import ManageTaskSubmit from "./ManageTaskSubmit";
interface IManageTaskView {}

export const ManageTaskView: FC<IManageTaskView> = memo(() => {
  const theme = useTheme();
  const md_screen = useMediaQuery(theme.breakpoints.down("lg"));

  const dispatch = useDispatch();

  const user = useSelector((store: RootStore) => store.UserReducer.user);
  const single_class_task = useSelector(
    (store: RootStore) => store.ClassSessionTaskReducer.single_class_task
  );

  const [open_edit_task, set_open_edit_task] = useState(false);
  const [open_file, set_open_file] = useState<boolean>(false);

  const handleSetOpenEditTask = useCallback((open: boolean) => {
    set_open_edit_task(open);
  }, []);

  const [tabs, set_tabls] = useState<any>();

  useEffect(() => {
    let mounted = true;
    const loadTabs = () => {
      const gen_tab = [
        {
          label: "Questions",
          RenderComponent: (
            <ManageTaskQuesView
              class_task_pk={single_class_task?.class_task_pk}
            />
          ),
        },
      ];

      if (user?.user_type === "tutor") {
        gen_tab.push({
          label: "Submissions",
          RenderComponent: (
            <ManageTaskSubmit
              class_task_pk={single_class_task?.class_task_pk}
            />
          ),
        });
      }

      set_tabls((tabs) => {
        return [...gen_tab];
      });
    };

    mounted && user && loadTabs();

    return () => {
      mounted = false;
    };
  }, [single_class_task, user]);

  return (
    <>
      {single_class_task && (
        <FormDialog
          open={true}
          fullScreen={md_screen}
          minWidth={theme.breakpoints.values.lg}
          handleClose={() =>
            dispatch(ClassSessionTaskActions.setSingleClassTask(0, true))
          }
          title="Task Information"
          body={
            <Container maxWidth="lg" style={{ padding: `1em` }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  {user?.user_type === "tutor" && (
                    <div
                      style={{
                        padding: `1em`,
                        display: `grid`,
                        gridGap: `.5em`,
                        gridAutoFlow: `column`,
                        justifyContent: `start`,
                      }}
                    >
                      <Button
                        variant="contained"
                        size="small"
                        color="primary"
                        onClick={() => {
                          handleSetOpenEditTask(true);
                        }}
                      >
                        Edit Task
                      </Button>

                      {single_class_task?.sts_pk === "c" && (
                        <Button
                          variant="contained"
                          size="small"
                          color="primary"
                          onClick={() => {
                            const payload: SessionTaskModel = {
                              class_task_pk: single_class_task?.class_task_pk,
                              sts_pk: "s",
                            };
                            dispatch(
                              setGeneralPrompt({
                                open: true,
                                continue_callback: () =>
                                  dispatch(
                                    ClassSessionTaskActions.changeStatusClassTask(
                                      payload,
                                      (msg: string) => {
                                        dispatch(
                                          ClassSessionTaskActions.setSingleClassTask(
                                            payload.class_task_pk
                                          )
                                        );
                                      }
                                    )
                                  ),
                              })
                            );
                          }}
                        >
                          Start Task
                        </Button>
                      )}

                      {single_class_task?.allow_submit === "n" && (
                        <Button
                          variant="contained"
                          size="small"
                          color="primary"
                          onClick={() => {
                            const payload: SessionTaskModel = {
                              class_task_pk: single_class_task?.class_task_pk,
                              allow_submit: "y",
                            };
                            dispatch(
                              setGeneralPrompt({
                                open: true,
                                continue_callback: () =>
                                  dispatch(
                                    ClassSessionTaskActions.toggleSubmitClassTask(
                                      payload,
                                      (msg: string) => {
                                        dispatch(
                                          ClassSessionTaskActions.setSingleClassTask(
                                            payload.class_task_pk
                                          )
                                        );
                                      }
                                    )
                                  ),
                              })
                            );
                          }}
                        >
                          Allow Sub.
                        </Button>
                      )}

                      {single_class_task?.sts_pk === "s" && (
                        <Button
                          variant="contained"
                          size="small"
                          color="secondary"
                          onClick={() => {
                            const payload: SessionTaskModel = {
                              class_task_pk: single_class_task?.class_task_pk,
                              sts_pk: "c",
                            };
                            dispatch(
                              setGeneralPrompt({
                                open: true,
                                continue_callback: () =>
                                  dispatch(
                                    ClassSessionTaskActions.changeStatusClassTask(
                                      payload,
                                      (msg: string) => {
                                        dispatch(
                                          ClassSessionTaskActions.setSingleClassTask(
                                            payload.class_task_pk
                                          )
                                        );
                                      }
                                    )
                                  ),
                              })
                            );
                          }}
                        >
                          Cancel Task
                        </Button>
                      )}

                      {single_class_task?.allow_submit === "y" && (
                        <Button
                          variant="contained"
                          size="small"
                          color="secondary"
                          onClick={() => {
                            const payload: SessionTaskModel = {
                              class_task_pk: single_class_task?.class_task_pk,
                              allow_submit: "n",
                            };
                            dispatch(
                              setGeneralPrompt({
                                open: true,
                                continue_callback: () =>
                                  dispatch(
                                    ClassSessionTaskActions.toggleSubmitClassTask(
                                      payload,
                                      (msg: string) => {
                                        dispatch(
                                          ClassSessionTaskActions.setSingleClassTask(
                                            payload.class_task_pk
                                          )
                                        );
                                      }
                                    )
                                  ),
                              })
                            );
                          }}
                        >
                          Disallow Sub.
                        </Button>
                      )}
                    </div>
                  )}

                  <h2>{single_class_task?.task_title}</h2>
                  <div>
                    {parseDateTimeOrDefault(single_class_task?.due_date, "-")}
                  </div>
                  {/* <div>
                    <Chip
                      label={single_class_task?.status_dtls?.sts_desc}
                      title={single_class_task?.status_dtls?.sts_desc}
                      style={{
                        color: single_class_task?.status_dtls?.sts_color,
                        backgroundColor:
                          single_class_task?.status_dtls?.sts_bgcolor,
                      }}
                    />
                  </div> */}
                  <div>{single_class_task?.task_desc}</div>

                  {!!single_class_task.file_location && (
                    <div
                      onClick={() => {
                        set_open_file(!open_file);
                      }}
                    >
                      <small className="link">View Attached Task File</small>
                    </div>
                  )}
                </Grid>
                <Grid item xs={12}>
                  <CustomTab tabs={tabs} />
                </Grid>
              </Grid>
            </Container>
          }
          // actions={<>Some Actions</>}
        />
      )}

      {single_class_task && (
        <EditTaskDialog
          task={single_class_task}
          open={open_edit_task}
          handleSetOpenEditTask={handleSetOpenEditTask}
        />
      )}

      {!!open_file && (
        // <FormDialog
        //   open={open_file}
        //   handleClose={() => set_open_file(false)}
        //   title={single_class_task?.task_title}
        //   fullScreen={true}
        //   body={<FileViewer file={`/${single_class_task?.file_location}`} />}
        // />

        <FileViewer
          handleClose={() => {
            // set_selected_inp_lab_result(undefined);
            set_open_file(false);
          }}
          doc_title={single_class_task?.task_title}
          location={`/${single_class_task?.file_location}`}
          actions={<></>}
        />
      )}
    </>
  );
});

export default ManageTaskView;
