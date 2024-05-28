import React from "react";
import { useSelector } from "react-redux";
import { Route, Switch } from "react-router-dom";
import { RootStore } from "../Services/Store";
import ManageClassAdminView from "../Views/SharedViews/Class/ManageClassView";
import RateClassDialog from "../Views/SharedViews/Tutor/RateClassDialog";
import HomeStudentView from "../Views/StudentViews/DashboardStudentView";
import DataClassStudentView from "../Views/StudentViews/DataClassStudentView";
import TutorRatingView from "../Views/StudentViews/TutorRatingStudentView/TutorRatingStudentView";
import ManageClassSelectedSessionTutorView from "../Views/TutorViews/ManageClassTutorViews/ManageClassSession";

const StudentRoutes = () => {
  const class_rating = useSelector(
    (store: RootStore) => store.ClassReducer.class_rating
  );

  return (
    <>
      {!!class_rating?.class_pk && <RateClassDialog />}

      <Switch>
        <Route path="/student/dashboard" exact>
          <HomeStudentView />
        </Route>
        {/* <Route path="/student/class" exact>
          <DataTableClassStudentView />
        </Route> */}

        {/* <Route
          path={`/student/class/:class_pk/session/:session_pk`}
          strict
          exact
        >
          <ManageClassSelectedSessionTutorView />
        </Route> */}

        <Route path="/student/class/records" strict>
          <DataClassStudentView />
        </Route>

        <Route path="/student/class/:class_pk/session/:session_pk" strict>
          <ManageClassSelectedSessionTutorView />
        </Route>

        <Route path="/student/class/:class_pk" strict>
          <ManageClassAdminView />
        </Route>

        {/* <Route path="/tutor/class/:class_pk/session/:session_pk" strict exact>
        <ManageClassSelectedSessionTutorView />
      </Route> */}
        {/* <Route path="/student/class/:class_pk" strict>
          <ManageClassTutorView />
        </Route> */}
      </Switch>
      <TutorRatingView />
    </>
  );
};

export default StudentRoutes;
