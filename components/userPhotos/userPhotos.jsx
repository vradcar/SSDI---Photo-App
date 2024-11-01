import React from 'react';
import {
  Typography, Card, CardContent, Grid, Paper, Link, TextField, Button
} from '@mui/material';
import axios from 'axios';
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
    //this.fetchUserData();
  }

  fetchUserData = () => {
    const userId = this.props.match.params.userId;
    this.setState({ loading: true, error: null });

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
        this.setState({
          loading: false,
          error: 'An error occurred while fetching user data. Please try again later.',
        });
      });
  };

  handleCommentChange = (photoId, event) => {
    const { photos } = this.state;
    const updatedPhotos = photos.map(photo => {
      if (photo._id === photoId) {
        return { ...photo, newComment: event.target.value }; // Add newComment field for each photo
      }
      return photo;
    });
    this.setState({ photos: updatedPhotos });
  };

  handleCommentSubmit = (photoId) => {

  const { photos } = this.state;
  const userId = this.props.userId; // Ensure you are passing userId correctly
  const photo = photos.find(photo => photo._id === photoId);
  
  if (!photo.newComment) return; // Prevent submission if the comment is empty

  const commentData = {
    comment: photo.newComment,
    date_time: new Date(),
    user_id: userId, 
    _id: userId,
  };


  try {
    // Make a POST request to add the comment
    const response = axios.post(`/commentsOfPhoto/${photoId}`, commentData);
    
    // Update the local state with the new comment
    setPhoto((prevPhoto) => ({
      ...prevPhoto,
      comments: [...prevPhoto.comments, response.data], // Append the new comment to the existing array
      newComment: '', // Clear the input field
    }));
  } catch (error) {
    console.error('Error adding comment:', error.response || error);
    alert('Failed to add comment. Please try again.');
  }
  };

  render() {
    const { photos, user, loading, error } = this.state;

    if (loading) {
      return (
        <Typography variant="h6" style={{ textAlign: 'center', margin: '20px' }}>
          Loading photos...
        </Typography>
      );
    }

    if (error) {
      return (
        <Typography variant="h6" style={{ textAlign: 'center', margin: '20px', color: 'red' }}>
          {error}
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

                  {/* Input field for adding a new comment */}
                  <TextField
                    label="Add a comment"
                    variant="outlined"
                    fullWidth
                    value={photo.newComment || ''}
                    onChange={event => this.handleCommentChange(photo._id, event)}
                    style={{ marginTop: '10px' }}
                  />
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => this.handleCommentSubmit(photo._id)}
                    style={{ marginTop: '10px' }}
                  >
                    Submit
                  </Button>
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






// import React from 'react';
// import {
//   Typography, Card, CardContent, Grid, Paper, Link
// } from '@mui/material';
// import axios from 'axios';  // Moved axios import above
// import './userPhotos.css';

// /**
//  * Define UserPhotos, a React component for displaying user photos and their comments
//  */
// class UserPhotos extends React.Component {
//   constructor(props) {
//     super(props);
//     this.state = {
//       photos: [],
//       user: null, // To store user details
//       loading: true,
//       error: null, 
//     };
//   }

//   componentDidMount() {
//     this.fetchUserData();
//   }

//   componentDidUpdate(prevProps) {
//     // Re-fetch the photos and user details if the userId has changed
//     if (this.props.match.params.userId !== prevProps.match.params.userId) {
//       this.fetchUserData();
//     }
//   }

//   handlePhotoClick = (photoId) => {
//     this.props.history.push(`/photoDetails/${photoId}`);
//   };
//   fetchUserData = () => {
//     const userId = this.props.match.params.userId;
//     this.setState({ loading: true, error: null });

//     // Fetch user data and photos concurrently using axios
//     Promise.all([
//       axios.get(`/user/${userId}`),            // Fetch user details by user ID
//       axios.get(`/photosOfUser/${userId}`)     // Fetch photos by user ID
//     ])
//       .then(([userResponse, photosResponse]) => {
//         // Set the user and photos in state
//         this.setState({
//           user: userResponse.data,
//           photos: photosResponse.data,
//           loading: false,
//         });
//       })
//       .catch((error) => {
//         console.error('Error fetching data:', error);
//         this.setState({
//           loading: false,
//           error: 'An error occurred while fetching user data. Please try again later.',
//         });
//       });
//   };

//   render() {
//     const { photos, user, loading, error } = this.state;

//     if (loading) {
//       return (
//         <Typography variant="h6" style={{ textAlign: 'center', margin: '20px' }}>
//           Loading photos...
//         </Typography>
//       );
//     }

//     if (error) {
//       return (
//         <Typography variant="h6" style={{ textAlign: 'center', margin: '20px', color: 'red' }}>
//           {error}
//         </Typography>
//       );
//     }

//     if (!user || photos.length === 0) {
//       return (
//         <Typography variant="h6" style={{ margin: '20px auto', textAlign: 'center' }}>
//           {user ? `No photos available for ${user.first_name} ${user.last_name}.` : 'No user data available.'}
//         </Typography>
//       );
//     }

//     return (
//       <Card style={{ maxWidth: 1000, margin: '20px auto', padding: '20px' }}>
//         <CardContent>
//           <Typography variant="h5" gutterBottom>
//             Photos of {user.first_name} {user.last_name}
//           </Typography>

//           <Grid container spacing={4}>
//             {photos.map((photo, index) => (
//               <Grid item xs={12} key={index}>
//                 <Paper elevation={3} style={{ padding: '15px', marginBottom: '20px' }}>
//                   <img
//                     src={`/images/${photo.file_name}`}
//                     alt={`Taken on ${photo.date_time}`}  // Removed the word "Photo"
//                     style={{ width: '100%', height: 'auto' }}
//                   />
//                   <Typography variant="caption" display="block" gutterBottom>
//                     {new Date(photo.date_time).toLocaleString()}
//                   </Typography>

//                   {/* Display comments for this photo */}
//                   {photo.comments && photo.comments.length > 0 ? (
//                     <div>
//                       <Typography variant="h6" style={{ marginTop: '10px' }}>
//                         Comments:
//                       </Typography>
//                       {photo.comments.map((comment, idx) => (
//                         <Paper
//                           key={idx}
//                           elevation={2}
//                           style={{ padding: '10px', margin: '10px 0' }}
//                         >
//                           <Typography variant="body2">
//                             <Link href={`#/users/${comment.user._id}`}>
//                               {comment.user.first_name} {comment.user.last_name}
//                             </Link>{' '}
//                             commented on {new Date(comment.date_time).toLocaleString()}:
//                           </Typography>
//                           <Typography variant="body1">{comment.comment}</Typography>
//                         </Paper>
//                       ))}
//                     </div>
//                   ) : (
//                     <Typography variant="body2" color="textSecondary">
//                       No comments on this photo.
//                     </Typography>
//                   )}
//                 </Paper>
//               </Grid>
//             ))}
//           </Grid>
//         </CardContent>
//       </Card>
//     );
//   }
// }

// export default UserPhotos;
