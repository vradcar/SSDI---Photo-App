import React from 'react';
import { AppBar, Toolbar, Typography } from '@mui/material';
import { withRouter } from 'react-router-dom';
import './TopBar.css';

class TopBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user: null,
      isPhotoView: false,
    };
  }

  componentDidMount() {
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
    let userId;

    if (path.startsWith('/users/')) {
      userId = path.split('/')[2];
    } else if (path.startsWith('/photos/')) {
      userId = path.split('/')[2];
    }

    if (userId) {
      const user = window.models.userModel(userId);
      this.setState({ user, isPhotoView: path.startsWith('/photos/') });
    } else {
      this.setState({ user: null, isPhotoView: false });
    }
  }

  render() {
    const { user, isPhotoView } = this.state;
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
        </Toolbar>
      </AppBar>
    );
  }
}

export default withRouter(TopBar);
