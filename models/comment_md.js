const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const commentSchema = new Schema({
    post_id:{type:String,},
    status:{type:Boolean},
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    comment:{type:String,}
})

const comment = mongoose.model("comment", commentSchema)
module.exports = comment



 