import React from 'react';
import {
  Typography,
  Grid,
  Avatar,
  Divider,
  Button,
  Card,
  CardContent,
} from '@mui/material';
import './userDetail.css';
import fetchModel from '../../lib/fetchModelData';

/**
 * Define UserDetail, a React component for displaying user details.
 */
class UserDetail extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user: null,  // To store the fetched user details
    };
    this.handleViewImageClick = this.handleViewImageClick.bind(this);
  }

  componentDidMount() {
    this.fetchUserData();
  }

  componentDidUpdate(prevProps) {
    // Re-fetch user details if the route userId changes
    if (this.props.match.params.userId !== prevProps.match.params.userId) {
      this.fetchUserData();
    }
  }

  fetchUserData = () => {
    const userId = this.props.match.params.userId; // Extract userId from route params

    // // Fetch user details from the server using the fetchModel function
    // fetchModel(`/user/${userId}`)
    //   .then((response) => {
    //     this.setState({ user: response.data }); // Set user details in state
    //   })
    //   .catch((error) => {
    //     console.error('Error fetching user details:', error);
    //   });


      // Fetch user details from the server
    fetch(`/user/${userId}`)
    .then((response) => {
      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }
      return response.json();
    })
    .then((userData) => {
      this.setState({ user: userData }); // Set user details in state
    })
    .catch((error) => {
      console.error('Error fetching user details:', error);
    });

  };

  handleViewImageClick() {
    const { history } = this.props;
    const { user } = this.state;
    // Navigate to the userPhotos route with the user's ID
    history.push(`/photos/${user._id}`);
  }

  render() {
    const { user } = this.state;

    if (!user) {
      return (
        <Typography variant="h6" style={{ textAlign: 'center', margin: '20px' }}>
          No user data available.
        </Typography>
      );
    }

    return (
      <Card style={{ maxWidth: 600, margin: '20px auto', padding: '20px' }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item>
            {/* Displaying the user's avatar */}
            <Avatar
              sx={{ width: 100, height: 100 }}
              alt={`${user.first_name} ${user.last_name}`}
              src={`/images/${user._id}.jpg`} // Assuming user images are stored by user ID
            />
          </Grid>

          <Grid item xs>
            <Typography variant="h4" gutterBottom>
              {`${user.first_name} ${user.last_name}`}
            </Typography>
            <Typography variant="body1" color="textSecondary">
              {`Location: ${user.location}`}
            </Typography>
            <Typography variant="body1" color="textSecondary">
              {`Occupation: ${user.occupation}`}
            </Typography>
          </Grid>
        </Grid>

        <Divider style={{ margin: '20px 0' }} />

        <CardContent>
          <Typography variant="body1" paragraph>
            {user.description ? `About: ${user.description}` : 'No description available.'}
          </Typography>
        </CardContent>

        {/* Link to UserPhotos component */}
        <CardContent>
          <Button
            variant="contained"
            color="primary"
            onClick={this.handleViewImageClick}  // Link to UserPhotos with userId
            style={{ textDecoration: 'none', color: 'white' }}
          >
            View {user.first_name}&apos;s Photos
          </Button>
        </CardContent>
      </Card>
    );
  }
}

export default UserDetail;
