import React from 'react';
import { TextField, Button, Typography, Card, CardContent, Grid, Snackbar } from '@mui/material';
import axios from 'axios';
import './loginRegister.css';

class LoginRegister extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      email: '',
      password: '',
      errorMessage: '',
      snackbarOpen: false,
      snackbarMessage: '',
    };
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleLogin = this.handleLogin.bind(this);
    this.handleSnackbarClose = this.handleSnackbarClose.bind(this);
  }

  handleInputChange(event) {
    const { name, value } = event.target;
    this.setState({ [name]: value });
  }

  handleLogin() {
    const { email, password } = this.state;

    axios.post('/admin/login', { login_name: email, password }) // Adjust according to your API
      .then((response) => {
        //const user = response.data;
        this.props.onLogin();
      })
      .catch(() => {
        this.setState({ snackbarOpen: true, snackbarMessage: 'Invalid email or password.' });
      });
  }

  handleSnackbarClose() {
    this.setState({ snackbarOpen: false });
  }

  render() {
    const { email, password, snackbarOpen, snackbarMessage } = this.state;

    return (
      <Grid container justifyContent="center" alignItems="center" style={{ minHeight: '100vh' }}>
        <Card style={{ maxWidth: 400, padding: '20px' }}>
          <CardContent>
            <Typography variant="h5" align="center" gutterBottom>
              Login
            </Typography>
            <TextField
              label="Email"
              name="email"
              variant="outlined"
              fullWidth
              margin="normal"
              value={email}
              onChange={this.handleInputChange}
            />
            <TextField
              label="Password"
              name="password"
              type="password"
              variant="outlined"
              fullWidth
              margin="normal"
              value={password}
              onChange={this.handleInputChange}
            />
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={this.handleLogin}
              style={{ marginTop: '16px' }}
            >
              Log In
            </Button>
          </CardContent>
        </Card>
        <Snackbar
          open={snackbarOpen}
          onClose={this.handleSnackbarClose}
          message={snackbarMessage}
          autoHideDuration={3000}
        />
      </Grid>
    );
  }
}

export default LoginRegister;


// import React from 'react';
// import { TextField, Button, Typography, Card, CardContent, Grid } from '@mui/material';
// import './loginRegister.css';

// class loginRegister extends React.Component {
//   constructor(props) {
//     super(props);
//     this.state = {
//       email: '',
//       password: '',
//       errorMessage: '',
//     };
//     this.handleInputChange = this.handleInputChange.bind(this);
//     this.handleLogin = this.handleLogin.bind(this);
//   }

//   handleInputChange(event) {
//     const { name, value } = event.target;
//     this.setState({ [name]: value });
//   }

//   handleLogin() {
//     const { email, password } = this.state;

//     if (email === 'user@example.com' && password === 'password') {
//       // This simulates successful login. Replace with actual authentication logic.
//       this.props.onLogin(); // Assuming a callback prop to proceed after login
//     } else {
//       this.setState({ errorMessage: 'Invalid email or password.' });
//     }
//   }

//   render() {
//     const { email, password, errorMessage } = this.state;

//     return (
//       <Grid container justifyContent="center" alignItems="center" style={{ minHeight: '100vh' }}>
//         <Card style={{ maxWidth: 400, padding: '20px' }}>
//           <CardContent>
//             <Typography variant="h5" align="center" gutterBottom>
//               Login
//             </Typography>
//             {errorMessage && (
//               <Typography color="error" align="center" variant="body2">
//                 {errorMessage}
//               </Typography>
//             )}
//             <TextField
//               label="Email"
//               name="email"
//               variant="outlined"
//               fullWidth
//               margin="normal"
//               value={email}
//               onChange={this.handleInputChange}
//             />
//             <TextField
//               label="Password"
//               name="password"
//               type="password"
//               variant="outlined"
//               fullWidth
//               margin="normal"
//               value={password}
//               onChange={this.handleInputChange}
//             />
//             <Button
//               variant="contained"
//               color="primary"
//               fullWidth
//               onClick={this.handleLogin}
//               style={{ marginTop: '16px' }}
//             >
//               Log In
//             </Button>
//           </CardContent>
//         </Card>
//       </Grid>
//     );
//   }
// }

// export default loginRegister;