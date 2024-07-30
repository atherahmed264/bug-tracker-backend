const mongoose = require('mongoose');

const recordSchema = new mongoose.Schema({
    Title:{
        type:String,
        required:true,
        maxlength:200,
        minLength:2,
    },
    Content:{
        type:String,
    },
    Status:{
        type:String,
        required:true,
        enum:['To Do','In Progress','Under Review','Finished'],
    },
    Priority:{
        type:String,
        required:true,
        enum:['Low','Medium','Urgent'],
    },
    CreatedAt:{
        type:Date,
        default:Date.now()
    },
    CreatedBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'End-Users',
        required:true
    },
    DeadLine:{
        type:String
    }
});

const Task = mongoose.model("Tasks",recordSchema);

module.exports = Task;