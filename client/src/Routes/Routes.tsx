import React, { memo, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Route, BrowserRouter as Router, Switch } from "react-router-dom";
import { io } from "socket.io-client";
import PageLoader from "../Component/PageLoader";
import PagePrompt from "../Component/PagePrompt";
import PageSnackbar from "../Component/PageSnackbar";
import PageSuccessPrompt from "../Component/PageSuccessPrompt";
import { getAccessToken } from "../Helpers/AppConfig";
import SocketActions from "../Services/Actions/SocketActions";
import UserActions, {
  SetCurrentUserAction,
} from "../Services/Actions/UserActions";
import { RootStore } from "../Services/Store";
import LoginPortal from "../Views/LoginPortal/LoginPortal";
import RegisterSTudentView from "../Views/RegisterStudentViews/RegisterStudentView";
import SysAdminRoutes from "./AdminRoutes";
import Layout from "./Layout/Layout";
import StudentRoutes from "./StudentRoutes";
import TutorRoutes from "./TutorRoutes";

const Routes = memo(() => {
  const dispatch = useDispatch();
  const user = useSelector((store: RootStore) => store.UserReducer.user);

  const socketRef = useRef<any>();

  useEffect(() => {
    let mounted = true;
    const getUserInfo = async () => {
      dispatch(SetCurrentUserAction());
    };

    mounted && getUserInfo();

    return () => {
      mounted = false;
    };
  }, [dispatch]);

  useEffect(() => {
    socketRef.current = io(`/socket/notif`, {
      query: {
        token: getAccessToken(),
      },
    });

    dispatch(SocketActions.setNotifSocket(socketRef.current));

    socketRef.current.on("getNotif", () => {
      dispatch(UserActions.getUserNotif());
    });

    return () => {
      socketRef?.current?.disconnect();
    };
  }, []);

  //notify tutor if tutor changes

  useEffect(() => {
    dispatch(UserActions.getUserNotif());
  }, [dispatch]);

  return (
    <div>
      <Router>
        <PageLoader />
        <PagePrompt />
        <PageSnackbar />
        <PageSuccessPrompt />
        <Switch>
          {/* <Route path="/" exact component={LoginPortal} /> */}
          <Route path="/login" exact component={LoginPortal} />
          <Route
            path="/student-registration"
            exact
            component={RegisterSTudentView}
          />
          {/* <Route path="/notfound" exact component={PageNotFound} /> */}
          <Layout>
            {user?.user_type === "admin" && <SysAdminRoutes />}
            {user?.user_type === "tutor" && <TutorRoutes />}
            {user?.user_type === "student" && <StudentRoutes />}
          </Layout>
        </Switch>
      </Router>
    </div>
  );
});
export default Routes;
