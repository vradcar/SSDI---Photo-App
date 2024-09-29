import React from 'react';
import {
  Divider,
  List,
  ListItem,
  ListItemText,
  Typography,
}
from '@mui/material';
import './userList.css';

import { Link } from 'react-router-dom';
import { useHistory } from 'react-router-dom';
// import models from 'D:\Sem I\SSDI\Assignment\SSDI---Photo-App\modelData\photoApp.js';

/**
 * Define UserList, a React component of project #5
 */
class UserList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      users :[],
    };
   // this.handleUserClick = this.handleUserClick.bind(this);
  }

  componentDidMount() {
    // Fetch user list from the models
    const users = models.userListModel();
    this.setState({ users });
  }

  // handleUserClick = (userId) => {
  //   // Programmatically navigate to the user detail route with the selected user's ID
  //   this.props.history.push(`/users/${userId}`);
  // };

  render() {
    const { users } = this.state;
    return (
      <div>
        <Typography variant="body1">
          {/* This is the user list, which takes up 3/12 of the window.
          You might choose to use <a href="https://mui.com/components/lists/">Lists</a> and <a href="https://mui.com/components/dividers/">Dividers</a> to
          display your users like so: */}
          List of Users
        </Typography>
        <List component="nav">
          {users.map((user) => (
            <React.Fragment key={user._id}>
            <ListItem component={Link} to={`/users/${user._id}`}>
              <ListItemText primary={`${user.first_name} ${user.last_name}`} />
            </ListItem>
            <Divider />
          </React.Fragment>
          ))}
        </List>
        {/* <List>
          {users.map((user) => (
            <ListItem
              button
              key={user.id} // Ensure unique key is here
              onClick={() => this.handleUserClick(user.id)}
            >
              <ListItemText primary={user.name} />
            </ListItem>
          ))}
        </List> */}
        {/* <List component="nav">
          <ListItem>
            <ListItemText primary="Item #1" />
          </ListItem>
          <Divider />
          <ListItem>
            <ListItemText primary="Item #2" />
          </ListItem>
          <Divider />
          <ListItem>
            <ListItemText primary="Item #3" />
          </ListItem>
          <Divider />
        </List> */}
        {/* <Typography variant="body1">
          The model comes in from window.models.userListModel()
        </Typography> */}
      </div>
    );
 }


}

export default UserList;

