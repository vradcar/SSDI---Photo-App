import React from 'react';
import { AppBar, Toolbar, Typography } from '@mui/material';
import { withRouter } from 'react-router-dom';
import fetchModel from '../../lib/fetchModelData'; 
import './TopBar.css';

class TopBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user: null,
      isPhotoView: false,
      version: '',  // To store the version number
    };
  }

  componentDidMount() {
    this.updateContext();
    this.fetchVersionNumber();
  }

  componentDidUpdate(prevProps) {
    const { location } = this.props;
    if (location !== prevProps.location) {
      this.updateContext();
    }
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
      // Use fetchModel to fetch user data instead of window.models
      fetchModel(`/user/${userId}`)
        .then((response) => {
          this.setState({ user: response.data, isPhotoView: path.startsWith('/photos/') });
        })
        .catch((error) => {
          console.error('Error fetching user data:', error);
          this.setState({ user: null });
        });
    } else {
      this.setState({ user: null, isPhotoView: false });
    }
  }

  fetchVersionNumber() {
    // Fetch version number from the /test/info API
    fetchModel('/test/info')
      .then((response) => {
        const version = response.data.__v; // Assuming version is stored in __v
        this.setState({ version });
      })
      .catch((error) => {
        console.error('Error fetching version number:', error);
      });
  }

  render() {
    const { user, isPhotoView, version } = this.state;
    const displayText = user
      ? `${isPhotoView ? 'Photos of' : 'Details of'} ${user.first_name} ${user.last_name}`
      : 'Photo Sharing App';

    return (
      <AppBar className="topbar-appBar" position="fixed">
        <Toolbar className="topbar-toolbar">
          <Typography variant="h6" className="topbar-title" style={{ flexGrow: 1, textAlign: 'left' }}>
            Group 6 - Project 5 - Sprint 1
          </Typography>
          <Typography variant="h6" className="topbar-content">
            {displayText}
          </Typography>
          <Typography variant="body1" className="topbar-version" style={{ marginLeft: '20px' }}>
            Version: {version}
          </Typography>
        </Toolbar>
      </AppBar>
    );
  }
}

export default withRouter(TopBar);
