const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const postSchema = new Schema({
    category:{type:String},
    title:{type:String},
    text:{type:String},
    hashtag:{type:String},
    image:{type:String},
    status:{type:Boolean},
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
   
    
})

const post = mongoose.model("post", postSchema)
module.exports = post