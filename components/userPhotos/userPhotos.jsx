import React from 'react';
import {
  Typography, Card, CardContent, Grid, Paper, Link
} from '@mui/material';
import './userPhotos.css';
import fetchModel from '../../lib/fetchModelData';
import axios from 'axios';
/**
 * Define UserPhotos, a React component for displaying user photos and their comments
 */
class UserPhotos extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      photos: [],
      user: null, // To store user details
      loading: true,
      error: null,
    };
  }

  componentDidMount() {
    this.fetchUserData();
  }

  componentDidUpdate(prevProps) {
    // Re-fetch the photos and user details if the userId has changed
    if (this.props.match.params.userId !== prevProps.match.params.userId) {
      this.fetchUserData();
    }
  }

  fetchUserData = () => {
    const userId = this.props.match.params.userId;
    this.setState({ loading: true, error: null });

    // // Fetch user data and photos concurrently using fetchModel
    // Promise.all([
    //   fetchModel(`/user/${userId}`),             // Fetch user details by user ID
    //   fetchModel(`/photosOfUser/${userId}`)      // Fetch photos by user ID
    // ])
    // .then(([userResponse, photosResponse]) => {
    //   this.setState({
    //     user: userResponse.data,
    //     photos: photosResponse.data,
    //     loading: false,
    //   });
    // })
    // .catch((error) => {
    //   console.error('Error fetching data:', error);
    //   this.setState({ loading: false });
    // });

     // Fetch user data and photos concurrently from the server
    //  Promise.all([
    //   // fetch(`/user/${userId}`),            // Fetch user details by user ID
    //   // fetch(`/photosOfUser/${userId}`)     // Fetch photos by user ID
    //   axios.get(`/user/${userId}`),            // Fetch user details by user ID
    //  axios.get(`/photosOfUser/${userId}`)     // Fetch photos by user ID
    // ])
    // .then(([userResponse, photosResponse]) => {
    //   // Ensure both responses are successful
    //   if (!userResponse.ok || !photosResponse.ok) {
    //     throw new Error('Error fetching data');
    //   }
    //   return Promise.all([userResponse.json(), photosResponse.json()]);
    // })
    // .then(([userData, photosData]) => {
    //   // Set the user and photos in state
    //   this.setState({
    //     user: userData,
    //     photos: photosData,
    //     loading: false,
    //   });
    // })
    // .catch((error) => {
    //   console.error('Error fetching data:', error);
    //   this.setState({ loading: false });
    // });


    // Fetch user data and photos concurrently using axios
    Promise.all([
      axios.get(`/user/${userId}`),            // Fetch user details by user ID
      axios.get(`/photosOfUser/${userId}`)     // Fetch photos by user ID
    ])
    .then(([userResponse, photosResponse]) => {
      // Set the user and photos in state
      this.setState({
        user: userResponse.data,
        photos: photosResponse.data,
        loading: false,
      });
    })
    .catch((error) => {
      console.error('Error fetching data:', error);
      this.setState({ loading: false, error: 'Error fetching data' });
    });


  };

  render() {
    const { photos, user, loading } = this.state;

    if (loading) {
      return (
        <Typography variant="h6" style={{ textAlign: 'center', margin: '20px' }}>
          Loading photos...
        </Typography>
      );
    }

    if (!user || photos.length === 0) {
      return (
        <Typography variant="h6" style={{ margin: '20px auto', textAlign: 'center' }}>
          {user ? `No photos available for ${user.first_name} ${user.last_name}.` : 'No user data available.'}
        </Typography>
      );
    }

    return (
      <Card style={{ maxWidth: 1000, margin: '20px auto', padding: '20px' }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Photos of {user.first_name} {user.last_name}
          </Typography>

          <Grid container spacing={4}>
            {photos.map((photo, index) => (
              <Grid item xs={12} key={index}>
                <Paper elevation={3} style={{ padding: '15px', marginBottom: '20px' }}>
                <img
                  src={`/images/${photo.file_name}`}
                  alt={`Taken on ${photo.date_time}`}  // Removed the word "Photo"
                  style={{ width: '100%', height: 'auto' }}
                />
                  <Typography variant="caption" display="block" gutterBottom>
                    {new Date(photo.date_time).toLocaleString()}
                  </Typography>

                  {/* Display comments for this photo */}
                  {photo.comments && photo.comments.length > 0 ? (
                    <div>
                      <Typography variant="h6" style={{ marginTop: '10px' }}>
                        Comments:
                      </Typography>
                      {photo.comments.map((comment, idx) => (
                        <Paper
                          key={idx}
                          elevation={2}
                          style={{ padding: '10px', margin: '10px 0' }}
                        >
                          <Typography variant="body2">
                            <Link href={`#/users/${comment.user._id}`}>
                              {comment.user.first_name} {comment.user.last_name}
                            </Link>{' '}
                            commented on {new Date(comment.date_time).toLocaleString()}:
                          </Typography>
                          <Typography variant="body1">{comment.comment}</Typography>
                        </Paper>
                      ))}
                    </div>
                  ) : (
                    <Typography variant="body2" color="textSecondary">
                      No comments on this photo.
                    </Typography>
                  )}
                </Paper>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>
    );
  }
}

export default UserPhotos;
