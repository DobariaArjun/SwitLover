const MongoClient = require('mongodb').MongoClient;
const bodyParser = require('body-parser');
const express = require('express');
const promise = require('promise');
const isEmpty = require('is-empty');
const randtoken = require('rand-token');
// const sendOtp = new SendOtp('220558AWw8c1QK8F5b22554d');
const app = express();
const request = require('request');
const ObjectId = require('mongodb').ObjectID;

const nodemailer = require("nodemailer");
app.use(bodyParser.json({limit: '50mb', extended: true}))
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}))

const uri = "mongodb+srv://ArjunDobaria:Pravin@143@switlover-bjxu8.mongodb.net/test?retryWrites=true"
const client = new MongoClient(uri, {useNewUrlParser: true});

var smtpTransport = nodemailer.createTransport({
    service: "Gmail",
    auth: {
        user: "switloverofficial@gmail.com",
        pass: "Switlover123"
    }
});

function paginate(array, page_size, page_number) {
    // because pages logically start with 1, but technically with 0
    return array.slice(page_number * page_size, (page_number + 1) * page_size);
}

var rand, mailOptions, host, link;

//--------------------------------------------------------------------------------------------------------------
//COLLECTIONS
var counter = "counters";
var switlover = "switlover";
var notification = "notification";
var match = "match";
//--------------------------------------------------------------------------------------------------------------


