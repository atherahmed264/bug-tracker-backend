'use-strict'

async function AdvanceLookup(input, next) {
    let query;
    console.log(input);
    try {
        let searchText = input.body.searchText;
        let page = +input.body.page;
        let limit = +input.body.limit || 5;
        let skip = (page - 1) * limit;

        let model = input.Model
        let obj = {};
        
        let totalPages = Math.ceil(total / 1);
        let searchBy = input.body.searchBy || input.defaultSearch;
        if (page > totalPages) next(new Err("Invalid Page", 400))

        if (searchBy && searchText) {
            obj[searchBy] = {
                $regex: searchText,
                $options: "i"
            }
        }

        if (input.isFilter) {
            let filter = (input.body.filter && input.body.filter) ? Object.keys(input.body.filter) : "";
            let allowedfilter = input.isFilter ? input.allowed : [];
            let filterObj = input.body.filter || "";
            let valid = filter ? filter.every(val => allowedfilter.includes(val)) : false;

            if (filter && filter.length && valid) {
                let arr = [];

                filter.forEach(value => {
                    let ob = {};
                    if(filterObj[value].length === 1){
                        filterObj[value] = filterObj[value][0];
                    }
                    if(typeof filterObj[value] === "string")
                        ob[value] = filterObj[value];
                    else if(filterObj[value].length > 1){
                        let res = filterObj[value].reduce((acc,val) => {
                            let or = {};
                            or[value] = val;
                            acc.push(or);
                            return acc;
                        } ,[]);
                        
                        ob['$or'] = res;
                    }    
                    arr.push(ob)
                });
                if( arr.length ) obj["$and"] = arr

                if (arr.length === 1) {
                    let [val] = filter
                    obj[val] = filterObj[val];
                    delete obj['$and'];
                }
            }
          
            if(input.body.dateRange){
                let [start,end] = input.body.dateRange.split("/");
                console.log(new Date(start),end)
                let query = {
                    "CreatedAt":{
                        $gt:new Date(start),
                        $lt:new Date(end),
                    }
                }
                obj['$and'].push(query);
            }
        }
        
        if(input.sort && input.sortBy){
            var sort = {}
            sort[input.sortBy] = input.sort || -1;
        }
        console.log(JSON.stringify(obj),sort,'objjj');
        if(!input.isFilter && searchText === "") {
            query = model.find().skip(skip).limit(limit);
            var total = limit;
        }
        else{
            query = model.find(obj).sort(sort).skip(skip).limit(limit);
            total = await model.find(obj).countDocuments();
        } 
        
        if(input.select)    
            query = query.select(input.select) ;
            
    }
    catch (err) {
        console.log("ERRR")
        next(new AppError(err));
    }

    return [query , total];
} 



function catchAsync(fn){
    return async(req,res,next) => {
        fn(req,res,next).catch(err => next(err))
    }
}


class AppError extends Error {
    constructor(message,status){
        super(message);
        this.status = status || 500;
        this.message = message || "Internal Error Blame Ather";
    }
}


function addRoute(route) {
    return '/api/v1/'+route;
}

exports.catchAsync = catchAsync
exports.err = AppError;
exports.addRoute = addRoute;
exports.advanceLookup = AdvanceLookup;