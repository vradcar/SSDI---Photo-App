"use strict";
/* jshint node: true */

const mongoose = require("mongoose");

/**
 * Define the Mongoose Schema for an Activity.
 * This schema will store records of activities performed on the photo-sharing site.
 */
// const activitySchema = new mongoose.Schema({
//   timestamp: {
//     type: Date, 
//     default: Date.now, 
//     required: true
//   },
//   userId: {
//     type: mongoose.Schema.Types.ObjectId, 
//     ref: "User", 
//     required: true
//   },
//   username: {
//     type: String, 
//     required: true, 
//     trim: true
//   },
//   type: {
//     type: String, 
//     required: true, 
//     enum: ["Photo Upload", "New Comment", "User Register", "User Login", "User Logout"]
//   },
//   photoId: {
//     type: mongoose.Schema.Types.ObjectId, 
//     ref: "Photo", 
//     default: null
//   },
//   comment: {
//     type: String, 
//     trim: true, 
//     default: null
//   }
// }, { timestamps: true }); // Adds createdAt and updatedAt fields


const activitySchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  action: { type: String, required: true },
  description: { type: String },
  timestamp: { type: Date, default: Date.now },
});


/**
 * Create a Mongoose Model for an Activity using the activitySchema.
 */
const Activity = mongoose.model("Activity", activitySchema);

/**
 * Export the Activity model to make it accessible in other parts of the application.
 */
module.exports = Activity;