client.connect((err, db) => {
        if (err)
            console.log("Error while connecting to Mongo" + err);
        else {
            console.log("Connected to Mongo");
            var dbo = db.db("SwitLover");

            //--------------------------------------------------------------------------------------------------------------
            //Testing API
            app.get('/', (req, res) => {
                res.json({status: "1", message: "Server is running..."});
            });
            //--------------------------------------------------------------------------------------------------------------

            //--------------------------------------------------------------------------------------------------------------
            //Generate Request Token
            app.post('/api/GenerateRequestToken', (req, res) => {
                var token = randtoken.generate(64);
                res.json({status: "1", message: token.toString()});
            });
            //--------------------------------------------------------------------------------------------------------------

            //--------------------------------------------------------------------------------------------------------------
            //Counter For Download but not Login
            app.post('/api/NotLoginYet', (req, res) => {

                var dataCounter = dbo.collection(counter).find({}).toArray();
                dataCounter.then((data) => {
                    if (isEmpty(data)) {
                        //Create New

                        var myObj = {
                            General: {
                                UserNotLogin: 1,
                                DownloadPerDay: 0,
                                DownloadPerHour: 0,
                                AccessPerDay: 0,
                                AccessPerHour: 0,
                            },
                            Location: {
                                TimeSpentOnApp: "00:00:00"
                            },
                        };

                        dbo.collection(counter).insertOne(myObj, (err, result) => {
                            if (err)
                                res.json({status: "3", message: "Inserting faild"});
                            else {
                                res.json({status: "1", message: "Counter added successfully"});
                            }
                        });
                    } else {
                        //Update
                        var UserNotLogin = data[0]['General']['UserNotLogin'];

                        dbo.collection(counter).updateOne(
                            {
                                "General.UserNotLogin": data[0]['General']['UserNotLogin'],
                            },
                            {
                                $set: {"General.UserNotLogin": UserNotLogin + 1},
                            }
                        ).then((result) => {

                            if (result['result']['n'] == 1)
                                res.json({status: "1", message: "counter updated successfully"});
                            else
                                res.json({status: "3", message: "counter updated failed"});
                        }).catch((err) => {
                            res.json({status: "3 ", message: "counter updated failed"});
                        });
                    }
                }).catch((err) => {
                    res.json({status: "3", message: "Internal Server error"});
                });


            });
            //--------------------------------------------------------------------------------------------------------------

            //--------------------------------------------------------------------------------------------------------------
            //decrease the not login yet count after login
            app.post('/api/NowLogin', (req, res) => {
                var dataCounter = dbo.collection(counter).find({}).toArray();
                dataCounter.then((data) => {

                    //Update
                    var UserNotLogin = data[0]['General']['UserNotLogin'];

                    dbo.collection(counter).updateOne(
                        {
                            "General.UserNotLogin": data[0]['General']['UserNotLogin'],
                        },
                        {
                            $set: {"General.UserNotLogin": UserNotLogin - 1},
                        }
                    ).then((result) => {

                        if (result['result']['n'] == 1)
                            res.json({status: "1", message: "counter updated successfully"});
                        else
                            res.json({status: "3", message: "counter updated failed"});
                    }).catch((err) => {
                        res.json({status: "3 ", message: "counter updated failed"});
                    });

                }).catch((err) => {

                });
            });
            //--------------------------------------------------------------------------------------------------------------

            //--------------------------------------------------------------------------------------------------------------
            //Check user is     exist or not
            app.post('/api/CheckUser', (req, res) => {
                var Request_token = req.header('Request_token');
                if (!Request_token || Request_token == null) {
                    res.json({status: "5", message: "Request token missing"});
                } else {
                    if (!req.body.Contry_Code || req.body.Contry_Code == null && !req.body.Number || req.body.Number == null
                        && !req.body.Location || req.body.Location == null) {
                        res.json({status: "4", message: "Parameter missing or Invalid"});
                    } else {
                        var dataArray = dbo.collection(switlover).find({
                            'Phone_Number.Contry_Code': req.body.Contry_Code,
                            'Phone_Number.Number': req.body.Number,
                            'Phone_Number.Location': req.body.Location
                        }).toArray();
                        dataArray.then((result) => {
                            if (!isEmpty(result)) {

                                var isOver;
                                if (result[0]['is_Block'] == 1) {
                                    res.json({
                                        status: "7",
                                        type: "1",
                                        message: "Sorry you are block for this app. Contact to our support team."
                                    });
                                    return;
                                }
                                if (result[0]['is_Deleted'] == 1) {
                                    var dataresult = result[0];
                                    delete dataresult.Contact_List;
                                    delete dataresult.Contact_Not_Recognized;
                                    delete dataresult.Add_New_Number_From_App;
                                    delete dataresult.Contact_Remove_Ratio;
                                    delete dataresult.Like;
                                    delete dataresult.Match_Ratio;
                                    delete dataresult.PowerID;
                                    delete dataresult.Not_In_App_Purchase;
                                    delete dataresult.language;
                                    delete dataresult.Device;
                                    delete dataresult.createdAt;
                                    delete dataresult.updatedAt;
                                    delete dataresult.deletedAt;
                                    delete dataresult.is_Online;
                                    delete dataresult.is_Blocked;
                                    res.json({
                                        status: "7",
                                        type: "2",
                                        message: "Sorry you are deleted from this app. If you not do this then please contact to support team.",
                                        user_data: dataresult
                                    });
                                    return;
                                }
                                for (var i = 0; i < result[0]['Phone_Number'].length; i++) {
                                    if (result[0]['Phone_Number'][i]['is_OverVerification'] == 1) {
                                        isOver = true;
                                        break;

                                    } else {
                                        isOver = false;
                                    }
                                }
                                if (isOver) {
                                    res.json({
                                        status: "7",
                                        type: "3",
                                        message: "Sorry this number is block for over verification. Please contact to our support team"
                                    });
                                    return;
                                }
                                res.json({status: "1", message: "User is available"});
                            } else
                                res.json({status: "0", message: "User is not register yet"});
                        }).catch((err) => {
                            res.json({status: "3", message: "Internal server error"});
                        })
                    }
                }
            });
            //--------------------------------------------------------------------------------------------------------------

            //--------------------------------------------------------------------------------------------------------------
            //Switch the user
            app.post('/api/SwitchUser', (req, res) => {
                var Auth_Token = req.header('Auth_Token');
                if (!Auth_Token || Auth_Token == null) {
                    res.json({status: "6", message: "Auth token missing"});
                } else {
                    if (!req.body.Contry_Code || req.body.Contry_Code == null && !req.body.Number || req.body.Number == null
                        && !req.body.Location || req.body.Location == null) {
                        res.json({status: "4", message: "Parameter missing or Invalid"});
                    } else {
                        var dataArray = dbo.collection(switlover).find({
                            'Phone_Number.Contry_Code': req.body.Contry_Code,
                            'Phone_Number.Number': req.body.Number,
                            'Phone_Number.Location': req.body.Location
                        }).toArray();
                        dataArray.then((result) => {
                            if (!isEmpty(result)) {

                                var isOver;
                                if (result[0]['is_Block'] == 1) {
                                    res.json({
                                        status: "7",
                                        type: "1",
                                        message: "Sorry you are block for this app. Contact to our support team."
                                    });
                                    return;
                                }
                                if (result[0]['is_Deleted'] == 1) {
                                    res.json({
                                        status: "7",
                                        type: "2",
                                        message: "Sorry you are deleted from this app. If you not do this then please contact to support team."
                                    });
                                    return;
                                }

                                if (result[0]["Phone_Number"].length > 1) {
                                    //It has more than 1 number
                                    for (var i = 0; i < result[0]['Phone_Number'].length; i++) {
                                        if (result[0]['Phone_Number'][i]["Number"] == req.body.Number) {
                                            if (result[0]['Phone_Number'][i]['is_OverVerification'] == 1) {
                                                res.json({
                                                    status: "7",
                                                    type: "3",
                                                    message: "Sorry this number is block for over verification. Please contact to our support team"
                                                });
                                                return;
                                            } else {
                                                var myObj = {
                                                    Contry_Code: req.body.Contry_Code,
                                                    Number: req.body.Number,
                                                    Location: req.body.Location,
                                                    is_OverVerification: req.body.is_OverVerification,
                                                    Verified: req.body.Verified
                                                }
                                                var dataArray = dbo.collection(switlover).find({Auth_Token: Auth_Token}).toArray();
                                                dataArray.then((currentUserResult) => {
                                                    var userPhone_Number = currentUserResult[0]["Phone_Number"];
                                                    userPhone_Number.push(myObj);
                                                    dbo.collection(switlover).updateOne(
                                                        {Auth_Token: Auth_Token},
                                                        {$set: {Phone_Number: userPhone_Number}})
                                                        .then((updateResult) => {
                                                            var arraydata = [];
                                                            var resultDelete = dbo.collection(switlover).find({_id: new ObjectId(result[0]["_id"])}).toArray();
                                                            resultDelete.then((resDel) => {
                                                                for (var i = 0; i < resDel[0]['Phone_Number'].length; i++) {
                                                                    if (resDel[0]['Phone_Number'][i]["Number"] != req.body.Number) {
                                                                        var myObj = {
                                                                            Contry_Code: resDel[0]['Phone_Number'][i]["Contry_Code"],
                                                                            Number: resDel[0]['Phone_Number'][i]["Number"],
                                                                            Location: resDel[0]['Phone_Number'][i]["Location"],
                                                                            is_OverVerification: resDel[0]['Phone_Number'][i]["is_OverVerification"],
                                                                            Verified: resDel[0]['Phone_Number'][i]["Verified"]
                                                                        }
                                                                        arraydata.push(myObj);
                                                                    }
                                                                }
                                                                dbo.collection(switlover).updateOne(
                                                                    {_id: new ObjectId(result[0]["_id"])},
                                                                    {$set: {Phone_Number: arraydata}})
                                                                    .then((resa) => {
                                                                        if (resa["result"]["n"] == 1) {
                                                                            res.json({status: "1", message: "Success"});
                                                                        }
                                                                    }).catch((erra) => {
                                                                    res.json({
                                                                        status: "3",
                                                                        message: "Internal server error" + erra
                                                                    });
                                                                })
                                                            }).catch((errDel) => {
                                                                res.json({
                                                                    status: "3",
                                                                    message: "Internal server error" + errDel
                                                                });
                                                            })
                                                        })
                                                        .catch((updateErr) => {
                                                            res.json({
                                                                status: "3",
                                                                message: "Internal server error" + updateErr
                                                            });
                                                        })
                                                }).catch((err) => {
                                                    res.json({status: "3", message: "Internal server error" + err});
                                                })
                                            }
                                        }
                                    }
                                } else {
                                    //It has only one register number

                                    if (result[0]['Phone_Number'][0]['is_OverVerification'] == 1) {
                                        res.json({
                                            status: "7",
                                            type: "3",
                                            message: "Sorry this number is block for over verification. Please contact to our support team"
                                        });
                                        return;
                                    } else {
                                        var myObj = {
                                            Contry_Code: result[0]["Phone_Number"][0]["Contry_Code"],
                                            Number: result[0]["Phone_Number"][0]["Number"],
                                            Location: result[0]["Phone_Number"][0]["Location"],
                                            is_OverVerification: result[0]["Phone_Number"][0]["is_OverVerification"],
                                            Verified: result[0]["Phone_Number"][0]["Verified"]
                                        }

                                        //insert this my object at the place of current user
                                        var dataArray = dbo.collection(switlover).find({Auth_Token: Auth_Token}).toArray();
                                        dataArray.then((currentUserResult) => {
                                            var userPhone_Number = currentUserResult[0]["Phone_Number"];
                                            userPhone_Number.push(myObj);
                                            console.log(userPhone_Number);
                                            dbo.collection(switlover).updateOne(
                                                {Auth_Token: Auth_Token},
                                                {$set: {Phone_Number: userPhone_Number}})
                                                .then((updateResult) => {
                                                    //Delete this account permenantly with notification and all that
                                                    dbo.collection(switlover).removeOne({_id: new ObjectId(result[0]["_id"])}).then((dataresult) => {
                                                        console.log(dataresult);
                                                        dbo.collection(notification).removeOne({userID: new ObjectId(result[0]["_id"])}).then((data) => {
                                                            res.json({status: "1", message: "success"});
                                                        }).catch((dataerr) => {
                                                            res.json({status: "3", message: "Internal server error"});
                                                        })
                                                    }).catch((err) => {
                                                        res.json({status: 3, message: "Internal server error"});
                                                    })
                                                })
                                                .catch((updateErr) => {
                                                    res.json({status: "3", message: "Internal server error"});
                                                })
                                        }).catch((err) => {
                                            res.json({status: "3", message: "Internal server error"});
                                        })
                                    }
                                }
                            } else
                                res.json({status: "0", message: "User is not register yet"});
                        }).catch((err) => {
                            res.json({status: "3", message: "Internal server error"});
                        })
                    }
                }
            });
            //--------------------------------------------------------------------------------------------------------------

            //--------------------------------------------------------------------------------------------------------------
            //Restore User if deleted
            app.post('/api/Restore', (req, res) => {
                var Auth_Token = req.header('Auth_Token');
                if (!Auth_Token || Auth_Token == null) {
                    res.json({status: "6", message: "Auth token missing"});
                } else {
                    var dataArray = dbo.collection(switlover).find({Auth_Token: Auth_Token}).toArray();
                    dataArray.then((result) => {
                        if (!isEmpty(result)) {
                            if (result[0]["is_Deleted"] == 1) {
                                dbo.collection(switlover).updateOne(
                                    {Auth_Token: Auth_Token},
                                    {$set: {is_Deleted: 0, updatedAt: new Date()}}
                                ).then((updateresult) => {
                                    if (updateresult['result']['n'] == 1) {
                                        var updateData = dbo.collection(switlover).find({Auth_Token: Auth_Token}).toArray();
                                        updateData.then((updateDataResult) => {
                                            res.json({status: "1", message: "success", user_data: updateDataResult});
                                        }).catch((updateDateErr) => {
                                            res.json({status: "0", message: "err" + updateDateErr})
                                        })
                                    } else {
                                        res.json({status: "0", message: "err"})
                                    }
                                }).catch((updateerr) => {
                                    res.json({status: "0", message: "err" + updateerr})
                                })
                            }
                        }
                    })
                }
            })
            //--------------------------------------------------------------------------------------------------------------

            //--------------------------------------------------------------------------------------------------------------
            //Delete Account
            app.post('/api/DeleteUser', (req, res) => {
                var Auth_Token = req.header('Auth_Token');
                if (!Auth_Token || Auth_Token == null) {
                    res.json({status: "6", message: "Auth token missing"});
                } else {
                    var dataArray = dbo.collection(switlover).find({Auth_Token: Auth_Token}).toArray();
                    dataArray.then((result) => {
                        if (!isEmpty(result)) {
                            if (result[0]["is_Deleted"] == 1) {
                                res.json({status: "0", message: "User is already deleted"});
                            } else {
                                dbo.collection(switlover).updateOne(
                                    {Auth_Token: Auth_Token},
                                    {$set: {is_Deleted: 1, updatedAt: new Date()}}
                                ).then((updateresult) => {
                                    if (updateresult['result']['n'] == 1) {
                                        var updateData = dbo.collection(switlover).find({Auth_Token: Auth_Token}).toArray();
                                        updateData.then((updateDataResult) => {
                                            res.json({status: "1", message: "success"});
                                        }).catch((updateDateErr) => {
                                            res.json({status: "0", message: "err" + updateDateErr})
                                        })
                                    } else {
                                        res.json({status: "0", message: "err"})
                                    }
                                }).catch((updateerr) => {
                                    res.json({status: "0", message: "err" + updateerr})
                                })
                            }
                        }
                    }).catch((err) => {

                    })
                }
            })
            //--------------------------------------------------------------------------------------------------------------

            //--------------------------------------------------------------------------------------------------------------
            //Match Logic
            app.post('/api/match', (req, res) => {
                var Auth_Token = req.header('Auth_Token');
                if (!Auth_Token || Auth_Token == null) {
                    res.json({status: "6", message: "Auth token missing"});
                } else {
                    var dataArray = dbo.collection(switlover).find({
                        Auth_Token: Auth_Token,
                    }).toArray()

                    dataArray.then((result) => {

                        if (result[0]["is_Block"] == 0) {
                            var likeArraybyMe = result[0]['Like'];

                            for (var i = 0; i < likeArraybyMe.length; i++) {

                                var numberArray = dbo.collection(switlover).find({'Phone_Number.Number': '9714470952'}).toArray()
                                numberArray.then((idresult) => {
                                    var myObj1 = [];
                                    var myObj;
                                    if (!isEmpty(idresult)) {

                                        var username = idresult[0]['Username'];
                                        var name = username[username.length - 1];
                                        myObj = {
                                            id: idresult[0]['_id'],
                                            name: name,
                                            image: idresult[0]['Profile_Pic'],
                                            is_used: "false",
                                            createdAt: new Date()
                                        }

                                        myObj1.push(myObj);
                                        if (!isEmpty(myObj1)) {
                                            var finalObj = {
                                                currentUser: idresult[0]['_id'],
                                                follobackUser: myObj1
                                            }

                                            var dataArray = dbo.collection(match).find({}).toArray()
                                            dataArray.then((result) => {
                                                if (!isEmpty(result)) {

                                                    for (var j = 0; j < result.length; j++) {

                                                        for (var k = 0; k < result[j]["follobackUser"].length; k++) {
                                                            if (result[j]["follobackUser"][k]["name"] == name) {
                                                                res.json({status: "0", message: "Already matched user"});
                                                            } else {
                                                                dbo.collection(match).insertOne(finalObj, (err, result) => {
                                                                    if (err)
                                                                        res.json({
                                                                            status: "3",
                                                                            message: "Error while inserting records"
                                                                        });
                                                                    else {
                                                                        res.json({status: "1", message: "success"});
                                                                    }
                                                                })
                                                            }
                                                        }
                                                    }
                                                }
                                            }).catch((err) => {
                                                // res.json({status: "3", message: "1Internal server error"});
                                            })

                                        }
                                    } else {
                                        res.json({status: "0", message: "Sorry, No Contacts found that like you...!!!"})
                                    }
                                }).catch((error) => {
                                    res.json({status: "3", message: "2Internal server error"});
                                })
                            }
                        } else {
                            res.json({status: "7", message: "You have been blocked by Admin"})
                        }
                    }).catch((err) => {
                        res.json({status: "3", message: "3Internal server error"});
                    })
                }
            })
            //--------------------------------------------------------------------------------------------------------------

            //--------------------------------------------------------------------------------------------------------------
            //My Like
            app.post('/api/LikesUnlikes', (req, res) => {
                var Auth_Token = req.header('Auth_Token');
                if (!Auth_Token || Auth_Token == null) {
                    res.json({status: "6", message: "Auth token missing"});
                } else {
                    if (!req.body || isEmpty(req.body)) {
                        res.json({status: "4", message: "Parameter missing or Invalid"});
                    } else {
                        var number;
                        if ((req.body.number).includes(req.body.code)) {
                            number = req.body.number;
                        } else {
                            number = req.body.code + "" + req.body.number;
                        }

                        var isLiked1 = false;
                        var numberArray = [];
                        var dataArray = dbo.collection(switlover).find({
                            Auth_Token: Auth_Token
                        }).toArray();
                        dataArray.then((dataresult) => {
                            if (dataresult[0]['is_Block'] == 0) {
                                existingLikes = dataresult[0]['Like']
                                if (!isEmpty(existingLikes)) {
                                    for (var j = 0; j < existingLikes.length; j++) {
                                        if (existingLikes[j].length < 15) {
                                            if (existingLikes[j] == number) {
                                                isLiked1 = true;
                                            } else {
                                                numberArray.push(existingLikes[j])
                                            }
                                        } else {
                                            numberArray.push(existingLikes[j])
                                        }
                                    }
                                    if (!isLiked1) {
                                        numberArray.push(number);
                                    }
                                } else {
                                    numberArray.push(number)
                                }
                                dbo.collection(switlover).updateOne({
                                        Auth_Token: Auth_Token,
                                    },
                                    {
                                        $set: {Like: numberArray}
                                    }).then((resultdata) => {
                                    if (resultdata['result']['n'] == 1) {
                                        res.json({status: "1", message: "success"});
                                    } else {
                                        res.json({status: "3", message: "Internal server error"})
                                    }
                                }).catch((errdata) => {
                                    res.json({status: "3", message: "Internal server error"})
                                })
                            } else {
                                res.json({status: "7", message: "You have been blocked by Admin"})
                            }
                        }).catch((dataerror) => {

                        })
                    }
                }
            });
            //--------------------------------------------------------------------------------------------------------------

            //--------------------------------------------------------------------------------------------------------------
            //Contacts that like me
            app.post('/api/LikeBy', (req, res) => {
                var Auth_Token = req.header('Auth_Token');
                if (!Auth_Token || Auth_Token == null) {
                    res.json({status: "6", message: "Auth token missing"});
                } else {
                    var dataArray = dbo.collection(switlover).find({
                        Auth_Token: Auth_Token,
                    }).toArray()
                    dataArray.then((result) => {
                        if (result[0]["is_Block"] == 0) {
                            var userNumber;
                            for (var i = 0; i < result[0]["Phone_Number"].length; i++) {
                                userNumber = result[0]["Phone_Number"][i]["Contry_Code"] + "" + result[0]["Phone_Number"][i]["Number"];
                                var idArray = dbo.collection(switlover).find({
                                    Like: userNumber,
                                }).toArray()
                                var name;
                                idArray.then((idresult) => {
                                    if (!isEmpty(idresult)) {
                                        if (idresult[0]["is_Block"] == 0) {
                                            var myObj1 = [];
                                            for (var i = 0; i < idresult.length; i++) {
                                                var username = idresult[i]['Username'];
                                                name = username[username.length - 1]

                                                var myObj = {
                                                    id: idresult[i]['_id'],
                                                    name: name,
                                                    image: idresult[i]['Profile_Pic']
                                                }
                                                myObj1.push(myObj);
                                            }
                                            res.json({status: "1", message: "success", user_data: myObj1});
                                        } else {
                                            res.json({status: "7", message: "You have been blocked by Admin"})
                                        }
                                    } else {
                                        res.json({status: "0", message: "Sorry, No Contacts found that like you...!!!"})
                                    }
                                }).catch((iserr) => {
                                    res.json({status: "3", message: "Internal server error" + iserr});
                                })
                            }
                        } else {
                            res.json({status: "7", message: "You have been blocked by Admin"})
                        }
                    }).catch((err) => {
                        res.json({status: "3", message: "Internal server error" + err});
                    })
                }
            });
            //--------------------------------------------------------------------------------------------------------------

            //--------------------------------------------------------------------------------------------------------------
            //Login User
            app.post('/api/CheckLogin', (req, res) => {
                var Request_token = req.header('Request_token');
                if (!Request_token || Request_token == null) {
                    res.json({status: "5", message: "Request token missing"});
                } else {
                    if (!req.body.Contry_Code || req.body.Contry_Code == null && !req.body.Number || req.body.Number == null
                        && !req.body.Location || req.body.Location == null && !req.body.Verified || req.body.Verified == null) {
                        res.json({status: "4", message: "Parameter missing or Invalid"});
                    } else {
                        var token = randtoken.generate(64);
                        var dataArray = dbo.collection(switlover).find({
                            'Phone_Number.Contry_Code': req.body.Contry_Code,
                            'Phone_Number.Number': req.body.Number,
                            'Phone_Number.Location': req.body.Location,
                        }).toArray();
                        dataArray.then((result) => {
                            if (!isEmpty(result)) {
                                if (result[0]["is_Block"] == 0) {
                                    //User Exist
                                    dbo.collection(switlover).updateOne({
                                        'Phone_Number.Contry_Code': req.body.Contry_Code,
                                        'Phone_Number.Number': req.body.Number,
                                        'Phone_Number.Location': req.body.Location,
                                    }, {
                                        $set: {Request_token: Request_token, updatedAt: new Date()}
                                    }).then((dataresult) => {
                                        if (dataresult['result']['n'] == 1) {
                                            var dataArray = dbo.collection(switlover).find({
                                                Request_token: Request_token,
                                            }).toArray();
                                            dataArray.then((finalresult) => {
                                                if (finalresult[0]["is_Block"] == 0) {
                                                    delete finalresult[0].Contact_List;
                                                    delete finalresult[0].is_Block;
                                                    delete finalresult[0].is_Deleted;
                                                    delete finalresult[0].Contact_Not_Recognized;
                                                    delete finalresult[0].Add_New_Number_From_App;
                                                    delete finalresult[0].Contact_Remove_Ratio;
                                                    delete finalresult[0].Like;
                                                    delete finalresult[0].Match_Ratio;
                                                    delete finalresult[0].PowerID;
                                                    delete finalresult[0].Not_In_App_Purchase;
                                                    delete finalresult[0].language;
                                                    delete finalresult[0].Device;
                                                    delete finalresult[0].createdAt;
                                                    delete finalresult[0].updatedAt;
                                                    delete finalresult[0].deletedAt;
                                                    delete finalresult[0].is_Online;
                                                    res.json({
                                                        status: "1",
                                                        message: "User is available",
                                                        user_data: finalresult
                                                    });
                                                } else {
                                                    res.json({status: "7", message: "You have been blocked by Admin"})
                                                }
                                            }).catch((finalerr) => {
                                                res.json({status: "3", message: "Internal server error"});
                                            })
                                        } else {
                                            res.json({status: "3", message: "Internal server error"});
                                        }
                                    }).catch((catcherr) => {
                                        res.json({status: "3", message: "Internal Server error"});
                                    })
                                } else {
                                    res.json({status: "7", message: "You have been blocked by Admin"});
                                }
                            } else {
                                var myObj = {
                                    Request_token: Request_token,
                                    Auth_Token: token.toString(),
                                    Username: [],
                                    Phone_Number: [req.body],
                                    Email: {EmailAddress: "", Verified: "false"},
                                    Profile_Pic: "",
                                    Contact_List: [],
                                    Contact_Not_Recognized: 0,
                                    Add_New_Number_From_App: 0,
                                    Contact_Remove_Ratio: 0,
                                    Like: [],
                                    Match_Ratio: {
                                        Two_Out_2_Ratio: 0,
                                        One_Out_1_Ratio: 0,
                                        Anonymous_Chat_Ratio: 0,
                                    },
                                    Not_In_App_Purchase: 0,
                                    PowerID: {Power_Of_Match: 0, Power_Of_Time: 0, Golden_Power: 0},
                                    language: "en",
                                    Device: 0,
                                    is_Deleted: 0,
                                    is_Online: 0,
                                    is_Block: 0,
                                    createdAt: new Date(),
                                    updatedAt: new Date(),
                                    deletedAt: ""
                                };
                                dbo.collection(switlover).insertOne(myObj, (err, result) => {
                                    if (err)
                                        res.json({status: "3", message: "Error while inserting records"});
                                    else {
                                        var dataArray = dbo.collection(switlover).find({
                                            'Phone_Number.Contry_Code': req.body.Contry_Code,
                                            'Phone_Number.Number': req.body.Number,
                                            'Phone_Number.Location': req.body.Location,
                                        }).toArray();
                                        dataArray.then((dataresult) => {
                                            if (!isEmpty(dataresult)) {
                                                if (dataresult[0]["is_Block"] == 0) {
                                                    var dataNotification = dbo.collection(notification).find({userID: new ObjectId(dataresult[0]["_id"])}).toArray();
                                                    dataNotification.then((result) => {
                                                        if (isEmpty(result)) {
                                                            var myObj = {
                                                                userID: new ObjectId(dataresult[0]["_id"]),
                                                                matcheek: {
                                                                    play_sound_for_every_notification: 1,
                                                                    play_sound_for_every_message: 1,
                                                                    likes: 1,
                                                                    matches: 1,
                                                                    messages: 1,
                                                                    power_of_time: 1,
                                                                    promotions: 1
                                                                },
                                                                phone: {
                                                                    play_sound_for_every_notification: 1,
                                                                    play_sound_for_every_message: 1,
                                                                    likes: 1,
                                                                    matches: 1,
                                                                    messages: 1,
                                                                    power_of_time: 1,
                                                                    promotions: 1
                                                                },
                                                                email: {
                                                                    frequency: {
                                                                        every_notification: 0,
                                                                        twice_a_day: 0,
                                                                        once_a_day: 1,
                                                                        once_a_week: 0,
                                                                        once_a_month: 0
                                                                    },
                                                                    newsletter: 1,
                                                                    promotions: 1,
                                                                    likes: 1,
                                                                    matches: 1,
                                                                    messages: 1,
                                                                    power_of_time: 1
                                                                }
                                                            }
                                                            dbo.collection(notification).insertOne(myObj, (err, resu) => {
                                                                if (err)
                                                                    res.json({status: "3", message: "Inserting faild"});
                                                                else {
                                                                    delete dataresult[0].Contact_List;
                                                                    delete dataresult[0].is_Block;
                                                                    delete dataresult[0].is_Deleted;
                                                                    delete dataresult[0].Contact_Not_Recognized;
                                                                    delete dataresult[0].Add_New_Number_From_App;
                                                                    delete dataresult[0].Contact_Remove_Ratio;
                                                                    delete dataresult[0].Like;
                                                                    delete dataresult[0].Match_Ratio;
                                                                    delete dataresult[0].PowerID;
                                                                    delete dataresult[0].Not_In_App_Purchase;
                                                                    delete dataresult[0].language;
                                                                    delete dataresult[0].Device;
                                                                    delete dataresult[0].createdAt;
                                                                    delete dataresult[0].updatedAt;
                                                                    delete dataresult[0].deletedAt;
                                                                    delete dataresult[0].is_Online;
                                                                    res.json({
                                                                        status: "1",
                                                                        message: "success",
                                                                        user_data: dataresult
                                                                    });
                                                                }
                                                            });
                                                        }
                                                    }).catch((err) => {
                                                        res.json({status: "3", message: "Internal Server error"});
                                                    });
                                                } else {
                                                    res.json({status: "7", message: "You have been blocked by Admin"})
                                                }
                                            }
                                        });
                                    }
                                });
                            }
                        }).catch((err) => {
                            res.json({status: "3", message: "Internal server error"});
                        });
                    }

                }

            });
            //--------------------------------------------------------------------------------------------------------------

            //--------------------------------------------------------------------------------------------------------------
            //get Profile
            app.post('/api/GetProfile', (req, res) => {
                var Auth_Token = req.header('Auth_Token');
                if (!Auth_Token || Auth_Token == null) {
                    res.json({status: "6", message: "Auth token missing"});
                } else {
                    if (!req.body.userID || req.body.userID == null) {
                        var dataArray = dbo.collection(switlover).find({
                            Auth_Token: Auth_Token
                        }).toArray();
                        dataArray.then((result) => {
                            if (result[0]["is_Block"] == 0) {
                                var dataresult = result[0];
                                delete dataresult.Request_token;
                                delete dataresult.Auth_Token;
                                delete dataresult.Contact_List;
                                delete dataresult.is_Block;
                                delete dataresult.is_Deleted;
                                delete dataresult.Contact_Not_Recognized;
                                delete dataresult.Add_New_Number_From_App;
                                delete dataresult.Contact_Remove_Ratio;
                                delete dataresult.Like;
                                delete dataresult.Match_Ratio;
                                delete dataresult.PowerID;
                                delete dataresult.Not_In_App_Purchase;
                                delete dataresult.language;
                                delete dataresult.Device;
                                delete dataresult.createdAt;
                                delete dataresult.updatedAt;
                                delete dataresult.deletedAt;
                                delete dataresult.is_Online;
                                res.json({status: "1", message: "success", user_data: dataresult});
                            } else {
                                res.json({status: "7", message: "You have been blocked by Admin"});
                            }
                        }).catch((err) => {
                            res.json({status: "3", message: "Internal server error"});
                        });
                    } else {
                        var dataArray = dbo.collection(switlover).find({
                            _id: new ObjectId(req.body.userID)
                        }).toArray();
                        dataArray.then((result) => {
                            if (result[0]["is_Block"] == 0) {
                                var dataresult = result[0];
                                delete dataresult.Request_token;
                                delete dataresult.Auth_Token;
                                delete dataresult.Contact_List;
                                delete dataresult.is_Block;
                                delete dataresult.is_Deleted;
                                delete dataresult.Contact_Not_Recognized;
                                delete dataresult.Add_New_Number_From_App;
                                delete dataresult.Contact_Remove_Ratio;
                                delete dataresult.Like;
                                delete dataresult.Match_Ratio;
                                delete dataresult.PowerID;
                                delete dataresult.Not_In_App_Purchase;
                                delete dataresult.language;
                                delete dataresult.Device;
                                delete dataresult.createdAt;
                                delete dataresult.updatedAt;
                                delete dataresult.deletedAt;
                                delete dataresult.is_Online;
                                res.json({status: "1", message: "success", user_data: dataresult});
                            } else {
                                res.json({status: "7", message: "You have been blocked by Admin"});
                            }
                        }).catch((err) => {
                            res.json({status: "3", message: "Internal server error"});
                        })
                    }
                }
            });
            //--------------------------------------------------------------------------------------------------------------

            //--------------------------------------------------------------------------------------------------------------
            //Get contacts for Like
            app.post('/api/GetContactsForLike', (req, res) => {
                var Auth_Token = req.header('Auth_Token');
                if (!Auth_Token || Auth_Token == null) {
                    res.json({status: "6", message: "Auth token missing"});
                } else {
                    if (!req.body.perpage || req.body.perpage == null && !req.body.page || req.body.page == null) {
                        res.json({status: "4", message: "Parameter missing or Invalid"});
                    } else {
                        var perPage = req.body.perpage;
                        var page = req.body.page;

                        var dataArray = dbo.collection(switlover).find({
                            Auth_Token: Auth_Token
                        }).toArray();
                        dataArray.then((data) => {
                            if (!isEmpty(data)) {
                                if (data[0]["is_Block"] == 0) {
                                    if (!isEmpty(data[0]['Contact_List'])) {
                                        var numberArray = [];
                                        for (var i = 0; i < (data[0]['Contact_List']).length; i++) {
                                            for (var j = 0; j < (data[0]['Contact_List'][i]['number']).length; j++) {
                                                var number;
                                                var myObj;
                                                if ((data[0]['Contact_List'][i]['number'][j]['number']).includes(data[0]['Contact_List'][i]['number'][j]['code'])) {
                                                    number = data[0]['Contact_List'][i]['number'][j]['number'];
                                                } else {
                                                    number = data[0]['Contact_List'][i]['number'][j]['code'] + "" + data[0]['Contact_List'][i]['number'][j]['number'];
                                                }
                                                var myLikesArray = data[0]['Like'];
                                                if (!isEmpty(myLikesArray)) {
                                                    for (var j = 0; j < myLikesArray.length; j++) {
                                                        if (myLikesArray[j].length < 15) {
                                                            if (myLikesArray[j] == number) {
                                                                myObj = {
                                                                    name: data[0]['Contact_List'][i]['name'],
                                                                    image: data[0]['Contact_List'][i]['image'],
                                                                    code: data[0]['Contact_List'][i]['number'][j]['code'],
                                                                    number: data[0]['Contact_List'][i]['number'][j]['number'],
                                                                    isRemovedByAdmin: data[0]['Contact_List'][i]['number'][j]['isRemovedByAdmin'],
                                                                    isRemovedByUser: data[0]['Contact_List'][i]['number'][j]['isRemovedByUser'],
                                                                    isLiked: 1
                                                                };
                                                                break;
                                                            } else {
                                                                myObj = {
                                                                    name: data[0]['Contact_List'][i]['name'],
                                                                    image: data[0]['Contact_List'][i]['image'],
                                                                    code: data[0]['Contact_List'][i]['number'][j]['code'],
                                                                    number: data[0]['Contact_List'][i]['number'][j]['number'],
                                                                    isRemovedByAdmin: data[0]['Contact_List'][i]['number'][j]['isRemovedByAdmin'],
                                                                    isRemovedByUser: data[0]['Contact_List'][i]['number'][j]['isRemovedByUser'],
                                                                    isLiked: 0
                                                                };
                                                            }
                                                        }
                                                    }
                                                } else {
                                                    myObj = {
                                                        name: data[0]['Contact_List'][i]['name'],
                                                        image: data[0]['Contact_List'][i]['image'],
                                                        code: data[0]['Contact_List'][i]['number'][j]['code'],
                                                        number: data[0]['Contact_List'][i]['number'][j]['number'],
                                                        isRemovedByAdmin: data[0]['Contact_List'][i]['number'][j]['isRemovedByAdmin'],
                                                        isRemovedByUser: data[0]['Contact_List'][i]['number'][j]['isRemovedByUser'],
                                                        isLiked: 0
                                                    };
                                                }
                                                numberArray.push(myObj);
                                            }
                                        }
                                        res.json({
                                            status: "1",
                                            message: "Contact List",
                                            userdata: paginate(numberArray, perPage, page)
                                        });
                                    } else {
                                        res.json({status: "0", message: "Please sync your contact first"});
                                    }
                                } else {
                                    res.json({status: "7", message: "You have been blocked by Admin"});
                                }
                            }
                        }).catch((err) => {
                            res.json({status: "3", message: "Internal Server error" + err});
                        })
                    }
                }
            });
            //--------------------------------------------------------------------------------------------------------------

            //--------------------------------------------------------------------------------------------------------------
            //Get contacts for Like
            app.post('/api/GetMyLikes', (req, res) => {
                var Auth_Token = req.header('Auth_Token');
                if (!Auth_Token || Auth_Token == null) {
                    res.json({status: "6", message: "Auth token missing"});
                } else {
                    var dataArray = dbo.collection(switlover).find({
                        Auth_Token: Auth_Token,
                    }).toArray();
                    dataArray.then((data) => {
                        if (!isEmpty(data)) {
                            if (data[0]["is_Block"] == 0) {
                                if (!isEmpty(data[0]['Contact_List'])) {
                                    var numberArray = [];
                                    for (var i = 0; i < (data[0]['Contact_List']).length; i++) {
                                        for (var j = 0; j < (data[0]['Contact_List'][i]['number']).length; j++) {
                                            if (data[0]['Contact_List'][i]['number'][j]['isRemovedByAdmin'] == 0 && data[0]['Contact_List'][i]['number'][j]['isRemovedByUser'] == 0) {
                                                var number;
                                                var myObj;
                                                if ((data[0]['Contact_List'][i]['number'][j]['number']).includes(data[0]['Contact_List'][i]['number'][j]['code'])) {
                                                    number = data[0]['Contact_List'][i]['number'][j]['number'];
                                                } else {
                                                    number = data[0]['Contact_List'][i]['number'][j]['code'] + "" + data[0]['Contact_List'][i]['number'][j]['number'];
                                                }

                                                var myLikesArray = data[0]['Like'];

                                                if (!isEmpty(myLikesArray)) {
                                                    for (var j = 0; j < myLikesArray.length; j++) {
                                                        if (myLikesArray[j] == number) {
                                                            myObj = {
                                                                name: data[0]['Contact_List'][i]['name'],
                                                                image: data[0]['Contact_List'][i]['image'],
                                                                code: data[0]['Contact_List'][i]['number'][j]['code'],
                                                                number: data[0]['Contact_List'][i]['number'][j]['number'],
                                                                isLiked: 1
                                                            };
                                                            numberArray.push(myObj);
                                                            break;
                                                        }
                                                    }
                                                } else {
                                                    res.json({status: "1", message: "Sorry there is no likes to display"});
                                                }
                                            }
                                        }
                                    }
                                    res.json({status: "1", message: "Contact List", userdata: numberArray});
                                } else {
                                    res.json({status: "0", message: "Please sync your contact first"});
                                }
                            } else {
                                res.json({status: "7", message: "You have been blocked by Admin"});
                            }
                        } else {
                            res.json({status: "1", message: "Sorry there is no likes to display"});
                        }
                    }).catch((err) => {
                        res.json({status: "3", message: "Internal Server error" + err});
                    })
                }
            });
            //--------------------------------------------------------------------------------------------------------------

            //--------------------------------------------------------------------------------------------------------------
            //In-app Purchase setting
            app.post('/api/In-appPurchaseSetting', (req, res) => {
                var Auth_Token = req.header('Auth_Token');
                if (!Auth_Token || Auth_Token == null) {
                    res.json({status: "6", message: "Auth token missing"});
                } else {
                    var dataArray = dbo.collection(switlover).find({
                        Auth_Token: Auth_Token,

                    }).toArray();
                    dataArray.then((result) => {
                        if (!isEmpty(result)) {
                            if (result[0]["is_Block"] == 0) {
                                dbo.collection(switlover).updateOne(
                                    {
                                        Auth_Token: Auth_Token
                                    },
                                    {
                                        $set: {
                                            'PowerID.Power_Of_Match': req.body.match,
                                            'PowerID.Power_Of_Time': req.body.time,
                                            'PowerID.Golden_Power': req.body.golden,
                                            updatedAt: new Date()
                                        }
                                    }).then((data) => {
                                    if (data['result']['n'] == 1) {
                                        res.json({status: "1", message: "success"});
                                    } else {
                                        res.json({status: "3", message: "error"});
                                    }
                                });
                            } else {
                                res.json({status: "7", message: "You have been blocked by Admin"});
                            }
                        }
                    }).catch((err) => {
                    })
                }
            })
            //--------------------------------------------------------------------------------------------------------------

            //--------------------------------------------------------------------------------------------------------------
            //Update Profile - after login first time
            app.post('/api/UpdateProfile', (req, res) => {
                var Auth_Token = req.header('Auth_Token');
                if (!Auth_Token || Auth_Token == null) {
                    res.json({status: "6", message: "Auth token missing"});
                } else {
                    if (!req.body || req.body == null) {
                        res.json({status: "4", message: "Parameter missing or Invalid"});
                    } else {
                        var dataArray = dbo.collection(switlover).find({
                            Auth_Token: Auth_Token,
                        }).toArray();
                        dataArray.then((result) => {
                            if (isEmpty(result)) {
                                res.json({status: "0", message: "User not found"});
                            } else {
                                if (result[0]["is_Block"] == 0) {
                                    var currentEmail = result[0]['Email']['EmailAddress'];
                                    console.log(currentEmail);


                                    var UsernameArray = [];
                                    UsernameArray = result[0]['Username'];

                                    if (UsernameArray != null || !isEmpty(UsernameArray) || UsernameArray != "" || UsernameArray != "null") {
                                        var existUser = UsernameArray[UsernameArray.length - 1];
                                        var newUsername = req.body.Username;
                                        if (newUsername != existUser) {
                                            UsernameArray.push(req.body.Username);
                                        }
                                    } else {
                                        UsernameArray.push(req.body.Username);
                                    }

                                    var arrayContact = [];
                                    var isAvailable;
                                    arrayContact = result[0]['Phone_Number'];
                                    if (arrayContact != null || !isEmpty(arrayContact)) {
                                        for (var i = 0; i < arrayContact.length; i++) {
                                            if (arrayContact[i]['Number'] == req.body.Number && arrayContact[i]['Contry_Code'] == req.body.Contry_Code
                                                && arrayContact[i]['Location'] == req.body.Location) {
                                                isAvailable = true;
                                                break;
                                            } else {
                                                isAvailable = false;
                                            }
                                        }
                                        if (!isAvailable) {
                                            var myObj = {
                                                Contry_Code: req.body.Contry_Code,
                                                Number: req.body.Number,
                                                Location: req.body.Location,
                                                Verified: req.body.Verified,
                                                is_OverVerification: 0
                                            };
                                            arrayContact.push(myObj);
                                        }
                                    }

                                    if (req.body.Contry_Code && req.body.Contry_Code != null && req.body.Number && req.body.Number != null
                                        && req.body.Location && req.body.Location != null && req.body.Verified && req.body.Verified != null
                                        && req.body.Username != null && req.body.Username && req.body.Email_Address != null && req.body.Email_Address) {
                                        if (currentEmail == req.body.Email_Address) {
                                            dbo.collection(switlover).updateOne(
                                                {
                                                    Auth_Token: Auth_Token
                                                },
                                                {
                                                    $set: {
                                                        Username: UsernameArray,
                                                        Phone_Number: arrayContact,
                                                        updatedAt: new Date()
                                                    }
                                                }).then((data) => {
                                                if (data['result']['n'] == 1) {
                                                    res.json({status: "1", message: "Profile updated successfully"});
                                                } else {
                                                    res.json({status: "3", message: "Profile updation field"});
                                                }
                                            });
                                        } else {
                                            dbo.collection(switlover).updateOne(
                                                {
                                                    Auth_Token: Auth_Token
                                                },
                                                {
                                                    $set: {
                                                        Email: {EmailAddress: req.body.Email_Address, Verified: 'false'},
                                                        Username: UsernameArray,
                                                        Phone_Number: arrayContact,
                                                        updatedAt: new Date()
                                                    }
                                                }).then((data) => {
                                                if (data['result']['n'] == 1) {
                                                    request('http://' + req.get('host') + '/api/EmailVerification?Email=' + req.body.Email_Address + '', (apierr, response) => {
                                                        if (!apierr) {
                                                            res.json({
                                                                status: "7",
                                                                message: "Please check your inbox for the verification mail send from the SwitLover"
                                                            });
                                                        } else {
                                                            res.json({status: "3", message: "Mail sending faild"});
                                                        }
                                                    })
                                                } else {
                                                    res.json({status: "3", message: "Profile updation field"});
                                                }
                                            });
                                        }
                                    } else if (req.body.Username != null && req.body.Username && req.body.Email_Address != null && req.body.Email_Address) {
                                        if (currentEmail == req.body.Email_Address) {
                                            dbo.collection(switlover).updateOne(
                                                {
                                                    Auth_Token: Auth_Token
                                                },
                                                {
                                                    $set: {
                                                        Username: UsernameArray,
                                                        updatedAt: new Date()
                                                    }
                                                }).then((data) => {
                                                if (data['result']['n'] == 1) {
                                                    res.json({status: "1", message: "Profile updated successfully"});
                                                } else {
                                                    res.json({status: "3", message: "Profile updation field"});
                                                }
                                            });
                                        } else {
                                            dbo.collection(switlover).updateOne(
                                                {
                                                    Auth_Token: Auth_Token
                                                },
                                                {
                                                    $set: {
                                                        Email: {EmailAddress: req.body.Email_Address, Verified: 'false'},
                                                        Username: UsernameArray,
                                                        updatedAt: new Date()
                                                    }
                                                }).then((data) => {
                                                if (data['result']['n'] == 1) {
                                                    request('http://' + req.get('host') + '/api/EmailVerification?Email=' + req.body.Email_Address + '', (apierr, response) => {
                                                        if (!apierr) {
                                                            res.json({
                                                                status: "7",
                                                                message: "Please check your inbox for the verification mail send from the SwitLover"
                                                            });
                                                        } else {
                                                            res.json({status: "3", message: "Mail sending faild"});
                                                        }
                                                    })
                                                } else {
                                                    res.json({status: "3", message: "Profile updation field"});
                                                }
                                            });
                                        }
                                    } else if (req.body.Username != null && req.body.Username) {

                                        dbo.collection(switlover).updateOne(
                                            {
                                                Auth_Token: Auth_Token
                                            },
                                            {
                                                $set: {Username: UsernameArray, updatedAt: new Date()}
                                            }).then((data) => {
                                            console.log(data);
                                            if (data['result']['n'] == 1) {
                                                res.json({status: "1", message: "Profile updated successfully"});
                                            } else {
                                                res.json({status: "3", message: "Profile updation field"});
                                            }
                                        }).catch((error) => {
                                            res.json({status: "0", message: "Profile not found"});
                                        })

                                    } else if (req.body.Email_Address != null && req.body.Email_Address) {
                                        if (currentEmail == req.body.Email_Address) {
                                            dbo.collection(switlover).updateOne(
                                                {
                                                    Auth_Token: Auth_Token
                                                },
                                                {
                                                    $set: {
                                                        updatedAt: new Date()
                                                    }
                                                }).then((data) => {
                                                if (data['result']['n'] == 1) {
                                                    res.json({status: "1", message: "Profile updated successfully"});
                                                } else {
                                                    res.json({status: "3", message: "Profile updation field"});
                                                }
                                            });
                                        } else {
                                            dbo.collection(switlover).updateOne(
                                                {
                                                    Auth_Token: Auth_Token
                                                },
                                                {
                                                    $set: {
                                                        Email: {EmailAddress: req.body.Email_Address, Verified: 'false'},
                                                        updatedAt: new Date()
                                                    }
                                                }).then((data) => {
                                                if (data['result']['n'] == 1) {
                                                    request('http://' + req.get('host') + '/api/EmailVerification?Email=' + req.body.Email_Address + '', (apierr, response) => {
                                                        if (!apierr) {
                                                            res.json({
                                                                status: "7",
                                                                message: "Please check your inbox for the verification mail send from the SwitLover"
                                                            });
                                                        } else {
                                                            res.json({status: "3", message: "Mail sending faild"});
                                                        }
                                                    })
                                                } else {
                                                    res.json({status: "3", message: "Profile updation field"});
                                                }
                                            });
                                        }

                                    } else if (req.body.Contry_Code && req.body.Contry_Code != null && req.body.Number && req.body.Number != null
                                        && req.body.Location && req.body.Location != null && req.body.Verified && req.body.Verified != null) {

                                        dbo.collection(switlover).updateOne({
                                            Auth_Token: Auth_Token,
                                            is_Block: {$ne: 1}
                                        }, {
                                            $set: {Phone_Number: arrayContact, updatedAt: new Date()}
                                        }).then((dataresult) => {
                                            if (dataresult['result']['n'] == 1) {
                                                var dataArray = dbo.collection(switlover).find({
                                                    Auth_Token: Auth_Token,
                                                }).toArray();
                                                dataArray.then((finalresult) => {
                                                    if (finalresult[0]["is_Block"] == 0) {
                                                        res.json({
                                                            status: "1",
                                                            message: "Profile updated successfully",
                                                            user_data: finalresult
                                                        });
                                                    } else {
                                                        res.json({status: "7", message: "You have been blocked by Admin"});
                                                    }
                                                }).catch((finalerr) => {
                                                    res.json({status: "3", message: "1Internal server error"});
                                                })
                                            } else {
                                                res.json({status: "3", message: "2Internal server error"});
                                            }
                                        }).catch((catcherr) => {
                                            res.json({status: "3", message: "3Internal Server error"});
                                        });
                                    }
                                } else {
                                    res.json({status: "7", message: "You have been blocked by Admin"});
                                }
                            }
                        }).catch((err) => {
                            res.json({status: "3", message: "4Internal server error" + err});
                        });
                    }
                }
            });
            //--------------------------------------------------------------------------------------------------------------

            //--------------------------------------------------------------------------------------------------------------
            //EditProfile
            app.post('/api/EditProfile', (req, res) => {
                var Auth_Token = req.header('Auth_Token');
                if (!Auth_Token || Auth_Token == null) {
                    res.json({status: "6", message: "Auth token missing"});
                } else {
                    if (!req.body || req.body == null) {
                        res.json({status: "4", message: "Parameter missing or Invalid"});
                    } else {
                        var dataArray = dbo.collection(switlover).find({
                            Auth_Token: Auth_Token,
                        }).toArray();
                        dataArray.then((result) => {
                            if (isEmpty(result)) {
                                res.json({status: "0", message: "User not found"});
                            } else {
                                if (result[0]["is_Block"] == 0) {
                                    var currentEmail = result[0]['Email']['EmailAddress'];

                                    var UsernameArray = [];
                                    UsernameArray = result[0]['Username'];

                                    if (!isEmpty(UsernameArray)) {
                                        var existUser = UsernameArray[UsernameArray.length - 1];
                                        var newUsername = req.body.Username;
                                        if (newUsername != existUser) {
                                            UsernameArray.push(req.body.Username);
                                        }
                                    } else {
                                        UsernameArray.push(req.body.Username);
                                    }

                                    var arrayContact = req.body.number;
                                    var jsonObject = JSON.parse(arrayContact);
                                    console.log("Number direct : " + req.body.number);
                                    console.log("Number after JSON parse : " + jsonObject);

                                    if (req.body.Username != null && req.body.Username && req.body.Email_Address != null && req.body.Email_Address && !isEmpty(arrayContact)) {
                                        if (currentEmail == req.body.Email_Address) {
                                            dbo.collection(switlover).updateOne(
                                                {
                                                    Auth_Token: Auth_Token
                                                },
                                                {
                                                    $set: {
                                                        Username: UsernameArray,
                                                        Phone_Number: arrayContact,
                                                        updatedAt: new Date()
                                                    }
                                                }).then((data) => {
                                                if (data['result']['n'] == 1) {
                                                    res.json({status: "1", message: "Profile updated successfully"});
                                                } else {
                                                    res.json({status: "3", message: "Profile updation field"});
                                                }
                                            });
                                        } else {
                                            dbo.collection(switlover).updateOne(
                                                {
                                                    Auth_Token: Auth_Token
                                                },
                                                {
                                                    $set: {
                                                        Email: {EmailAddress: req.body.Email_Address, Verified: 'false'},
                                                        Username: UsernameArray,
                                                        Phone_Number: arrayContact,
                                                        updatedAt: new Date()
                                                    }
                                                }).then((data) => {
                                                if (data['result']['n'] == 1) {
                                                    request('http://' + req.get('host') + '/api/EmailVerification?Email=' + req.body.Email_Address + '', (apierr, response) => {
                                                        if (!apierr) {
                                                            res.json({
                                                                status: "7",
                                                                message: "Please check your inbox for the verification mail send from the SwitLover"
                                                            });
                                                        } else {
                                                            res.json({status: "3", message: "Mail sending faild"});
                                                        }
                                                    })
                                                } else {
                                                    res.json({status: "3", message: "Profile updation field"});
                                                }
                                            });
                                        }
                                    } else if (req.body.Username != null && req.body.Username && req.body.Email_Address != null && req.body.Email_Address) {
                                        if (currentEmail == req.body.Email_Address) {
                                            dbo.collection(switlover).updateOne(
                                                {
                                                    Auth_Token: Auth_Token
                                                },
                                                {
                                                    $set: {
                                                        Username: UsernameArray,
                                                        updatedAt: new Date()
                                                    }
                                                }).then((data) => {
                                                if (data['result']['n'] == 1) {
                                                    res.json({status: "1", message: "Profile updated successfully"});
                                                } else {
                                                    res.json({status: "3", message: "Profile updation field"});
                                                }
                                            });
                                        } else {
                                            dbo.collection(switlover).updateOne(
                                                {
                                                    Auth_Token: Auth_Token
                                                },
                                                {
                                                    $set: {
                                                        Email: {EmailAddress: req.body.Email_Address, Verified: 'false'},
                                                        Username: UsernameArray,
                                                        updatedAt: new Date()
                                                    }
                                                }).then((data) => {
                                                if (data['result']['n'] == 1) {
                                                    request('http://' + req.get('host') + '/api/EmailVerification?Email=' + req.body.Email_Address + '', (apierr, response) => {
                                                        if (!apierr) {
                                                            res.json({
                                                                status: "7",
                                                                message: "Please check your inbox for the verification mail send from the SwitLover"
                                                            });
                                                        } else {
                                                            res.json({status: "3", message: "Mail sending faild"});
                                                        }
                                                    })
                                                } else {
                                                    res.json({status: "3", message: "Profile updation field"});
                                                }
                                            });
                                        }
                                    } else if (req.body.Username != null && req.body.Username && !isEmpty(arrayContact)) {
                                        dbo.collection(switlover).updateOne(
                                            {
                                                Auth_Token: Auth_Token
                                            },
                                            {
                                                $set: {
                                                    Username: UsernameArray,
                                                    Phone_Number: arrayContact,
                                                    updatedAt: new Date()
                                                }
                                            }).then((data) => {
                                            if (data['result']['n'] == 1) {
                                                res.json({status: "1", message: "Profile updated successfully"});
                                            } else {
                                                res.json({status: "3", message: "Profile updation field"});
                                            }
                                        });
                                    } else if (req.body.Username != null && req.body.Username) {

                                        dbo.collection(switlover).updateOne(
                                            {
                                                Auth_Token: Auth_Token
                                            },
                                            {
                                                $set: {Username: UsernameArray, updatedAt: new Date()}
                                            }).then((data) => {
                                            console.log(data);
                                            if (data['result']['n'] == 1) {
                                                res.json({status: "1", message: "Profile updated successfully"});
                                            } else {
                                                res.json({status: "3", message: "Profile updation field"});
                                            }
                                        }).catch((error) => {
                                            res.json({status: "0", message: "Profile not found"});
                                        })

                                    } else if (req.body.Email_Address != null && req.body.Email_Address) {
                                        if (currentEmail == req.body.Email_Address) {
                                            dbo.collection(switlover).updateOne(
                                                {
                                                    Auth_Token: Auth_Token
                                                },
                                                {
                                                    $set: {
                                                        updatedAt: new Date()
                                                    }
                                                }).then((data) => {
                                                if (data['result']['n'] == 1) {
                                                    res.json({status: "1", message: "Profile updated successfully"});
                                                } else {
                                                    res.json({status: "3", message: "Profile updation field"});
                                                }
                                            });
                                        } else {
                                            dbo.collection(switlover).updateOne(
                                                {
                                                    Auth_Token: Auth_Token
                                                },
                                                {
                                                    $set: {
                                                        Email: {EmailAddress: req.body.Email_Address, Verified: 'false'},
                                                        updatedAt: new Date()
                                                    }
                                                }).then((data) => {
                                                if (data['result']['n'] == 1) {
                                                    request('http://' + req.get('host') + '/api/EmailVerification?Email=' + req.body.Email_Address + '', (apierr, response) => {
                                                        if (!apierr) {
                                                            res.json({
                                                                status: "7",
                                                                message: "Please check your inbox for the verification mail send from the SwitLover"
                                                            });
                                                        } else {
                                                            res.json({status: "3", message: "Mail sending faild"});
                                                        }
                                                    })
                                                } else {
                                                    res.json({status: "3", message: "Profile updation field"});
                                                }
                                            });
                                        }

                                    } else if (!isEmpty(arrayContact)) {

                                        dbo.collection(switlover).updateOne({
                                            Auth_Token: Auth_Token,
                                            is_Block: {$ne: 1}
                                        }, {
                                            $set: {Phone_Number: arrayContact, updatedAt: new Date()}
                                        }).then((dataresult) => {
                                            if (dataresult['result']['n'] == 1) {
                                                var dataArray = dbo.collection(switlover).find({
                                                    Auth_Token: Auth_Token,
                                                }).toArray();
                                                dataArray.then((finalresult) => {
                                                    if (finalresult[0]["is_Block"] == 0) {
                                                        res.json({
                                                            status: "1",
                                                            message: "Profile updated successfully"
                                                        });
                                                    } else {
                                                        res.json({status: "7", message: "You have been blocked by Admin"});
                                                    }
                                                }).catch((finalerr) => {
                                                    res.json({status: "3", message: "1Internal server error"});
                                                })
                                            } else {
                                                res.json({status: "3", message: "2Internal server error"});
                                            }
                                        }).catch((catcherr) => {
                                            res.json({status: "3", message: "3Internal Server error"});
                                        });
                                    }
                                } else {
                                    res.json({status: "7", message: "You have been blocked by Admin"});
                                }
                            }
                        }).catch((err) => {
                            res.json({status: "3", message: "4Internal server error" + err});
                        });
                    }
                }
            });
            //--------------------------------------------------------------------------------------------------------------

            //--------------------------------------------------------------------------------------------------------------
            //OTP Verification
            app.post('/api/OverVerification', (req, res) => {
                var Auth_Token = req.header('Auth_Token');
                if (!Auth_Token || Auth_Token == null) {
                    res.json({status: "6", message: "Auth token missing"});
                } else {
                    dbo.collection(switlover).updateOne(
                        {
                            Auth_Token: Auth_Token,
                            'Phone_Number.Number': req.body.number,
                            'Phone_Number.Contry_Code': req.body.code
                        },
                        {
                            $set: {'Phone_Number.$.is_OverVerification': 1, updatedAt: new Date()}
                        }
                    ).then((result) => {
                        if (result['result']['n'] == 1) {
                            res.json({status: "1", message: "Your phone number is cross the limit of verification"});
                        } else {
                            res.json({status: "3", message: "Internal Server error"});
                        }

                    }).catch((err) => {
                        res.json({status: "3", message: "Internal Server error"});
                    })
                }
            });
            //--------------------------------------------------------------------------------------------------------------

            //--------------------------------------------------------------------------------------------------------------
            //Get Contact List
            app.post('/api/GetContactList', (req, res) => {
                var Auth_Token = req.header('Auth_Token');
                if (!Auth_Token || Auth_Token == null) {
                    res.json({status: "6", message: "Auth token missing"});
                } else {
                    var dataArray = dbo.collection(switlover).find({
                        Auth_Token: Auth_Token
                    }).toArray();
                    dataArray.then((data) => {
                        if (!isEmpty(data[0]['Contact_List'])) {
                            if (data[0]["is_Block"] == 0) {
                                res.json({status: "1", message: "Contact List", user_data: data[0]['Contact_List']});
                            } else {
                                res.json({status: "7", message: "You have been blocked by Admin"});
                            }
                        } else {
                            res.json({
                                status: "0",
                                message: "Contact_List is not available",
                                user_data: data[0]['Contact_List']
                            });
                        }

                    }).catch((err) => {
                        res.json({status: "3", message: "Internal Server error"});
                    })
                }
            });
            //--------------------------------------------------------------------------------------------------------------

            //--------------------------------------------------------------------------------------------------------------
            //Set Contact List
            app.post('/api/ContactList', (req, res) => {
                var Auth_Token = req.header('Auth_Token');
                if (!Auth_Token || Auth_Token == null) {
                    res.json({status: "6", message: "Auth token missing"});
                } else {
                    if (!req.body.Contact_List || req.body.Contact_List == null) {
                        res.json({status: "4", message: "Parameter missing or Invalid"});
                    } else {
                        var stringdata = req.body.Contact_List;
                        var jsonObj;

                        if (stringdata == "[]" || stringdata == "") {

                        } else {
                            jsonObj = JSON.parse(stringdata);
                        }

                        dbo.collection(switlover).updateOne(
                            {
                                Auth_Token: Auth_Token
                            },
                            {
                                $set: {Contact_List: jsonObj, updatedAt: new Date()}
                            }).then((result) => {
                            if (result['result']['n'] == 1) {
                                res.json({status: "1", message: "Contact list updated successfully"});
                            } else {
                                res.json({status: "3", message: "Contact list updation failed"});
                            }
                        }).catch((err) => {
                            res.json({status: "3", message: "Internal Server error"});
                        });
                    }

                }

            });
            //--------------------------------------------------------------------------------------------------------------

            //--------------------------------------------------------------------------------------------------------------
            //Get Notification Settings
            app.post('/api/GetNotificationSettings', (req, res) => {
                var Auth_Token = req.header('Auth_Token');
                if (!Auth_Token || Auth_Token == null) {
                    res.json({status: "6", message: "Auth token missing"});
                } else {
                    var dataNotification = dbo.collection(notification).find({userID: new ObjectId(req.body.userID)}).toArray();
                    dataNotification.then((result) => {
                        if (isEmpty(result)) {
                            res.json({status: "0", message: "No notification settings found"});
                        } else {
                            var dataresult = result[0];
                            delete dataresult._id;
                            delete dataresult.userID;
                            res.json({status: "1", message: "success", user_data: result});
                        }
                    }).catch((err) => {
                        res.json({status: "3 ", message: "notification updated failed"});
                    });
                }
            });
            //--------------------------------------------------------------------------------------------------------------

            //--------------------------------------------------------------------------------------------------------------
            //Set Notification Settings
            app.post('/api/SetNotificationSettings', (req, res) => {
                var Auth_Token = req.header('Auth_Token');
                if (!Auth_Token || Auth_Token == null) {
                    res.json({status: "6", message: "Auth token missing"});
                } else {
                    var dataNotification = dbo.collection(notification).find({userID: new ObjectId(req.body.data["userID"])}).toArray();
                    dataNotification.then((result) => {
                        if (isEmpty(result)) {
                            var myObj = {
                                userID: new ObjectId(req.body.data["userID"]),
                                matcheek: {
                                    play_sound_for_every_notification: req.body.data["matcheek"]["play_sound_for_every_notification"],
                                    play_sound_for_every_message: req.body.data["matcheek"]["play_sound_for_every_message"],
                                    likes: req.body.data["matcheek"]["likes"],
                                    matches: req.body.data["matcheek"]["matches"],
                                    messages: req.body.data["matcheek"]["messages"],
                                    power_of_time: req.body.data["matcheek"]["power_of_time"],
                                    promotions: req.body.data["matcheek"]["promotions"]
                                },
                                phone: {
                                    play_sound_for_every_notification: req.body.data["phone"]["play_sound_for_every_notification"],
                                    play_sound_for_every_message: req.body.data["phone"]["play_sound_for_every_message"],
                                    likes: req.body.data["phone"]["likes"],
                                    matches: req.body.data["phone"]["matches"],
                                    messages: req.body.data["phone"]["messages"],
                                    power_of_time: req.body.data["phone"]["power_of_time"],
                                    promotions: req.body.data["phone"]["promotions"]
                                },
                                email: {
                                    frequency: {
                                        every_notification: req.body.data["email"]["frequency"]["every_notification"],
                                        twice_a_day: req.body.data["email"]["frequency"]["twice_a_day"],
                                        once_a_day: req.body.data["email"]["frequency"]["once_a_day"],
                                        once_a_week: req.body.data["email"]["frequency"]["once_a_week"],
                                        once_a_month: req.body.data["email"]["frequency"]["once_a_month"]
                                    },
                                    newsletter: req.body.data["email"]["newsletter"],
                                    promotions: req.body.data["email"]["promotions"],
                                    likes: req.body.data["email"]["likes"],
                                    matches: req.body.data["email"]["matches"],
                                    messages: req.body.data["email"]["messages"],
                                    power_of_time: req.body.data["email"]["power_of_time"]
                                }
                            }
                            dbo.collection(notification).insertOne(myObj, (err, result) => {
                                if (err)
                                    res.json({status: "3", message: "Inserting faild"});
                                else {

                                    res.json({status: "1", message: "Notification set successfully"});
                                }
                            });
                        } else {

                            dbo.collection(notification).updateOne(
                                {
                                    userID: new ObjectId(req.body.data["userID"])
                                },
                                {
                                    $set: {
                                        matcheek: {
                                            play_sound_for_every_notification: req.body.data["matcheek"]["play_sound_for_every_notification"],
                                            play_sound_for_every_message: req.body.data["matcheek"]["play_sound_for_every_message"],
                                            likes: req.body.data["matcheek"]["likes"],
                                            matches: req.body.data["matcheek"]["matches"],
                                            messages: req.body.data["matcheek"]["messages"],
                                            power_of_time: req.body.data["matcheek"]["power_of_time"],
                                            promotions: req.body.data["matcheek"]["promotions"]
                                        },
                                        phone: {
                                            play_sound_for_every_notification: req.body.data["phone"]["play_sound_for_every_notification"],
                                            play_sound_for_every_message: req.body.data["phone"]["play_sound_for_every_message"],
                                            likes: req.body.data["phone"]["likes"],
                                            matches: req.body.data["phone"]["matches"],
                                            messages: req.body.data["phone"]["messages"],
                                            power_of_time: req.body.data["phone"]["power_of_time"],
                                            promotions: req.body.data["phone"]["promotions"]
                                        },
                                        email: {
                                            frequency: {
                                                every_notification: req.body.data["email"]["frequency"]["every_notification"],
                                                twice_a_day: req.body.data["email"]["frequency"]["twice_a_day"],
                                                once_a_day: req.body.data["email"]["frequency"]["once_a_day"],
                                                once_a_week: req.body.data["email"]["frequency"]["once_a_week"],
                                                once_a_month: req.body.data["email"]["frequency"]["once_a_month"]
                                            },
                                            newsletter: req.body.data["email"]["newsletter"],
                                            promotions: req.body.data["email"]["promotions"],
                                            likes: req.body.data["email"]["likes"],
                                            matches: req.body.data["email"]["matches"],
                                            messages: req.body.data["email"]["messages"],
                                            power_of_time: req.body.data["email"]["power_of_time"]
                                        }
                                    },
                                }
                            ).then((result) => {

                                    if (result['result']['n'] == 1) {
                                        res.json({status: "1", message: "notification updated successfully"});
                                    } else
                                        res.json({status: "3", message: "notification updated failed"});
                                }
                            ).catch((err) => {
                                res.json({status: "3 ", message: "notification updated failed"});
                            });
                        }
                    }).catch((err) => {
                        res.json({status: "3 ", message: "Internal server error" + err});
                    });
                }
            });
            //--------------------------------------------------------------------------------------------------------------

            //--------------------------------------------------------------------------------------------------------------
            //Send Email For Verification
            app.get('/api/EmailVerification', (req, res) => {
                rand = Math.floor((Math.random() * 1000) + 54);
                host = req.get('host');
                link = "http://" + req.get('host') + "/verify?id=" + rand;
                mailOptions = {
                    to: req.query.Email,
                    subject: "Please confirm your Email account",
                    html: "Hello,<br> Please Click on the link to verify your email.<br><a href=" + link + ">Click here to verify</a>"
                }
                console.log(mailOptions);
                smtpTransport.sendMail(mailOptions, function (error, response) {
                    if (error) {
                        console.log(error);
                        res.end("error" + error);
                    } else {
                        console.log("Message sent: " + response);
                        res.end("sent" + response);
                    }
                });
            });
            //--------------------------------------------------------------------------------------------------------------

            //--------------------------------------------------------------------------------------------------------------
            //Email Verification
            app.get('/verify', (req, res) => {
                console.log(req.protocol + ":/" + req.get('host'));
                if ((req.protocol + "://" + req.get('host')) == ("http://" + host)) {
                    console.log("Domain is matched. Information is from Authentic email");
                    if (req.query.id == rand) {
                        console.log("email is verified");
                        res.end("<h1>Email " + mailOptions.to + " is been Successfully verified");
                        dbo.collection(switlover).updateOne(
                            {
                                'Email.EmailAddress': mailOptions.to
                            },
                            {
                                $set: {'Email.Verified': 'true', updatedAt: new Date()}
                            }).then((result) => {
                            if (result['result']['n'] == 1) {
                                res.json({status: "1", message: "EmailAddress Verified successfully"});
                            } else {
                                res.json({status: "3", message: "Internal Server error"});
                            }
                        }).catch((err) => {
                            res.json({status: "3", message: "Internal Server error"});
                        });
                    } else {
                        res.json({status: "3", message: "Bad Request"});
                    }
                } else {
                    res.json({status: "3", message: "Request is from unknown source"});
                }
            });
            //--------------------------------------------------------------------------------------------------------------

            //--------------------------------------------------------------------------------------------------------------
            // Block particuler number from the contact list
            app.post('/api/removeNumber', (req, res) => {
                var Auth_Token = req.header('Auth_Token');
                if (!Auth_Token || Auth_Token == null) {
                    res.json({status: "6", message: "Auth token missing"});
                } else {
                    var dataArray = dbo.collection(switlover).find({
                        Auth_Token: Auth_Token
                    }).toArray();
                    dataArray.then((result) => {
                        if (!isEmpty(result)) {
                            for (var i = 0; i < result[0]["Contact_List"].length; i++) {
                                for (var j = 0; j < result[0]["Contact_List"][i]['number'].length; j++) {
                                    if (result[0]["Contact_List"][i]['number'][j]["number"] == req.body.number) {
                                        if (result[0]["Contact_List"][i]['number'][j]["isRemovedByUser"] == 1) {
                                            dbo.collection(switlover).updateOne(
                                                {
                                                    Auth_Token: Auth_Token,
                                                },
                                                {
                                                    $set: {
                                                        'Contact_List.$.number.$.isRemovedByUser': 0,
                                                        updatedAt: new Date()
                                                    }
                                                }
                                            ).then((result) => {
                                                if (result['result']['n'] == 1) {
                                                    res.json({
                                                        status: "1",
                                                        message: "success"
                                                    });
                                                }
                                            }).catch((err) => {
                                                res.json({status: "3", message: "Internal server error"});
                                            })
                                        } else {

                                            dbo.collection(switlover).updateOne(
                                                {
                                                    Auth_Token: Auth_Token
                                                },
                                                {
                                                    $set: {
                                                        'Contact_List.$.number.$.isRemovedByUser': 1,
                                                        updatedAt: new Date()
                                                    }
                                                }
                                            ).then((result) => {
                                                if (result['result']['n'] == 1) {
                                                    res.json({
                                                        status: "1",
                                                        message: "success"
                                                    });
                                                }
                                            }).catch((err) => {
                                                res.json({status: "3", message: "Internal server error" + err});
                                            })
                                        }
                                    }
                                }
                            }
                        }
                    }).catch((err) => {
                        res.json({status: "3", message: "Internal server error"});
                    })
                }
            })
            //--------------------------------------------------------------------------------------------------------------

            //**************************************************************************************************************
            // Admin Panel API
            //**************************************************************************************************************

            //--------------------------------------------------------------------------------------------------------------
            //get count for not login yet
            app.post('/api/notloginyetcount', (req, res) => {
                var dataArray = dbo.collection(counter).find({}).toArray();
                dataArray.then((result) => {
                    if (!isEmpty(result)) {
                        res.json({
                            status: "1",
                            message: "success",
                            userdata: result[0]["General"]["UserNotLogin"]
                        });
                    }
                }).catch((err) => {
                    res.json({status: "3", message: "Internal server error"});
                })
            })
            //--------------------------------------------------------------------------------------------------------------

            //--------------------------------------------------------------------------------------------------------------
            //get single user based on ID
            app.post('/api/singleUser', (req, res) => {
                var dataArray = dbo.collection(switlover).find({
                    _id: new ObjectId(req.body.id)
                }).toArray();
                dataArray.then((result) => {
                    if (!isEmpty(result)) {
                        res.json({
                            status: "1",
                            message: "success",
                            userdata: result
                        });
                    } else {
                        res.json({
                            status: "0",
                            message: "no data"
                        });
                    }
                }).catch((err) => {
                    res.json({status: "3", message: "Internal server error"});
                })
            })
            //--------------------------------------------------------------------------------------------------------------

            //--------------------------------------------------------------------------------------------------------------
            //get single user based on ID
            app.post('/api/singleUserNumber', (req, res) => {
                var dataArray = dbo.collection(switlover).find({
                    _id: new ObjectId(req.body.id)
                }).toArray();
                dataArray.then((result) => {
                    if (!isEmpty(result)) {

                        var isRemovedByAdmin;
                        var isRemovedByUser;
                        var buttonAction;
                        var dataresult = result[0];
                        delete dataresult._id;
                        delete dataresult.Request_token;
                        delete dataresult.Auth_Token;
                        delete dataresult.Contact_Not_Recognized;
                        delete dataresult.Add_New_Number_From_App;
                        delete dataresult.Contact_Remove_Ratio;
                        delete dataresult.Like;
                        delete dataresult.Username;
                        delete dataresult.Phone_Number;
                        delete dataresult.Email;
                        delete dataresult.is_Block;
                        delete dataresult.is_Online;
                        delete dataresult.is_Deleted;
                        delete dataresult.Profile_Pic;
                        delete dataresult.Match_Ratio;
                        delete dataresult.PowerID;
                        delete dataresult.Not_In_App_Purchase;
                        delete dataresult.language;
                        delete dataresult.Device;
                        delete dataresult.createdAt;
                        delete dataresult.updatedAt;
                        delete dataresult.deletedAt;


                        var dataArray1 = [];

                        for (var i = 0; i < dataresult.Contact_List.length; i++) {
                            for (var j = 0; j < dataresult.Contact_List[i]['number'].length; j++) {
                                if (dataresult["Contact_List"][i]['number'][j]["isRemovedByAdmin"] == 0) {
                                    isRemovedByAdmin = "No";
                                    buttonAction = "<button id='remove' class='btn btn-outline-danger btn-sm'>Remove</button>"
                                } else {
                                    isRemovedByAdmin = "Yes";
                                    buttonAction = "<button id='remove' class='btn btn-outline-warning btn-sm'>Put Back</button>"
                                }

                                if (dataresult["Contact_List"][i]['number'][j]["isRemovedByUser"] == 0) {
                                    isRemovedByUser = "No";
                                } else {
                                    isRemovedByUser = "Yes";
                                }
                                var data = [
                                    i + 1,
                                    dataresult.Contact_List[i]['number'][j]["code"],
                                    dataresult.Contact_List[i]['number'][j]["number"],
                                    dataresult.Contact_List[i]["name"],
                                    isRemovedByUser,
                                    isRemovedByAdmin,
                                    buttonAction
                                ];
                                dataArray1.push(data);
                            }
                        }
                        res.json({
                            data: dataArray1
                        });
                    }
                }).catch((err) => {
                    res.json({status: "3", message: "Internal server error" + err});
                })
            })
            //--------------------------------------------------------------------------------------------------------------

            //--------------------------------------------------------------------------------------------------------------
            //get single user based on ID
            app.post('/api/singleUsePhonerNumber', (req, res) => {
                var dataArray = dbo.collection(switlover).find({
                    _id: new ObjectId(req.body.id)
                }).toArray();
                dataArray.then((result) => {
                    if (!isEmpty(result)) {
                        var verified;
                        var dataresult = result[0];
                        delete dataresult._id;
                        delete dataresult.Request_token;
                        delete dataresult.Auth_Token;
                        delete dataresult.Contact_Not_Recognized;
                        delete dataresult.Add_New_Number_From_App;
                        delete dataresult.Contact_Remove_Ratio;
                        delete dataresult.Like;
                        delete dataresult.Username;
                        delete dataresult.Contact_List;
                        delete dataresult.Email;
                        delete dataresult.is_Block;
                        delete dataresult.is_Online;
                        delete dataresult.is_Deleted;
                        delete dataresult.Profile_Pic;
                        delete dataresult.Match_Ratio;
                        delete dataresult.PowerID;
                        delete dataresult.Not_In_App_Purchase;
                        delete dataresult.language;
                        delete dataresult.Device;
                        delete dataresult.createdAt;
                        delete dataresult.updatedAt;
                        delete dataresult.deletedAt;

                        var dataArray1 = [];

                        for (var i = 0; i < dataresult.Phone_Number.length; i++) {
                            if (dataresult["Phone_Number"][i]["is_OverVerification"] == 0) {
                                verified = "No";

                            } else {
                                verified = "Yes";

                            }
                            var data = [
                                i + 1,
                                dataresult.Phone_Number[i]["Contry_Code"],
                                dataresult.Phone_Number[i]["Number"],
                                dataresult.Phone_Number[i]["Location"],
                                dataresult.Phone_Number[i]["Verified"],
                                verified
                            ];
                            dataArray1.push(data);
                        }

                        console.log(dataArray1)
                        res.json({
                            data: dataArray1
                        });
                    }
                }).catch((err) => {
                    res.json({status: "3", message: "Internal server error" + err});
                })
            })
            //--------------------------------------------------------------------------------------------------------------

            //--------------------------------------------------------------------------------------------------------------
            //get all user list
            app.post('/api/allUser', (req, res) => {
                var dataArray = dbo.collection(switlover).find({}).toArray();
                dataArray.then((result) => {
                    if (!isEmpty(result)) {
                        var data = [];
                        var is_Deleted;
                        var is_Online;
                        var is_Block;
                        var name;
                        for (var i = 0; i < result.length; i++) {
                            var dataresult = result[i];

                            delete dataresult.Request_token;
                            delete dataresult.Auth_Token;
                            delete dataresult.Contact_Not_Recognized;
                            delete dataresult.Add_New_Number_From_App;
                            delete dataresult.Contact_Remove_Ratio;
                            delete dataresult.Like;
                            delete dataresult.Contact_List;
                            delete dataresult.Profile_Pic;
                            delete dataresult.Match_Ratio;
                            delete dataresult.PowerID;
                            delete dataresult.Not_In_App_Purchase;
                            delete dataresult.language;
                            delete dataresult.Device;
                            delete dataresult.createdAt;
                            delete dataresult.updatedAt;
                            delete dataresult.deletedAt;

                            if (dataresult["is_Deleted"] == 0) {
                                is_Deleted = "No";
                            } else {
                                is_Deleted = "Yes";
                            }
                            if (dataresult["is_Online"] == 0) {
                                is_Online = "No";
                            } else {
                                is_Online = "Yes";
                            }
                            if (dataresult["is_Block"] == 0) {
                                is_Block = "No";
                            } else {
                                is_Block = "Yes";
                            }
                            if (dataresult["Username"][(dataresult["Username"]).length - 1] == null) {
                                name = "";
                            } else {
                                name = dataresult["Username"][(dataresult["Username"]).length - 1];
                            }

                            var finalData = [
                                dataresult["_id"],
                                name,
                                dataresult["Phone_Number"][0]["Contry_Code"] + '' + dataresult["Phone_Number"][0]["Number"],
                                dataresult["Email"]["EmailAddress"],
                                is_Deleted,
                                is_Online,
                                is_Block
                            ];
                            data.push(finalData);
                        }
                        res.json({
                            data: data
                        });
                    }
                }).catch((err) => {
                    res.json({status: "3", message: "Internal server error" + err});
                })
            })
            //--------------------------------------------------------------------------------------------------------------

            //--------------------------------------------------------------------------------------------------------------
            //Block Full User
            app.post('/api/block_unblock', (req, res) => {
                console.log(req.body)
                var dataArray = dbo.collection(switlover).find({
                    _id: new ObjectId(req.body.id)
                }).toArray();
                dataArray.then((result) => {
                    if (!isEmpty(result)) {
                        if (result[0]["is_Block"] == 0) {
                            dbo.collection(switlover).updateOne(
                                {
                                    _id: new ObjectId(req.body.id)
                                },
                                {
                                    $set: {is_Block: 1, updatedAt: new Date()}
                                }
                            ).then((result) => {
                                if (result['result']['n'] == 1) {
                                    res.json({
                                        status: "1",
                                        message: "success"
                                    });
                                }
                            }).catch((err) => {
                                res.json({status: "3", message: "Internal server error"});
                            })
                        } else {
                            dbo.collection(switlover).updateOne(
                                {
                                    _id: new ObjectId(req.body.id)
                                },
                                {
                                    $set: {is_Block: 0, updatedAt: new Date()}
                                }
                            ).then((result) => {
                                if (result['result']['n'] == 1) {
                                    res.json({
                                        status: "1",
                                        message: "success"
                                    });
                                }
                            }).catch((err) => {
                                res.json({status: "3", message: "Internal server error"});
                            })
                        }
                    }
                }).catch((err) => {
                    res.json({status: "3", message: "Internal server error"});
                })
            })
            //--------------------------------------------------------------------------------------------------------------

            //--------------------------------------------------------------------------------------------------------------
            // Block particuler number from the contact list
            app.post('/api/blockNumber', (req, res) => {
                console.log(req.body);
                var dataArray = dbo.collection(switlover).find({
                    _id: new ObjectId(req.body.id)
                }).toArray();
                dataArray.then((result) => {
                    if (!isEmpty(result)) {
                        for (var i = 0; i < result[0]["Contact_List"].length; i++) {
                            for (var j = 0; j < result[0]["Contact_List"][i]['number'].length; j++) {
                                if (result[0]["Contact_List"][i]['number'][j]["number"] == req.body.number) {
                                    if (result[0]["Contact_List"][i]['number'][j]["isRemovedByAdmin"] == 1) {
                                        dbo.collection(switlover).updateOne(
                                            {
                                                _id: new ObjectId(req.body.id),
                                                'Contact_List.number.number': req.body.number
                                            },
                                            {
                                                $set: {'Contact_List.$.number.$[j].isRemovedByAdmin': 0}
                                            },
                                            {
                                                arrayFilters: [
                                                    {"j.number": req.body.number}
                                                ]
                                            }
                                        ).then((result) => {
                                            if (result['result']['n'] == 1) {
                                                res.json({
                                                    status: "1",
                                                    message: "success"
                                                });
                                            }
                                        }).catch((err) => {
                                            res.json({status: "3", message: "Internal server error"});
                                        })
                                    } else {

                                        dbo.collection(switlover).updateOne(
                                            {
                                                _id: new ObjectId(req.body.id),
                                                'Contact_List.number.number': req.body.number
                                            },
                                            {
                                                $set: {'Contact_List.$.number.$[j].isRemovedByAdmin': 1}
                                            },
                                            {
                                                arrayFilters: [
                                                    {"j.number": req.body.number}
                                                ]
                                            }
                                        ).then((result) => {
                                            if (result['result']['n'] == 1) {
                                                res.json({
                                                    status: "1",
                                                    message: "success"
                                                });
                                            }
                                        }).catch((err) => {
                                            res.json({status: "3", message: "Internal server error" + err});
                                        })
                                    }
                                }
                            }
                        }
                    }
                }).catch((err) => {
                    res.json({status: "3", message: "Internal server error"});
                })
            })
            //--------------------------------------------------------------------------------------------------------------

            //--------------------------------------------------------------------------------------------------------------
            //Delete User from the database
            app.post('/api/deleteUserAdmin', (req, res) => {
                var dataArray = dbo.collection(switlover).find({
                    _id: new ObjectId(req.body.id)
                }).toArray();
                dataArray.then((result) => {
                    if (!isEmpty(result)) {
                        if (result[0]["is_Deleted"] == 0) {
                            dbo.collection(switlover).updateOne(
                                {
                                    _id: new ObjectId(req.body.id)
                                },
                                {
                                    $set: {is_Deleted: 1, updatedAt: new Date()}
                                }
                            ).then((result) => {
                                if (result['result']['n'] == 1) {
                                    res.json({
                                        status: "1",
                                        message: "success"
                                    });
                                }
                            }).catch((err) => {
                                res.json({status: "3", message: "Internal server error"});
                            })
                        } else {
                            dbo.collection(switlover).updateOne(
                                {
                                    _id: new ObjectId(req.body.id)
                                },
                                {
                                    $set: {is_Deleted: 0, updatedAt: new Date()}
                                }
                            ).then((result) => {
                                if (result['result']['n'] == 1) {
                                    res.json({
                                        status: "1",
                                        message: "success"
                                    });
                                }
                            }).catch((err) => {
                                res.json({status: "3", message: "Internal server error"});
                            })
                        }
                    }
                }).catch((err) => {
                    res.json({status: "3", message: "Internal server error"});
                })
            })
            //--------------------------------------------------------------------------------------------------------------

            //--------------------------------------------------------------------------------------------------------------
            //get count of total user
            app.post('/api/count', (req, res) => {
                var dataArray = dbo.collection(switlover).find({}).toArray();
                dataArray.then((result) => {
                    if (!isEmpty(result)) {

                        res.json({
                            status: "1",
                            message: "success",
                            userdata: result.length
                        });
                    }
                }).catch((err) => {
                    res.json({status: "3", message: "Internal server error"});
                })
            })
            //--------------------------------------------------------------------------------------------------------------

            //--------------------------------------------------------------------------------------------------------------
            //Get Like Contact
            app.post('/api/GetLikeContact', (req, res) => {
                var dataArray = dbo.collection(switlover).find({
                    _id: new ObjectId(req.body.id),
                }).toArray();
                dataArray.then((data) => {
                    if (!isEmpty(data[0]['Contact_List'])) {
                        var numberArray = [];
                        for (var i = 0; i < (data[0]['Contact_List']).length; i++) {
                            for (var j = 0; j < (data[0]['Contact_List'][i]['number']).length; j++) {
                                if (data[0]['Contact_List'][i]['number'][j]['isRemovedByAdmin'] == 0 || data[0]['Contact_List'][i]['number'][j]['isRemovedByUser'] == 0) {
                                    var number;
                                    var myObj;
                                    if ((data[0]['Contact_List'][i]['number'][j]['number']).includes(data[0]['Contact_List'][i]['number'][j]['code'])) {
                                        number = data[0]['Contact_List'][i]['number'][j]['number'];
                                    } else {
                                        number = data[0]['Contact_List'][i]['number'][j]['code'] + "" + data[0]['Contact_List'][i]['number'][j]['number'];
                                    }
                                    var isRemovedByAdmin;
                                    var counter = 0;
                                    var isRemovedByUser;
                                    var myLikesArray = data[0]['Like'];
                                    if (!isEmpty(myLikesArray)) {
                                        for (var j = 0; j < myLikesArray.length; j++) {
                                            if (myLikesArray[j].length < 15) {
                                                counter = counter + 1;
                                                if (myLikesArray[j] == number) {

                                                    if (data[0]["Contact_List"][i]['number'][j]["isRemovedByAdmin"] == 0) {
                                                        isRemovedByAdmin = "No";
                                                    } else {
                                                        isRemovedByAdmin = "Yes";
                                                    }
                                                    if (data[0]["Contact_List"][i]['number'][j]["isRemovedByUser"] == 0) {
                                                        isRemovedByUser = "No";
                                                    } else {
                                                        isRemovedByUser = "Yes";
                                                    }
                                                    myObj = [
                                                        counter,
                                                        data[0]['Contact_List'][i]['number'][j]['code'],
                                                        data[0]['Contact_List'][i]['number'][j]['number'],
                                                        data[0]['Contact_List'][i]['name'],
                                                        isRemovedByUser,
                                                        isRemovedByAdmin
                                                    ];
                                                    numberArray.push(myObj);
                                                    break;
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                        if (isEmpty(numberArray)) {
                            res.json({status: "0", message: "Sorry there is no contact to display"});
                        } else {
                            res.json({data: numberArray});
                        }
                    }
                }).catch((err) => {
                    res.json({status: "3", message: "Internal Server error" + err});
                })
            });
            //--------------------------------------------------------------------------------------------------------------

            //--------------------------------------------------------------------------------------------------------------
            //Get Notification Settings
            app.post('/api/GetNotificationadmin', (req, res) => {
                var dataNotification = dbo.collection(notification).find({userID: new ObjectId(req.body.id)}).toArray();
                dataNotification.then((result) => {
                    if (isEmpty(result))
                        res.json({status: "0", message: "No notification settings found"});
                    else
                        var dataresult = result[0];
                    delete dataresult._id;
                    delete dataresult.userID;
                    res.json({status: "1", message: "success", userdata: result});
                }).catch((err) => {
                    res.json({status: "3 ", message: "notification updated failed"});
                });
            });
            //--------------------------------------------------------------------------------------------------------------

            //--------------------------------------------------------------------------------------------------------------
            //Set Notification Settings
            app.post('/api/SetNotificationadmin', (req, res) => {
                console.log(req.body);
                // var dataNotification = dbo.collection(notification).find({userID: new ObjectId(req.body.data["userID"])}).toArray();
                // dataNotification.then((result) => {
                //     if (isEmpty(result)) {
                //         var myObj = {
                //             userID: new ObjectId(req.body.data["userID"]),
                //             matcheek: {
                //                 play_sound_for_every_notification: req.body.data["matcheek"]["play_sound_for_every_notification"],
                //                 play_sound_for_every_message: req.body.data["matcheek"]["play_sound_for_every_message"],
                //                 likes: req.body.data["matcheek"]["likes"],
                //                 matches: req.body.data["matcheek"]["matches"],
                //                 messages: req.body.data["matcheek"]["messages"],
                //                 power_of_time: req.body.data["matcheek"]["power_of_time"],
                //                 promotions: req.body.data["matcheek"]["promotions"]
                //             },
                //             phone: {
                //                 play_sound_for_every_notification: req.body.data["phone"]["play_sound_for_every_notification"],
                //                 play_sound_for_every_message: req.body.data["phone"]["play_sound_for_every_message"],
                //                 likes: req.body.data["phone"]["likes"],
                //                 matches: req.body.data["phone"]["matches"],
                //                 messages: req.body.data["phone"]["messages"],
                //                 power_of_time: req.body.data["phone"]["power_of_time"],
                //                 promotions: req.body.data["phone"]["promotions"]
                //             },
                //             email: {
                //                 frequency: {
                //                     every_notification: req.body.data["email"]["frequency"]["every_notification"],
                //                     twice_a_day: req.body.data["email"]["frequency"]["twice_a_day"],
                //                     once_a_day: req.body.data["email"]["frequency"]["once_a_day"],
                //                     once_a_week: req.body.data["email"]["frequency"]["once_a_week"],
                //                     once_a_month: req.body.data["email"]["frequency"]["once_a_month"]
                //                 },
                //                 newsletter: req.body.data["email"]["newsletter"],
                //                 promotions: req.body.data["email"]["promotions"],
                //                 likes: req.body.data["email"]["likes"],
                //                 matches: req.body.data["email"]["matches"],
                //                 messages: req.body.data["email"]["messages"],
                //                 power_of_time: req.body.data["email"]["power_of_time"]
                //             }
                //         }
                //         dbo.collection(notification).insertOne(myObj, (err, result) => {
                //             if (err)
                //                 res.json({status: "3", message: "Inserting faild"});
                //             else {
                //                 res.json({status: "1", message: "Notification set successfully"});
                //             }
                //         });
                //     } else {
                //
                //         dbo.collection(notification).updateOne(
                //             {
                //                 userID: new ObjectId(req.body.data["userID"])
                //             },
                //             {
                //                 $set: {
                //                     matcheek: {
                //                         play_sound_for_every_notification: req.body.data["matcheek"]["play_sound_for_every_notification"],
                //                         play_sound_for_every_message: req.body.data["matcheek"]["play_sound_for_every_message"],
                //                         likes: req.body.data["matcheek"]["likes"],
                //                         matches: req.body.data["matcheek"]["matches"],
                //                         messages: req.body.data["matcheek"]["messages"],
                //                         power_of_time: req.body.data["matcheek"]["power_of_time"],
                //                         promotions: req.body.data["matcheek"]["promotions"]
                //                     },
                //                     phone: {
                //                         play_sound_for_every_notification: req.body.data["phone"]["play_sound_for_every_notification"],
                //                         play_sound_for_every_message: req.body.data["phone"]["play_sound_for_every_message"],
                //                         likes: req.body.data["phone"]["likes"],
                //                         matches: req.body.data["phone"]["matches"],
                //                         messages: req.body.data["phone"]["messages"],
                //                         power_of_time: req.body.data["phone"]["power_of_time"],
                //                         promotions: req.body.data["phone"]["promotions"]
                //                     },
                //                     email: {
                //                         frequency: {
                //                             every_notification: req.body.data["email"]["frequency"]["every_notification"],
                //                             twice_a_day: req.body.data["email"]["frequency"]["twice_a_day"],
                //                             once_a_day: req.body.data["email"]["frequency"]["once_a_day"],
                //                             once_a_week: req.body.data["email"]["frequency"]["once_a_week"],
                //                             once_a_month: req.body.data["email"]["frequency"]["once_a_month"]
                //                         },
                //                         newsletter: req.body.data["email"]["newsletter"],
                //                         promotions: req.body.data["email"]["promotions"],
                //                         likes: req.body.data["email"]["likes"],
                //                         matches: req.body.data["email"]["matches"],
                //                         messages: req.body.data["email"]["messages"],
                //                         power_of_time: req.body.data["email"]["power_of_time"]
                //                     }
                //                 },
                //             }
                //         ).then((result) => {
                //
                //             if (result['result']['n'] == 1)
                //                 res.json({status: "1", message: "notification updated successfully"});
                //             else
                //                 res.json({status: "3", message: "notification updated failed"});
                //         }).catch((err) => {
                //             res.json({status: "3 ", message: "notification updated failed"});
                //         });
                //     }
                // }).catch((err) => {
                //     res.json({status: "3 ", message: "Internal server error" + err});
                // });
            });
            //--------------------------------------------------------------------------------------------------------------


        }
    }
)
;

var port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.listen(port, () => {
    console.log('Server is up and running on port number ' + port);
});
