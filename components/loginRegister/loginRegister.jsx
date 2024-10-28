import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import "./loginRegister.css";

function LoginRegister({ setIsAuthenticated }) {
  const [loginName, setLoginName] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const history = useHistory();

  const handleLogin = async (event) => {
    event.preventDefault();
    try {
      const response = await fetch("/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ login_name: loginName, password }),
      });

      if (response.ok) {
        setIsAuthenticated(true);  // Update authentication state in the parent component
        history.push("/");  // Redirect to the main route upon successful login
      } else {
        const { message } = await response.json();
        setErrorMessage(message || "Login failed. Please try again.");
      }
    } catch (error) {
      setErrorMessage("An error occurred. Please try again.");
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <input
          type="text"
          value={loginName}
          onChange={(e) => setLoginName(e.target.value)}
          placeholder="Login Name"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
        />
        <button type="submit">Login</button>
      </form>
      {errorMessage && <p className="error-message">{errorMessage}</p>}
    </div>
  );
}

export default LoginRegister;
