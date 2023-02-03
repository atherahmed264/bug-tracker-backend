const Records = require('./../src/models/records-model');
console.log("Started");

// Script to Add any values to all records in the database
async function AddUserOwnerID(){
    try {
    let records = await Records.find().populate('AssignedTo');
    console.log(records);
    records.forEach(async(record,i) => {
        let index = i+1;
        record.OwnerId = record.AssignedTo._id;
        record.save().then(x => {
            console.log("saved",index);
        }).catch(err => {
            console.log("error",err);
        });
    }) 
} catch(err){
    console.log("error");
}
}

function run(){
    AddUserOwnerID();
}
exports.script = run;