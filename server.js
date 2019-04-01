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
            //Check user is exist or not
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
                                    res.json({
                                        status: "7",
                                        type: "2",
                                        message: "Sorry you are deleted from this app. If you not do this then please contact to support team."
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
            //Match Logic
            app.post('/api/match', (req, res) => {
                var Auth_Token = req.header('Auth_Token');
                if (!Auth_Token || Auth_Token == null) {
                    res.json({status: "6", message: "Auth token missing"});
                } else {
                    var dataArray = dbo.collection(switlover).find({
                        Auth_Token: Auth_Token,
                        is_Block: {$ne: 1}
                    }).toArray()

                    dataArray.then((result) => {
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

                                                    for(var k = 0; k < result[j]["follobackUser"].length; k++)
                                                    {
                                                        if (result[j]["follobackUser"][k]["name"] == name) {
                                                            res.json({status: "0", message: "Already matched user"});
                                                        }else {
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
                    }).catch((err) => {
                        res.json({status: "3", message: "3Internal server error"});
                    })
                }
            })
            //--------------------------------------------------------------------------------------------------------------

            //--------------------------------------------------------------------------------------------------------------
            //My Like
            app.post('/api/AddToLikes', (req, res) => {
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
                            Auth_Token: Auth_Token,
                            is_Block: {$ne: 1}
                        }).toArray();
                        dataArray.then((dataresult) => {
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
                        }).catch((dataerror) => {

                        })

                        // var dataArray = dbo.collection(switlover).find({
                        //     'Phone_Number.Contry_Code': req.body.code,
                        //     'Phone_Number.Number': req.body.number,
                        //     is_Block: {$ne: 1}
                        // }).toArray();
                        // dataArray.then((result) => {
                        //     if (!isEmpty(result)) {
                        //
                        //         var userID = result[0]['_id'];
                        //
                        //         var likeArray = [];
                        //
                        //         var isLiked = false;
                        //         var existingLikes = [];
                        //
                        //         var dataArray = dbo.collection(switlover).find({
                        //             Auth_Token: Auth_Token,
                        //             is_Block: {$ne: 1}
                        //         }).toArray();
                        //         dataArray.then((dataresult) => {
                        //             existingLikes = dataresult[0]['Like']
                        //             console.log(existingLikes)
                        //             if (!isEmpty(existingLikes)) {
                        //                 for (var j = 0; j < existingLikes.length; j++) {
                        //                     if (existingLikes[j].length < 15) {
                        //                         likeArray.push(existingLikes[j]);
                        //                     } else if (existingLikes[j].equals(userID)) {
                        //                         isLiked = true;
                        //                     } else {
                        //                         likeArray.push(existingLikes[j])
                        //                         // isLiked = false;
                        //                     }
                        //                 }
                        //                 if (!isLiked) {
                        //                     likeArray.push(userID);
                        //                 }
                        //             } else {
                        //                 likeArray.push(userID)
                        //             }
                        //
                        //
                        //             dbo.collection(switlover).updateOne({
                        //                     Auth_Token: Auth_Token,
                        //                 },
                        //                 {
                        //                     $set: {Like: likeArray}
                        //                 }).then((resultdata) => {
                        //                 if (resultdata['result']['n'] == 1) {
                        //                     res.json({status: "1", message: "success"});
                        //                 } else {
                        //                     res.json({status: "3", message: "Internal server error"})
                        //                 }
                        //             }).catch((errdata) => {
                        //                 res.json({status: "3", message: "Internal server error"})
                        //             })
                        //         }).catch((dataerror) => {
                        //
                        //         })
                        //
                        //     } else {
                        //         //User is not using this app
                        //         var isLiked1 = false;
                        //         var numberArray = [];
                        //         var dataArray = dbo.collection(switlover).find({
                        //             Auth_Token: Auth_Token,
                        //             is_Block: {$ne: 1}
                        //         }).toArray();
                        //         dataArray.then((dataresult) => {
                        //             existingLikes = dataresult[0]['Like']
                        //             if (!isEmpty(existingLikes)) {
                        //                 for (var j = 0; j < existingLikes.length; j++) {
                        //                     if (existingLikes[j].length < 15) {
                        //                         if (existingLikes[j] == number) {
                        //                             isLiked1 = true;
                        //                         } else {
                        //                             numberArray.push(existingLikes[j])
                        //                         }
                        //                     } else {
                        //                         numberArray.push(existingLikes[j])
                        //                     }
                        //                 }
                        //                 if (!isLiked1) {
                        //                     numberArray.push(number);
                        //                 }
                        //             } else {
                        //                 numberArray.push(number)
                        //             }
                        //             dbo.collection(switlover).updateOne({
                        //                     Auth_Token: Auth_Token,
                        //                 },
                        //                 {
                        //                     $set: {Like: numberArray}
                        //                 }).then((resultdata) => {
                        //                 if (resultdata['result']['n'] == 1) {
                        //                     res.json({status: "1", message: "success"});
                        //                 } else {
                        //                     res.json({status: "3", message: "Internal server error"})
                        //                 }
                        //             }).catch((errdata) => {
                        //                 res.json({status: "3", message: "Internal server error"})
                        //             })
                        //         }).catch((dataerror) => {
                        //
                        //         })
                        //     }
                        // }).catch((err) => {
                        //     res.json({status: "3", message: "Internal server error" + err})
                        // })
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
                        is_Block: {$ne: 1}
                    }).toArray()
                    dataArray.then((result) => {
                        var userId = result[0]['_id'];
                        var idArray = dbo.collection(switlover).find({
                            Like: userId,
                            is_Block: {$ne: 1}
                        }).toArray()
                        idArray.then((idresult) => {
                            console.log(idresult);
                            var myObj1 = [];
                            if (!isEmpty(idresult)) {
                                for (var i = 0; i < idresult.length; i++) {
                                    var username = idresult[i]['Username'];
                                    var name = username[username.length - 1]

                                    var myObj = {
                                        id: idresult[i]['_id'],
                                        name: name,
                                        image: idresult[i]['Profile_Pic']
                                    }
                                    myObj1.push(myObj);
                                }
                                res.json({status: "1", message: "success", user_data: myObj1});
                            } else {
                                res.json({status: "0", message: "Sorry, No Contacts found that like you...!!!"})
                            }
                        }).catch((iserr) => {
                            res.json({status: "3", message: "Internal server error"});
                        })
                    }).catch((err) => {
                        res.json({status: "3", message: "Internal server error"});
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
                            is_Block: {$ne: 1}
                        }).toArray();
                        dataArray.then((result) => {
                            if (!isEmpty(result)) {
                                //User Exist
                                dbo.collection(switlover).updateOne({
                                    'Phone_Number.Contry_Code': req.body.Contry_Code,
                                    'Phone_Number.Number': req.body.Number,
                                    'Phone_Number.Location': req.body.Location,
                                    is_Block: {$ne: 1}
                                }, {
                                    $set: {Request_token: Request_token, updatedAt: new Date()}
                                }).then((dataresult) => {
                                    if (dataresult['result']['n'] == 1) {
                                        var dataArray = dbo.collection(switlover).find({
                                            Request_token: Request_token,
                                            is_Block: {$ne: 1}
                                        }).toArray();
                                        dataArray.then((finalresult) => {
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
                                            Request_token: Request_token,
                                            is_Block: {$ne: 1}
                                        }).toArray();
                                        dataArray.then((result) => {
                                            if (!isEmpty(result)) {
                                                res.json({status: "1", message: "success", user_data: result});
                                            }
                                        }).catch((err) => {
                                            res.json({status: "3", message: "Internal Server error"});
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
                            Auth_Token: Auth_Token,
                            is_Block: {$ne: 1}
                        }).toArray();
                        dataArray.then((result) => {
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
                        }).catch((err) => {
                            res.json({status: "3", message: "Internal server error"});
                        })
                    } else {
                        var dataArray = dbo.collection(switlover).find({
                            _id: new ObjectId(req.body.userID),
                            is_Block: {$ne: 1}
                        }).toArray();
                        dataArray.then((result) => {
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
                    var dataArray = dbo.collection(switlover).find({
                        Auth_Token: Auth_Token,
                        is_Block: {$ne: 1}
                    }).toArray();

                    dataArray.then((data) => {

                        // if (!isEmpty(data[0]['Contact_List'])) {
                        //     var numberArray = [];
                        //     for (var i = 0; i < (data[0]['Contact_List']).length; i++) {
                        //         if (data[0]['Contact_List'][i]['isRemovedByAdmin'] == 0 && data[0]['Contact_List'][i]['isRemovedByUser'] == 0) {
                        //             var number;
                        //             var myObj;
                        //             if ((data[0]['Contact_List'][i]['number']).includes(data[0]['Contact_List'][i]['code'])) {
                        //                 number = data[0]['Contact_List'][i]['number'];
                        //             } else {
                        //                 number = data[0]['Contact_List'][i]['code'] + "" + data[0]['Contact_List'][i]['number'];
                        //             }
                        //
                        //             var myLikesArray = data[0]['Like'];
                        //
                        //             for (var j = 0; j < myLikesArray.length; j++) {
                        //
                        //                 if (myLikesArray[j].length < 15) {
                        //
                        //                     if (myLikesArray[j] == number) {
                        //
                        //                         myObj = {
                        //                             name: data[0]['Contact_List'][i]['name'],
                        //                             image: data[0]['Contact_List'][i]['image'],
                        //                             code: data[0]['Contact_List'][i]['code'],
                        //                             number: number,
                        //                             isLiked: 1
                        //                         };
                        //
                        //                     } else {
                        //
                        //                         myObj = {
                        //                             name: data[0]['Contact_List'][i]['name'],
                        //                             image: data[0]['Contact_List'][i]['image'],
                        //                             code: data[0]['Contact_List'][i]['code'],
                        //                             number: number,
                        //                             isLiked: 0
                        //                         };
                        //                     }
                        //                     numberArray.push(myObj);
                        //                 } else {
                        //                     var dataArray = dbo.collection(switlover).find({
                        //                         _id: myLikesArray[j]
                        //                     }).toArray();
                        //                     dataArray.then((result) => {
                        //                         if (!isEmpty(result)) {
                        //                             var likeContactNumber;
                        //                             for (var k = 0; k < result[0]['Phone_Number'].length; k++) {
                        //                                 likeContactNumber = result[0]['Phone_Number'][k]['Contry_Code'] + "" + result[0]['Phone_Number'][k]['Number'];
                        //                                 if (likeContactNumber == number) {
                        //                                     myObj = {
                        //                                         name: data[0]['Contact_List'][i]['name'],
                        //                                         image: data[0]['Contact_List'][i]['image'],
                        //                                         code: data[0]['Contact_List'][i]['code'],
                        //                                         number: number,
                        //                                         isLiked: 1
                        //                                     };
                        //                                 } else {
                        //                                     myObj = {
                        //                                         name: data[0]['Contact_List'][i]['name'],
                        //                                         image: data[0]['Contact_List'][i]['image'],
                        //                                         code: data[0]['Contact_List'][i]['code'],
                        //                                         number: number,
                        //                                         isLiked: 0
                        //                                     };
                        //                                 }
                        //                                 numberArray.push(myObj);
                        //                             }
                        //                         } else {
                        //                             res.json({status: "3", message: "No data"});
                        //                         }
                        //                     }).catch((err) => {
                        //                         // res.json({status: "3", message: "1Internal Server error" + err});
                        //                     })
                        //                 }
                        //             }
                        //         } else {
                        //             if (isEmpty(numberArray)) {
                        //                 res.json({status: "0", message: "Sorry there is no contact to display"});
                        //             }
                        //         }
                        //     }
                        //     res.json({status: "1", message: "Contact List", user_data: numberArray});
                        // }
                        if (!isEmpty(data[0]['Contact_List'])) {
                            var numberArray = [];
                            for (var i = 0; i < (data[0]['Contact_List']).length; i++) {
                                if (data[0]['Contact_List'][i]['isRemovedByAdmin'] == 0 || data[0]['Contact_List'][i]['isRemovedByUser'] == 0) {
                                    var number;
                                    var myObj;
                                    if ((data[0]['Contact_List'][i]['number']).includes(data[0]['Contact_List'][i]['code'])) {
                                        number = data[0]['Contact_List'][i]['number'];
                                    } else {
                                        number = data[0]['Contact_List'][i]['code'] + "" + data[0]['Contact_List'][i]['number'];
                                    }

                                    var myLikesArray = data[0]['Like'];

                                    for (var j = 0; j < myLikesArray.length; j++) {
                                        if (myLikesArray[j].length < 15) {
                                            if (myLikesArray[j] == number) {

                                                myObj = {
                                                    name: data[0]['Contact_List'][i]['name'],
                                                    image: data[0]['Contact_List'][i]['image'],
                                                    code: data[0]['Contact_List'][i]['code'],
                                                    number: number,
                                                    isLiked: 1,
                                                    isRemovedByUser: data[0]['Contact_List'][i]['isRemovedByUser'],
                                                    isRemovedByAdmin: data[0]['Contact_List'][i]['isRemovedByAdmin']
                                                };
                                                break;

                                            } else {

                                                myObj = {
                                                    name: data[0]['Contact_List'][i]['name'],
                                                    image: data[0]['Contact_List'][i]['image'],
                                                    code: data[0]['Contact_List'][i]['code'],
                                                    number: number,
                                                    isLiked: 0,
                                                    isRemovedByUser: data[0]['Contact_List'][i]['isRemovedByUser'],
                                                    isRemovedByAdmin: data[0]['Contact_List'][i]['isRemovedByAdmin']
                                                };
                                            }

                                        }
                                    }
                                    numberArray.push(myObj);
                                } else {
                                    if (isEmpty(numberArray)) {
                                        res.json({status: "0", message: "Sorry there is no contact to display"});
                                    }
                                }
                            }
                            res.json({status: "1", message: "Contact List", userdata: numberArray});
                        }
                    }).catch((err) => {
                        res.json({status: "3", message: "Internal Server error" + err});
                    })
                }
            });
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
                            is_Block: {$ne: 1}
                        }).toArray();
                        dataArray.then((result) => {
                            if (isEmpty(result)) {
                                res.json({status: "0", message: "User not found"});
                            } else {

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
                                                is_Block: {$ne: 1}
                                            }).toArray();
                                            dataArray.then((finalresult) => {
                                                res.json({
                                                    status: "1",
                                                    message: "success",
                                                    user_data: finalresult
                                                });
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
                            Auth_Token: Auth_Token
                        },
                        {
                            $set: {'Phone_Number.is_OverVerification': 1, updatedAt: new Date()}
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
                        Auth_Token: Auth_Token,
                        is_Block: {$ne: 1}
                    }).toArray();
                    dataArray.then((data) => {
                        if (!isEmpty(data[0]['Contact_List'])) {
                            res.json({status: "1", message: "Contact List", user_data: data[0]['Contact_List']});
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
                    var dataNotification = dbo.collection(notification).find({userID: req.body.userID}).toArray();
                    dataNotification.then((result) => {
                        if (isEmpty(result))
                            res.json({status: "0", message: "No notification settings found"});
                        else
                            res.json({status: "1", message: "success", user_data: result});
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
                    var dataNotification = dbo.collection(notification).find({userID: req.body.userID}).toArray();
                    dataNotification.then((result) => {
                        if (isEmpty(result)) {
                            var myObj = {
                                userID: req.body.userID,
                                switlover: {
                                    play_sound_for_every_notification: 0,
                                    play_sound_for_every_message: 0,
                                    likes: 0,
                                    matches: 0,
                                    messages: 0,
                                    power_of_time: 0,
                                    promotions: 0,
                                },
                                phone: {
                                    play_sound_for_every_notification: 0,
                                    play_sound_for_every_message: 0,
                                    likes: 0,
                                    matches: 0,
                                    messages: 0,
                                    power_of_time: 0,
                                    promotions: 0,
                                },
                                email: {
                                    frequency: {
                                        every_notification: 0,
                                        twice_a_day: 0,
                                        once_a_day: 0,
                                        once_a_week: 0,
                                        once_a_month: 0
                                    },
                                    newsletter: 0,
                                    promotions: 0,
                                    likes: 0,
                                    matches: 0,
                                    messages: 0,
                                    power_of_time: 0
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
                                    userID: req.body.userID,
                                },
                                {
                                    $set: {
                                        switlover: {
                                            switlover_play_sound_for_every_notification: req.body.switlover_play_sound_for_every_notification,
                                            switlover_play_sound_for_every_message: req.body.switlover_play_sound_for_every_message,
                                            switlover_likes: req.body.switlover_likes,
                                            switlover_matches: req.body.switlover_matches,
                                            switlover_messages: req.body.switlover_messages,
                                            switlover_power_of_time: req.body.switlover_power_of_time,
                                            switlover_promotions: req.body.switlover_promotions
                                        },
                                        phone: {
                                            phone_play_sound_for_every_notification: req.body.phone_play_sound_for_every_notification,
                                            phone_play_sound_for_every_message: req.body.phone_play_sound_for_every_message,
                                            phone_likes: req.body.phone_likes,
                                            phone_matches: req.body.phone_matches,
                                            phone_messages: req.body.phone_messages,
                                            phone_power_of_time: req.body.phone_power_of_time,
                                            phone_promotions: req.body.phone_promotions
                                        },
                                        email: {
                                            frequency: {
                                                frequency_every_notification: req.body.frequency_every_notification,
                                                frequency_twice_a_day: req.body.frequency_twice_a_day,
                                                frequency_once_a_day: req.body.frequency_once_a_day,
                                                frequency_once_a_week: req.body.frequency_once_a_week,
                                                frequency_once_a_month: req.body.frequency_once_a_month
                                            },
                                            email_newsletter: req.body.email_newsletter,
                                            email_promotions: req.body.email_promotions,
                                            email_likes: req.body.email_likes,
                                            email_matches: req.body.email_matches,
                                            email_messages: req.body.email_messages,
                                            email_power_of_time: req.body.email_power_of_time
                                        }
                                    },
                                }
                            ).then((result) => {

                                if (result['result']['n'] == 1)
                                    res.json({status: "1", message: "notification updated successfully"});
                                else
                                    res.json({status: "3", message: "notification updated failed"});
                            }).catch((err) => {
                                res.json({status: "3 ", message: "notification updated failed"});
                            });
                        }
                    }).catch((err) => {
                        res.json({status: "3 ", message: "Internal server error"});
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
            //get count for not login yet
            app.post('/api/singleUser', (req, res) => {
                var dataArray = dbo.collection(switlover).find({
                    _id: new ObjectId(req.body.id),
                    is_Block: {$ne: 1}
                }).toArray();
                dataArray.then((result) => {
                    if (!isEmpty(result)) {
                        res.json({
                            status: "1",
                            message: "success",
                            userdata: result
                        });
                    }
                }).catch((err) => {
                    res.json({status: "3", message: "Internal server error"});
                })
            })
            //--------------------------------------------------------------------------------------------------------------

            //--------------------------------------------------------------------------------------------------------------
            //get count for not login yet
            app.post('/api/allUser', (req, res) => {
                var dataArray = dbo.collection(switlover).find({}).toArray();
                dataArray.then((result) => {
                    if (!isEmpty(result)) {
                        res.json({
                            status: "1",
                            message: "success",
                            userdata: result
                        });
                    }
                }).catch((err) => {
                    res.json({status: "3", message: "Internal server error"});
                })
            })
            //--------------------------------------------------------------------------------------------------------------

            //--------------------------------------------------------------------------------------------------------------
            //get count for not login yet
            app.post('/api/block_unblock', (req, res) => {

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
            //get count
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
                    is_Block: {$ne: 1}
                }).toArray();

                dataArray.then((data) => {


                    if (!isEmpty(data[0]['Contact_List'])) {
                        var numberArray = [];
                        for (var i = 0; i < (data[0]['Contact_List']).length; i++) {
                            if (data[0]['Contact_List'][i]['isRemovedByAdmin'] == 0 || data[0]['Contact_List'][i]['isRemovedByUser'] == 0) {
                                var number;
                                var myObj;
                                if ((data[0]['Contact_List'][i]['number']).includes(data[0]['Contact_List'][i]['code'])) {
                                    number = data[0]['Contact_List'][i]['number'];
                                } else {
                                    number = data[0]['Contact_List'][i]['code'] + "" + data[0]['Contact_List'][i]['number'];
                                }

                                var myLikesArray = data[0]['Like'];

                                for (var j = 0; j < myLikesArray.length; j++) {
                                    if (myLikesArray[j].length < 15) {
                                        if (myLikesArray[j] == number) {

                                            myObj = {
                                                name: data[0]['Contact_List'][i]['name'],
                                                image: data[0]['Contact_List'][i]['image'],
                                                code: data[0]['Contact_List'][i]['code'],
                                                number: number,
                                                isLiked: 1,
                                                isRemovedByUser: data[0]['Contact_List'][i]['isRemovedByUser'],
                                                isRemovedByAdmin: data[0]['Contact_List'][i]['isRemovedByAdmin']
                                            };
                                            break;

                                        } else {

                                            myObj = {
                                                name: data[0]['Contact_List'][i]['name'],
                                                image: data[0]['Contact_List'][i]['image'],
                                                code: data[0]['Contact_List'][i]['code'],
                                                number: number,
                                                isLiked: 0,
                                                isRemovedByUser: data[0]['Contact_List'][i]['isRemovedByUser'],
                                                isRemovedByAdmin: data[0]['Contact_List'][i]['isRemovedByAdmin']
                                            };
                                        }

                                    }
                                }
                                numberArray.push(myObj);
                            } else {
                                if (isEmpty(numberArray)) {
                                    res.json({status: "0", message: "Sorry there is no contact to display"});
                                }
                            }
                        }
                        res.json({status: "1", message: "Contact List", userdata: numberArray});
                    }
                }).catch((err) => {
                    res.json({status: "3", message: "Internal Server error" + err});
                })
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