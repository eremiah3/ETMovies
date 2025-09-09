import React from "react";
import { Route, Switch, Redirect } from "react-router-dom";

import Home from "../pages/Home";
import Catalog from "../pages/Catalog";
import Detail from "../pages/detail/Detail";
import Animation from "../pages/Animation";
import Login from "../pages/Login";
import Signup from "../pages/Signup";
import ForgotPassword from "../pages/ForgotPassword";
import ProtectedRoute from "../components/ProtectedRoute";

import * as Config from "../constants/Config";

const Routes = () => {
  return (
    <Switch>
      <Route exact path="/" render={() => <Redirect to={`/${Config.HOME_PAGE}`} />} />
      <Route path="/login" component={Login} />
      <Route path="/signup" component={Signup} />
      <Route path="/forgot-password" component={ForgotPassword} />
      <ProtectedRoute path={`/${Config.HOME_PAGE}/animation/search/:keyword`} component={Animation} />
      <ProtectedRoute path={`/${Config.HOME_PAGE}/:category/search/:keyword`} component={Catalog} />
      <ProtectedRoute path={`/${Config.HOME_PAGE}/:category/:id`} component={Detail} />
      <ProtectedRoute path={`/${Config.HOME_PAGE}/animation`} component={Animation} />
      <ProtectedRoute path={`/${Config.HOME_PAGE}/:category`} component={Catalog} />
      <ProtectedRoute path={`/${Config.HOME_PAGE}`} exact component={Home} />
    </Switch>
  );
};

export default Routes;
