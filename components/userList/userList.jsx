import React from 'react';
import {
  Divider,
  List,
  ListItem,
  ListItemText,
  Typography,
} from '@mui/material';
import './userList.css';
import { Link } from 'react-router-dom';
import fetchModel from '../../lib/fetchModelData';

/**
 * Define UserList, a React component of project #5
 */
class UserList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      users: [],
    };
  }

  componentDidMount() {
    // Fetch the user list from the server using the fetchModel function
    fetchModel('/user/list')
      .then((response) => {
        this.setState({ users: response.data });
      })
      .catch((error) => {
        console.error('Error fetching user list:', error);
      });
  }

  render() {
    const { users } = this.state;

    return (
      <div>
        <Typography variant="body1">
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
      </div>
    );
  }
}

export default UserList;
