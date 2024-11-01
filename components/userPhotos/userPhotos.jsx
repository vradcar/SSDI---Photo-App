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
            photos: undefined,
            new_comment: '',
            add_comment: false,
            current_photo_id: undefined
        };
    }

    componentDidMount() {
        const new_user_id = this.props.match.params.userId;
        this.loadUserData(new_user_id);
    }

    componentDidUpdate(prevProps) {
        const new_user_id = this.props.match.params.userId;
        if (prevProps.match.params.userId !== new_user_id) {
            this.loadUserData(new_user_id);
        }
    }

    /**
     * Fetches user and photo data when user ID changes
     */
    loadUserData(user_id) {
        axios.get(`/photosOfUser/${user_id}`)
            .then((response) => {
                this.setState({
                    user_id: user_id,
                    photos: response.data
                });
            })
            .catch(() => {
                console.log('Failed to fetch photos');
            });

        axios.get(`/user/${user_id}`)
            .then((response) => {
                const { first_name, last_name } = response.data;
                const main_content = `User Photos for ${first_name} ${last_name}`;
                this.props.changeMainContent(main_content);
            })
            .catch(() => {
                console.log('Failed to fetch user details');
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

    render() {
        const { user_id, photos, add_comment, new_comment } = this.state;

        return user_id ? (
            <div>
                <div>
                    <Button variant="contained" component="a" href={`#/users/${user_id}`}>
                        User Detail
                    </Button>
                </div>
                <ImageList variant="masonry" cols={1} gap={8}>
                    {photos ? photos.map((item) => (
                        <div key={item._id}>
                            <ImageListItem>
                                <img
                                    src={`images/${item.file_name}?w=164&h=164&fit=crop&auto=format&dpr=2 2x`}
                                    srcSet={`images/${item.file_name}?w=164&h=164&fit=crop&auto=format`}
                                    alt={item.file_name}
                                    loading="lazy"
                                />
                            </ImageListItem>
                            <div>
                                {item.comments && item.comments.length > 0 ? item.comments.map((comment) => (
                                    <div className="comment" key={comment._id}>
                                        <Typography className="comment-user">
                                            <Link to={`/users/${comment.user._id}`} className="username-link">
                                                {`${comment.user.first_name} ${comment.user.last_name}`}
                                            </Link>
                                        </Typography>
                                        <Typography className="comment-text">
                                            {comment.comment}
                                        </Typography>
                                        <div className="comment-footer">
                                            <Typography className="comment-time">{formatDate(comment.date_time)}</Typography>
                                            <Typography className="comment-likes">{comment.likes}</Typography>
                                        </div>
                                    </div>
                                )) : (
                                    <Typography>No Comments</Typography>
                                )}
                                <Button photo_id={item._id} variant="contained" onClick={this.handleShowAddComment}>
                                    Add Comment
                                </Button>
                            </div>
                        </div>
                    )) : (
                        <Typography>No Photos</Typography>
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
                            multiline rows={4}
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
        ) : (
            <div />
        );
    }
}

export default UserPhotos;
