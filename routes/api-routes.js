const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const cookieParser = require("cookie-parser");
// const path = require('path')
// const cors = require('cors')
// const config = require('config')
const userModel = require("../models/user_md");
const postModel = require("../models/post_md");
const likeModel = require("../models/like_md");
const commentModel = require("../models/comment_md");
const profileUpdateModel = require("../models/profileUpdate_md");

const salt = bcrypt.genSaltSync(10);
const secret = "sdfghyui8765ewesdfg7654ed";

let multer = require("multer");
let fs = require("fs");
let path = require("path");
const { error } = require("console");
 
let storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let __dir = path.join(__dirname, "../public/uploads");
    cb(null, __dir);
  },
  filename: function (req, file, cb) {
    let filename = file.originalname.toLowerCase();
    cb(null, filename);
  },
});
let upload = multer({ storage });

//USER MANAGEMENT ROUTES
// Create A User
router.post("/create-user", async (req, res) => {

  const { userName, password, email, fullName, phone, image } = req.body;

  try {
    const userEntry = await userModel.create({
      userName: userName,
      password: bcrypt.hashSync(password, salt),
      email: email,
      fullName: fullName,
      phone: phone,
      image: image,
    });

    res.json({ status: 200, success: true, data: userEntry });

    // res.json(userEntry);
  } catch (err) {
    console.log(err);
    res.status(400).json(err);
  }
});

// Login
router.post("/login", async (req, res) => {
  const { userName, password } = req.body;

  try {
    const user = await userModel.findOne({ userName: userName });

    if (!user) {
      return res.status(400).json("User not found");
    }

    const pwdOk = bcrypt.compareSync(password, user.password);
    // res.json(pwdOk);
    // console.log(pwdOk);

    if (pwdOk) {
      jwt.sign({ userName, id: user._id }, secret, {}, (err, token) => {
        if (err) throw err;
        console.log(token);
        res.cookie("token", token).json({ status: 200, message: "Logged In" });
      });
    } else {
      console.log("error here");
      res.status(400).json("wrong user");
    }
  } catch (err) {
    console.log(err);
    res.status(400).json(err);
  }
});

// Get All Users
router.get("/users", (req, res) => {
  userModel
    .find()
    .lean()
    .then((users) => {
      res.send({ success: true, data: users });
    });
});

// Get A User by ID
router.get("/user/:id", (req, res) => {
  userModel
    .findById(req.params.id)
    .lean()
    .then((user) => {
      res.send({ success: true, data: user });
    });
});

// Edit User
router.post("/update-user", (req, res) => {
  userModel.findByIdAndUpdate(req.body.id, req.body).then(() => {
    userModel
      .findById(req.body.id)
      .lean()
      .then((user) => {
        res.send({ success: true, message: "User Updated", data: user });
      });
  });  
}); 


router.post("/update-user/:id", (req, res) => {
  userModel.findByIdAndUpdate(req.params.id, req.body).then(() => {
    userModel
      .findById(req.params.id)
      .lean()
      .then((user) => {
        res.send({ success: true, message: "User Updated", data: user });
      }); 
  });
});

// Delete User
router.delete("/delete-user/:id", (req, res) => {
  userModel.findByIdAndDelete(req.params.id).then(() => {
    res.send({ success: true, message: "User Deleted" });
  });
}); 

/* USER PROFILE MANAGEMENT ROUTES*/
//Get User Profile (Token Validation)
router.get("/profile", (req, res) => {
  const { token } = req.cookies;

  if (!token) {
    return res.status(400).json("Token Not Found");
  }

  jwt.verify(token, secret, {}, async (err, profile) => {
    if (err) {
      return res.status(500).json("Token Not Verified");
    }
    const existingUser = await userModel.findOne(
      { _id: profile.id },
      { userName: true, _id: true, fullName: true }
    );
    console.log(existingUser);
    res.json(existingUser);
  });
});

// Creating User Profile
router.post("/create-profile", upload.any(), async (req, res) => {
  if (req.files.length > 0) {
    req.body.image = req.files[0].filename;
  }

  const { token } = req.cookies;

  if (!token) {
    return res.status(400).json("User not found.... Register your account");
  }

  jwt.verify(token, secret, {}, async (error, user) => {
    if (error) {
      return res.status(500).json("Failed to verity User");
    }

    profileUpdateModel
      .create({
        user_id: user.id,
        employmentStatus: req.body.employmentStatus,
        location: req.body.location,
        skills: req.body.skills,
        nationlity: req.body.nationality,
        gender: req.body.gender,
        bio: req.body.bio,
        // birthDay: req.body.birthDay,
        image: req.body.image,
      })
      .then((profile) => {
        res.send({ success: true, data: profile });
      })
      .catch((err) => {
        res.send({ status: 500, error: true, message: err });
      });
  });
});

