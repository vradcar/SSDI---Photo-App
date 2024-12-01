/**
 * This builds on the webServer of previous projects in that it exports the
 * current directory via webserver listing on a hard code (see portno below)
 * port. It also establishes a connection to the MongoDB named 'project6'.
 *
 * To start the webserver run the command:
 *    node webServer.js
 *
 * Note that anyone able to connect to localhost:portNo will be able to fetch
 * any file accessible to the current user in the current directory or any of
 * its children.
 *
 * This webServer exports the following URLs:
 * /            - Returns a text status message. Good for testing web server
 *                running.
 * /test        - Returns the SchemaInfo object of the database in JSON format.
 *                This is good for testing connectivity with MongoDB.
 * /test/info   - Same as /test.
 * /test/counts - Returns the population counts of the cs collections in the
 *                database. Format is a JSON object with properties being the
 *                collection name and the values being the counts.
 *
 * The following URLs need to be changed to fetch there reply values from the
 * database:
 * /user/list         - Returns an array containing all the User objects from
 *                      the database (JSON format).
 * /user/:id          - Returns the User object with the _id of id (JSON
 *                      format).
 * /photosOfUser/:id  - Returns an array with all the photos of the User (id).
 *                      Each photo should have all the Comments on the Photo
 *                      (JSON format).
 */

const mongoose = require("mongoose");
mongoose.Promise = require("bluebird");

const async = require("async");

const fs = require("fs");
const express = require("express");
const app = express();
const session = require("express-session");
const bodyParser = require("body-parser");
const multer = require("multer");

const processFormBody = multer({ storage: multer.memoryStorage() }).single('uploadedphoto');

app.use(session({ secret: "secretKey", resave: false, saveUninitialized: false }));
app.use(bodyParser.json());

// Load the Mongoose schema for User, Photo, and SchemaInfo
const User = require("./schema/user.js");
const Photo = require("./schema/photo.js");
const SchemaInfo = require("./schema/schemaInfo.js");
const Activity = require("./schema/activities.js");

