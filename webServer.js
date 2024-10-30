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
const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const multer = require("multer");
const app = express();

const User = require("./schema/user.js");
const Photo = require("./schema/photo.js");
const SchemaInfo = require("./schema/schemaInfo.js");

mongoose.set("strictQuery", false);
mongoose.connect("mongodb://127.0.0.1/project6", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use(express.static(__dirname));
app.use(session({ secret: "secretKey", resave: false, saveUninitialized: false }));
app.use(bodyParser.json());

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + "-" + Date.now());
  },
});
const upload = multer({ storage: storage });

app.get("/", function (request, response) {
  response.send("Simple web server of files from " + __dirname);
});

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
        response.status(500).send("Missing SchemaInfo");
        return;
      }

      console.log("SchemaInfo", info[0]);
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
          for (let i = 0; i < collections.length; i++) {
            obj[collections[i].name] = collections[i].count;
          }
          response.end(JSON.stringify(obj));
        }
      }
    );
  } else {
    response.status(400).send("Bad param " + param);
  }
});

app.get("/user/list", function (request, response) {
  if (!request.session.loggedIn) {
    response.status(401).send("Unauthorized");
    return;
  }

  User.find({}, "_id first_name last_name", function (err, users) {
    if (err) {
      response.status(500).send(JSON.stringify(err));
      return;
    }
    response.status(200).send(users);
  });
});

app.get("/user/:id", function (request, response) {
  const id = request.params.id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    response.status(400).send("Invalid user ID");
    return;
  }

  User.findById(id, "-__v", function (err, user) {
    if (err) {
      response.status(500).send(JSON.stringify(err));
      return;
    }
    if (!user) {
      response.status(400).send("User not found");
      return;
    }
    response.status(200).send(user);
  });
});

app.get("/photosOfUser/:id", function (request, response) {
  const id = request.params.id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    response.status(400).send("Invalid user ID");
    return;
  }

  Photo.find({ user_id: id }, function (err, photos) {
    if (err) {
      response.status(500).send(JSON.stringify(err));
      return;
    }
    if (photos.length === 0) {
      response.status(400).send("No photos found for this user");
      return;
    }

    async.map(
      photos,
      function (photo, callback) {
        const photoObj = photo.toObject();
        delete photoObj.__v;

        async.map(
          photoObj.comments,
          function (comment, cb) {
            User.findById(comment.user_id, "_id first_name last_name", function (
              err1,
              user
            ) {
              if (err1) {
                cb(err1);
              } else {
                const commentObj = {
                  comment: comment.comment,
                  date_time: comment.date_time,
                  _id: comment._id,
                  user: user,
                };
                cb(null, commentObj);
              }
            });
          },
          function (err2, commentsWithUsers) {
            if (err2) {
              callback(err2);
            } else {
              photoObj.comments = commentsWithUsers;
              callback(null, photoObj);
            }
          }
        );
      },
      function (err3, photosWithComments) {
        if (err3) {
          response.status(500).send(JSON.stringify(err3));
        } else {
          response.status(200).send(photosWithComments);
        }
      }
    );
  });
});

// Login endpoint
app.post("/admin/login", function (request, response) {
  const { login_name, password } = request.body;

  User.findOne({ login_name: login_name }, function (err, user) {
    if (err) {
      response.status(500).send(JSON.stringify(err));
      return;
    }
    if (!user || user.password !== password) {
      response.status(400).send("Invalid login credentials");
      return;
    }
    request.session.loggedIn = true;
    request.session.user = user;
    response.status(200).send("Login successful");
  });
});

// Logout endpoint
app.post("/admin/logout", function (request, response) {
  if (request.session.loggedIn) {
    request.session.destroy();
    response.status(200).send("Logout successful");
  } else {
    response.status(400).send("User not logged in");
  }
});

// Add comment to a photo
app.post("/commentsOfPhoto/:photo_id", function (request, response) {
  if (!request.session.loggedIn) {
    response.status(401).send("Unauthorized");
    return;
  }

  const { comment } = request.body;
  const photoId = request.params.photo_id;
  const userId = request.session.user._id;

  if (!comment) {
    response.status(400).send("Comment text is required");
    return;
  }

  Photo.findById(photoId, function (err, photo) {
    if (err) {
      response.status(500).send(JSON.stringify(err));
      return;
    }
    if (!photo) {
      response.status(400).send("Photo not found");
      return;
    }

    photo.comments.push({ comment: comment, date_time: new Date(), user_id: userId });
    photo.save(function (err) {
      if (err) {
        response.status(500).send(JSON.stringify(err));
        return;
      }
      response.status(200).send("Comment added successfully");
    });
  });
});

// Photo upload endpoint
app.post("/photos/new", upload.single("photo"), function (request, response) {
  if (!request.session.loggedIn) {
    response.status(401).send("Unauthorized");
    return;
  }

  const userId = request.session.user._id;
  const newPhoto = new Photo({
    file_name: request.file.filename,
    date_time: new Date(),
    user_id: userId,
    comments: [],
  });

  newPhoto.save(function (err) {
    if (err) {
      response.status(500).send(JSON.stringify(err));
      return;
    }
    response.status(200).send("Photo uploaded successfully");
  });
});

const server = app.listen(3000, function () {
  const port = server.address().port;
  console.log(
    "Listening at http://localhost:" +
    port +
    " exporting the directory " +
    __dirname
  );
});
