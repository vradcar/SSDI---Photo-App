import React from 'react';
import {
  Typography, Card, CardContent, Grid, Paper, Link
} from '@mui/material';
import './userPhotos.css';

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

    // Fetch photos from the model (assumed from window.models)
    const photos = window.models.photoOfUserModel(userId); // Fetch photos by user ID
    const user = window.models.userModel(userId); // Fetch user details by user ID

    this.setState({ photos, user, loading: false });
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
                    src={`/images/${photo.file_name}`} // Assuming the photo filenames are stored
                    alt={`Photo taken on ${photo.date_time}`}
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
