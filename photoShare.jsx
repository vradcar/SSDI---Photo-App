import React from 'react';
import ReactDOM from 'react-dom';
import {
  HashRouter, Route, Switch, Redirect
} from 'react-router-dom';
import {
  Grid, Paper
} from '@mui/material';
import './styles/main.css';

// Import necessary components
import TopBar from './components/topBar/TopBar';
import UserDetail from './components/userDetail/userDetail';
import LoginRegister from './components/loginRegister/loginRegister';
import UserPhotos from './components/userPhotos/userPhotos';

class PhotoShare extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isAuthenticated: false, // Authentication state
      user: null, 
    };
    this.handleLogin = this.handleLogin.bind(this);
    this.handleLogout = this.handleLogout.bind(this);
  }

  componentDidMount() {
    sessionStorage.clear();
    // Check sessionStorage for existing login session
    const sessionStatus = sessionStorage.getItem('isAuthenticated');
    const user = JSON.parse(sessionStorage.getItem('user'));
    if (sessionStatus === 'true' && user) {
      this.setState({ isAuthenticated: true, user });
    }
  }

  // Method to handle login and update authentication state
  handleLogin(user) { // Accepts `user` parameter from `LoginRegister`
    this.setState({ isAuthenticated: true, user }, () => {
      sessionStorage.setItem('isAuthenticated', 'true');
      sessionStorage.setItem('user', JSON.stringify(user));
    });
  }

  // Method to handle logout and clear session storage
  handleLogout() {
    this.setState({ isAuthenticated: false, user: null }, () => {
      // Clear session storage
      sessionStorage.removeItem('isAuthenticated');
      sessionStorage.removeItem('user');
    });
    sessionStorage.clear();
  }

  render() {
    const { isAuthenticated, user } = this.state;

    return (
      <HashRouter>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            {isAuthenticated ? (
              <>
                <TopBar user={user} onLogout={this.handleLogout} />
                <Paper elevation={3} style={{ padding: '20px' }}>
                  <Switch>
                    <Route 
                      path="/user/:userId" 
                      render={(props) => <UserDetail {...props} user={user} />} 
                    />
                    <Route path="/photos/:userId" 
                    render={props => <UserPhotos {...props} />} />
                    <Redirect from="/" to={`/user/${user._id}`} />
                    
                  </Switch>
                </Paper>
              </>
            ) : (
              <LoginRegister onLogin={this.handleLogin} />
            )}
          </Grid>
        </Grid>
      </HashRouter>
    );
  }
}

ReactDOM.render(
  <PhotoShare />,
  document.getElementById('photoshareapp'),
);




// import React from 'react';
// import ReactDOM from 'react-dom';
// import {
//   HashRouter, Route, Switch, Redirect
// } from 'react-router-dom';
// import {
//   Grid, Typography, Paper, Button // Import Button here
// } from '@mui/material';
// import './styles/main.css';

// // Import necessary components
// import TopBar from './components/topBar/TopBar';
// import UserDetail from './components/userDetail/userDetail';
// import UserList from './components/userList/userList';
// import UserPhotos from './components/userPhotos/userPhotos';
// import LoginRegister from './components/loginRegister/loginRegister';

// class PhotoShare extends React.Component {
//   constructor(props) {
//     super(props);
//     this.state = {
//       isAuthenticated: false,// Authentication state
//       user: null, 
//     };
//     this.handleLogin = this.handleLogin.bind(this);
//     this.handleLogout = this.handleLogout.bind(this);
//   }

//   componentDidMount() {
//     // Check sessionStorage for existing login session
//     const sessionStatus = sessionStorage.getItem('isAuthenticated');
//     const user = JSON.parse(sessionStorage.getItem('user'));
//     if (sessionStatus === 'true' && user) {
//       this.setState({ isAuthenticated: true, user });
//     }
//   }

//   // Method to handle login and update authentication state
  
//   handleLogin(user) { // Accepts `user` parameter from `LoginRegister`
//     this.setState({ isAuthenticated: true, user }, () => {
//       sessionStorage.setItem('isAuthenticated', 'true');
//       sessionStorage.setItem('user', JSON.stringify(user));
//     });
//   }
//   // Method to handle logout and clear session storage
//   handleLogout() {
//     this.setState({ isAuthenticated: false, user:null }, () => {
//       // Clear session storage
//       sessionStorage.removeItem('isAuthenticated');
//       sessionStorage.removeItem('user');
//     });
//   }

  
// render() {
//   const { isAuthenticated, user } = this.state;

//   return (

//     <HashRouter>
//         <Grid container spacing={2}>
//           <Grid item xs={12}>
//             {isAuthenticated ? (
//               <>
//                 <TopBar user={user} onLogout={this.handleLogout} />
//                 <Paper elevation={3} style={{ padding: '20px' }}>
//                   <Switch>
//                     <Route 
//                       path="/user/:userId" 
//                       render={(props) => <UserDetail {...props} user={user} />} 
//                     />
//                     <Redirect from="/" to={`/user/${user._id}`} /> {/* Default route */}
//                   </Switch>
//                 </Paper>
//               </>
//             ) : (
//               <LoginRegister onLogin={this.handleLogin} />
//             )}
//           </Grid>
//         </Grid>
//       </HashRouter>

    
//   );
// }}



// ReactDOM.render(
//   <PhotoShare />,
//   document.getElementById('photoshareapp'),
// );





