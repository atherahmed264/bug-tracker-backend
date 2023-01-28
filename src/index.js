const mongoose = require('mongoose');
const dotenv = require('dotenv');

const app = require('./app.js');
dotenv.config({ path:`${__dirname}/envariables.env`});

let pass = process.env.DATABASE_PASSWORD
let url = process.env.DATABASE?.replace("<PASSWORD>",pass);
let port = process.env.PORT || 5000;

mongoose.connect(url,{
    useNewUrlParser:true,
    useUnifiedTopology:true,
})
.then((con) => {
    console.log("DataBase connected");
})
.catch( err => {
    console.log("error occured while connecting database",err);
});

let server = app.listen(port,() => {
    console.log(`Listening on port number ${port}`);
});

process.on('uncaughtException',() => {
    console.log("Error occured uncaughtException")
    server.close();
    process.exit(1);
});

process.on('unhandledRejection',() => {
    console.log("Error occured uncaughtException");
    server.close();
    process.exit(1);
});