mongoose.set("strictQuery", false);
mongoose.connect("mongodb://127.0.0.1/project8", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// We have the express static module
// (http://expressjs.com/en/starter/static-files.html) do all the work for us.
app.use(express.static(__dirname));

function getSessionUserID(request) {
  return request.session.user_id;
}

function hasNoUserSession(request, response) {
  if (!getSessionUserID(request)) {
    response.status(401).send();
    return true;
  }
  return false;
}

app.get("/", function (request, response) {
  response.send("Simple web server of files from " + __dirname);
});

/**
 * Use express to handle argument passing in the URL. This .get will cause
 * express to accept URLs with /test/<something> and return the something in
 * request.params.p1.
 * 
 * If implemented, the get will work as follows:
 * /test        - Returns the SchemaInfo object of the database in JSON format.
 *                This is good for testing connectivity with MongoDB.
 * /test/info   - Same as /test.
 * /test/counts - Returns an object with the counts of the different collections
 *                in JSON format.
 */
app.get("/test/:p1", function (request, response) {
  const param = request.params.p1 || "info";
  if (param === "info") {
    SchemaInfo.find({}, function (err, info) {
      if (err) {
        console.error("Error in /user/info:", err);
        response.status(500).send(JSON.stringify(err));
        return;
      }
      if (info.length === 0) {
        response.status(400).send("Missing SchemaInfo");
        return;
      }
      response.end(JSON.stringify(info[0]));
    });
  } else if (param === "counts") {
    const collections = [
      { name: "user", collection: User },
      { name: "photo", collection: Photo },
      { name: "schemaInfo", collection: SchemaInfo },
    ];
    async.each(
      collections,
      function (col, done_callback) {
        col.collection.countDocuments({}, function (err, count) {
          col.count = count;
          done_callback(err);
        });
      },
      function (err) {
        if (err) {
          response.status(500).send(JSON.stringify(err));
        } else {
          const obj = {};
          collections.forEach(col => obj[col.name] = col.count);
          response.end(JSON.stringify(obj));
        }
      }
    );
  } else {
    response.status(400).send("Bad param " + param);
  }
});

/**
 * URL /user - adds a new user
 */
app.post("/user", function (request, response) {
  const { first_name, last_name, location, description, occupation, login_name, password } = request.body;

  if (!first_name || !last_name || !login_name || !password) {
    const missingFields = ["first_name", "last_name", "login_name", "password"].filter(field => !request.body[field]);
    console.error("Error in /user: Missing fields", missingFields);
    response.status(400).send(missingFields.join(", ") + " are required");
    return;
  }

  User.exists({ login_name: login_name }, function (err, userExists) {
    if (err) {
      console.error("Error in /user", err);
      response.status(500).send();
    } else if (userExists) {
      response.status(400).send("User already exists");
    } else {
      User.create({
        _id: new mongoose.Types.ObjectId(),
        first_name,
        last_name,
        location,
        description,
        occupation,
        login_name,
        password
      })
      .then(user => {
        request.session.user_id = user._id;
        logActivity(user._id, "New Account", `${user.first_name} Created New Account`);
        response.end(JSON.stringify(user));
      })
      .catch(err1 => {
        console.error("Error in /user", err1);
        response.status(500).send();
      });
    }
  });
});

/**
 * URL /photos/new - adds a new photo for the current user
 */
app.post("/photos/new", function (request, response) {
  if (hasNoUserSession(request, response)) return;

  const user_id = getSessionUserID(request);
  processFormBody(request, response, function (err) {
    if (err || !request.file) {
      console.error("Error in /photos/new", err);
      response.status(400).send("photo required");
      return;
    }
    const timestamp = new Date().valueOf();
    const filename = `U${timestamp}${request.file.originalname}`;
    fs.writeFile(`./images/${filename}`, request.file.buffer, function (err1) {
      if (err1) {
        console.error("Error in /photos/new", err1);
        response.status(400).send("error writing photo");
        return;
      }
      Photo.create({
        _id: new mongoose.Types.ObjectId(),
        file_name: filename,
        date_time: new Date(),
        user_id: mongoose.Types.ObjectId(user_id),
        comment: []
      })
      .then(() => {
        logActivity(user_id, "upload_photo", `Uploaded photo: ${filename}`);
        response.end()})
      .catch(err2 => {
        console.error("Error in /photos/new", err2);
        response.status(500).send(JSON.stringify(err2));
      });
    });
  });
});

/**
 * URL /commentsOfPhoto/:photo_id - adds a new comment on photo for the current user
 */
app.post("/commentsOfPhoto/:photo_id", function (request, response) {
  if (hasNoUserSession(request, response)) return;

  const { photo_id } = request.params;
  const user_id = getSessionUserID(request);
  const comment = request.body.comment || "";

  if (!photo_id || !user_id || !comment) {
    const missingParams = ["photo_id", "user_id", "comment"].filter(param => !request[param]);
    response.status(400).send(missingParams.join(", ") + " required");
    return;
  }

  Photo.updateOne(
    { _id: new mongoose.Types.ObjectId(photo_id) },
    { $push: {
        comments: {
          comment,
          date_time: new Date(),
          user_id: new mongoose.Types.ObjectId(user_id),
          _id: new mongoose.Types.ObjectId()
        }
      }
    },
    function (err) {
      if (err) {
        console.error("Error in /commentsOfPhoto/:photo_id", err);
        response.status(500).send(JSON.stringify(err));
      } else {
        logActivity(user_id, "New_Comment", `Added New Comment on Photo`);
        response.end();
      }
    }
  );
});

/**
 * URL /admin/login - Returns user object on successful login
 */
app.post("/admin/login", function (request, response) {
  const { login_name, password } = request.body;

  User.find({ login_name, password }, { __v: 0 }, function (err, user) {
    if (err) {
      console.error("Error in /admin/login", err);
      response.status(500).send(JSON.stringify(err));
      return;
    }
    if (user.length === 0) {
      response.status(400).send("Invalid login credentials");
    } else {
      request.session.user_id = user[0]._id;
      console.log("UserId of logged in user : ",request.session.user_id);
      logActivity(user[0]._id, "login", `User ${user[0].first_name} logged in`);
      response.end(JSON.stringify(user[0]));
    }
  });
});

/**
 * URL /admin/logout - logs out the current user
 */
app.post("/admin/logout", function (request, response) {
  const user_id = getSessionUserID(request);
  logActivity(user_id, "logout", "User logged out");
  request.session.destroy(function () {
    response.end();
  });
});

/**
 * URL /user/list - Returns all users
 */
app.get("/user/list", function (request, response) {
  if (hasNoUserSession(request, response)) return;

  User.find({}, { _id: 1, first_name: 1, last_name: 1 }, function (err, users) {
    if (err) {
      response.status(500).send(JSON.stringify(err));
      return;
    }
    response.end(JSON.stringify(users));
  });
});

/**
 * URL /user/:id - Returns a particular user
 */
app.get("/user/:id", function (request, response) {
  if (hasNoUserSession(request, response)) return;

  // Validate ObjectId
  if (!mongoose.Types.ObjectId.isValid(request.params.id)) {
    return response.status(400).send("Invalid user ID format");
  }

  User.findById(request.params.id, { __v: 0, login_name: 0, password: 0})
    .select('-createdAt -updatedAt')
    .then(user => {
      if (!user) {
        response.status(400).send("User not found");
      } else {
        response.end(JSON.stringify(user));
      }
    })
    .catch(err => {
      console.error("Error in /user/:id", err.reason);
      response.status(500).send();
    });
});

app.get("/username/:id", async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "Invalid user ID format" });
  }

  try {
    const user = await User.findById(id);
    res.json(user || { username: "Unknown User", id });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});



