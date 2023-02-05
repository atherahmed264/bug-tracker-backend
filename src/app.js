const express = require('express');
const morgan = require('morgan');
const app = express();
const cors = require('cors');
const helmet = require('helmet');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const path = require('path');

const userRouter = require('./routes/userRoutes');
const commentRouter = require('./routes/commentRoute');
const recordRouter = require('./routes/recordRoutes');

app.use(cors());
app.use(xss());
app.options('*', cors()); 
app.use(helmet());
app.use(express.json());
console.log(path.join(__dirname,"/public"))
app.use(express.static(path.join(__dirname,"/public"))) // to send static files present in public folder like images,html etc
app.use(morgan('dev'));

let limiter = rateLimit({
    windowMs:10 * 60 * 1000,
    max:100,
    standardHeaders:true
});

app.use(limiter);
app.use("/api/v1/user",userRouter);
app.use("/api/v1/comment",commentRouter);
app.use("/api/v1/record",recordRouter);


app.use('*',(_req,_res,next) => next(new Error("Route not Found")));

app.use((err,_req,res,_next) => {
    console.log("GLOBAL ERR");
    console.log(err);
    let status = err.status || 500;
    let message = err.message || "Error Occured Please Try Again Later";
    if(err.code === 11000) message = `The value ${JSON.stringify(err.keyValue)} already is used`;
    if(err.name === "CastError") message = `The value ${err.value} is not a valid ID`;
    res.status(status).json({
        message,
        error:true,
    });
});

module.exports = app;