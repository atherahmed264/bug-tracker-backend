const util = require('./../utils/catchAsync');
const Comment = require('./../models/comment-model');

exports.addComment = util.catchAsync( async(req,res,next) => {
    if(!req.body) next(new util.err("No Payload",404));

    req.body.UserId = req.body.UserId || req.user._id;

    if(req.body.Type === "Reply"){
        if(!req.body.Parent) next(new util.err("Which comment is this replying to ?",404));

        let parent = await Comment.findById(req.body.Parent);
        if(!parent) next(new util.err("Invalid Comment id passed",400))

        let body = req.body;
        body.Replies = undefined;
        let reply = await Comment.create(body)

        parent.Replies.push(reply._id);
        await parent.save({ validateBeforeSave : true });
        res.status(200).json({
            message:"Success",
        });
    }

    let data = await Comment.create(req.body);
    res.status(200).json({
        message:"Success",
        data,
    });
})

exports.getComments = util.catchAsync( async(req,res,next) => {
    let data = await Comment.find().populate('Replies');
    res.status(200).json({
        data
    })
})

exports.editComment = util.catchAsync( async (req,res,next) => {
    if(!req.body || !req.body.CommentId) next( new util.err("No id given ",404))

    let obj = {
        Comment : req.body.Comment
    };
    let data = await Comment.findByIdAndUpdate(req.body.CommentId , obj , { new:true });
    if(!data) return next(new util.err("ID Not Found",404));
    res.status(200).json({
        message:"Success",
        data,
    });
})

exports.deleteComment = util.catchAsync( async(req,res,next) => {
    if(!req.body || !req.body.CommentId) next(new util.err("No Id given",404))

    let deletedRcrd = await Comment.findByIdAndDelete(req.body.CommentId , { returnDocument : true });

    if(req.body.Type === "Reply"){
        let parent = await Comment.findById(deletedRcrd._id);
        let arr = parent.Replies;
        let index = arr.findIndex(x => x === deletedRcrd._id);
        parent.Replies.splice(index,1);
        await parent.save();    
    }
    
    res.status(204).send();
});

exports.getCommentByRecord = util.catchAsync(async(req,res,next) => {
    if(!req.body || !req.body.RecordId) return next(new util.err("No Input ID Found"));

    let data = await Comment.find({ Record:req.body.RecordId});
    let result = data.map(async(value) => await value.populate('UserId'));
    result = await Promise.all(result);
    console.log(result);
    res.status(200).json({
        'message':'success',
        'data':result
    });

})