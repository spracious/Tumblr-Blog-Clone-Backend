const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const likeSchema = new Schema({
    post_id:{ type: mongoose.Schema.Types.ObjectId, ref: 'post' },
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    like:{type:Boolean},
    status:{type:Boolean},
})

const like = mongoose.model("like", likeSchema)
module.exports = like