
// Import collection from person.json
// mongoimport array-data.json -d analytics -c friends --jsonArray
// still have dupicated values 
// $addToSet - avoid duplicated values 
db.friends.aggregate([
    { $unwind : "$hobbies"}, 
    { $group : {
        _id : {
            age : "$age"
        }, 
        allHobbies : {
            //$push : "$hobbies"
            $addToSet : "$hobbies"
        }
        }
    }
]).pretty()

// using unwind create collection where all hobbies placed in own fields 
// duplicate documents 

db.friends.aggregate([
    { $unwind : "$hobbies"}
   
]).pretty()

db.friends.aggregate([
    { $project : {
        _id : 0, 
        examScore : {
            // get just first element 
            //$slice : ["$examScores", 1] 
            // start from 2 and get 1 element 
            $slice : ["$examScores", 2, 1] 
        }

    }}
])

// calculating the size of array 

db.friends.aggregate([
    { 
        $project : {
            _id : 0 , 
            numScores : {
                // how to get the lenght of an array by field
                $size : "$examScores"
            }
        }
    }   
]).pretty()

// using filter operator more then 60

db.friends.aggregate([
    { 
        $project : {
            _id : 0 , 
            scores : {
                $filter : {
                    input : "$examScores" , 
                    as : "sc", 
                    cond : {
                        // $$ -  
                        $gt: ["$$sc.score", 60]  
                    }
                }
            }
        }
    }   
]).pretty()

// filter just highest scores of user 

db.friends.aggregate([
    { $unwind : "$examScores" } , 
    { $project : { 
        _id : 1, 
        name : 1, 
        age : 1, 
        score : "$examScores.score"}}, 
    { $sort : { examScores : -1}}, 
    { $group : {
        _id : "$_id", 
        name : { $first : "$name"}, 
        maxScores : { $max : "$score" }
    }}, 
    { $sort : { maxScores : -1 }} 
    ]).pretty()

// bucket - useful to get some statics of big data analytics 
// create bucket of person grouped by age 

db.persons.aggregate([
    { $bucket : { 
        groupBy : "$dob.age", 
        boundaries : [ 0, 18, 30, 40,  50, 60, 80, 120], 
        output : {
            numPersons:  { $sum : 1}, 
            averageAge : { $avg : "$dob.age"}  
            //names : { $push : "$name.first"}
        }
    } 
}
]).pretty()

// create Buckets automatically 

db.persons.aggregate([
    { $bucketAuto : {
        groupBy : "$dob.age", 
        buckets : 5, 
        output : {
            numPersons : {$sum : 1}, 
            averageAge : { $avg : "$dob.age"}
        }
    }
    
}
]).pretty()

// using skip , limit , match, sort , project 
db.persons.aggregate([
    { $match :  {
        gender : "male"
    } }, 
    { $project : {
        _id : 0, 
        gender : 1, 
        name : {
            $concat : [ "$name.first", " ", "$name.last"]
        }, 
        birthdate : {
            $toDate : "$dob.date"
        }
        }
    }, 
    { $sort : {
            birthdate : 1
        }
    }, 
    { $skip : 10 }, 
    { $limit : 4}
]).pretty()


