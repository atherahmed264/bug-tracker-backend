const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    Record:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Records'
    },
    UserId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'End-Users',
        required:true,
    },
    Comment:{
        type:String,
        maxLength:150,
    },
    Time:{
        type:Date,
        default:Date.now(),
    },
    Replies:{
        type:[mongoose.Schema.Types.ObjectId],
        ref:"Comments"
    },
    Type:{
        type:String,
        required:true,
        enum:["Comment","Reply"],
        validate: [ function (val ){ 
            if( val === "Comment")
                return !!this.Record;
            else    
                return true;    
        } 
        , "Record Id Not found"]
    },
})

const Comment = mongoose.model("Comments",commentSchema);
module.exports = Comment;