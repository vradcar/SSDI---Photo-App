import React from 'react';
import ReactDOM from 'react-dom';
import { HashRouter, Route, Switch, Redirect } from 'react-router-dom';
import { Grid, Paper, Container } from '@mui/material';
import './styles/main.css';

import TopBar from './components/topBar/TopBar';
import UserDetail from './components/userDetail/userDetail';
import UserList from './components/userList/userList';
import UserPhotos from './components/userPhotos/userPhotos';
import LoginRegister from "./components/loginRegister/loginRegister";
import ActivityFeed from "./components/Activities/Activities"; 

class PhotoShare extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      main_content: undefined,
      user: undefined
    };
  }

  userIsLoggedIn = () => this.state.user !== undefined;

  changeMainContent = (main_content) => {
    this.setState({ main_content });
  };

  changeUser = (user) => {
    this.setState({ user });
    if (!user) this.changeMainContent(undefined);
  };

  render() {
    return (
      <HashRouter>
        <div>
          <Grid container spacing={8}>
            <Grid item xs={12}>
              <TopBar main_content={this.state.main_content} user={this.state.user} changeUser={this.changeUser} />
            </Grid>
            <div className="main-topbar-buffer" />

            {this.userIsLoggedIn() ? (
              // Render the main layout with UserList and user content when logged in
              <>
                <Grid item sm={3}>
                  <Paper className="main-grid-item">
                    <UserList />
                  </Paper>
                </Grid>
                <Grid item sm={9}>
                  <Paper className="main-grid-item">
                    <Switch>
                      <PrivateRoute
                        path="/users/:userId"
                        component={UserDetail}
                        user={this.state.user}
                        changeMainContent={this.changeMainContent}
                        redirectTo="/login-register"
                      />
                      <PrivateRoute
                        path="/photos/:userId"
                        component={UserPhotos}
                        user={this.state.user}
                        changeMainContent={this.changeMainContent}
                        redirectTo="/login-register"
                      />
                      <PrivateRoute
                        path="/activities"
                        component={ActivityFeed}
                        user={this.state.user}
                        changeMainContent={this.changeMainContent}
                        redirectTo="/login-register"
                      />
                      <Route
                        path="/"
                        render={() => <Redirect to="/users" />}
                      />
                    </Switch>
                  </Paper>
                </Grid>
              </>
            ) : (
              // Center the LoginRegister component when not logged in
              <Container maxWidth="sm" style={{ marginTop: '10vh', textAlign: 'center' }}>
                <Paper elevation={3} style={{ padding: '2rem' }}>
                  <Route
                    path="/login-register"
                    render={(props) => <LoginRegister {...props} changeUser={this.changeUser} />}
                  />
                  <Route
                    path="/"
                    render={() => <Redirect to="/login-register" />}
                  />
                </Paper>
              </Container>
            )}
          </Grid>
        </div>
      </HashRouter>
    );
  }
}

/**
 * PrivateRoute component to handle authentication-based redirection.
 * If the user is logged in, it renders the specified component; otherwise, redirects to the login page.
 */
const PrivateRoute = ({ component: Component, user, changeMainContent, redirectTo, ...rest }) => (
  <Route
    {...rest}
    render={(props) => user ? (
        <Component {...props} changeMainContent={changeMainContent} />
      ) : (
        <Redirect to={redirectTo} />
      )
    } />
);

ReactDOM.render(<PhotoShare />, document.getElementById('photoshareapp'));
