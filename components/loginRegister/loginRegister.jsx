import React from 'react';
import {
    Button,
    Box,
    TextField,
    Alert,
    Typography,
    Paper,
    Container,
    AppBar,
    Toolbar,
} from '@mui/material';
import axios from 'axios';
import './loginRegister.css';

class LoginRegister extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            user: {
                first_name: '',
                last_name: '',
                location: '',
                description: '',
                occupation: '',
                login_name: '',
                password: '',
                password_repeat: '',
            },
            showLoginError: false,
            showRegistrationError: false,
            showRegistrationSuccess: false,
            isRegistering: false,
        };
        this.handleLogin = this.handleLogin.bind(this);
        this.handleRegister = this.handleRegister.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.toggleForm = this.toggleForm.bind(this);
    }

    toggleForm() {
        this.setState((prevState) => ({
            isRegistering: !prevState.isRegistering,
            showLoginError: false,
            showRegistrationError: false,
            showRegistrationSuccess: false,
        }));
    }

    handleLogin = () => {
        axios.post("/admin/login", this.state.user, {
            headers: { 'Content-Type': 'application/json' }
        })
        .then((response) => {
            const user = response.data;
            this.setState({ showLoginError: false });
            this.props.changeUser(user);
        })
        .catch((error) => {
            this.setState({ showLoginError: true });
            console.error(error);
        });
    };

    handleRegister = () => {
        if (this.state.user.password !== this.state.user.password_repeat) {
            this.setState({ showRegistrationError: true });
            return;
        }
        axios.post("/user/", this.state.user, {
            headers: { 'Content-Type': 'application/json' }
        })
        .then(() => { // Removed unused 'response'
            this.setState({ showRegistrationSuccess: true, showRegistrationError: false });
            this.toggleForm();
        })
        .catch((error) => {
            this.setState({ showRegistrationError: true });
            console.error(error);
        });
    };

    handleChange(event) {
        this.setState({
            user: { ...this.state.user, [event.target.id]: event.target.value }
        });
    }

    render() {
        return (
            <Container maxWidth="xs" style={{ marginTop: '10vh', backgroundColor: '#ffffff' }}>
                <AppBar position="static" style={{ backgroundColor: '#ffffff' }}>
                    <Toolbar>
                        <Typography variant="h6" style={{ color: '#000000', fontWeight: 'bold' }}>
                            PhotoShare
                        </Typography>
                    </Toolbar>
                </AppBar>
                <Paper elevation={3} style={{ padding: '2rem', borderRadius: '10px', marginTop: '20px' }}>
                    <Box component="form" autoComplete="off">
                        {this.state.isRegistering ? (
                            <div>
                                {this.state.showRegistrationError && <Alert severity="error">Registration Failed</Alert>}
                                {this.state.showRegistrationSuccess && <Alert severity="success">Registration Succeeded</Alert>}
                                <TextField id="first_name" label="First Name" variant="outlined" fullWidth margin="normal" required onChange={this.handleChange} style={{ borderRadius: '5px' }} />
                                <TextField id="last_name" label="Last Name" variant="outlined" fullWidth margin="normal" required onChange={this.handleChange} style={{ borderRadius: '5px' }} />
                                <TextField id="location" label="Location" variant="outlined" fullWidth margin="normal" onChange={this.handleChange} style={{ borderRadius: '5px' }} />
                                <TextField id="description" label="Description" variant="outlined" fullWidth margin="normal" multiline rows={4} onChange={this.handleChange} style={{ borderRadius: '5px' }} />
                                <TextField id="occupation" label="Occupation" variant="outlined" fullWidth margin="normal" onChange={this.handleChange} style={{ borderRadius: '5px' }} />
                                <TextField id="login_name" label="Login Name" variant="outlined" fullWidth margin="normal" required onChange={this.handleChange} style={{ borderRadius: '5px' }} />
                                <TextField id="password" label="Password" variant="outlined" fullWidth margin="normal" type="password" required onChange={this.handleChange} style={{ borderRadius: '5px' }} />
                                <TextField id="password_repeat" label="Repeat Password" variant="outlined" fullWidth margin="normal" type="password" required onChange={this.handleChange} style={{ borderRadius: '5px' }} />
                                <Box mt={2}>
                                    <Button variant="contained" onClick={this.handleRegister} style={{ borderRadius: '5px', backgroundColor: '#3897f0', color: '#ffffff' }}>Register Me</Button>
                                </Box>
                                <Typography mt={2} style={{ textAlign: 'center' }}>
                                    Already have an account? <Button variant="text" onClick={this.toggleForm} style={{ color: '#3897f0' }}>Login here</Button>
                                </Typography>
                            </div>
                        ) : (
                            <div>
                                {this.state.showLoginError && <Alert severity="error">Login Failed</Alert>}
                                <TextField id="login_name" label="Login Name" variant="outlined" fullWidth margin="normal" required onChange={this.handleChange} style={{ borderRadius: '5px' }} />
                                <TextField id="password" label="Password" variant="outlined" fullWidth margin="normal" type="password" required onChange={this.handleChange} style={{ borderRadius: '5px' }} />
                                <Box mt={2}>
                                    <Button type="button" variant="contained" onClick={this.handleLogin} style={{ borderRadius: '5px', backgroundColor: '#3897f0', color: '#ffffff' }}>Login</Button>
                                </Box>
                                <Typography mt={2} style={{ textAlign: 'center' }}>
                                    Don&apos;t have an account? <Button variant="text" onClick={this.toggleForm} style={{ color: '#3897f0' }}>Register here</Button>
                                </Typography>
                            </div>
                        )}
                    </Box>
                </Paper>
            </Container>
        );
    }
}

export default LoginRegister;
