const Records = require('../models/records-model');
const util = require('../utils/catchAsync');

const Err = util.err;
const catchAsync = util.catchAsync;
const advanceLookup = util.advanceLookup;

exports.addRecords = catchAsync( async (req,res,next) => {
    if(!req.body) next(new Err("No Payload",404));
    Records.countDocuments()

    req.body.RecordNumber = Date.now().toString().slice(-6);
    let data = await (await Records.create(req.body)).populate('AssignedTo');
    data = data.toObject();
    delete data.__v;
    delete data.Attachments;
    console.log(data);

    res.status(200).json({
        message:"Success",
        data
    })
});

exports.getRecordsList = catchAsync( async (req,res,next) => {
    if(!req.body || !req.body.page || !req.body.limit) next(new Err("No Fields found",404));
    
    let defaultSearch = isNaN(req.body.searchText) ? "Title" : "RecordNumber";
    let obj = {
        isFilter : true,
        allowed:["AssignedTo","CreatedBy","Status","Type","OwnerId"],
        body : req.body,
        Model : Records,
        defaultSearch,
        sort:+req.body.sort,
        sortBy:'CreatedAt'
    }
    let [query,total,count] = await advanceLookup(obj,next);
    let data = await query
               .populate('AssignedTo','UserName Name Email')
               .populate('CreatedBy','UserName Name Email');          

    res.status(200).json({
        message:"Success",
        length:data.length,
        data,
        totalRecords:total
    });
})

exports.getRecordDetails = catchAsync( async (req,res,next) => {
    if(!req.body || !req.body.id) next(new Err('Payload not valid',404))

    let data = await Records.findById(req.body.id).select('-__v').populate('AssignedTo');
    if(!data) return next(new util.err("ID Not Found",404));
    res.status(200).json({
        message:"Success",
        data
    });
})

exports.getAll = catchAsync( async(req,res,next) => {
    let data = await Records.find();
    res.status(200).json({
        message:"Success",
        total:data.length,
        data,
    });
})

exports.deleteRecord = catchAsync( async (req,res,next) => {
    if(!req.body || !req.body.id) next(new Err('No payload',404)) 
    await Records.findByIdAndDelete(req.body.id);
    res.status(204).send();
})



// {
//     isFilter : true | false;
//     allowed : ["AssignedTo","CreatedBy","Status","Type"];
//     searchText : "";
//     searchBy : "" 
//     body : req.body;
//     Model : Records;
// }

exports.editRecord  = catchAsync( async(req,res,next) => {
    if(Object.keys(req.body).length === 0 || !req.body.id) return next(new util.err("No Input",404));

    let id = req.body.id;
    let data = await (await Records.findByIdAndUpdate(id,req.body,{ runValidators:true,new:true})).populate('AssignedTo');
    res.status(200).json({
        message:"Success",
        data
    });
});


exports.advanceLookup = catchAsync(async (req,res,next) => {
    let defaultSearch = "RecordNumber";
    let select = 'RecordNumber Title Type Status AssignedTo';
    let obj = {
        isFilter : false,
        body : req.body,
        Model : Records,
        defaultSearch,
        select
    }
    let page = +req.body.page
    
    console.log(await advanceLookup(obj,next));
    let total = await Records.countDocuments();
    let [query,restotal] = await advanceLookup(obj,next);
    let data = await query;
    res.status(200).json({
        message:"Success",
        data,
        requestedPage:page,
        restotal,
        total
    });

})

//console.log(!req.body.page);
    
    // if(!req.body || !req.body.page) next(new Err("No payload",400))  
    // //PRMS - allowed,searchText="",req.body,Model,searchby?

    // let allowedfilter = ["AssignedTo","CreatedBy","Status","Type"];
    // let filter = (req.body.filter && req.body.filter) ? Object.keys(req.body.filter) : "";
    // let filterObj = req.body.filter || "";
    // let searchText = req.body.searchText;
    // let page = +req.body.page;
    // let limit = 1;
    // let skip = (page - 1) * limit;
    
    // let obj = {};
    // let total = await Records.countDocuments();
    // let totalPages = Math.ceil(total / 1);
    // if(page > totalPages ) next(new Err("Invalid Page",400))

    // if(searchText) {
    //     if(!isNaN(searchText) && searchText.length === 6){
    //         obj["RecordNumber"] = {
    //             $regex:searchText,
    //             $options:"i"
    //         }
    //     }
    //     else {
    //         obj["Title"] = {
    //         $regex:searchText,
    //             $options:"i"
    //         }
    //     }
    // }
    // if(isFilter){
    //     let valid = filter ? filter.every(val => allowedfilter.includes(val)) : false;
    // if(filter && filter.length && valid){
    //     if(arr.length === 1){
    //         let [ val ] = filter 
    //         obj[val] = filterObj[val];
    //     }
    //     else{
    //     let arr = [];
    //     filter.forEach(value => {
    //         let ob = {};
    //         ob[value] = filterObj[value];
    //         arr.push(ob)
    //     });
    //     obj["$and"] = arr
    //     }
    // }
    // }
    // console.log(obj);
    // let data = await Records.find(obj).skip(skip).limit(limit);
    // let length = data.length;
    // res.status(200).json({
    //     message:"Success",
    //     page,
    //     length,
    //     data,
    //     error:false
    // });