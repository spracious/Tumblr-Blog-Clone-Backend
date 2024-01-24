const express=require('express')
const router=express.Router()
const userModel=require('../models/user_md')
const postModel = require('../models/post_md')
const likeModel= require('../models/like_md')
const commentModel= require('../models/comment_md')


let multer   = require("multer");
let fs = require('fs');
let path = require('path');

let storage = multer.diskStorage({
    destination: function (req, file, cb) {
        let __dir =  path.join(__dirname,'../public/uploads',); 
        cb(null, __dir);
    },
    filename: function (req, file, cb) {
            let filename = file.originalname.toLowerCase();
            cb(null, filename);
        }
    });
let upload = multer({storage});


//USER MANAGEMENT ROUTES
// Create A User
router.post('/create-user',(req, res) => {

    // console.log(req.files[0].filename)
    // req.body.image = req.files[0].filename

    userModel.create(req.body).then((user) => {
        res.send({ sucess: true, data: user });

    }).catch((err) => {
        console.log(err);
        res.send({ "error": true, message: err.message });
    })

})

 // Get All Users 
router.get('/users', (req, res) => {
    userModel.find().lean().then((users) => {
        res.send({ success: true, data: users })
    })
})

// Get A User
// router.get('/user/:id', (req, res) => {
//     userModel.findById(req.params.id).lean().then((user) => {
//         res.send({ "success": true, "data": user })
//     })
// })

// 
router.get('/user/:username', async (req, res) => {

try{
    const user = await userModel.findOne({userName: req.params.username})

    const payload = {
        _id: user._id,
        fullName: user.fullName,
        image: user.image,
        phone: user.phone,
        userName: user.userName, 
    }
    
    res.json({status: 200, success: true, data: payload})

}catch (err){
    res.json({status: 500, error: true, message: err});
}



    // .then((user) => {
    //     res.send({ "success": true, "data": user })    
    // })
})

// Edit User
router.post('/update-user', (req, res) => {
    userModel.findByIdAndUpdate(req.body.id, req.body).then(() => {

        userModel.findById(req.body.id).lean().then((user) => {
            res.send({ success: true, message: "User Updated", data: user })
        })
    })
})

router.put('/update-user/:id', (req, res)=>{
    userModel.findByIdAndUpdate(req.params.id, req.body).then(()=>{

        userModel.findById(req.params.id).lean().then((user)=>{
            res.send({success:true, message:"User Updated", data:user})
        })
    })
})

// Delete User
router.delete('/delete-user/:id', (req, res) => {
    userModel.findByIdAndDelete(req.params.id).then(() => {
        res.send({ success: true, message: "User Deleted" })
    })
})


/* POST MANAGEMENT ROUTES*/
//  Create Post
router.post("/create-post",upload.any(), async(req, res) => {

    if(req.files.length > 0){
        req.body.image = req.files[0].filename
    }

    postModel.create(req.body).then((post) => {
        res.send({success: true, data: post})
    }).catch((err) => {
        console.log(err)
        res.send({'error': true, message: err.message});
    })
})

// Get All Posts
router.get("/posts", (req, res) => {
    postModel.find().lean().then((posts) => {
        res.send({ success: true, data: posts })
    })
})

// Edit Post
router.get("/post/:id", (req, res) => {
    postModel.findById(req.params.id).lean().then((post) => {
        res.send({ success: true, data: post })
    })

})

router.post("/update-post", (req, res) => {
    postModel.findByIdAndUpdate(req.body.id, req.body).then(() => {
        postModel.findById(req.body.id).lean().then((post) => {
            res.send({ success: true, message: "Post Updated", data: post })
        })
    })
})

// Delete Post
router.delete("/delete-post/:id", (req, res) => {
    postModel.findByIdAndDelete(req.params.id).then(() => {
        res.send({ success: true, message: "Post Deleted" })
    })
})



/* LIKE MANAGEMENT ROUTES*/
//  Create Like
router.post("/create-like", (req, res) => {

    likeModel.create(req.body).then((like) => {
        res.send(like)
    }).catch((err) => {
        console.log(err)
        res.send(err)
    })
})

// Get All Likes
router.get("/likes", (req, res) => {
    likeModel.find().lean().then((likes) => {
        res.send({ success: true, data: likes })
    })
})

// Get A Like
router.get("/like/:id", (req, res) => {
    likeModel.findById(req.params.id).lean().then((like) => {
        res.send({ success: true, data: like })
    })

})

// Edit Like
router.put('/update-like/:id', (req, res) => {
    likeModel.findByIdAndUpdate(req.params.id, req.body).then(() => {
        likeModel.findById(req.params.id).lean().then((like) => {
            res.send({success:true, msg:"Like Updated", data:like})
        })
    })
})

router.post("/update-like", (req, res) => {
    likeModel.findByIdAndUpdate(req.body.id, req.body).then(() => {
        likeModel.findById(req.body.id).lean().then((like) => {
            res.send({ success: true, message: "like Updated", data: like })
        })
    })
})

// Delete Like
router.delete("/delete-like/:id", (req, res) => {
    likeModel.findByIdAndDelete(req.params.id).then(() => {
        res.send({ success: true, message: "like Deleted" })
    })
})


//COMMENT MANAGEMENT ROUTES
// Create Comment
router.post('/create-comment', (req, res)=>{

    commentModel.create(req.body).then((comment)=>{
        res.send(comment)
        
    }).catch((err)=>{
        console.log(err);
        res.send(err)
    })
})

// Get All Comments
router.get('/comments', (req, res) => {
    commentModel.find().lean().then((comments) => {
        res.send({success:true, data:comments})
    })
})

// Get A Comment
router.get('/comment/:id', (req, res) => {
    commentModel.findById(req.params.id).lean().then((comment) => {
        res.send({success:true, data:comment})
    })
})

// Edit Comment
router.put('/update-comment/:id', (req, res) => {
    commentModel.findByIdAndUpdate(req.params.id, req.body).then(() => {
        commentModel.findById(req.params.id).lean().then((comment) => {
            res.send({success:true, msg:"Comment Updated", data:comment})
        })
    })
})

router.post('/update-comment', (req, res) => {
    commentModel.findByIdAndUpdate(req.body.id, req.body).then(() => {
        commentModel.findById(req.body.id).lean().then((comment) => {
            res.send({success:true, msg:"Comment Updated", data:comment})
        })
    })
})

// Delete Comment
router.delete('/delete-comment/:id', (req, res) => {
    commentModel.findByIdAndDelete(req.params.id).then(() => {
        res.send({success:true, msg:"Comment Deleted"})
    })
})


 
module.exports=router
