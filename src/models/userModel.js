const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

let userSchema = new mongoose.Schema({
    UserName:{
        type:String,
        required:[true,"User must have a Name"],
        minlength:5,
        maxlength:20,
    },
    Name:{
        type:String,
        required:[true,"User must have a Name"],
        minlength:5,
        maxlength:20,
    },
    Email:{
        type:String,
        validate:[],
        unique:true,
    },
    Password:{
        type:String,
        minlength:8,
    },
    ConfirmPassword:{
        type:String,
        minlength:8,
        maxlength:16,
        select:false,
        validate:[passwordValid,"Passwords dont match"]
    },
    ProfilePhoto:{
        type:String
    },
    accountCreatedAt:{
        type:Date,
        default:Date.now(),
    },
    Role:{
        type:String,
        enum:["Basic","Admin","FullAccess","HelpDesk"],
        default:"Basic"
    },
    Mobile:{
        type:String,
        minLength:8,
        maxLength:15
    },
    Country:{
        type:String,
    },
    PasswordCreatedAt:{
        type:Date,
        default:Date.now(),
    }
})

function passwordValid(val){
    return val === this.Password;
}

userSchema.pre(/^find/, async function(next){
    this.select('-__v');
    next();
})

userSchema.pre('findOneAndUpdate',function (next){
    console.log("findbyid",this.model.Password);
    next();
})

userSchema.pre('save', function (next){
    console.log("MODI",this.isModified('Password'));
    if (this.isModified('Password')) 
        bcrypt.hash(this.Password, 12).then(val => {
        this.Password = val;
        this.ConfirmPassword = undefined;
        this.PasswordCreatedAt = Date.now();
        next()
    }).catch(err => {
        next(err);
    })
    else
        next();
})

function hashPassword(next){
    bcrypt.hash(this.Password, 12).then(val => {
        this.Password = val;
        this.ConfirmPassword = undefined;
        this.PasswordCreatedAt = Date.now();
        next()
    }).catch(err => {
        next(err);
    })
}

let User = mongoose.model('End-Users',userSchema);

module.exports = User;