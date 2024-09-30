import React from 'react';
import {
  Typography, Card,CardContent, Grid
} from '@mui/material';
import './userPhotos.css';


/**
 * Define UserPhotos, a React componment of project #5
 */
class UserPhotos extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      photos: [],
      loading: true,
    };


  }

  componentDidMount() {
    this.fetchUserPhotos();
  }
  componentDidUpdate(prevProps) {
    // Re-fetch the photos if the userId has changed
    if (this.props.match.params.userId !== prevProps.match.params.userId) {
      this.fetchUserPhotos();
    }
  }
  fetchUserPhotos = () => {
    const userId = this.props.match.params.userId;
    // Simulate fetching photos from a server or model
    const photos = models.photoOfUserModel(userId); // Assuming photos are fetched by user ID
    this.setState({ photos, loading: false });
  };

  render() {
    // return (
    //   <Typography variant="body1">
    //   This should be the UserPhotos view of the PhotoShare app. Since
    //   it is invoked from React Router the params from the route will be
    //   in property match. So this should show details of user:
    //   {this.props.match.params.userId}. You can fetch the model for the user from
    //   window.models.photoOfUserModel(userId):
    //     <Typography variant="caption">
    //       {JSON.stringify(window.models.photoOfUserModel(this.props.match.params.userId))}
    //     </Typography>
    //   </Typography>
    // );
  
  
    const { photos, loading } = this.state;

    // if (loading) {
    //   return <CircularProgress />; // Display a loading spinner while fetching photos
    // }

    if (photos.length === 0) {
      return (
        <Typography variant="h6" style={{ margin: '20px auto' }}>
          No photos available for this user.
        </Typography>
      );
    }

    return (
      <Card style={{ maxWidth: 800, margin: '20px auto', padding: '20px' }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            User Photos
          </Typography>

          <Grid container spacing={2}>
            {photos.map((photo, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <img
                  src={`/images/${photo.file_name}`} // Assuming the photo filenames are stored
                  alt={`Photo taken on ${photo.date_time}`}
                  style={{ width: '100%', height: 'auto' }}
                />
                <Typography variant="caption" display="block" gutterBottom>
                  {photo.date_time}
                </Typography>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>
    );
  
  
  }
}

export default UserPhotos;