// Get All Profiles
router.get("/profiles", (req, res) => {
  profileUpdateModel
    .find()
    .lean()
    .then((profiles) => {
      res.send({ success: true, data: profiles });
    });
});

// Get A UserProfile by Id
router.post("/userProfile", async (req, res) => {
  const { user } = req.body;
  try {
    const getProfile = await profileUpdateModel.findOne({ user_id: user });

    const payload = {
      id: getProfile.user,
      emp_status: getProfile.employmentStatus,
      location: getProfile.location,
      skills: getProfile.skills,
      nationality: getProfile.nationality,
      bio: getProfile.bio,
      image: getProfile.image,
      gender: getProfile.gender,
      // birthDay: getProfile.birthDay,
    };

    res.json({ status: 200, success: true, data: payload });
  } catch (error) {
    res.json({ status: 500, error: true, message: error });
  }
});

//  LogOut User
router.post("/logOut", (req, res) => {
  res.cookie("token", "").json("LogOut Successful");
});


/* POST MANAGEMENT ROUTES*/
//  Create Post
router.post("/create-post", upload.any(), async (req, res) => {
  if (req.files.length > 0) {
    req.body.image = req.files[0].filename;
  }

  const { token } = req.cookies;

  if (!token) {
    return res
      .status(400)
      .json("This user cannot post yet.... Register your account");
  }

  jwt.verify(token, secret, {}, async (error, user) => {
    if (error) {
      return res.status(500).json("Failed to verity User");
    }

    postModel
      .create({
        user_id: user.id,
        category: req.body.category,
        title: req.body.title,
        text: req.body.text,
        hashtag: req.body.hashtag,
        image: req.body.image,
      })
      .then((post) => {
        res.send({ success: true, data: post });
      })
      .catch((err) => {
        res.send({ status: 500, error: true, message: err });
      });
  });
});

// Get All Posts
router.get("/posts", (req, res) => {
  postModel
    .find()
    .lean()
    .sort({ createdAt: -1 })
    .then((posts) => {
      // commentModel.find().lean
      // for

      res.send({ success: true, data: posts });
    });
});

// Get Post by User
router.get("/post/:username", async (req, res) => {

  try {
    const userPost = await postModel.findOne({ userName: req.params.username });

    const payload = {
      _id: userPost._id,
      fullName: userPost.fullName,
      image: userPost.image,
      phone: userPost.phone,
      userName: userPost.userName,
      password: userPost.password,
    }; 

    res.json({ status: 200, success: true, data: payload });
  } catch (error) {
    res.json({ status: 500, error: true, message: error });
  }
});

// Edit Post
router.get("/post/:id", (req, res) => {
  postModel
    .findById(req.params.id) 
    .lean()
    .then((post) => {
      res.send({ success: true, data: post });
    });
});

router.post("/update-post/:id", upload.any(), (req, res) => {
  if (req.files.length > 0) {
    req.body.image = req.files[0].filename;
  }
  postModel
    .findByIdAndUpdate(req.params.id, req.body)
    .then(() => {
      postModel
        .findById(req.params.id)
        .lean()
        .then((post) => {
          res.send({ success: true, message: "Post Updated", data: post });
        })
        .catch((err) => {
          res.send({ error: true, message: err.message });
        });
    })
    .catch((err) => {
      res.send({ error: true, message: err.message });
    });
});

// Delete Post
router.delete("/delete-post/:id", (req, res) => {
  postModel.findByIdAndDelete(req.params.id).then(() => {
    res.send({ success: true, message: "Post Deleted" });
  });
}); 

/* LIKE MANAGEMENT ROUTES*/
//  Create Like
router.post("/post/:id/like", (req, res) => {
  const { token } = req.cookies; 
  try {
    console.log("working");
    jwt.verify(token, secret, {}, async (error, liking) => {
      if (error) return res.send({ message: "Unable to like" });

      likeModel  
        .findOne({
          user_id: liking.id,
          post_id: req.params.id,
        })
        .then((user) => {
          if (!user) {
            const payload = {
              user_id: liking.id,
              post_id: req.params.id, 
              like: req.body.like,
            };
            likeModel.create(payload).then((user) => {
              console.log(user)
              res.send({ message: "Liked", data: user});
            });
          } else {
            likeModel.findByIdAndDelete(user._id, req.body).then((data) => {
              res.send({ message: "Deleted", data });
            });
          }
        });
    });
  } catch (err) {
    res.send({ error: true, message: err.messasge });
  }
});

