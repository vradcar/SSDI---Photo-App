"use strict";
/* jshint node: true */

const mongoose = require("mongoose");

/**
 * Define the Mongoose Schema for a User.
 * This schema will store basic user information and login credentials.
 */
const userSchema = new mongoose.Schema({
  first_name: {
    type: String,
    required: true,
    trim: true
  },
  last_name: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  occupation: {
    type: String,
    trim: true
  },
  login_name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  }
}, { timestamps: true }); // Adds createdAt and updatedAt fields

/**
 * Create a Mongoose Model for a User using the userSchema.
 */
const User = mongoose.model("User", userSchema);

/**
 * Export the User model to make it accessible in other parts of the application.
 */
module.exports = User;
