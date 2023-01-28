const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const {catchAsync , err ,advanceLookup } = require('./../utils/catchAsync');
const User = require('./../models/userModel');

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
        let data = await User.findByIdAndUpdate(id,req.body,{ returnDocument:true ,new: true , runValidators:true});
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
    let total = await User.countDocuments(); 
    let [query,restotal] = await advanceLookup(obj,next);
    let data = await query;
    res.status(200).json({
        message:"Success",
        data,
        requestedPage:page,
        restotal,
        total
    });
});