"use strict";

const mongoose = require("mongoose");

/**
 * Define the Mongoose Schema for a User.
 */
const userSchema = new mongoose.Schema({
  login_name: { type: String, required: true, unique: true },  // Unique login name for each user
  password: { type: String, required: true },  // Hashed password for authentication
  first_name: { type: String, required: true },  // First name is required
  last_name: { type: String, required: true },  // Last name is required
  location: String,  // Optional location field
  description: String,  // Optional description field
  occupation: String,  // Optional occupation field
});

/**
 * Create a Mongoose Model for a User using the userSchema.
 */
const User = mongoose.model("User", userSchema);

/**
 * Make this available to our application.
 */
module.exports = User;
