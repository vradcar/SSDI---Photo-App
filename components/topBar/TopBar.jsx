import React from 'react';
import { AppBar, Toolbar, Typography, Button, Avatar } from '@mui/material';
//import AccountCircleIcon from '@mui/icons-material/AccountCircle'; // Importing AccountCircleIcon
import { withRouter } from 'react-router-dom';
import axios from 'axios';
import './TopBar.css';

class TopBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user: props.user,
      isPhotoView: false,
      version: '',  // Store the version number
    };
    this.handleLogout = this.handleLogout.bind(this);
  }

  componentDidMount() {
    this.fetchVersionNumber();
    this.updateContext();
  }

  componentDidUpdate(prevProps) {
    const { location } = this.props;
    if (location !== prevProps.location) {
      this.updateContext();
    }
  }

  updateContext() {
    const path = this.props.location.pathname;
    this.setState({ isPhotoView: path.startsWith('/photos/') });
  }

  fetchVersionNumber() {
    this.setState({ version: 1 });
    // Add fetch logic for version number if needed
  }

  handleLogout() {
    axios.post('/admin/logout')
      .then(() => {
        this.props.onLogout(); // Notify parent component about logout
        this.props.history.push('/login');  // Redirect to login page
      })
      .catch((error) => {
        console.error('Error logging out:', error);
      });
  }

  render() {
    const { user } = this.props; // Receive user prop from parent component
    const displayUserName = user ? user.first_name : 'Guest'; // Display user's name or 'Guest'

    return (
      <AppBar position="static" color="primary">
        <Toolbar>
          {/* <AccountCircleIcon style={{ marginRight: '10px' }} /> */}
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Welcome,{displayUserName}!
          </Typography>
          {user && (
            <Avatar alt={user.first_name} src={user.profilePic} />
          )}
          {user && (
            <Button color="inherit" onClick={this.handleLogout}>
              Logout
            </Button>
          )}
        </Toolbar>
      </AppBar>
    );
  }
}

export default withRouter(TopBar);
