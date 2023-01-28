const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const util = require('./../utils/catchAsync');

const Err = util.err;
const catchAsync = util.catchAsync;

exports.authorize = function (...vals){
    return catchAsync(async (req,res,next) => {
        return vals.includes(req.user.Role.toLowerCase()) ? next() : next(new Err("You Dont Have Permissions",401));
    })
} 

exports.authenticate = async (req,res,next) => {
    let token = req.headers.authorization;
    console.log(req.headers)
    if(!token) next(new Err("Token Not Found",404));
    token = token.split(" ")[1];
    let payload = jwt.decode(token);
    //let val = jwt.verify(token,process.env.SECRET);
    
    let data = await User.findById(payload.id);
    if(!data) next(new Err("User Doesnt Exist",404));

    let current = new Date(Date.now());
    let expiration = new Date(payload.expiresIn) ;
    let passChanged = new Date(data.PasswordCreatedAt).getTime();
    let iat = new Date(payload.iat).getTime();
    console.log(passChanged >= iat);
    if(current > expiration || passChanged > iat ) next(new Err("Token Expired",401));
    req.user = data;
    next();
}