app.get("/currentUser", (req, res) => {
  if (hasNoUserSession(req, res)) return;

  const currentUserId = getSessionUserID(req); // Use your session/JWT mechanism to get the user ID.
  if (!currentUserId) {
      return res.status(401).send("No logged-in user found");
  }

  User.findById(currentUserId)
      .then((user) => {
          if (!user) {
              res.status(404).send("User not found");
              return;
          }
          res.json({ userId: currentUserId, firstName: user.first_name, lastName: user.last_name });
      })
      .catch((err) => {
          console.error("Error fetching current user", err);
          res.status(500).send("Error fetching current user");
      });
});

/**
 * URL /photosOfUser/:id - Returns the photos of a user along with all comments on each photo.
 */

app.get("/photosOfUser/:id", function (request, response) {
  if (hasNoUserSession(request, response)) return;
  const currentUserId = getSessionUserID(request);
  if (!mongoose.Types.ObjectId.isValid(request.params.id)) {
    return response.status(400).send("Invalid user ID format");
  }

  User.findById(request.params.id)
    .then(user => {
      if (!user) {
        response.status(400).send("User not found");
        return;
      }
      return Photo.aggregate([
        { $match: { user_id: mongoose.Types.ObjectId(request.params.id) } },
        {
          $lookup: {
            from: "users",
            localField: "comments.user_id",
            foreignField: "_id",
            as: "users"
          }
        },
        {
          $addFields: {
            comments: {
              $map: {
                input: "$comments",
                as: "comment",
                in: {
                  $mergeObjects: [
                    "$$comment",
                    {
                      user: {
                        $arrayElemAt: [
                          {
                            $map: {
                              input: {
                                $filter: {
                                  input: "$users",
                                  as: "user",
                                  cond: { $eq: ["$$user._id", "$$comment.user_id"] }
                                }
                              },
                              as: "filteredUser",
                              in: {
                                _id: "$$filteredUser._id",
                                first_name: "$$filteredUser.first_name",
                                last_name: "$$filteredUser.last_name"
                              }
                            }
                          },
                          0
                        ]
                      }
                    }
                  ]
                }
              }
            }
          }
        },
        {
          $project: {
            users: 0,
            __v: 0,
            "comments.user_id": 0
          }
        }
      ]);
    })
    .then(photos => response.end(
      JSON.stringify(photos || [])))
    .catch(err => {
      console.error("Error in /photosOfUser/:id", err);
      response.status(500).send(JSON.stringify(err));
    });
});


// Endpoint to fetch all activities
app.get("/activities", async (req, res) => {
  try {
    const activities = await Activity.find()
      .populate('user_id', 'username')  // Populate with user details like username
      .sort({ timestamp: -1 });
    res.json(activities);
  } catch (error) {
    console.error("Error fetching activities:", error);
    res.status(500).send("Failed to fetch activities.");
  }
});



// Log an activity
function logActivity(user_id, action, description) {
  
  Activity.create({
    _id: new mongoose.Types.ObjectId(),
    user_id: user_id,
    action,
    description,
    timestamp: new Date(),
  }).catch((err) => {
    console.error("Error logging activity:", err);
  });
}

