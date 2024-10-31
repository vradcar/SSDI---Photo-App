import React from 'react';
import { AppBar, Toolbar, Typography, Button } from '@mui/material';
import { withRouter } from 'react-router-dom';
import axios from 'axios';
import './TopBar.css';

class TopBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user: null,
      isPhotoView: false,
      version: '',  // Store the version number
    };
    this.handleLogout = this.handleLogout.bind(this);
  }

  componentDidMount() {
    this.updateContext();
    this.fetchVersionNumber();
    this.checkUserSession();
  }

  componentDidUpdate(prevProps) {
    const { location } = this.props;
    if (location !== prevProps.location) {
      this.updateContext();
    }
  }

  // Fetches the current logged-in user session
  checkUserSession() {
    axios.get('/current/user')
      .then((response) => {
        if (response.data) {
          this.setState({ user: response.data });
        }
      })
      .catch(() => {
        this.setState({ user: null });
      });
  }

  updateContext() {
    const path = this.props.location.pathname;
    let userId;

    if (path.startsWith('/users/')) {
      userId = path.split('/')[2];
    } else if (path.startsWith('/photos/')) {
      userId = path.split('/')[2];
    }

    if (userId) {
      axios.get(`/user/${userId}`)
        .then((response) => {
          const userData = response.data;
          this.setState({ 
            user: userData, 
            isPhotoView: path.startsWith('/photos/') 
          });
        })
        .catch((error) => {
          console.error('Error fetching user details:', error);
          this.setState({ user: null, isPhotoView: false });
        });
    } else {
      this.setState({ user: null, isPhotoView: false });
    }
  }

  fetchVersionNumber() {
    this.setState({ version: 1 });
    // Add fetch logic for version number if needed
  }

  handleLogout() {
    axios.post('/admin/logout')
      .then(() => {
        this.setState({ user: null });
        this.props.history.push('/login');  // Redirect to login page
      })
      .catch((error) => {
        console.error('Error logging out:', error);
      });
  }

  render() {
    const { user, isPhotoView, version } = this.state;
    const displayText = user
      ? `Hi, ${user.first_name}`
      : 'Please Login';

    return (
      <AppBar className="topbar-appBar" position="fixed">
        <Toolbar className="topbar-toolbar">
          <Typography variant="h6" className="topbar-title" style={{ flexGrow: 1, textAlign: 'left' }}>
            Group 6 - Project 6 - Sprint 2
          </Typography>
          <Typography variant="h6" className="topbar-content">
            {user ? (
              `${isPhotoView ? 'Photos of' : 'Details of'} ${user.first_name} ${user.last_name}`
            ) : (
              'Photo Sharing App'
            )}
          </Typography>
          <Typography variant="body1" className="topbar-version" style={{ marginLeft: '20px' }}>
            Version: {version}
          </Typography>
          <div style={{ marginLeft: 'auto' }}>
            <Typography variant="h6" style={{ marginRight: '20px' }}>
              {displayText}
            </Typography>
            {user && (
              <Button color="inherit" onClick={this.handleLogout}>
                Logout
              </Button>
            )}
          </div>
        </Toolbar>
      </AppBar>
    );
  }
}

export default withRouter(TopBar);













// import React from 'react';
// import { AppBar, Toolbar, Typography } from '@mui/material';
// import { withRouter } from 'react-router-dom';
// import axios from 'axios'; // Corrected import order
// import './TopBar.css';

// class TopBar extends React.Component {
//   constructor(props) {
//     super(props);
//     this.state = {
//       user: null,
//       isPhotoView: false,
//       version: '',  // To store the version number
//     };
//   }

//   componentDidMount() {
//     this.updateContext();
//     this.fetchVersionNumber();
//   }

//   componentDidUpdate(prevProps) {
//     const { location } = this.props;
//     if (location !== prevProps.location) {
//       this.updateContext();
//     }
//   }

//   updateContext() {
//     const path = this.props.location.pathname;
//     let userId;

//     if (path.startsWith('/users/')) {
//       userId = path.split('/')[2];
//     } else if (path.startsWith('/photos/')) {
//       userId = path.split('/')[2];
//     }

//     if (userId) {
//       // Use axios to fetch user data
//       axios.get(`/user/${userId}`)
//       .then((response) => {
//         const userData = response.data;
//         this.setState({ 
//           user: userData, 
//           isPhotoView: path.startsWith('/photos/') 
//         });
//       })
//       .catch((error) => {
//         console.error('Error fetching user details:', error);
//         this.setState({ user: null, isPhotoView: false });
//       });
//     } else {
//       this.setState({ user: null, isPhotoView: false });
//     }
//   }

//   fetchVersionNumber() {
//     this.setState({ version: 1 });
//     // Fetch version number from the /test/info API if needed
//   }

//   render() {
//     const { user, isPhotoView, version } = this.state;
//     const displayText = user
//       ? `${isPhotoView ? 'Photos of' : 'Details of'} ${user.first_name} ${user.last_name}`
//       : 'Photo Sharing App';

//     return (
//       <AppBar className="topbar-appBar" position="fixed">
//         <Toolbar className="topbar-toolbar">
//           <Typography variant="h6" className="topbar-title" style={{ flexGrow: 1, textAlign: 'left' }}>
//             Group 6 - Project 6 - Sprint 2
//           </Typography>
//           <Typography variant="h6" className="topbar-content">
//             {displayText}
//           </Typography>
//           <Typography variant="body1" className="topbar-version" style={{ marginLeft: '20px' }}>
//             Version: {version}
//           </Typography>
//         </Toolbar>
//       </AppBar>
//     );
//   }
// }

// export default withRouter(TopBar);





