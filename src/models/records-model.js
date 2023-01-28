const mongoose = require('mongoose');

const recordSchema = new mongoose.Schema({
    Title:{
        type:String,
        required:true,
        maxlength:20,
        minLength:5,
    },
    Descryption:{
        type:String,
        required:true,
    },
    Attachments:{
        type:[String]
    },
    Type:{
        type:String,
        required:true,
        enum:['Bug','UserStory','Task'],
    },
    CreatedAt:{
        type:Date,
        default:Date.now()
    },
    RecordNumber:{
        type:String,
        required:true
    },
    Status:{
        type:String,
        enum:['New','Active','Closed','Invalid'],
        default:'New'
    },
    CreatedBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'End-Users',
        required:true
    },
    AssignedTo:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'End-Users',
        required:true
    },
    StartDate:{
        type:Date
    },
    EndDate:{
        type:Date
    },
    Efforts:{
        type:Number
    },
    CompletedEfforts:{
        type:Number
    }
});

const Record = mongoose.model("Records",recordSchema);

module.exports = Record;