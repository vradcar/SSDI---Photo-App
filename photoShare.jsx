import React from 'react';
import ReactDOM from 'react-dom';
import {
  HashRouter, Route, Switch
} from 'react-router-dom';
import {
  Grid, Typography, Paper
} from '@mui/material';
import './styles/main.css';

// Import necessary components
import TopBar from './components/topBar/TopBar';
import UserDetail from './components/userDetail/userDetail';
import UserList from './components/userList/userList';
import UserPhotos from './components/userPhotos/userPhotos';
import LoginRegister from './components/loginRegister/loginRegister';

class PhotoShare extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isAuthenticated: false, // Add authentication state
    };
    this.handleLogin = this.handleLogin.bind(this);
  }

  // Method to handle login (can be updated as per login requirements)
  handleLogin() {
    this.setState({ isAuthenticated: true });
  }

  render() {
    // Check if user is authenticated; if not, render LoginRegister
    if (!this.state.isAuthenticated) {
      return <LoginRegister onLogin={this.handleLogin} />;
    }

    // If authenticated, render the main app layout
    return (
      <HashRouter>
        <div>
          <Grid container spacing={8}>
            <Grid item xs={12}>
              <TopBar />
            </Grid>
            <div className="main-topbar-buffer" />
            <Grid item sm={3}>
              <Paper className="main-grid-item">
                <UserList />
              </Paper>
            </Grid>
            <Grid item sm={9}>
              <Paper className="main-grid-item">
                <Switch>
                  <Route exact path="/"
                    render={() => (
                      <Typography variant="body1">
                        Welcome to your photo-sharing app! This <a href="https://mui.com/components/paper/">Paper</a> component
                        displays the main content of the application. The {"sm={9}"} prop in
                        the <a href="https://mui.com/components/grid/">Grid</a> item component makes it responsively
                        display 9/12 of the window. The Switch component enables us to conditionally render different
                        components to this part of the screen. You don&apos;t need to display anything here on the homepage,
                        so you should delete this Route component once you get started.
                      </Typography>
                    )}
                  />
                  <Route path="/users/:userId"
                    render={props => <UserDetail {...props} />}
                  />
                  <Route path="/photos/:userId"
                    render={props => <UserPhotos {...props} />}
                  />
                  <Route path="/users" component={UserList} />
                </Switch>
              </Paper>
            </Grid>
          </Grid>
        </div>
      </HashRouter>
    );
  }
}

ReactDOM.render(
  <PhotoShare />,
  document.getElementById('photoshareapp'),
);
