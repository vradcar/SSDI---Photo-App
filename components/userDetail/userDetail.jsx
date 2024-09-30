import React from 'react';
import {
  Typography,
  List,
  ListItem,
  ListItemText,
  Link,
  Card, 
  CardContent, 
  Avatar, 
  Grid, 
  Divider, 
  Button
} from '@mui/material';
import './userDetail.css';
import { useParams } from 'react-router-dom';

/**
 * Define UserDetail, a React component of project #5
 */
class UserDetail extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user: null
    };
    this.handleViewImageClick = this.handleViewImageClick.bind(this);
  }

  componentDidMount() {
    const userId = this.props.match.params.userId; // Extract userId from route params
    const user = models.userModel(userId); // Fetch user details from models
    this.setState({ user });
  }

  componentDidUpdate(prevProps) {
    // Check if the userId in the route params has changed
    if (this.props.match.params.userId !== prevProps.match.params.userId) {
      const userId = this.props.match.params.userId; // Extract userId from route params
      const user = models.userModel(userId); // Fetch user details from models
      this.setState({ user });
    }
  }

  handleViewImageClick() {
    const { userId, history } = this.props; // Extract userId and history from props
    history.push(`/photos/${this.state.user._id}`); // Navigate to the userPhotos route
  }
  render() {
    const { user } = this.state;

    if (!user) {
      return (
        <Typography variant="body1">
              <Typography variant="h6">No user data available.</Typography>
              </Typography>
      );
    }
   

    return (
      <><Typography variant="body1">
        {/* This should be the UserDetail view of the PhotoShare app. Since
it is invoked from React Router the params from the route will be
in property match. So this should show details of user:
{this.props.match.params.userId}. You can fetch the model for the
user from window.models.userModel(userId). */}
        {/* <Typography variant="h4">{`${user.first_name} ${user.last_name}`}</Typography>
        <Typography variant="body1">Email: {user.occupation}</Typography>
        <Typography variant="body1">Phone: {user.location}</Typography>
        <Typography variant="body1">Company: {user.description}</Typography>
        <Link to={`/photos/${user._id}`}>View Photos</Link> */}
      </Typography><Card style={{ maxWidth: 600, margin: '20px auto', padding: '20px' }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item>
              {/* Displaying the user's avatar */}
              <Avatar
                sx={{ width: 100, height: 100 }}
                alt={`${user.first_name} ${user.last_name}`}
                src={`/images/${user._id}.jpg`} // Assuming you have user images stored with user ID as the file name
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
              {user.description ? `About: ${user.description}` : 'No description available'}
            </Typography>
          </CardContent>

          {/* Link to UserPhotos component */}
          <CardContent>
            <Button
              variant="contained"
              color="primary"
              // component={Link}
              // to={`/photos/${user._id}`}
              onClick={this.handleViewImageClick}  // Link to the UserPhotos component with the userId as a parameter
              style={{ textDecoration: 'none', color: 'white' }}
            >
              View {user.first_name}'s Photos
            </Button>
          </CardContent>
        </Card></>
    
    );
  }
}

export default UserDetail;