// Get All Likes
router.get("/post/:id/getlikes", (req, res) => {
  likeModel
    .find({ post_id: req.params.id, like: true })
    .lean()
    .then((likes) => {
      console.log(likes);
      res.send({ success: true, data: likes });
    });
});  
  
// Get Like
router.get("/post/like/:id", (req, res) => {
  likeModel
    .find({ post_id: req.params.id, like: true })
    .count()
    .then((like) => {
      res.send({ success: true, data: like });
    })
    .catch((err) => {
      res.send({ error: true, message: err.message });
    });   
}); 

// Get Admin Likes
router.get("/likes", (req, res) => {
  likeModel
    .find()
    .lean()
    .then((like) => {
      res.send({ success: true, data: like });
    });
});

 
// Edit Like
router.put("/update-like/:id", (req, res) => {
  likeModel.findByIdAndUpdate(req.params.id, req.body).then(() => {
    likeModel
      .findById(req.params.id)
      .lean()
      .then((like) => {
        res.send({ success: true, msg: "Like Updated", data: like });
      });
  });
});

router.post("/update-like", (req, res) => {
  likeModel.findByIdAndUpdate(req.body.id, req.body).then(() => {
    likeModel
      .findById(req.body.id)
      .lean()
      .then((like) => {
        res.send({ success: true, message: "like Updated", data: like });
      });
  });
});

// Delete Like
router.delete("/delete-like/:id", (req, res) => {
  likeModel.findByIdAndDelete(req.params.id).then(() => {
    res.send({ success: true, message: "like Deleted" });
  });
});

//COMMENT MANAGEMENT ROUTES
// Create Comment
router.post("/create-comment", (req, res) => {
  const { token } = req.cookies;
  if (!token) {
    return res.status(400).json("invaild");
  }

  jwt.verify(token, secret, {}, async (error, poster) => {
    if (error) {
      return res.status(500).json("failed");
    }
    console.log(req.body.post_id);
    const payload = {
      user_id: poster.id,
      post_id: req.body.post_id,
      comment: req.body.comment,
    };

    // console.log("will it reach here?")

    const info = new commentModel(payload);
    await info.save();
  });
});

// Get All Comments
router.get("/comments", (req, res) => {
  commentModel
    .find()
    .lean()
    .sort({ createdAt: -1 })
    .then((comments) => {
      res.send({ success: true, data: comments });
    });
});  

// Get A Comment
router.get("/comment/:id", (req, res) => {
  commentModel
    .find({ post_id: req.params.id })
    .lean()
    .then((comment) => {
      console.log(comment);
      res.send({ success: true, data: comment });
    });
});

// Get Comment by Post Id
router.get("/comment/:post_id", async (req, res) => {
  try {
    const postId = await commentModel.findOne({ post_id: req.params.post_id });

    const payload = {
      post_id: postId.post_id,
      comment: postId.comment,
      _id: postId.user_id,
    };
    res.json({ status: 200, success: true, data: payload });
  } catch (error) {
    res.json({ status: 500, error: true, message: error });
  }
});

// Edit Comment
router.put("/update-comment/:id", (req, res) => {
  commentModel.findByIdAndUpdate(req.params.id, req.body).then(() => {
    commentModel
      .findById(req.params.id)
      .lean()
      .then((comment) => {
        res.send({ success: true, msg: "Comment Updated", data: comment });
      });
  });
});

router.post("/update-comment", (req, res) => {
  commentModel.findByIdAndUpdate(req.body.id, req.body).then(() => {
    commentModel
      .findById(req.body.id)
      .lean()
      .then((comment) => {
        res.send({ success: true, message: "Comment Updated", data: comment });
      });
  });
});

// Delete Comment
router.delete("/delete-comment/:id", (req, res) => {
  commentModel.findByIdAndDelete(req.params.id).then(() => {
    res.send({ success: true, msg: "Comment Deleted" });
  });
});


router.get("/", (req, res) => res.send("api-routes"));

module.exports = router;
