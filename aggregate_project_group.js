
// Import collection from person.json
// mongoimport person.json -d analytics -c persons --jsonArray


// retrive data from person by female, couunt by state, sort desceding 
db.persons.aggregate([
    { $match : { gender : 'female'}}, 
    { $group : { _id: { state : "$location.state"}, totalPersons : { $sum : 1 } }}, 
    { $sort : { totalPersons : -1 }}
]).pretty()

// usinfg project can hide some field, can combine some fileds to one FullName  
// concat

db.persons.aggregate([
    { 
        $project : { 
            _id : 0, 
            gender : 1, 
            //fullName: { $concat : [ "$name.first", " ", "$name.last"]} 
            fullName: { $concat : [
                 { $toUpper : "$name.first"}, 
                    " ", 
                { $toUpper : "$name.last" } 
        ]} 
        }
    } 
]).pretty()

// Projections hide _id, combine fullName with first capital letter

db.persons.aggregate([
    { 
        $project : { 
            _id : 0, 
            gender : 1, 
            fullName: { $concat : [
                 { $toUpper : { 
                     $substrCP : [
                         '$name.first', 
                         0, 
                         1
                        ]
                    }
                }, 
                 { $substrCP : [ 
                     '$name.first' , 
                     1, 
                     { $subtract : [ 
                         { $strLenCP : "$name.first"}, 
                         1 
                        ]
                    }
                    ]
                }, 
                    " ",
                    { $toUpper : { 
                        $substrCP : [
                            '$name.last', 
                            0, 
                            1]
                        }
                    },  
                    { $substrCP : [ 
                        '$name.last' , 
                        1, 
                        { $subtract : [ 
                            { $strLenCP : "$name.last"}, 
                            1 
                           ]
                       }
                       ]
                   }, 
        ]} 
        }
    } 
]).pretty()

// get FullName from previous example, get coordinates and convert it to number 

db.persons.aggregate([
    { $project : {
            _id : 0, 
            name : 1,  
            email : 1, 
            birthday : {
                $toDate : "$dob.date"
            }, 
            age : "$dob.age", 
            location : { 
                type: "Point",
                coordinates : [
                    {
                        $convert : { input : "$location.coordinates.longitude", 
                        to : "double", 
                        onError : 0.0, 
                        onNull : 0.0
                     } 
                    }, 
                    {
                        $convert : { input : "$location.coordinates.latitude", 
                        to : "double", 
                        onError : 0.0, 
                        onNull : 0.0
                     } 
                    }    
                ]
            }
        }
    }, 
    {
        $project : {
            gender : 1, 
            email : 1, 
            location : 1, 
            birthday : 1 ,
            age : 1, 
            fullName: { $concat : [
                { $toUpper : { 
                    $substrCP : [
                        '$name.first', 
                        0, 
                        1
                       ]
                   }
               }, 
                { $substrCP : [ 
                    '$name.first' , 
                    1, 
                    { $subtract : [ 
                        { $strLenCP : "$name.first"}, 
                        1 
                       ]
                   }
                   ]
               }, 
                   " ",
                   { $toUpper : { 
                       $substrCP : [
                           '$name.last', 
                           0, 
                           1]
                       }
                   },  
                   { $substrCP : [ 
                       '$name.last' , 
                       1, 
                       { $subtract : [ 
                           { $strLenCP : "$name.last"}, 
                           1 
                          ]
                      }
                      ]
                  }, 
       ]} 

        }
    }, 
    { $group : 
        { _id : { 
            birthYear : { 
                $isoWeekYear : "$birthday" 
            }
        }, 
        numPerson : {
            $sum : 1
        }
        }
    }, 
    {
        $sort : { numPerson : -1}
    }
]).pretty()