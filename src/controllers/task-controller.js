const util = require('./../utils/catchAsync');
const Task = require('./../models/task-model');

exports.addTask = util.catchAsync( async(req,res,next) => {
    if(!req.body) next(new util.err("No Payload",404));

    req.body.CreatedBy = req.body.CreatedBy || req.user._id;

    let data = await Task.create(req.body);
    res.status(200).json({
        message:"Success",
        data,
    });
})

exports.getTasks = util.catchAsync( async(req,res,next) => {
    console.log(req.query.id)
    if(!req.query?.id){
        res.status(404).json({
            message:'User Id not found'
        })
    }
    let data = await Task.find({CreatedBy:req.query.id});
    res.status(200).json({
        data
    })
})

exports.editTask = util.catchAsync( async (req,res,next) => {
    if(!req.body || !req.body.TaskId) next( new util.err("No id given ",404))


    let data = await Task.findByIdAndUpdate(req.body.TaskId , req.body , { new:true });
    if(!data) return next(new util.err("ID Not Found",404));
    res.status(200).json({
        message:"Success",
        data,
    });
})

exports.deleteTask = util.catchAsync( async(req,res,next) => {
    if(!req.body || !req.body.TaskId) next(new util.err("No Id given",404))

    let deletedRcrd = await Task.findByIdAndDelete(req.body.TaskId , { returnDocument : true });

    
    res.status(204).send();
});