// Like a photo
app.post("/photos/:photo_id/like", (req, res) => {
  if (hasNoUserSession(req, res)) return;
  
  const photo_id = req.params.photo_id;
  const user_id = getSessionUserID(req);

  Photo.findByIdAndUpdate(
    photo_id,
    { $addToSet: { likes: user_id } }, // Adds user_id to likes only if it's not already present
    { new: true }, // Return the updated document
    (err, updatedPhoto) => {
      if (err || !updatedPhoto) {
        res.status(400).send("Photo not found");
        return;
      }
      if (!updatedPhoto.likes.includes(user_id)) {
        res.status(400).send("User already liked this photo");
        return;
      }
      res.send("Liked successfully");
    }
  );
});

// Unlike a photo

app.post("/photos/:photo_id/unlike", (req, res) => {
  if (hasNoUserSession(req, res)) return;

  const photo_id = req.params.photo_id;
  const user_id = getSessionUserID(req);

  Photo.findByIdAndUpdate(
    photo_id,
    { $pull: { likes: user_id } }, // Removes user_id from likes
    { new: true }, // Return the updated document
    (err, updatedPhoto) => {
      if (err || !updatedPhoto) {
        res.status(400).send("Photo not found");
        return;
      }
      if (updatedPhoto.likes.includes(user_id)) {
        res.status(400).send("User has not liked this photo");
        return;
      }
      res.send("Unliked successfully");
    }
  );
});

app.delete("/user/delete", async function (request, response) {
  if (hasNoUserSession(request, response)) return;

  const user_id = getSessionUserID(request);
  const userObjectId = mongoose.Types.ObjectId(user_id);

  try {
      // Delete all photos created by the user
      await Photo.deleteMany({ user_id: user_id });
      // Delete all activities created for this user
    
      const deleteResult = await Activity.deleteMany({ user_id: userObjectId });
      console.log("Delete result:", deleteResult);
      console.log("Number of deleted activities:", deleteResult.deletedCount);
      // Remove user's comments and likes from all photos
      await Photo.updateMany(
          {}, // Match all photos
          {
              $pull: {
                  comments: { user_id: user_id }, // Remove user's comments
                  likes: user_id, // Remove user's likes
              },
          }
      );

      // Delete the user from the database
      await User.findByIdAndDelete(user_id);

      // Destroy the session and send a response
      request.session.destroy(function () {
          response.status(200).send("User and related data deleted successfully.");
      });
  } catch (error) {
      console.error("Error in /user/delete", error);
      response.status(500).send("Error deleting user and related data.");
  }
});

app.delete("/photos/:photoId", async function (request, response) {
  if (hasNoUserSession(request, response)) return;

  const user_id = getSessionUserID(request);
  const { photoId } = request.params;

  try {
      const photo = await Photo.findById(photoId);

      if (!photo) {
          return response.status(404).send("Photo not found.");
      }

      if (photo.user_id.toString() !== user_id) {
          return response.status(403).send("You are not authorized to delete this photo.");
      }

      await photo.remove(); // Delete photo document
      response.status(200).send("Photo deleted successfully.");
  } catch (error) {
      console.error("Error deleting photo:", error);
      response.status(500).send("Error deleting photo.");
  }
});

app.delete("/photos/:photoId/comments/:commentId", async function (request, response) {
  if (hasNoUserSession(request, response)) return;

  const user_id = getSessionUserID(request);
  const { photoId, commentId } = request.params;

  try {
      const photo = await Photo.findById(photoId);

      if (!photo) {
          return response.status(404).send("Photo not found.");
      }

      const comment = photo.comments.id(commentId);

      if (!comment) {
          return response.status(404).send("Comment not found.");
      }

      if (comment.user_id.toString() !== user_id) {
          return response.status(403).send("You are not authorized to delete this comment.");
      }

      comment.remove(); // Remove the comment
      await photo.save(); // Save updated photo
      response.status(200).send("Comment deleted successfully.");
  } catch (error) {
      console.error("Error deleting comment:", error);
      response.status(500).send("Error deleting comment.");
  }
});


const server = app.listen(3000, function () {
  console.log(`Listening at http://localhost:3000 exporting the directory ${__dirname}`);
});
