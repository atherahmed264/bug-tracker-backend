const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const fs = require('fs');
const {catchAsync , err ,advanceLookup } = require('./../utils/catchAsync');
const User = require('./../models/userModel');
const path = require('path')

let options = multer.diskStorage({
    destination:(req,file,cb) => {
        console.log('fie',file);
        cb(null,global.img+'/img/');
    },
    filename:(req,file,cb) => {
        let name = file.originalname.split('.')[0];
        let type = file.mimetype.includes('octet') ? 'jpeg' : file.mimetype.split('/')[1];
        cb(null,`${name}-${Date.now()}.${type}`);
    }
})
exports.multer = multer({ storage:options});

exports.uploadImage = catchAsync( async(req,res,next) => {
    if(!req.file || !req.params.id) next(new err("No Inputs Found",400));
    console.log('id',req.params.id);
    let data = await User.findById(req.params.id);
    if(data.ProfilePhoto){
        fs.unlink(global.img+'/img/'+data.ProfilePhoto,(err) => {
            if(err) console.log('errr');
            else console.log('file deleted');
        })
    }
    data.ProfilePhoto = req.file.filename;
    await data.save();
    fs.readFile(global.img+'/img/'+req.file.filename, { encoding:'base64'},(err,data64) => {
        if(err){
            return next(new err('Some Error Occurred while reading file',500));
        }

        res.status(200).json({
            message:'Success',
            base64String:data64
        })
    });

})

exports.getDocumentBase64 = catchAsync( async(req,res,next) => {
    if(!req.body.DocumentName){
        return next(new err("NO Input Found"),400);
    }
    console.log('global.img+req.body.DocumentName',global.img+'/img/'+req.body.DocumentName);
    let exists = fs.existsSync(global.img+'/img/'+req.body.DocumentName);
    if(!exists){
        next(new err('No File Found in Server It may have been deleted'),400);
        return;
    }
    fs.readFile(global.img+'/img/'+req.body.DocumentName,{ encoding:'base64'},(err,data) => {
        if(!data){
            next(new err('No Data Found'),400);
            return;
        }
        if(err){
            console.log(err);
            return;
        }
        res.status(200).json({
            message:'success',
            name:req.body.DocumentName,
            base64String:data,
        });
    })
})

exports.signup = catchAsync( async (req,res,next) => {
    if(req.body){
        let data = await User.create(req.body)
        if(data) res.status(200).json({
            data
        }); 
    }
})

exports.getUsers =  catchAsync( async(req,res) => {
    let data = await User.find().sort({ accountCreatedAt : -1});
    let length = data.length;
    res.status(200).json({
        length,
        data,
    })
})

exports.deleteUser = catchAsync( async(req,res,next) => {
    if(req.body && req.body.UserGuid ){
        await User.findByIdAndDelete(req.body.UserGuid);
        res.status(204).send();
    }
    next(new err("Payload issue",404))
});

exports.login = catchAsync( async(req,res,next) => {
    if(!req.body.userEmail && !req.body.userPass){
        next(new err('Username or password not found',404));
    }
    let data = await User.findOne({ Email: req.body.userEmail});
    
    if(!data) return next('User Not Found',404)
    console.log(data);
    bcrypt.compare(req.body.userPass,data.Password)
    .then(valid => {
        if(!valid) return next( new err("Wrong Password",401))
        data.Password = undefined;
        data.accountCreatedAt = undefined;
        data.PasswordCreatedAt = undefined;

        let payload = {
            iat:Date.now(),
            expiresIn:Date.now() + (10 * 24 * 60 * 60 * 1000),
            user:data.Name,
            id:data._id,
        }
        let token = jwt.sign(payload, process.env.SECRET, {
            expiresIn:"10d",
            algorithm:"HS256"
        });
        if(!token) return next(new err("Error Ocurred While generating token",500));

        console.log(valid);
        res.status(200).json({
            message:"Success",
            data,
            token,
        });
    })
    .catch(errr => {
        console.log(errr);
        next(new err("Internal Error",500));
    })
})

exports.updateUser = catchAsync( async(req,res,next) => {
////////////////// wrong implementation /////////////////////////////////////////
    if(req.body && req.body.id && req.body.Password){

        if(!req.body.ConfirmPassword) next(new err("WHere conform pass",404));
        
        let id = req.user?._id || req.body.id ;
        let passMatch = req.body.Password === req.body.ConfirmPassword ? true : false;
        
        if(!passMatch) next(new err("Password not matching",404));

        req.body.ConfirmPassword = undefined;
        bcrypt.hash(req.body.Password,12)
        .then( async val => {
            req.body.Password = val;
            req.body.PasswordCreatedAt = Date.now();
            let data = await User.findByIdAndUpdate(id,req.body, { returnDocument:true ,new: true , runValidators:true});
    
            if(!data) next(new err("Error Occurred While Updating",500));
            res.status(200).json({
                message:"Success",
                data
            });

        })
        .catch(err => next(err,500))

    }
    else if(req.body &&  req.body.id){
        let id = req.user?._id || req.body.id;
        let data = await User.findByIdAndUpdate(id,req.body,{ returnDocument:true ,new: true , runValidators:true}).select('-Password -PasswordCreatedAt');
        res.status(200).json({
            message:"Success",
            data
        });
    }
    else{
        next(new err("NO PAYLOAD",404));
    }
});

exports.advanceLookupUser = catchAsync( async (req,res,next) => {
    let defaultSearch = "Name";
    let select = "UserName Name Email";
    let obj = {
        isFilter : false,
        body : req.body,
        Model : User,
        defaultSearch,
        select
    }
    let page = +req.body.page;
    let OverallTotal = await User.countDocuments(); 
    let [query,restotal] = await advanceLookup(obj,next);
    let data = await query;
    res.status(200).json({
        message:"Success",
        data,
        requestedPage:page,
        restotal,
        OverallTotal
    });
});