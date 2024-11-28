import React from 'react';
import {
    Button, TextField,
    ImageList, ImageListItem, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Typography
} from '@mui/material';
import { Link } from 'react-router-dom';
import './userPhotos.css';
import axios from 'axios';

/**
 * Function to format date to "DD-MM-YYYY HH:MM"
 */
const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${day}-${month}-${year} ${hours}:${minutes}`;
};

/**
 * Define UserPhotos, a React component of project #5
 */
class UserPhotos extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            user_id: undefined,
            photos: [],
            new_comment: '',
            add_comment: false,
            current_photo_id: undefined,
            likedPhotos: new Set(), // Tracks photos that the user has liked
            currentUserId: null
        };
    }

    componentDidMount() {
        const new_user_id = this.props.match.params.userId;
      
        this.loadUserData(new_user_id);
    }

    componentDidUpdate(prevProps) {
        const new_user_id = this.props.match.params.userId;
      
        if (prevProps.match.params.userId !== new_user_id) {
            this.setState({ likedPhotos: new Set() });
            this.loadUserData(new_user_id);
        }
    }

    /**
     * Fetches user and photo data when user ID changes
     */
    loadUserData(user_id) {
        // Step 1: Fetch the current logged-in user ID
        axios.get('/currentUser')
            .then((response) => {
                const currentUserId = response.data.userId;
    
                // Step 2: Fetch user photos
                return axios.get(`/photosOfUser/${user_id}`).then((photoResponse) => {
                    // Initialize likedPhotos set based on the photos the user has liked
                    const likedPhotos = new Set();
                    photoResponse.data.forEach((photo) => {
                        if (photo.likes.includes(currentUserId)) { // Check if the current user has liked the photo
                            likedPhotos.add(photo._id); // Add liked photo IDs to the set
                        }
                    });
    
                    // Update state with photos and liked photos
                    this.setState({
                        user_id: user_id,
                        photos: photoResponse.data,
                        likedPhotos: likedPhotos
                    });
                });
            })
            .then(() => {
                // Step 3: Fetch user details (for display purposes)
                return axios.get(`/user/${user_id}`).then((userResponse) => {
                    const { first_name, last_name } = userResponse.data;
                    const main_content = `User Photos for ${first_name} ${last_name}`;
                    this.props.changeMainContent(main_content);
                });
            })
            .catch((error) => {
                console.error('Error loading user data:', error);
            });
    }
    
    
    /**
     * Updates state for new comment input
     */
    handleNewCommentChange = (event) => {
        this.setState({ new_comment: event.target.value });
    };

    /**
     * Shows dialog to add comment
     */
    handleShowAddComment = (event) => {
        const photo_id = event.currentTarget.getAttribute("photo_id");
        this.setState({
            add_comment: true,
            current_photo_id: photo_id
        });
    };

    /**
     * Cancels adding comment and resets relevant state
     */
    handleCancelAddComment = () => {
        this.setState({
            add_comment: false,
            new_comment: '',
            current_photo_id: undefined
        });
    };

    /**
     * Submits new comment to the server and refreshes photo data
     */
    handleSubmitAddComment = () => {
        const { new_comment, current_photo_id, user_id } = this.state;
        const commentPayload = JSON.stringify({ comment: new_comment });

        axios.post(`/commentsOfPhoto/${current_photo_id}`, commentPayload, {
            headers: { 'Content-Type': 'application/json' }
        })
        .then(() => {
            this.setState({ add_comment: false, new_comment: '', current_photo_id: undefined });
            return axios.get(`/photosOfUser/${user_id}`);
        })
        .then((response) => {
            this.setState({ photos: response.data });
        })
        .catch(error => {
            console.log('Error submitting comment', error);
        });
    };

    handleLike = (photoId) => {
        axios.post(`/photos/${photoId}/like`)
            .then(() => {
                this.setState((prevState) => {
                    const likedPhotos = new Set(prevState.likedPhotos);
                    likedPhotos.add(photoId); // Add liked photo ID to set

                    return {
                        likedPhotos,
                        photos: prevState.photos.map(photo =>
                            photo._id === photoId ? { ...photo, likes: [...photo.likes, this.state.user_id] } : photo
                        )
                    };
                });
            })
            .catch(console.error);
    };


    handleUnlike = (photoId) => {
        axios.get('/currentUser')
            .then((response) => {
                const currentUser_Id = response.data.userId; // Fetch current user ID
    
                // Proceed with the unlike logic by calling the unlike API
                return axios.post(`/photos/${photoId}/unlike`, { currentUser_Id }) // Pass user ID in request body
                    .then(() => {
                        console.log('Unlike API response:', response.data);
                        
                        // After successfully unliking, fetch the updated photo data
                        return axios.get(`/photosOfUser/${this.state.user_id}`);
                    })
                    .then((response) => {
                        // Update state with the latest photo data (including likes)
                        const updatedPhotos = response.data;
    
                        this.setState((prevState) => {
                            // Update the likedPhotos set and photo likes in state
                            const likedPhotos = new Set(prevState.likedPhotos);
                            likedPhotos.delete(photoId); // Remove the photo ID from the liked set
    
                            // Map over photos to ensure likes array is correctly updated
                            const updatedPhotosWithLikes = updatedPhotos.map(photo => {
                                if (photo._id === photoId) {
                                    // Ensure the likes array reflects the current state
                                    return { ...photo, likes: photo.likes.filter(id => id !== currentUser_Id) };
                                }
                                return photo;
                            });
    
                            return {
                                likedPhotos,
                                photos: updatedPhotosWithLikes, // Update photos with modified like count
                            };
                        });
                    })
                    .catch((error) => {
                        console.error('Error unliking photo:', error);
                    });
            });
    };
    

    
    // handleUnlike = (photoId) => {
    //     axios.get('/currentUser')
    //         .then((response) => {
    //             const currentUser_Id = response.data.userId; // Fetch current user ID
    
    //             // Proceed with the unlike logic
    //             return axios.post(`/photos/${photoId}/unlike`, { currentUser_Id }) // Pass user ID in request body
    //                 .then(() => {
    //                     console.log('Unlike API response:', response.data);
    //                     this.setState((prevState) => {
    //                         const likedPhotos = new Set(prevState.likedPhotos);
    //                         likedPhotos.delete(photoId); // Remove photo ID from liked set
    
    //                         const updatedPhotos = prevState.photos.map(photo => {
    //                             if (photo._id === photoId) {
    //                                 console.log('Before unlike:', photo.likes);
    //                                 const updatedLikes = photo.likes.filter((id) => id !== currentUser_Id);
    //                                 console.log('After unlike:', updatedLikes);
    //                                 return { ...photo, likes: updatedLikes };
    //                             }
    //                             return photo;
    //                         });
    //                         console.log('Updated photos:', updatedPhotos);
    //                         return {
    //                             likedPhotos,
    //                             photos: updatedPhotos, // Update photos with modified like count
    //                         };
    //                     });
    //                 });
    //         })
    //         .catch((error) => {
    //             console.error('Error unliking photo:', error);
    //         });
    // };
    
    
    
    render() {
        const { user_id, photos, add_comment, new_comment } = this.state;
    
        // Sort photos: first by likes count, then by date
        const sortedPhotos = Array.isArray(photos)
            ? [...photos].sort((a, b) => {
                if (b.likes.length !== a.likes.length) {
                    return b.likes.length - a.likes.length;
                }
                return new Date(b.date_time) - new Date(a.date_time);
            })
            : [];
    
        return user_id ? (
            <div>
                <div>
                    <Button variant="contained" component="a" href={`#/users/${user_id}`}>
                        User Detail
                    </Button>
                </div>
                <ImageList variant="masonry" cols={1} gap={8}>
                    {sortedPhotos.length > 0 ? (
                        sortedPhotos.map((photo) => {
                            // Dynamically determine if the current user has liked the photo
                            const isLiked = this.state.likedPhotos.has(photo._id);
    
                            return (
                                <div key={photo._id}>
                                    <ImageListItem>
                                        <img
                                            src={`images/${photo.file_name}`}
                                            alt={photo.file_name}
                                            loading="lazy"
                                        />
                                    </ImageListItem>
                                    <div>
                                        <Button
                                            variant="contained"
                                            color={isLiked ? "secondary" : "primary"}
                                            onClick={() =>
                                                isLiked
                                                    ? this.handleUnlike(photo._id)
                                                    : this.handleLike(photo._id)
                                            }
                                        >
                                            {isLiked ? "Unlike" : "Like"}
                                        </Button>
                                        <Typography>{photo.likes.length} Likes</Typography>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <Typography>No Photos Available</Typography>
                    )}
                </ImageList>
                <Dialog open={add_comment}>
                    <DialogTitle>Add Comment</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            Enter New Comment for Photo
                        </DialogContentText>
                        <TextField
                            autoFocus
                            margin="dense"
                            id="comment"
                            label="Comment"
                            multiline
                            rows={4}
                            fullWidth
                            variant="standard"
                            onChange={this.handleNewCommentChange}
                            value={new_comment}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={this.handleCancelAddComment}>Cancel</Button>
                        <Button onClick={this.handleSubmitAddComment}>Add</Button>
                    </DialogActions>
                </Dialog>
            </div>
        ) : null;
    }
}

export default UserPhotos;
