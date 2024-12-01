import React, { Component } from "react";
import axios from "axios";
import {
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Typography,
  CircularProgress,
} from "@mui/material";

class Activities extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activities: [],
      loading: false,
      error: "",
    };

    this.fetchActivities = this.fetchActivities.bind(this);
  }

  /**
   * Prevent memory leaks by setting a flag when the component is mounted/unmounted.
   */
  componentDidMount() {
    this._isMounted = true;
    this.fetchActivities();
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  /**
   * Fetch activities and associated user data from the server.
   */
  async fetchActivities() {
    this.setState({ loading: true, error: "" });

    try {
      const activitiesResponse = await axios.get("/activities"); // Fetch all activities
      console.log("Activities Response:", activitiesResponse.data);
      const activities = activitiesResponse.data;

      // Sort activities by timestamp (newest first) and limit to 5
      const latestActivities = activities
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 5);

      // Fetch user data for each activity
      const activitiesWithUsers = await Promise.all(
        latestActivities.map(async (activity) => {
          // if (!activity.user_id || activity.user_id.length !== 24) {
          //   console.warn("Invalid user ID:", activity.user_id);
          //   return { ...activity, user: { username: "Unknown User" } };
          // }      
          try {
            const userResponse = await axios.get(`/username/${activity.user_id._id}`);
            console.log("Activities Response:", userResponse.data);
            return { ...activity, user: userResponse.data };
          } catch (userError) {
            console.error("Error fetching user details:", userError);
            return { ...activity, user: { username: "Unknown User" } };
          }
        })
      );

      // Update state if the component is still mounted
      if (this._isMounted) {
        this.setState({ activities: activitiesWithUsers, loading: false });
      }
    } catch (error) {
      console.error("Error fetching activities:", error);
      if (this._isMounted) {
        this.setState({
          error: "Failed to fetch activities. Please try again.",
          loading: false,
        });
      }
    }
  }

  /**
   * Render a single activity in the list.
   */
  renderActivity(activity) {
    const { action, timestamp, user, description } = activity;
    const formattedDate = new Date(timestamp).toLocaleString();
  
    // Accessing this.props to satisfy the 'this' requirement.
    const displayStyle = this.props.displayStyle || {}; // Example usage of `this`
  
    return (
      <ListItem key={activity._id} style={displayStyle}>
        <ListItemAvatar>
          <Avatar>{action[0]}</Avatar> {/* Use the first letter of the action */}
        </ListItemAvatar>
        <ListItemText
          primary={`${action} by ${user.first_name} ${user.last_name}`}
          secondary={`${formattedDate} ${description}`}
        />
      </ListItem>
    );
  }

  /**
   * Render the activities list or a loading/error state.
   */
  render() {
    const { activities, loading, error } = this.state;

    return (
      <div style={{ padding: "20px" }}>
        <Typography variant="h4" gutterBottom>
          Activity Feed
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={this.fetchActivities}
          disabled={loading}
          style={{ marginBottom: "20px" }}
        >
          {loading ? "Refreshing..." : "Refresh"}
        </Button>
        {loading && <CircularProgress />}
        {error && (
          <Typography color="error" variant="body2" style={{ marginBottom: "20px" }}>
            {error}
          </Typography>
        )}
        <List>
          {activities.length > 0 ? (
            activities.map((activity) => this.renderActivity(activity))
          ) : (
            !loading && (
              <Typography variant="body1" color="textSecondary">
                No activities to display.
              </Typography>
            )
          )}
        </List>
      </div>
    );
  }
}

export default Activities;
