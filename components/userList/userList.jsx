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
//import fetchModel from '../../lib/fetchModelData';

/**
 * Define UserList, a React component of project #5
 */
class UserList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      users: [],
      error: null,
    };
  }

  componentDidMount() {
    // Fetch the user list from the server using the fetchModel function
    // fetchModel('/user/list')
    //   .then((response) => {
    //     this.setState({ users: response.data });
    //   })
    //   .catch((error) => {
    //     console.error('Error fetching user list:', error);
    //   });


      fetch('/user/list')  // Fetch data from the backend
      .then(response => response.json())  // Parse the JSON from the response
      .then(
        (data) => {
          this.setState({
            users: data // Set the fetched users data to the state
          });
        },
        (error) => {
          this.setState({
            error // In case of error, store it in state
          });
        }
      );
  }

  render() {
   // const { users } = this.state;

    const { users, error } = this.state; // Destructure state to use the data and error
    
    // Check if there's an error
    if (error) {
      return <div>Error: {error.message}</div>;
    } 
    
    // If no users are found
    if (users.length === 0) {
      return <div>No users found</div>;
    }


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
