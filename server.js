const MongoClient = require('mongodb').MongoClient;
const bodyParser = require('body-parser');
const express = require('express');
const promise = require('promise');
const isEmpty = require('is-empty');
const randtoken = require('rand-token');
const gcm = require('node-gcm');
const request = require('request');
const app = express();
const ObjectId = require('mongodb').ObjectID;

// accessKeyId: "AKIAUPCF3FIA7CXJRKIV",
// secretAccessKey: "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",
// region: 'us-east-2',

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

var sender = new gcm.Sender('AAAA7vn5O1I:APA91bHDisPau4quviRkkmVbvfPnlJox3FprpoPKLD71HXMT-jVajjj5_-pGt2-_E4Ky2ncccEc6_iZHRgrmcRS2o2fng2pyEBUv_OVqeQtTDQyDBEYvf3U0wLKH0nnZaM490ss9ezC3');

function sendNotification(title, body, device_token1, matchUser, currentUser) {
    var message = new gcm.Message({
        priority: 'high',
        data: {match_user: matchUser},
        notification: {
            title: title,
            body: body
        }
    });
    var regTokens = [device_token1];
    sender.send(message, {registrationTokens: regTokens}, function (err, response) {
        if (err) console.error(err);
        else console.log(response);
    });
}

var N1_Title = "User liked";
var N2_Title = "User matched";
var N3_Title = "Preference match update";
var N4_Title = "Match opportunity";
var N5_Title = "Power of Time";
var N6_Title = "Power of Match";
var N7_Title = "Match discoverd";

var notification_body;

function N1(var1, token, title, matchUser) {
    notification_body = var1 + " tagged you. Look among your contacts"
    sendNotification(title, notification_body, token, matchUser)
}

// function N2(var1, var2, var3, token, title, matchUser) {
function N2(token, title, matchUser) {
    // notification_body = var1 + " matches with " + var2 + " and " + var3 + "."
    notification_body = "You have a new Match."
    sendNotification(title, notification_body, token, matchUser)
}

function N3(token, title, matchUser) {
    // notification_body = var1 + " updated match preferences."
    notification_body = "Your match updated match preferences."
    sendNotification(title, notification_body, token, matchUser)
}

function N4(var1, var2, token, title, matchUser) {
    notification_body = var1 + " new matches can be unlocked by tagging " + var2 + " more."
    sendNotification(title, notification_body, token, matchUser)
}

function N5(var1, var2, token, title, matchUser) {
    notification_body = "You have" + var1 + " left to change your mind before " + var2 + " discover about your match."
    sendNotification(title, notification_body, token, matchUser)
}

function N6(var1, token, title, matchUser) {
    notification_body = "You can active your Power of Match to tag back " + var1 + " people that tagged you."
    sendNotification(title, notification_body, token, matchUser)
}

function N7(var1, var2, token, title, matchUser) {
    notification_body = "Congratulation, " + var1 + " using the username " + var2 + " is now a Match."
    sendNotification(title, notification_body, token, matchUser)
}


var rand, mailOptions, host, link;
var tempNumberArray = [];
var tempUserIDArray = [];

var isMatch = false;

// Math.floor(Math.random() * 21) + 61

//--------------------------------------------------------------------------------------------------------------
//COLLECTIONS
var counter = "counters";
var switlover = "switlover";
var notification = "notification";
var match = "match";
var temp_match = "temp_match";
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
                sendNotification("hello_Titile", "Body-body", "cyDsx0BWezc:APA91bEdUaryAoV6-0NaN9a05J56nOXDIt1SDKOYPbdzziaUTeJsB8P0EMaJNnjjGKVaQBssLdp9MruVWviE3-7t0FE3ezttA5y3UGhYkjmbH_cPht225vEkIOrqMOMyLNMYLyLfNoW_")
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
                                } else if (result[0]['is_Block'] == 1 && result[0]['is_Deleted'] == 1) {
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
                                } else if (result[0]['is_Deleted'] == 1) {
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
                                                    delete finalresult[0].UnLikes;
                                                    delete finalresult[0].Match_Ratio;
                                                    delete finalresult[0].PowerID;
                                                    delete finalresult[0].Not_In_App_Purchase;
                                                    delete finalresult[0].language;
                                                    delete finalresult[0].Device;
                                                    delete finalresult[0].createdAt;
                                                    delete finalresult[0].updatedAt;
                                                    delete finalresult[0].deletedAt;
                                                    delete finalresult[0].is_Online;
                                                    delete finalresult[0].Delete_Reason;
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
                                    Device_Token: "",
                                    Username: [],
                                    Phone_Number: [req.body],
                                    Email: {EmailAddress: "", Verified: "false"},
                                    Profile_Pic: "",
                                    Contact_List: [],
                                    Contact_Not_Recognized: 0,
                                    Add_New_Number_From_App: 0,
                                    Contact_Remove_Ratio: 0,
                                    Like: [],
                                    UnLikes: [],
                                    Match_Ratio: {
                                        Two_Out_2_Ratio: 0,
                                        One_Out_1_Ratio: 0,
                                        Anonymous_Chat_Ratio: 0,
                                    },
                                    Not_In_App_Purchase: 0,
                                    PowerID: {Power_Of_Match: 0, Power_Of_Time: 0, Golden_Power: 0},
                                    Delete_Reason: "",
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
                                                                    play_sound_for_every_notification: "1",
                                                                    play_sound_for_every_message: "1",
                                                                    likes: "1",
                                                                    matches: "1",
                                                                    messages: "1",
                                                                    power_of_time: "1",
                                                                    promotions: "1"
                                                                },
                                                                phone: {
                                                                    play_sound_for_every_notification: "1",
                                                                    play_sound_for_every_message: "1",
                                                                    likes: "1",
                                                                    matches: "1",
                                                                    messages: "1",
                                                                    power_of_time: "1",
                                                                    promotions: "1"
                                                                },
                                                                email: {
                                                                    frequency: {
                                                                        every_notification: "0",
                                                                        twice_a_day: "0",
                                                                        once_a_day: "1",
                                                                        once_a_week: "0",
                                                                        once_a_month: "0"
                                                                    },
                                                                    newsletter: "1",
                                                                    promotions: "1",
                                                                    likes: "1",
                                                                    matches: "1",
                                                                    messages: "1",
                                                                    power_of_time: "1"
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
            //Update / insert device token
            app.post('/api/deviceToken', (req, res) => {
                var Auth_Token = req.header('Auth_Token');
                if (!Auth_Token || Auth_Token == null) {
                    res.json({status: "6", message: "Auth token missing"});
                } else {
                    if (!req.body.token || req.body.token == null) {
                        res.json({status: "4", message: "Parameter missing or Invalid"});
                    } else {
                        var ha = dbo.collection(switlover).find({
                            Auth_Token: Auth_Token
                        }).toArray();
                        ha.then((result) => {
                            if (!isEmpty(result)) {
                                if (result[0]['is_Block'] == 0) {
                                    dbo.collection(switlover).updateOne({
                                            Auth_Token: Auth_Token
                                        },
                                        {
                                            $set: {
                                                Device_Token: req.body.token,
                                                updatedAt: new Date()
                                            }
                                        }).then((update) => {
                                        if (update['result']['n'] == 1) {
                                            res.json({status: "1", message: "success"});
                                        } else {
                                            res.json({status: "0", message: "error update"});
                                        }
                                    })
                                }
                            }
                        }).catch()
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

                                            dbo.collection(switlover).updateOne(
                                                {Auth_Token: Auth_Token},
                                                {$set: {Phone_Number: userPhone_Number}})
                                                .then((updateResult) => {
                                                    //Delete this account permenantly with notification and all that
                                                    dbo.collection(switlover).removeOne({_id: new ObjectId(result[0]["_id"])}).then((dataresult) => {

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
                                    {$set: {is_Deleted: 0, Delete_Reason: "", updatedAt: new Date()}}
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
            });
            //--------------------------------------------------------------------------------------------------------------

            //--------------------------------------------------------------------------------------------------------------
            //Delete Account
            app.post('/api/DeleteUser', (req, res) => {
                var Auth_Token = req.header('Auth_Token');
                if (!Auth_Token || Auth_Token == null) {
                    res.json({status: "6", message: "Auth token missing"});
                } else {
                    if (!req.body.reason || req.body.reason == null) {
                        res.json({status: "4", message: "Parameter missing or Invalid"});
                    } else {
                        var dataArray = dbo.collection(switlover).find({Auth_Token: Auth_Token}).toArray();
                        dataArray.then((result) => {
                            if (!isEmpty(result)) {
                                if (result[0]["is_Deleted"] == 1) {
                                    res.json({status: "0", message: "User is already deleted"});
                                } else {
                                    dbo.collection(switlover).updateOne(
                                        {Auth_Token: Auth_Token},
                                        {$set: {is_Deleted: 1, Delete_Reason: req.body.reason, updatedAt: new Date()}}
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
                }
            });
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
                        var final_number = req.body.code + "-" + req.body.number;
                        var isLiked1 = false;
                        var numberArray = [];
                        var dataArray = dbo.collection(switlover).find({
                            Auth_Token: Auth_Token
                        }).toArray();
                        dataArray.then((dataresult) => {
                            let existingLikes;
                            if (dataresult[0]['is_Block'] == 0) {
                                existingLikes = dataresult[0]['Like'];
                                if (!isEmpty(existingLikes)) {
                                    for (var j = 0; j < existingLikes.length; j++) {
                                        var numbe = existingLikes[j].split("-")[1];
                                        if (numbe == req.body.number) {
                                            isLiked1 = true;
                                        } else {
                                            numberArray.push(existingLikes[j])
                                        }
                                    }
                                    if (!isLiked1) {
                                        numberArray.push(final_number);
                                    }
                                } else {
                                    numberArray.push(final_number);
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
            //Match Unlike
            app.post('/api/matchUnlike', (req, res) => {
                var Auth_Token = req.header('Auth_Token');
                if (!Auth_Token || Auth_Token == null) {
                    res.json({status: "6", message: "Auth token missing"});
                } else {
                    if (!req.body || isEmpty(req.body)) {
                        res.json({status: "4", message: "Parameter missing or Invalid"});
                    } else {
                        var myUnlikesArray = [];
                        var matchArray = req.body.match;
                        if (!isEmpty(matchArray)) {
                            for (var i = 0; i < matchArray.length; i++) {
                                for (var j = 0; j < matchArray[i]['number'].length; j++) {
                                    myUnlikesArray.push(matchArray[i]['number'][j])
                                }
                            }
                            dbo.collection(switlover).find({
                                _id: new ObjectId(req.body.userID)
                            }).toArray((error, result) => {
                                if (error)
                                    res.json({status: "0", message: "Error : " + error})
                                if (!isEmpty(result)) {
                                    if (result[0]["is_Block"] == 0) {
                                        var isEnter = false;
                                        var finalMyLikes = [];
                                        var myLikesArray = result[0]['Like']
                                        for (var f = 0; f < myLikesArray.length; f++) {
                                            var number = myLikesArray[f].split("-")[1];
                                            for (var g = 0; g < myUnlikesArray.length; g++) {
                                                if (myUnlikesArray[g] != number) {
                                                    isEnter = true;
                                                } else {
                                                    isEnter = false;
                                                    break;
                                                }
                                            }
                                            if (isEnter) {
                                                finalMyLikes.push(myLikesArray[f])
                                            }
                                        }
                                        dbo.collection(switlover).updateOne({
                                            _id: new ObjectId(req.body.userID)
                                        }, {
                                            Like: finalMyLikes
                                        }).then((rr) => {
                                            if (rr['result']['n'] == 1) {
                                                dbo.collection(switlover).updateOne({
                                                    _id: new ObjectId(req.body.userID)
                                                }, {
                                                    $set: {
                                                        UnLikes: myUnlikesArray
                                                    }
                                                }).then((re) => {
                                                    if (re['result']['n'] == 1) {
                                                        res.json({
                                                            status: "7",
                                                            message: "Now you are not able to like this 3 user's for next 3 months."
                                                        })
                                                    } else {
                                                        res.json({status: "0", message: "error in updating"})
                                                    }
                                                }).catch();
                                            }
                                        })
                                    }
                                }
                            })
                        }
                    }
                }
            });
            //--------------------------------------------------------------------------------------------------------------

            //--------------------------------------------------------------------------------------------------------------
            //Match Logic
            app.post('/api/match', (req, res) => {

                var userIDs = [];

                dbo.collection(switlover).find({}).toArray((err, result) => {
                    if (err) {
                        res.json({status: "0", message: "Error : " + err})
                    }
                    if (!isEmpty(result)) {

                        for (var i = 0; i < result.length; i++) {
                            userIDs.push(result[i]["_id"]);
                        }
                        randomUserID(userIDs, req, res, (err, data) => {
                            tempUserIDArray = [];
                            res.json({status: "1", message: "success"})
                        })

                    } else {
                        res.json({status: "0", message: "Result not found"})
                    }
                });
            });

            function randomUserID(array, req, res, callback) {

                var isAvailable = false;
                var item = array[Math.floor(Math.random() * array.length)];

                if (isEmpty(tempUserIDArray)) {
                    tempUserIDArray.push(item);
                    //Call database query
                    matchLogic(item, array, req, res)
                } else {
                    if (tempUserIDArray.length != array.length) {
                        for (var i = 0; i < tempUserIDArray.length; i++) {
                            if (!(tempUserIDArray[i]).equals(item)) {
                                isAvailable = false;
                            } else {
                                isAvailable = true;
                                break;
                            }
                        }
                        if (isAvailable) {
                            randomUserID(array, req, res);
                        } else {
                            tempUserIDArray.push(item);
                            //Database Query
                            matchLogic(item, array, req, res)
                        }
                    } else {
                        console.log("true")
                        callback(item);
                        // return true;
                    }
                }
            }

            function matchLogic(userid, array, req, res) {
                var myArray = [];
                dbo.collection(switlover).find({
                    _id: new ObjectId(userid)
                }).toArray((error, AllUserArray) => {
                    if (error) res.json({status: "0", message: "Error"});
                    if (!isEmpty(AllUserArray)) {
                        if (AllUserArray[0]["is_Block"] == 0) {
                            var myNumber = AllUserArray[0]['Phone_Number'];
                            var likeByMeArray = AllUserArray[0]['Like'];
                            if (likeByMeArray.length > 3) {
                                // if (!isEmpty(likeByMeArray)) {
                                var arrayCounter = 0;
                                for (var i = 0; i < likeByMeArray.length; i++) {
                                    var num = likeByMeArray[i].split("-")[1]
                                    dbo.collection(switlover).find({'Phone_Number.Number': num}).toArray((err, result) => {
                                        if (err) console.log(err)
                                        else {
                                            if (!isEmpty(result)) {
                                                if (result[0]["is_Block"] == 0) {
                                                    var likeByHim = result[0]['Like']
                                                    if (!isEmpty(likeByHim)) {
                                                        for (var j = 0; j < likeByHim.length; j++) {
                                                            var numb = likeByHim[j].split("-")[1]
                                                            for (var k = 0; k < myNumber.length; k++) {
                                                                if (myNumber[k]['Number'] == numb) {
                                                                    var Current_User_Preferance = {
                                                                        out_1: 0,
                                                                        out_2: 0,
                                                                        anonymas_chat: 0,
                                                                        is_Set: false
                                                                    }
                                                                    var Match_User_Preferance = {
                                                                        out_1: 0,
                                                                        out_2: 0,
                                                                        anonymas_chat: 0,
                                                                        is_Set: false
                                                                    }
                                                                    var myObj = {
                                                                        matchUserID: result[0]['_id'],
                                                                        currentUserPreferenace: Current_User_Preferance,
                                                                        matchUserPreferenace: Match_User_Preferance,
                                                                        number: result[0]['Phone_Number'],
                                                                        isUsed: false,
                                                                        isAvailable: true
                                                                    }
                                                                    myArray.push(myObj)
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                            arrayCounter = arrayCounter + 1;
                                            if (arrayCounter == likeByMeArray.length) {
                                                timeOutCall(myArray, AllUserArray, array, req, res);
                                            }
                                        }
                                    })
                                }
                            } else {
                                // res.json({
                                //     status: "7",
                                //     message: "You don't have the sufficent likes to get your match...!!!"
                                // })
                                randomUserID(array, req, res, (err, data) => {
                                    tempUserIDArray = [];
                                    res.json({status: "1", message: "success"})
                                });
                            }
                        }
                    }
                })
            }

            function timeOutCall(myArray, AllUserArray, array, req, res) {
                if (!isEmpty(myArray)) {
                    var arr = myArray;
                    var tempAray = myArray
                    if (myArray.length > 1) {
                        for (var z = 0; z < tempAray.length; z++) {
                            for (var y = 0; y < myArray.length; y++) {
                                if (z != y) {
                                    if (tempAray[z]['matchUserID'].equals(myArray[y]['matchUserID'])) {
                                        arr.splice(y, 1);
                                    }
                                }
                            }
                        }
                    }

                    dbo.collection(match).find({}).toArray((errresu, resul) => {
                        if (!isEmpty(resul)) {
                            dbo.collection(match).find({
                                currentUserID: new ObjectId(AllUserArray[0]['_id'])
                            }).toArray((result1err, result1) => {
                                if (!isEmpty(result1)) {
                                    for (var h = 0; h < arr.length; h++) {
                                        for (var a = 0; a < result1[0]["matchUser"].length; a++) {
                                            if (arr[h]["matchUserID"].equals(result1[0]["matchUser"][a]["matchUserID"])) {
                                                if (arr[h]["isUsed"] != result1[0]["matchUser"][a]["isUsed"]) {
                                                    arr.push({
                                                        matchUserID: arr[h]["matchUserID"],
                                                        currentUserPreferenace: result1[0]["matchUser"][a]["currentUserPreferenace"],
                                                        matchUserPreferenace: result1[0]["matchUser"][a]["matchUserPreferenace"],
                                                        number: arr[h]["number"],
                                                        isUsed: true,
                                                        isAvailable: result1[0]["matchUser"][a]["isAvailable"]
                                                    })
                                                    arr.splice(h, 1);
                                                } else {
                                                    arr.push({
                                                        matchUserID: arr[h]["matchUserID"],
                                                        currentUserPreferenace: result1[0]["matchUser"][a]["currentUserPreferenace"],
                                                        matchUserPreferenace: result1[0]["matchUser"][a]["matchUserPreferenace"],
                                                        number: arr[h]["number"],
                                                        isUsed: false,
                                                        isAvailable: result1[0]["matchUser"][a]["isAvailable"]
                                                    })
                                                    arr.splice(h, 1);
                                                }

                                            }
                                        }
                                    }

                                    dbo.collection(match).updateOne(
                                        {currentUserID: new ObjectId(AllUserArray[0]['_id'])},
                                        {$set: {matchUser: arr}}
                                    ).then((resu) => {
                                        if (resu['result']['n'] == 1) {
                                            //success
                                            // res.json({
                                            //     status: "1",
                                            //     message: "success",
                                            //     isAvailable: "1"
                                            // });
                                            randomUserID(array, req, res, (err, data) => {
                                                tempUserIDArray = [];
                                                res.json({status: "1", message: "success"})
                                            });
                                        } else {
                                            //already up to date
                                            // res.json({
                                            //     status: "1",
                                            //     message: "Already up-to date",
                                            //     isAvailable: "1"
                                            // });
                                            randomUserID(array, req, res, (err, data) => {
                                                tempUserIDArray = [];
                                                res.json({status: "1", message: "success"})
                                            });
                                        }
                                    }).catch((err) => {

                                    });
                                } else {

                                    var myObj = {
                                        currentUserID: AllUserArray[0]['_id'],
                                        matchUser: arr,
                                        isAvailable: true
                                    }
                                    dbo.collection(match).insertOne(myObj).then((result) => {
                                        // res.json({status: "1", message: "success", isAvailable: "1"});
                                        randomUserID(array, req, res, (err, data) => {
                                            tempUserIDArray = [];
                                            res.json({status: "1", message: "success"})
                                        });
                                    }).catch((err) => {
                                    })
                                }
                            });
                        } else {
                            var myObj = {
                                currentUserID: AllUserArray[0]['_id'],
                                matchUser: arr,
                                isAvailable: true
                            }
                            dbo.collection(match).insertOne(myObj).then((result) => {
                                // res.json({status: "1", message: "success", isAvailable: "1"});
                                randomUserID(array, req, res, (err, data) => {
                                    tempUserIDArray = [];
                                    res.json({status: "1", message: "success"})
                                });
                            }).catch((err) => {
                            })
                        }
                    });
                } else {
                    // res.json({status: "0", message: "No match found"});
                    randomUserID(array, req, res, (err, data) => {
                        tempUserIDArray = [];
                        res.json({status: "1", message: "success"})
                    });
                }
            }

            //--------------------------------------------------------------------------------------------------------------

            //--------------------------------------------------------------------------------------------------------------
            //Get Match
            app.post('/api/getMatch', (req, res) => {
                tempNumberArray = [];
                var matchID;
                var matchUsername;
                var matchDeviceToken;
                var arrTempMatch = [];
                var Auth_Token = req.header('Auth_Token');
                if (!Auth_Token || Auth_Token == null) {
                    res.json({status: "6", message: "Auth token missing"});
                } else {
                    if (!req.body.userID || isEmpty(req.body.userID)) {
                        res.json({status: "4", message: "Parameter missing or Invalid"});
                    } else {
                        dbo.collection(match).find({currentUserID: new ObjectId(req.body.userID)}).toArray((err, result) => {
                            if (err) res.json({status: "0", message: "Error"});
                            if (!isEmpty(result)) {
                                var myArray = [];
                                for (var i = 0; i < result[0]["matchUser"].length; i++) {
                                    if (result[0]["matchUser"][i]["isUsed"] == false && result[0]["matchUser"][i]["isAvailable"] == true) {
                                        myArray.push(result[0]["matchUser"][i])
                                    }
                                }
                                if (!isEmpty(myArray)) {
                                    dbo.collection(switlover).find({_id: new ObjectId(myArray[0]["matchUserID"])}).toArray((err1, result1) => {
                                        if (err1) res.json({status: "0", message: "Error"});
                                        if (!isEmpty(result1)) {
                                            if (result1[0]['is_Block'] == 0) {
                                                matchID = result1[0]['_id'];
                                                matchDeviceToken = result1[0]['Device_Token'];
                                                matchUsername = result1[0]['Username'][result1[0]['Username'].length - 1];
                                                var matchObj = {
                                                    id: result1[0]['_id'],
                                                    name: result1[0]['Username'][result1[0]['Username'].length - 1],
                                                    profile_pic: result1[0]['Profile_Pic'],
                                                    number: result1[0]['Phone_Number'],
                                                    isMatch: true
                                                }
                                                arrTempMatch.push(matchObj);
                                                dbo.collection(switlover).find({_id: new ObjectId(req.body.userID)}).toArray((err3, result3) => {
                                                    if (err3) res.json({status: "0", message: "Error"});
                                                    if (!isEmpty(result3)) {
                                                        if (result3[0]["is_Block"] == 0) {
                                                            var randomNumbers;
                                                            randomNumbers = randomNumber(result3[0]['Like'], result[0]);
                                                            if (!isEmpty(randomNumbers)) {
                                                                if (randomNumbers.length > 1) {
                                                                    var numb0 = randomNumbers[0].split("-")[1]
                                                                    var numb1 = randomNumbers[1].split("-")[1]
                                                                    dbo.collection(switlover).find({"Phone_Number.Number": numb0}).toArray((err2, result2) => {
                                                                        if (err2) res.json({status: "0", message: "Error"});
                                                                        if (!isEmpty(result2)) {
                                                                            var myObj = {
                                                                                id: "",
                                                                                name: result2[0]['Username'][result2[0]['Username'].length - 1],
                                                                                profile_pic: result2[0]['Profile_Pic'],
                                                                                number: [{
                                                                                    Number : numb0
                                                                                }],
                                                                                isMatch: false
                                                                            }
                                                                            arrTempMatch.push(myObj)
                                                                        } else {
                                                                            var myObj = {
                                                                                id: "",
                                                                                name: numb0,
                                                                                number: [{
                                                                                    Number : numb0
                                                                                }],
                                                                                profile_pic: "",
                                                                                isMatch: false
                                                                            }
                                                                            arrTempMatch.push(myObj)
                                                                        }
                                                                    })
                                                                    var isUser = false;
                                                                    dbo.collection(switlover).find({"Phone_Number.Number": numb1}).toArray((err4, result4) => {
                                                                        if (err4) res.json({status: "0", message: "Error"});
                                                                        if (!isEmpty(result4)) {
                                                                            var myObj = {
                                                                                id: "",
                                                                                name: result4[0]['Username'][result4[0]['Username'].length - 1],
                                                                                profile_pic: result4[0]['Profile_Pic'],
                                                                                number: [{
                                                                                    Number : numb1
                                                                                }],
                                                                                isMatch: false
                                                                            }
                                                                            arrTempMatch.push(myObj)
                                                                        } else {
                                                                            var myObj = {
                                                                                id: "",
                                                                                name: numb1,
                                                                                profile_pic: "",
                                                                                number: [{
                                                                                    Number : numb1
                                                                                }],
                                                                                isMatch: false
                                                                            }
                                                                            arrTempMatch.push(myObj)
                                                                        }
                                                                    })

                                                                    setTimeout(function () {
                                                                        dbo.collection(match).find({
                                                                            currentUserID: new ObjectId(req.body.userID),
                                                                            'matchUser.matchUserID': new ObjectId(myArray[0]["matchUserID"])
                                                                        }).toArray((err9, result9) => {
                                                                            if (err9) {
                                                                            }
                                                                            if (!isEmpty(result9)) {
                                                                                if (result9[0]['isAvailable'] == true && myArray[0]["isAvailable"] == true) {
                                                                                    dbo.collection(match).updateOne({
                                                                                            currentUserID: new ObjectId(req.body.userID),
                                                                                            'matchUser.matchUserID': new ObjectId(myArray[0]["matchUserID"])
                                                                                        },
                                                                                        {
                                                                                            $set: {
                                                                                                'matchUser.$.isUsed': true,
                                                                                                'matchUser.$.isAvailable': false,
                                                                                                isAvailable: false
                                                                                            }
                                                                                        }).then((re) => {
                                                                                        if (re['result']['n'] == 1) {

                                                                                            dbo.collection(match).updateOne({
                                                                                                    currentUserID: new ObjectId(myArray[0]["matchUserID"]),
                                                                                                    'matchUser.matchUserID': new ObjectId(req.body.userID)
                                                                                                },
                                                                                                {
                                                                                                    $set: {
                                                                                                        'matchUser.$.isUsed': true,
                                                                                                        'matchUser.$.isAvailable': false,
                                                                                                        isAvailable: false
                                                                                                    }
                                                                                                }).then((rr) => {
                                                                                                if (rr['result']['n'] == 1) {
                                                                                                    dbo.collection(match).updateOne({
                                                                                                            currentUserID: new ObjectId(myArray[0]["matchUserID"])
                                                                                                        },
                                                                                                        {
                                                                                                            $set: {
                                                                                                                isAvailable: false
                                                                                                            }
                                                                                                        }).then((resu) => {
                                                                                                        if (resu['result']['n'] == 1) {
                                                                                                            dbo.collection(match).updateMany({
                                                                                                                    'matchUser.matchUserID': new ObjectId(req.body.userID)
                                                                                                                },
                                                                                                                {
                                                                                                                    $set: {
                                                                                                                        'matchUser.$.isAvailable': false
                                                                                                                    }
                                                                                                                }).then((resul) => {
                                                                                                                if (resul['result']['n'] >= 1) {
                                                                                                                    var myObj = {
                                                                                                                        currentU: req.body.userID,
                                                                                                                        matchA: arrTempMatch
                                                                                                                    }
                                                                                                                    dbo.collection(temp_match).find({
                                                                                                                        currentU: req.body.userID
                                                                                                                    }).toArray((e, r) => {
                                                                                                                        if (e) {
                                                                                                                            //error in find
                                                                                                                        }
                                                                                                                        if (!isEmpty(r)) {
                                                                                                                            dbo.collection(temp_match).updateOne({
                                                                                                                                currentU: req.body.userID
                                                                                                                            }, {
                                                                                                                                $set: {
                                                                                                                                    matchA: arrTempMatch
                                                                                                                                }
                                                                                                                            }).then((r1) => {
                                                                                                                                if (r1['result']['n'] == 1) {
                                                                                                                                    //Updated successfully
                                                                                                                                    // N2(matchDeviceToken,N2_Title);
                                                                                                                                    res.json({
                                                                                                                                        status: "1",
                                                                                                                                        message: "Success",
                                                                                                                                        user_data: arrTempMatch
                                                                                                                                    });
                                                                                                                                } else {
                                                                                                                                    // N2(matchDeviceToken,N2_Title);
                                                                                                                                    res.json({
                                                                                                                                        status: "1",
                                                                                                                                        message: "Success",
                                                                                                                                        user_data: arrTempMatch
                                                                                                                                    });
                                                                                                                                    //already uptodate
                                                                                                                                }
                                                                                                                            }).catch();
                                                                                                                        } else {
                                                                                                                            dbo.collection(temp_match).insertOne(myObj, (ee, rr) => {
                                                                                                                                if (ee) {
                                                                                                                                    //Error while inserting
                                                                                                                                } else {
                                                                                                                                    //insert successfully
                                                                                                                                    N2(matchDeviceToken,N2_Title);
                                                                                                                                    res.json({
                                                                                                                                        status: "1",
                                                                                                                                        message: "Success",
                                                                                                                                        user_data: arrTempMatch
                                                                                                                                    });
                                                                                                                                }
                                                                                                                            })
                                                                                                                        }
                                                                                                                    })
                                                                                                                }
                                                                                                            }).catch()
                                                                                                        }
                                                                                                    }).catch()
                                                                                                }
                                                                                            });
                                                                                        }
                                                                                    })
                                                                                } else {
                                                                                    return false;
                                                                                }
                                                                            }
                                                                        })
                                                                    }, 10000);

                                                                } else {
                                                                    randomNumbers = randomNumber(result3[0]['Like'], result[0]);
                                                                }
                                                            }
                                                        }
                                                    }
                                                });
                                            }
                                        }
                                    })
                                } else {
                                    res.json({status: "0", message: "No match found yet"})
                                }
                            } else {
                                res.json({status: "0", message: "No match found yet"})
                            }
                        })
                    }
                }
            });

            function randomNumber(array, arr1) {
                // let array1 = shuffle(array);
                var item = array[Math.floor(Math.random() * array.length)];
                // for (var m = 0; m < 2; m++) {
                // var item = array1[m];
                var num = item.split("-")[1]
                for (var k = 0; k < arr1["matchUser"].length; k++) {
                    for (var l = 0; l < arr1["matchUser"][k]["number"].length; l++) {
                        if (num == arr1["matchUser"][k]["number"][l]['Number']) {
                            isMatch = true
                            randomNumber(array, arr1)
                        } else {
                            isMatch = false
                        }
                    }
                }
                // }
                if (!isMatch) {
                    if (isEmpty(tempNumberArray)) {
                        tempNumberArray.push(item);
                        randomNumber(array, arr1);
                    } else {
                        if (tempNumberArray[0] != item) {
                            tempNumberArray.push(item);
                        } else {
                            randomNumber(array, arr1);
                        }
                    }
                }
                return tempNumberArray
            }

            //--------------------------------------------------------------------------------------------------------------

            //--------------------------------------------------------------------------------------------------------------
            //Match prefereances
            app.post('/api/MatchPreference', (req, res) => {
                var jsonObj;
                var Auth_Token = req.header('Auth_Token');
                if (!Auth_Token || Auth_Token == null) {
                    res.json({status: "6", message: "Auth token missing"});
                } else {
                    if (!req.body || isEmpty(req.body)) {
                        if (!req.body.match || isEmpty(req.body.match)) {
                            res.json({status: "4", message: "Match parameter missing or Invalid"});
                        }
                        res.json({status: "4", message: "Parameter missing or Invalid"});
                    } else {
                        var stringdata = req.body.match;
                        if (stringdata == "[]" || stringdata == "") {
                            res.json({status: "4", message: "Match parameter missing or Invalid"});
                        } else {
                            jsonObj = JSON.parse(stringdata);
                        }
                        var isCID = false;
                        if ((new ObjectId(jsonObj[0]['id'])).equals(new ObjectId(req.body.cid))) {
                            isCID = true;
                            var myObj = {
                                currentU: req.body.mid,
                                matchA: jsonObj
                            }
                            dbo.collection(temp_match).find({
                                currentU: req.body.mid
                            }).toArray((e, r) => {
                                if (e) {
                                    //error in find
                                }
                                if (!isEmpty(r)) {
                                    dbo.collection(temp_match).updateOne({
                                        currentU: req.body.mid
                                    }, {
                                        $set: {
                                            matchA: jsonObj
                                        }
                                    }).then((r1) => {
                                        if (r1['result']['n'] == 1) {
                                            //Updated successfully
                                        } else {
                                            //already uptodate
                                        }
                                    }).catch();
                                } else {
                                    dbo.collection(temp_match).insertOne(myObj, (ee, rr) => {
                                        if (ee) {
                                            //Error while inserting
                                        } else {
                                            //insert successfully
                                        }
                                    })
                                }
                            })
                        } else {
                            isCID = false;
                            var myObj = {
                                currentU: req.body.cid,
                                matchA: jsonObj
                            }
                            dbo.collection(temp_match).find({
                                currentU: req.body.cid
                            }).toArray((e, r) => {
                                if (e) {
                                    //error in find
                                }
                                if (!isEmpty(r)) {
                                    dbo.collection(temp_match).updateOne({
                                        currentU: req.body.cid
                                    }, {
                                        $set: {
                                            matchA: jsonObj
                                        }
                                    }).then((r1) => {
                                        if (r1['result']['n'] == 1) {
                                            //Updated successfully
                                        } else {
                                            //already uptodate
                                        }
                                    }).catch();
                                } else {
                                    dbo.collection(temp_match).insertOne(myObj, (ee, rr) => {
                                        if (ee) {
                                            //Error while inserting
                                        } else {
                                            //insert successfully
                                        }
                                    })
                                }
                            })
                        }

                        var mid = new ObjectId(req.body.mid);
                        var ah = dbo.collection(match).find({
                            currentUserID: new ObjectId(req.body.cid),
                            'matchUser.matchUserID': new ObjectId(req.body.mid)
                        }).toArray();
                        ah.then((result) => {
                            if (!isEmpty(result)) {
                                for (var a = 0; a < result[0]["matchUser"].length; a++) {
                                    if ((mid).equals(result[0]["matchUser"][a]["matchUserID"])) {
                                        if (result[0]['matchUser'][a]['isUsed'] == true) {
                                            if (result[0]['matchUser'][a]['currentUserPreferenace']['is_Set'] == false || result[0]['matchUser'][a]['matchUserPreferenace']['is_Set'] == false) {
                                                dbo.collection(match).updateOne({
                                                        currentUserID: new ObjectId(req.body.cid),
                                                        'matchUser.matchUserID': new ObjectId(req.body.mid)
                                                    },
                                                    {
                                                        $set: {
                                                            'matchUser.$.currentUserPreferenace.is_Set': true,
                                                            'matchUser.$.currentUserPreferenace.out_1': req.body.out_1,
                                                            'matchUser.$.currentUserPreferenace.out_2': req.body.out_2,
                                                            'matchUser.$.currentUserPreferenace.anonymas_chat': req.body.chat
                                                        }
                                                    }).then((responce) => {
                                                    if (responce['result']['n'] == 1) {

                                                        dbo.collection(match).updateOne({
                                                                'currentUserID': new ObjectId(req.body.mid),
                                                                'matchUser.matchUserID': new ObjectId(req.body.cid)
                                                            },
                                                            {
                                                                $set: {
                                                                    'matchUser.$.matchUserPreferenace.is_Set': true,
                                                                    'matchUser.$.matchUserPreferenace.out_1': req.body.out_1,
                                                                    'matchUser.$.matchUserPreferenace.out_2': req.body.out_2,
                                                                    'matchUser.$.matchUserPreferenace.anonymas_chat': req.body.chat
                                                                }
                                                            }).then((re) => {
                                                            if (re['result']['n'] == 1) {

                                                                var ah = dbo.collection(switlover).find({
                                                                    _id: new ObjectId(req.body.mid)
                                                                }).toArray();
                                                                ah.then((result26) => {
                                                                    // N3(result26[0]['Device_Token'], N3_Title)
                                                                    // N3("cyDsx0BWezc:APA91bEdUaryAoV6-0NaN9a05J56nOXDIt1SDKOYPbdzziaUTeJsB8P0EMaJNnjjGKVaQBssLdp9MruVWviE3-7t0FE3ezttA5y3UGhYkjmbH_cPht225vEkIOrqMOMyLNMYLyLfNoW_", N3_Title, "", "")
                                                                })

                                                                var ha = dbo.collection(match).find({
                                                                    currentUserID: new ObjectId(req.body.cid),
                                                                    'matchUser.matchUserID': new ObjectId(req.body.mid)
                                                                }).toArray();
                                                                ha.then((result1) => {
                                                                    if (!isEmpty(result1)) {
                                                                        for (var h = 0; h < result1[0]["matchUser"].length; h++) {
                                                                            if ((mid).equals(result1[0]["matchUser"][h]["matchUserID"])) {
                                                                                if (result1[0]['matchUser'][h]['currentUserPreferenace']['is_Set'] == true && result1[0]['matchUser'][h]['matchUserPreferenace']['is_Set'] == true) {
                                                                                    //1 out 1 - 1 out 1 = Normal chat
                                                                                    if (result1[0]['matchUser'][h]['currentUserPreferenace']['out_1'] == 1 && result1[0]['matchUser'][h]['matchUserPreferenace']['out_1'] == 1) {
                                                                                        //Fire Notification
                                                                                        var ah = dbo.collection(switlover).find({
                                                                                            _id: new ObjectId(req.body.cid)
                                                                                        }).toArray();
                                                                                        ah.then((result2) => {
                                                                                            if (!isEmpty(result2)) {
                                                                                                if (result2[0]['is_Block'] == 0) {
                                                                                                    var hah = dbo.collection(switlover).find({
                                                                                                        _id: new ObjectId(req.body.mid)
                                                                                                    }).toArray();
                                                                                                    hah.then((result3) => {
                                                                                                        if (!isEmpty(result3)) {
                                                                                                            if (result3[0]['is_Block'] == 0) {
                                                                                                                for (var i = 0; i < result3[0]['Phone_Number'].length; i++) {
                                                                                                                    for (var g = 0; g < result2[0]['Contact_List'].length; g++) {
                                                                                                                        if (result2[0]['Contact_List'][g]['number'] == result3[0]['Phone_Number'][i]['Number']) {
                                                                                                                            N7(result2[0]['Contact_List'][g]['name'], result2[0]['Username'][(result2[0]['Username'].length) - 1], result2[0]['Device_Token'], N7_Title, result3[0]['_id'])
                                                                                                                        }
                                                                                                                    }
                                                                                                                }
                                                                                                            }
                                                                                                        }
                                                                                                    })
                                                                                                }
                                                                                            }
                                                                                        })
                                                                                        var ah = dbo.collection(switlover).find({
                                                                                            _id: new ObjectId(req.body.mid)
                                                                                        }).toArray();
                                                                                        ah.then((result4) => {
                                                                                            if (!isEmpty(result4)) {
                                                                                                if (result4[0]['is_Block'] == 0) {
                                                                                                    var hah = dbo.collection(switlover).find({
                                                                                                        _id: new ObjectId(req.body.cid)
                                                                                                    }).toArray();
                                                                                                    hah.then((result5) => {
                                                                                                        if (!isEmpty(result5)) {
                                                                                                            if (result5[0]['is_Block'] == 0) {
                                                                                                                for (var i = 0; i < result5[0]['Phone_Number'].length; i++) {
                                                                                                                    for (var g = 0; g < result4[0]['Contact_List'].length; g++) {
                                                                                                                        if (result4[0]['Contact_List'][g]['number'] == result5[0]['Phone_Number'][i]['Number']) {
                                                                                                                            N7(result4[0]['Contact_List'][g]['name'], result4[0]['Username'][(result4[0]['Username'].length) - 1], result4[0]['Device_Token'], N7_Title, result5[0]['_id'])
                                                                                                                        }
                                                                                                                    }
                                                                                                                }
                                                                                                            }
                                                                                                        }
                                                                                                    })
                                                                                                }
                                                                                            }
                                                                                        })
                                                                                        res.json({
                                                                                            status: "1",
                                                                                            message: "success",
                                                                                            notification_type: 7
                                                                                        });
                                                                                    }
                                                                                    //1 out 1 - 1 out 2 = 1 out 2
                                                                                    else if (result1[0]['matchUser'][h]['currentUserPreferenace']['out_1'] == 1 && result1[0]['matchUser'][h]['matchUserPreferenace']['out_1'] == 0 && result1[0]['matchUser'][h]['matchUserPreferenace']['out_2'] == 1 && result1[0]['matchUser'][h]['matchUserPreferenace']['anonymas_chat'] == 0) {
                                                                                        var matchArray = jsonObj;
                                                                                        matchArray.pop()
                                                                                        if (matchArray.length > 1) {
                                                                                            if (isCID) {
                                                                                                dbo.collection(temp_match).updateOne({
                                                                                                    currentU: req.body.mid
                                                                                                }, {
                                                                                                    $set: {
                                                                                                        matchA: matchArray
                                                                                                    }
                                                                                                }).then((r1) => {
                                                                                                    if (r1['result']['n'] == 1) {
                                                                                                        //Updated successfully
                                                                                                        res.json({
                                                                                                            status: "1",
                                                                                                            message: "success",
                                                                                                            notification_type: 1,
                                                                                                            match: matchArray
                                                                                                        });
                                                                                                    } else {
                                                                                                        res.json({
                                                                                                            status: "1",
                                                                                                            message: "updated or fail to update",
                                                                                                            notification_type: 1,
                                                                                                            match: matchArray
                                                                                                        });
                                                                                                        //already uptodate
                                                                                                    }
                                                                                                }).catch();
                                                                                            } else {
                                                                                                dbo.collection(temp_match).updateOne({
                                                                                                    currentU: req.body.cid
                                                                                                }, {
                                                                                                    $set: {
                                                                                                        matchA: matchArray
                                                                                                    }
                                                                                                }).then((r1) => {
                                                                                                    if (r1['result']['n'] == 1) {
                                                                                                        //Updated successfully
                                                                                                        res.json({
                                                                                                            status: "1",
                                                                                                            message: "success",
                                                                                                            notification_type: 1,
                                                                                                            match: matchArray
                                                                                                        });
                                                                                                    } else {
                                                                                                        res.json({
                                                                                                            status: "1",
                                                                                                            message: "updated or fail to update",
                                                                                                            notification_type: 1,
                                                                                                            match: matchArray
                                                                                                        });
                                                                                                        //already uptodate
                                                                                                    }
                                                                                                }).catch();
                                                                                            }

                                                                                        } else {
                                                                                            if (matchArray[0]["isMatch"] == true) {
                                                                                                var ah = dbo.collection(switlover).find({
                                                                                                    _id: new ObjectId(req.body.cid)
                                                                                                }).toArray();
                                                                                                ah.then((result2) => {
                                                                                                    if (!isEmpty(result2)) {
                                                                                                        if (result2[0]['is_Block'] == 0) {
                                                                                                            var hah = dbo.collection(switlover).find({
                                                                                                                _id: new ObjectId(req.body.mid)
                                                                                                            }).toArray();
                                                                                                            hah.then((result3) => {
                                                                                                                if (!isEmpty(result3)) {
                                                                                                                    if (result3[0]['is_Block'] == 0) {
                                                                                                                        for (var i = 0; i < result3[0]['Phone_Number'].length; i++) {
                                                                                                                            for (var g = 0; g < result2[0]['Contact_List'].length; g++) {
                                                                                                                                if (result2[0]['Contact_List'][g]['number'] == result3[0]['Phone_Number'][i]['Number']) {
                                                                                                                                    N7(result2[0]['Contact_List'][g]['name'], result2[0]['Username'][(result2[0]['Username'].length) - 1], result2[0]['Device_Token'], N7_Title, result3[0]['_id'])
                                                                                                                                }
                                                                                                                            }
                                                                                                                        }
                                                                                                                    }
                                                                                                                }
                                                                                                            })
                                                                                                        }
                                                                                                    }
                                                                                                })
                                                                                                var ah = dbo.collection(switlover).find({
                                                                                                    _id: new ObjectId(req.body.mid)
                                                                                                }).toArray();
                                                                                                ah.then((result4) => {
                                                                                                    if (!isEmpty(result4)) {
                                                                                                        if (result4[0]['is_Block'] == 0) {
                                                                                                            var hah = dbo.collection(switlover).find({
                                                                                                                _id: new ObjectId(req.body.cid)
                                                                                                            }).toArray();
                                                                                                            hah.then((result5) => {
                                                                                                                if (!isEmpty(result5)) {
                                                                                                                    if (result5[0]['is_Block'] == 0) {
                                                                                                                        for (var i = 0; i < result5[0]['Phone_Number'].length; i++) {
                                                                                                                            for (var g = 0; g < result4[0]['Contact_List'].length; g++) {
                                                                                                                                if (result4[0]['Contact_List'][g]['number'] == result5[0]['Phone_Number'][i]['Number']) {
                                                                                                                                    N7(result4[0]['Contact_List'][g]['name'], result4[0]['Username'][(result4[0]['Username'].length) - 1], result4[0]['Device_Token'], N7_Title, result5[0]['_id'])
                                                                                                                                }
                                                                                                                            }
                                                                                                                        }
                                                                                                                    }
                                                                                                                }
                                                                                                            })
                                                                                                        }
                                                                                                    }
                                                                                                })
                                                                                                res.json({
                                                                                                    status: "1",
                                                                                                    message: "success",
                                                                                                    notification_type: 7
                                                                                                });
                                                                                            }
                                                                                        }
                                                                                    }
                                                                                    //1 out 1 - chat = chat
                                                                                    else if (result1[0]['matchUser'][h]['currentUserPreferenace']['out_1'] == 1 && result1[0]['matchUser'][h]['matchUserPreferenace']['out_1'] == 0 && result1[0]['matchUser'][h]['matchUserPreferenace']['out_2'] == 0 && result1[0]['matchUser'][h]['matchUserPreferenace']['anonymas_chat'] == 1) {
                                                                                        var matchArray = jsonObj;

                                                                                        if (isCID) {
                                                                                            dbo.collection(temp_match).updateOne({
                                                                                                currentU: req.body.mid
                                                                                            }, {
                                                                                                $set: {
                                                                                                    matchA: matchArray
                                                                                                }
                                                                                            }).then((r1) => {
                                                                                                if (r1['result']['n'] == 1) {
                                                                                                    //Updated successfully
                                                                                                    res.json({
                                                                                                        status: "1",
                                                                                                        message: "success",
                                                                                                        notification_type: 0,
                                                                                                        match: matchArray
                                                                                                    });
                                                                                                } else {
                                                                                                    res.json({
                                                                                                        status: "1",
                                                                                                        message: "updated or fail to update",
                                                                                                        notification_type: 0,
                                                                                                        match: matchArray
                                                                                                    });
                                                                                                    //already uptodate
                                                                                                }
                                                                                            }).catch();
                                                                                        } else {
                                                                                            dbo.collection(temp_match).updateOne({
                                                                                                currentU: req.body.cid
                                                                                            }, {
                                                                                                $set: {
                                                                                                    matchA: matchArray
                                                                                                }
                                                                                            }).then((r1) => {
                                                                                                if (r1['result']['n'] == 1) {
                                                                                                    //Updated successfully
                                                                                                    res.json({
                                                                                                        status: "1",
                                                                                                        message: "success",
                                                                                                        notification_type: 0,
                                                                                                        match: matchArray
                                                                                                    });
                                                                                                } else {
                                                                                                    res.json({
                                                                                                        status: "1",
                                                                                                        message: "updated or fail to update",
                                                                                                        notification_type: 0,
                                                                                                        match: matchArray
                                                                                                    });
                                                                                                    //already uptodate
                                                                                                }
                                                                                            }).catch();
                                                                                        }
                                                                                    }
                                                                                    //1 out 1 -  = x
                                                                                    else if (result1[0]['matchUser'][h]['currentUserPreferenace']['out_1'] == 1 && result1[0]['matchUser'][h]['matchUserPreferenace']['out_1'] == 0 && result1[0]['matchUser'][h]['matchUserPreferenace']['out_2'] == 0 && result1[0]['matchUser'][h]['matchUserPreferenace']['anonymas_chat'] == 0) {
                                                                                        var matchArray = jsonObj;

                                                                                        if (isCID) {
                                                                                            dbo.collection(temp_match).updateOne({
                                                                                                currentU: req.body.mid
                                                                                            }, {
                                                                                                $set: {
                                                                                                    matchA: matchArray
                                                                                                }
                                                                                            }).then((r1) => {
                                                                                                if (r1['result']['n'] == 1) {
                                                                                                    //Updated successfully
                                                                                                    res.json({
                                                                                                        status: "1",
                                                                                                        message: "success",
                                                                                                        notification_type: 2,
                                                                                                        match: matchArray
                                                                                                    });
                                                                                                } else {
                                                                                                    res.json({
                                                                                                        status: "1",
                                                                                                        message: "updated or fail to update",
                                                                                                        notification_type: 2,
                                                                                                        match: matchArray
                                                                                                    });
                                                                                                    //already uptodate
                                                                                                }
                                                                                            }).catch();
                                                                                        } else {
                                                                                            dbo.collection(temp_match).updateOne({
                                                                                                currentU: req.body.cid
                                                                                            }, {
                                                                                                $set: {
                                                                                                    matchA: matchArray
                                                                                                }
                                                                                            }).then((r1) => {
                                                                                                if (r1['result']['n'] == 1) {
                                                                                                    //Updated successfully
                                                                                                    res.json({
                                                                                                        status: "1",
                                                                                                        message: "success",
                                                                                                        notification_type: 2,
                                                                                                        match: matchArray
                                                                                                    });
                                                                                                } else {
                                                                                                    res.json({
                                                                                                        status: "1",
                                                                                                        message: "updated or fail to update",
                                                                                                        notification_type: 2,
                                                                                                        match: matchArray
                                                                                                    });
                                                                                                    //already uptodate
                                                                                                }
                                                                                            }).catch();
                                                                                        }
                                                                                    }
                                                                                    //1 out 2 - 1 out 1 = 1 out 2
                                                                                    else if (result1[0]['matchUser'][h]['currentUserPreferenace']['out_2'] == 1 && result1[0]['matchUser'][h]['matchUserPreferenace']['out_1'] == 1 || result1[0]['matchUser'][h]['matchUserPreferenace']['out_2'] == 1) {
                                                                                        var matchArray = jsonObj;
                                                                                        matchArray.pop()
                                                                                        if (matchArray.length > 1) {

                                                                                            if (isCID) {
                                                                                                dbo.collection(temp_match).updateOne({
                                                                                                    currentU: req.body.mid
                                                                                                }, {
                                                                                                    $set: {
                                                                                                        matchA: matchArray
                                                                                                    }
                                                                                                }).then((r1) => {
                                                                                                    if (r1['result']['n'] == 1) {
                                                                                                        //Updated successfully
                                                                                                        res.json({
                                                                                                            status: "1",
                                                                                                            message: "success",
                                                                                                            notification_type: 1,
                                                                                                            match: matchArray
                                                                                                        });
                                                                                                    } else {
                                                                                                        res.json({
                                                                                                            status: "1",
                                                                                                            message: "updated or fail to update",
                                                                                                            notification_type: 1,
                                                                                                            match: matchArray
                                                                                                        });
                                                                                                        //already uptodate
                                                                                                    }
                                                                                                }).catch();
                                                                                            } else {
                                                                                                dbo.collection(temp_match).updateOne({
                                                                                                    currentU: req.body.cid
                                                                                                }, {
                                                                                                    $set: {
                                                                                                        matchA: matchArray
                                                                                                    }
                                                                                                }).then((r1) => {
                                                                                                    if (r1['result']['n'] == 1) {
                                                                                                        //Updated successfully
                                                                                                        res.json({
                                                                                                            status: "1",
                                                                                                            message: "success",
                                                                                                            notification_type: 1,
                                                                                                            match: matchArray
                                                                                                        });
                                                                                                    } else {
                                                                                                        res.json({
                                                                                                            status: "1",
                                                                                                            message: "updated or fail to update",
                                                                                                            notification_type: 1,
                                                                                                            match: matchArray
                                                                                                        });
                                                                                                        //already uptodate
                                                                                                    }
                                                                                                }).catch();
                                                                                            }
                                                                                        } else {
                                                                                            if (matchArray[0]["isMatch"] == true) {
                                                                                                var ah = dbo.collection(switlover).find({
                                                                                                    _id: new ObjectId(req.body.cid)
                                                                                                }).toArray();
                                                                                                ah.then((result2) => {
                                                                                                    if (!isEmpty(result2)) {
                                                                                                        if (result2[0]['is_Block'] == 0) {
                                                                                                            var hah = dbo.collection(switlover).find({
                                                                                                                _id: new ObjectId(req.body.mid)
                                                                                                            }).toArray();
                                                                                                            hah.then((result3) => {
                                                                                                                if (!isEmpty(result3)) {
                                                                                                                    if (result3[0]['is_Block'] == 0) {
                                                                                                                        for (var i = 0; i < result3[0]['Phone_Number'].length; i++) {
                                                                                                                            for (var g = 0; g < result2[0]['Contact_List'].length; g++) {
                                                                                                                                if (result2[0]['Contact_List'][g]['number'] == result3[0]['Phone_Number'][i]['Number']) {
                                                                                                                                    N7(result2[0]['Contact_List'][g]['name'], result2[0]['Username'][(result2[0]['Username'].length) - 1], result2[0]['Device_Token'], N7_Title, result3[0]['_id'])
                                                                                                                                }
                                                                                                                            }
                                                                                                                        }
                                                                                                                    }
                                                                                                                }
                                                                                                            })
                                                                                                        }
                                                                                                    }
                                                                                                })
                                                                                                var ah = dbo.collection(switlover).find({
                                                                                                    _id: new ObjectId(req.body.mid)
                                                                                                }).toArray();
                                                                                                ah.then((result4) => {
                                                                                                    if (!isEmpty(result4)) {
                                                                                                        if (result4[0]['is_Block'] == 0) {
                                                                                                            var hah = dbo.collection(switlover).find({
                                                                                                                _id: new ObjectId(req.body.cid)
                                                                                                            }).toArray();
                                                                                                            hah.then((result5) => {
                                                                                                                if (!isEmpty(result5)) {
                                                                                                                    if (result5[0]['is_Block'] == 0) {
                                                                                                                        for (var i = 0; i < result5[0]['Phone_Number'].length; i++) {
                                                                                                                            for (var g = 0; g < result4[0]['Contact_List'].length; g++) {
                                                                                                                                if (result4[0]['Contact_List'][g]['number'] == result5[0]['Phone_Number'][i]['Number']) {
                                                                                                                                    N7(result4[0]['Contact_List'][g]['name'], result4[0]['Username'][(result4[0]['Username'].length) - 1], result4[0]['Device_Token'], N7_Title, result5[0]['_id'])
                                                                                                                                }
                                                                                                                            }
                                                                                                                        }
                                                                                                                    }
                                                                                                                }
                                                                                                            })
                                                                                                        }
                                                                                                    }
                                                                                                })
                                                                                                res.json({
                                                                                                    status: "1",
                                                                                                    message: "success",
                                                                                                    notification_type: 7
                                                                                                });
                                                                                            }
                                                                                        }
                                                                                    }
                                                                                    //1 out 2 - chat = x
                                                                                    else if (result1[0]['matchUser'][h]['currentUserPreferenace']['out_2'] == 1 && result1[0]['matchUser'][h]['matchUserPreferenace']['out_1'] == 0 && result1[0]['matchUser'][h]['matchUserPreferenace']['out_2'] == 0 && result1[0]['matchUser'][h]['matchUserPreferenace']['anonymas_chat'] == 1) {
                                                                                        var matchArray = jsonObj;

                                                                                        if (isCID) {
                                                                                            dbo.collection(temp_match).updateOne({
                                                                                                currentU: req.body.mid
                                                                                            }, {
                                                                                                $set: {
                                                                                                    matchA: matchArray
                                                                                                }
                                                                                            }).then((r1) => {
                                                                                                if (r1['result']['n'] == 1) {
                                                                                                    //Updated successfully
                                                                                                    res.json({
                                                                                                        status: "1",
                                                                                                        message: "success",
                                                                                                        notification_type: 2,
                                                                                                        match: matchArray
                                                                                                    });
                                                                                                } else {
                                                                                                    res.json({
                                                                                                        status: "1",
                                                                                                        message: "updated or fail to update",
                                                                                                        notification_type: 2,
                                                                                                        match: matchArray
                                                                                                    });
                                                                                                    //already uptodate
                                                                                                }
                                                                                            }).catch();
                                                                                        } else {
                                                                                            dbo.collection(temp_match).updateOne({
                                                                                                currentU: req.body.cid
                                                                                            }, {
                                                                                                $set: {
                                                                                                    matchA: matchArray
                                                                                                }
                                                                                            }).then((r1) => {
                                                                                                if (r1['result']['n'] == 1) {
                                                                                                    //Updated successfully
                                                                                                    res.json({
                                                                                                        status: "1",
                                                                                                        message: "success",
                                                                                                        notification_type: 2,
                                                                                                        match: matchArray
                                                                                                    });
                                                                                                } else {
                                                                                                    res.json({
                                                                                                        status: "1",
                                                                                                        message: "updated or fail to update",
                                                                                                        notification_type: 2,
                                                                                                        match: matchArray
                                                                                                    });
                                                                                                    //already uptodate
                                                                                                }
                                                                                            }).catch();
                                                                                        }
                                                                                    }
                                                                                    //1 out 2 -  = x
                                                                                    else if (result1[0]['matchUser'][h]['currentUserPreferenace']['out_2'] == 1 && result1[0]['matchUser'][h]['matchUserPreferenace']['out_1'] == 0 && result1[0]['matchUser'][h]['matchUserPreferenace']['out_2'] == 0 && result1[0]['matchUser'][h]['matchUserPreferenace']['anonymas_chat'] == 0) {
                                                                                        var matchArray = jsonObj;

                                                                                        if (isCID) {
                                                                                            dbo.collection(temp_match).updateOne({
                                                                                                currentU: req.body.mid
                                                                                            }, {
                                                                                                $set: {
                                                                                                    matchA: matchArray
                                                                                                }
                                                                                            }).then((r1) => {
                                                                                                if (r1['result']['n'] == 1) {
                                                                                                    //Updated successfully
                                                                                                    res.json({
                                                                                                        status: "1",
                                                                                                        message: "success",
                                                                                                        notification_type: 2,
                                                                                                        match: matchArray
                                                                                                    });
                                                                                                } else {
                                                                                                    res.json({
                                                                                                        status: "1",
                                                                                                        message: "updated or fail to update",
                                                                                                        notification_type: 2,
                                                                                                        match: matchArray
                                                                                                    });
                                                                                                    //already uptodate
                                                                                                }
                                                                                            }).catch();
                                                                                        } else {
                                                                                            dbo.collection(temp_match).updateOne({
                                                                                                currentU: req.body.cid
                                                                                            }, {
                                                                                                $set: {
                                                                                                    matchA: matchArray
                                                                                                }
                                                                                            }).then((r1) => {
                                                                                                if (r1['result']['n'] == 1) {
                                                                                                    //Updated successfully
                                                                                                    res.json({
                                                                                                        status: "1",
                                                                                                        message: "success",
                                                                                                        notification_type: 2,
                                                                                                        match: matchArray
                                                                                                    });
                                                                                                } else {
                                                                                                    res.json({
                                                                                                        status: "1",
                                                                                                        message: "updated or fail to update",
                                                                                                        notification_type: 2,
                                                                                                        match: matchArray
                                                                                                    });
                                                                                                    //already uptodate
                                                                                                }
                                                                                            }).catch();
                                                                                        }
                                                                                    }
                                                                                    //chat - 1 out 1 = chat
                                                                                    else if (result1[0]['matchUser'][h]['currentUserPreferenace']['anonymas_chat'] == 1 && result1[0]['matchUser'][h]['matchUserPreferenace']['out_1'] == 1) {
                                                                                        var matchArray = jsonObj;

                                                                                        if (isCID) {
                                                                                            dbo.collection(temp_match).updateOne({
                                                                                                currentU: req.body.mid
                                                                                            }, {
                                                                                                $set: {
                                                                                                    matchA: matchArray
                                                                                                }
                                                                                            }).then((r1) => {
                                                                                                if (r1['result']['n'] == 1) {
                                                                                                    //Updated successfully
                                                                                                    res.json({
                                                                                                        status: "1",
                                                                                                        message: "success",
                                                                                                        notification_type: 0,
                                                                                                        match: matchArray
                                                                                                    });
                                                                                                } else {
                                                                                                    res.json({
                                                                                                        status: "1",
                                                                                                        message: "updated or fail to update",
                                                                                                        notification_type: 0,
                                                                                                        match: matchArray
                                                                                                    });
                                                                                                    //already uptodate
                                                                                                }
                                                                                            }).catch();
                                                                                        } else {
                                                                                            dbo.collection(temp_match).updateOne({
                                                                                                currentU: req.body.cid
                                                                                            }, {
                                                                                                $set: {
                                                                                                    matchA: matchArray
                                                                                                }
                                                                                            }).then((r1) => {
                                                                                                if (r1['result']['n'] == 1) {
                                                                                                    //Updated successfully
                                                                                                    res.json({
                                                                                                        status: "1",
                                                                                                        message: "success",
                                                                                                        notification_type: 0,
                                                                                                        match: matchArray
                                                                                                    });
                                                                                                } else {
                                                                                                    res.json({
                                                                                                        status: "1",
                                                                                                        message: "updated or fail to update",
                                                                                                        notification_type: 0,
                                                                                                        match: matchArray
                                                                                                    });
                                                                                                    //already uptodate
                                                                                                }
                                                                                            }).catch();
                                                                                        }
                                                                                    }
                                                                                    //chat - 1 out 2 = x
                                                                                    else if (result1[0]['matchUser'][h]['currentUserPreferenace']['anonymas_chat'] == 1 && result1[0]['matchUser'][h]['matchUserPreferenace']['out_1'] == 0 && result1[0]['matchUser'][h]['matchUserPreferenace']['out_2'] == 1 && result1[0]['matchUser'][h]['matchUserPreferenace']['anonymas_chat'] == 0) {
                                                                                        var matchArray = jsonObj;

                                                                                        if (isCID) {
                                                                                            dbo.collection(temp_match).updateOne({
                                                                                                currentU: req.body.mid
                                                                                            }, {
                                                                                                $set: {
                                                                                                    matchA: matchArray
                                                                                                }
                                                                                            }).then((r1) => {
                                                                                                if (r1['result']['n'] == 1) {
                                                                                                    //Updated successfully
                                                                                                    res.json({
                                                                                                        status: "1",
                                                                                                        message: "success",
                                                                                                        notification_type: 2,
                                                                                                        match: matchArray
                                                                                                    });
                                                                                                } else {
                                                                                                    res.json({
                                                                                                        status: "1",
                                                                                                        message: "updated or fail to update",
                                                                                                        notification_type: 2,
                                                                                                        match: matchArray
                                                                                                    });
                                                                                                    //already uptodate
                                                                                                }
                                                                                            }).catch();
                                                                                        } else {
                                                                                            dbo.collection(temp_match).updateOne({
                                                                                                currentU: req.body.cid
                                                                                            }, {
                                                                                                $set: {
                                                                                                    matchA: matchArray
                                                                                                }
                                                                                            }).then((r1) => {
                                                                                                if (r1['result']['n'] == 1) {
                                                                                                    //Updated successfully
                                                                                                    res.json({
                                                                                                        status: "1",
                                                                                                        message: "success",
                                                                                                        notification_type: 2,
                                                                                                        match: matchArray
                                                                                                    });
                                                                                                } else {
                                                                                                    res.json({
                                                                                                        status: "1",
                                                                                                        message: "updated or fail to update",
                                                                                                        notification_type: 2,
                                                                                                        match: matchArray
                                                                                                    });
                                                                                                    //already uptodate
                                                                                                }
                                                                                            }).catch();
                                                                                        }
                                                                                    }
                                                                                    //chat - chat = chat
                                                                                    else if (result1[0]['matchUser'][h]['currentUserPreferenace']['anonymas_chat'] == 1 && result1[0]['matchUser'][h]['matchUserPreferenace']['out_1'] == 0 && result1[0]['matchUser'][h]['matchUserPreferenace']['out_2'] == 0 && result1[0]['matchUser'][h]['matchUserPreferenace']['anonymas_chat'] == 1) {
                                                                                        var matchArray = jsonObj;

                                                                                        if (isCID) {
                                                                                            dbo.collection(temp_match).updateOne({
                                                                                                currentU: req.body.mid
                                                                                            }, {
                                                                                                $set: {
                                                                                                    matchA: matchArray
                                                                                                }
                                                                                            }).then((r1) => {
                                                                                                if (r1['result']['n'] == 1) {
                                                                                                    //Updated successfully
                                                                                                    res.json({
                                                                                                        status: "1",
                                                                                                        message: "success",
                                                                                                        notification_type: 0,
                                                                                                        match: matchArray
                                                                                                    });
                                                                                                } else {
                                                                                                    res.json({
                                                                                                        status: "1",
                                                                                                        message: "updated or fail to update",
                                                                                                        notification_type: 0,
                                                                                                        match: matchArray
                                                                                                    });
                                                                                                    //already uptodate
                                                                                                }
                                                                                            }).catch();
                                                                                        } else {
                                                                                            dbo.collection(temp_match).updateOne({
                                                                                                currentU: req.body.cid
                                                                                            }, {
                                                                                                $set: {
                                                                                                    matchA: matchArray
                                                                                                }
                                                                                            }).then((r1) => {
                                                                                                if (r1['result']['n'] == 1) {
                                                                                                    //Updated successfully
                                                                                                    res.json({
                                                                                                        status: "1",
                                                                                                        message: "success",
                                                                                                        notification_type: 0,
                                                                                                        match: matchArray
                                                                                                    });
                                                                                                } else {
                                                                                                    res.json({
                                                                                                        status: "1",
                                                                                                        message: "updated or fail to update",
                                                                                                        notification_type: 0,
                                                                                                        match: matchArray
                                                                                                    });
                                                                                                    //already uptodate
                                                                                                }
                                                                                            }).catch();
                                                                                        }

                                                                                    }
                                                                                    //chat -  = x
                                                                                    else if (result1[0]['matchUser'][h]['currentUserPreferenace']['anonymas_chat'] == 1 && result1[0]['matchUser'][h]['matchUserPreferenace']['out_1'] == 0 && result1[0]['matchUser'][h]['matchUserPreferenace']['out_2'] == 0 && result1[0]['matchUser'][h]['matchUserPreferenace']['anonymas_chat'] == 0) {
                                                                                        var matchArray = jsonObj;

                                                                                        if (isCID) {
                                                                                            dbo.collection(temp_match).updateOne({
                                                                                                currentU: req.body.mid
                                                                                            }, {
                                                                                                $set: {
                                                                                                    matchA: matchArray
                                                                                                }
                                                                                            }).then((r1) => {
                                                                                                if (r1['result']['n'] == 1) {
                                                                                                    //Updated successfully
                                                                                                    res.json({
                                                                                                        status: "1",
                                                                                                        message: "success",
                                                                                                        notification_type: 0,
                                                                                                        match: matchArray
                                                                                                    });
                                                                                                } else {
                                                                                                    res.json({
                                                                                                        status: "1",
                                                                                                        message: "updated or fail to update",
                                                                                                        notification_type: 0,
                                                                                                        match: matchArray
                                                                                                    });
                                                                                                    //already uptodate
                                                                                                }
                                                                                            }).catch();
                                                                                        } else {
                                                                                            dbo.collection(temp_match).updateOne({
                                                                                                currentU: req.body.cid
                                                                                            }, {
                                                                                                $set: {
                                                                                                    matchA: matchArray
                                                                                                }
                                                                                            }).then((r1) => {
                                                                                                if (r1['result']['n'] == 1) {
                                                                                                    //Updated successfully
                                                                                                    res.json({
                                                                                                        status: "1",
                                                                                                        message: "success",
                                                                                                        notification_type: 0,
                                                                                                        match: matchArray
                                                                                                    });
                                                                                                } else {
                                                                                                    res.json({
                                                                                                        status: "1",
                                                                                                        message: "updated or fail to update",
                                                                                                        notification_type: 0,
                                                                                                        match: matchArray
                                                                                                    });
                                                                                                    //already uptodate
                                                                                                }
                                                                                            }).catch();
                                                                                        }

                                                                                    }
                                                                                    //chat & 1 out 2 - 1 out 1 = 1 out 2 & chat
                                                                                    else if (result1[0]['matchUser'][h]['currentUserPreferenace']['out_2'] == 1 && result1[0]['matchUser'][h]['currentUserPreferenace']['anonymas_chat'] == 1 && result1[0]['matchUser'][h]['matchUserPreferenace']['out_1'] == 1) {
                                                                                        var matchArray = jsonObj;
                                                                                        matchArray.pop()
                                                                                        if (matchArray.length > 1) {

                                                                                            if (isCID) {
                                                                                                dbo.collection(temp_match).updateOne({
                                                                                                    currentU: req.body.mid
                                                                                                }, {
                                                                                                    $set: {
                                                                                                        matchA: matchArray
                                                                                                    }
                                                                                                }).then((r1) => {
                                                                                                    if (r1['result']['n'] == 1) {
                                                                                                        //Updated successfully
                                                                                                        res.json({
                                                                                                            status: "1",
                                                                                                            message: "success",
                                                                                                            notification_type: 3,
                                                                                                            match: matchArray
                                                                                                        });
                                                                                                    } else {
                                                                                                        res.json({
                                                                                                            status: "1",
                                                                                                            message: "updated or fail to update",
                                                                                                            notification_type: 3,
                                                                                                            match: matchArray
                                                                                                        });
                                                                                                        //already uptodate
                                                                                                    }
                                                                                                }).catch();
                                                                                            } else {
                                                                                                dbo.collection(temp_match).updateOne({
                                                                                                    currentU: req.body.cid
                                                                                                }, {
                                                                                                    $set: {
                                                                                                        matchA: matchArray
                                                                                                    }
                                                                                                }).then((r1) => {
                                                                                                    if (r1['result']['n'] == 1) {
                                                                                                        //Updated successfully
                                                                                                        res.json({
                                                                                                            status: "1",
                                                                                                            message: "success",
                                                                                                            notification_type: 3,
                                                                                                            match: matchArray
                                                                                                        });
                                                                                                    } else {
                                                                                                        res.json({
                                                                                                            status: "1",
                                                                                                            message: "updated or fail to update",
                                                                                                            notification_type: 3,
                                                                                                            match: matchArray
                                                                                                        });
                                                                                                        //already uptodate
                                                                                                    }
                                                                                                }).catch();
                                                                                            }
                                                                                        } else {
                                                                                            if (matchArray[0]["isMatch"] == true) {
                                                                                                var ah = dbo.collection(switlover).find({
                                                                                                    _id: new ObjectId(req.body.cid)
                                                                                                }).toArray();
                                                                                                ah.then((result2) => {
                                                                                                    if (!isEmpty(result2)) {
                                                                                                        if (result2[0]['is_Block'] == 0) {
                                                                                                            var hah = dbo.collection(switlover).find({
                                                                                                                _id: new ObjectId(req.body.mid)
                                                                                                            }).toArray();
                                                                                                            hah.then((result3) => {
                                                                                                                if (!isEmpty(result3)) {
                                                                                                                    if (result3[0]['is_Block'] == 0) {
                                                                                                                        for (var i = 0; i < result3[0]['Phone_Number'].length; i++) {
                                                                                                                            for (var g = 0; g < result2[0]['Contact_List'].length; g++) {
                                                                                                                                if (result2[0]['Contact_List'][g]['number'] == result3[0]['Phone_Number'][i]['Number']) {
                                                                                                                                    N7(result2[0]['Contact_List'][g]['name'], result2[0]['Username'][(result2[0]['Username'].length) - 1], result2[0]['Device_Token'], N7_Title, result3[0]['_id'])
                                                                                                                                }
                                                                                                                            }
                                                                                                                        }
                                                                                                                    }
                                                                                                                }
                                                                                                            })
                                                                                                        }
                                                                                                    }
                                                                                                })
                                                                                                var ah = dbo.collection(switlover).find({
                                                                                                    _id: new ObjectId(req.body.mid)
                                                                                                }).toArray();
                                                                                                ah.then((result4) => {
                                                                                                    if (!isEmpty(result4)) {
                                                                                                        if (result4[0]['is_Block'] == 0) {
                                                                                                            var hah = dbo.collection(switlover).find({
                                                                                                                _id: new ObjectId(req.body.cid)
                                                                                                            }).toArray();
                                                                                                            hah.then((result5) => {
                                                                                                                if (!isEmpty(result5)) {
                                                                                                                    if (result5[0]['is_Block'] == 0) {
                                                                                                                        for (var i = 0; i < result5[0]['Phone_Number'].length; i++) {
                                                                                                                            for (var g = 0; g < result4[0]['Contact_List'].length; g++) {
                                                                                                                                if (result4[0]['Contact_List'][g]['number'] == result5[0]['Phone_Number'][i]['Number']) {
                                                                                                                                    N7(result4[0]['Contact_List'][g]['name'], result4[0]['Username'][(result4[0]['Username'].length) - 1], result4[0]['Device_Token'], N7_Title, result5[0]['_id'])
                                                                                                                                }
                                                                                                                            }
                                                                                                                        }
                                                                                                                    }
                                                                                                                }
                                                                                                            })
                                                                                                        }
                                                                                                    }
                                                                                                })
                                                                                                res.json({
                                                                                                    status: "1",
                                                                                                    message: "success",
                                                                                                    notification_type: 7
                                                                                                });
                                                                                            }
                                                                                        }
                                                                                    }
                                                                                    //chat & 1 out 2 - 1 out 2 = 1 out 2
                                                                                    else if (result1[0]['matchUser'][h]['currentUserPreferenace']['out_2'] == 1 && result1[0]['matchUser'][h]['currentUserPreferenace']['anonymas_chat'] == 1 && result1[0]['matchUser'][h]['matchUserPreferenace']['out_1'] == 0 && result1[0]['matchUser'][h]['matchUserPreferenace']['out_2'] == 1 && result1[0]['matchUser'][h]['matchUserPreferenace']['anonymas_chat'] == 0) {
                                                                                        var matchArray = jsonObj;
                                                                                        matchArray.pop()
                                                                                        if (matchArray.length > 1) {

                                                                                            if (isCID) {
                                                                                                dbo.collection(temp_match).updateOne({
                                                                                                    currentU: req.body.mid
                                                                                                }, {
                                                                                                    $set: {
                                                                                                        matchA: matchArray
                                                                                                    }
                                                                                                }).then((r1) => {
                                                                                                    if (r1['result']['n'] == 1) {
                                                                                                        //Updated successfully
                                                                                                        res.json({
                                                                                                            status: "1",
                                                                                                            message: "success",
                                                                                                            notification_type: 1,
                                                                                                            match: matchArray
                                                                                                        });
                                                                                                    } else {
                                                                                                        res.json({
                                                                                                            status: "1",
                                                                                                            message: "updated or fail to update",
                                                                                                            notification_type: 1,
                                                                                                            match: matchArray
                                                                                                        });
                                                                                                        //already uptodate
                                                                                                    }
                                                                                                }).catch();
                                                                                            } else {
                                                                                                dbo.collection(temp_match).updateOne({
                                                                                                    currentU: req.body.cid
                                                                                                }, {
                                                                                                    $set: {
                                                                                                        matchA: matchArray
                                                                                                    }
                                                                                                }).then((r1) => {
                                                                                                    if (r1['result']['n'] == 1) {
                                                                                                        //Updated successfully
                                                                                                        res.json({
                                                                                                            status: "1",
                                                                                                            message: "success",
                                                                                                            notification_type: 1,
                                                                                                            match: matchArray
                                                                                                        });
                                                                                                    } else {
                                                                                                        res.json({
                                                                                                            status: "1",
                                                                                                            message: "updated or fail to update",
                                                                                                            notification_type: 1,
                                                                                                            match: matchArray
                                                                                                        });
                                                                                                        //already uptodate
                                                                                                    }
                                                                                                }).catch();
                                                                                            }
                                                                                        } else {
                                                                                            if (matchArray[0]["isMatch"] == true) {
                                                                                                var ah = dbo.collection(switlover).find({
                                                                                                    _id: new ObjectId(req.body.cid)
                                                                                                }).toArray();
                                                                                                ah.then((result2) => {
                                                                                                    if (!isEmpty(result2)) {
                                                                                                        if (result2[0]['is_Block'] == 0) {
                                                                                                            var hah = dbo.collection(switlover).find({
                                                                                                                _id: new ObjectId(req.body.mid)
                                                                                                            }).toArray();
                                                                                                            hah.then((result3) => {
                                                                                                                if (!isEmpty(result3)) {
                                                                                                                    if (result3[0]['is_Block'] == 0) {
                                                                                                                        for (var i = 0; i < result3[0]['Phone_Number'].length; i++) {
                                                                                                                            for (var g = 0; g < result2[0]['Contact_List'].length; g++) {
                                                                                                                                if (result2[0]['Contact_List'][g]['number'] == result3[0]['Phone_Number'][i]['Number']) {
                                                                                                                                    N7(result2[0]['Contact_List'][g]['name'], result2[0]['Username'][(result2[0]['Username'].length) - 1], result2[0]['Device_Token'], N7_Title, result3[0]['_id'])
                                                                                                                                }
                                                                                                                            }
                                                                                                                        }
                                                                                                                    }
                                                                                                                }
                                                                                                            })
                                                                                                        }
                                                                                                    }
                                                                                                })
                                                                                                var ah = dbo.collection(switlover).find({
                                                                                                    _id: new ObjectId(req.body.mid)
                                                                                                }).toArray();
                                                                                                ah.then((result4) => {
                                                                                                    if (!isEmpty(result4)) {
                                                                                                        if (result4[0]['is_Block'] == 0) {
                                                                                                            var hah = dbo.collection(switlover).find({
                                                                                                                _id: new ObjectId(req.body.cid)
                                                                                                            }).toArray();
                                                                                                            hah.then((result5) => {
                                                                                                                if (!isEmpty(result5)) {
                                                                                                                    if (result5[0]['is_Block'] == 0) {
                                                                                                                        for (var i = 0; i < result5[0]['Phone_Number'].length; i++) {
                                                                                                                            for (var g = 0; g < result4[0]['Contact_List'].length; g++) {
                                                                                                                                if (result4[0]['Contact_List'][g]['number'] == result5[0]['Phone_Number'][i]['Number']) {
                                                                                                                                    N7(result4[0]['Contact_List'][g]['name'], result4[0]['Username'][(result4[0]['Username'].length) - 1], result4[0]['Device_Token'], N7_Title, result5[0]['_id'])
                                                                                                                                }
                                                                                                                            }
                                                                                                                        }
                                                                                                                    }
                                                                                                                }
                                                                                                            })
                                                                                                        }
                                                                                                    }
                                                                                                })
                                                                                                res.json({
                                                                                                    status: "1",
                                                                                                    message: "success",
                                                                                                    notification_type: 7
                                                                                                });
                                                                                            }
                                                                                        }
                                                                                    }
                                                                                    //chat & 1 out 2 - chat = chat
                                                                                    else if (result1[0]['matchUser'][h]['currentUserPreferenace']['out_2'] == 1 && result1[0]['matchUser'][h]['currentUserPreferenace']['anonymas_chat'] == 1 && result1[0]['matchUser'][h]['matchUserPreferenace']['out_1'] == 0 && result1[0]['matchUser'][h]['matchUserPreferenace']['out_2'] == 0 && result1[0]['matchUser'][h]['matchUserPreferenace']['anonymas_chat'] == 1) {
                                                                                        var matchArray = jsonObj;

                                                                                        if (isCID) {
                                                                                            dbo.collection(temp_match).updateOne({
                                                                                                currentU: req.body.mid
                                                                                            }, {
                                                                                                $set: {
                                                                                                    matchA: matchArray
                                                                                                }
                                                                                            }).then((r1) => {
                                                                                                if (r1['result']['n'] == 1) {
                                                                                                    //Updated successfully
                                                                                                    res.json({
                                                                                                        status: "1",
                                                                                                        message: "success",
                                                                                                        notification_type: 0,
                                                                                                        match: matchArray
                                                                                                    });
                                                                                                } else {
                                                                                                    res.json({
                                                                                                        status: "1",
                                                                                                        message: "updated or fail to update",
                                                                                                        notification_type: 0,
                                                                                                        match: matchArray
                                                                                                    });
                                                                                                    //already uptodate
                                                                                                }
                                                                                            }).catch();
                                                                                        } else {
                                                                                            dbo.collection(temp_match).updateOne({
                                                                                                currentU: req.body.cid
                                                                                            }, {
                                                                                                $set: {
                                                                                                    matchA: matchArray
                                                                                                }
                                                                                            }).then((r1) => {
                                                                                                if (r1['result']['n'] == 1) {
                                                                                                    //Updated successfully
                                                                                                    res.json({
                                                                                                        status: "1",
                                                                                                        message: "success",
                                                                                                        notification_type: 0,
                                                                                                        match: matchArray
                                                                                                    });
                                                                                                } else {
                                                                                                    res.json({
                                                                                                        status: "1",
                                                                                                        message: "updated or fail to update",
                                                                                                        notification_type: 0,
                                                                                                        match: matchArray
                                                                                                    });
                                                                                                    //already uptodate
                                                                                                }
                                                                                            }).catch();
                                                                                        }

                                                                                    }
                                                                                    //chat & 1 out 2 -  = x
                                                                                    else if (result1[0]['matchUser'][h]['currentUserPreferenace']['out_2'] == 1 && result1[0]['matchUser'][h]['currentUserPreferenace']['anonymas_chat'] == 1 && result1[0]['matchUser'][h]['matchUserPreferenace']['out_1'] == 0 && result1[0]['matchUser'][h]['matchUserPreferenace']['out_2'] == 0 && result1[0]['matchUser'][h]['matchUserPreferenace']['anonymas_chat'] == 0) {
                                                                                        var matchArray = jsonObj;

                                                                                        if (isCID) {
                                                                                            dbo.collection(temp_match).updateOne({
                                                                                                currentU: req.body.mid
                                                                                            }, {
                                                                                                $set: {
                                                                                                    matchA: matchArray
                                                                                                }
                                                                                            }).then((r1) => {
                                                                                                if (r1['result']['n'] == 1) {
                                                                                                    //Updated successfully
                                                                                                    res.json({
                                                                                                        status: "1",
                                                                                                        message: "success",
                                                                                                        notification_type: 2,
                                                                                                        match: matchArray
                                                                                                    });
                                                                                                } else {
                                                                                                    res.json({
                                                                                                        status: "1",
                                                                                                        message: "updated or fail to update",
                                                                                                        notification_type: 2,
                                                                                                        match: matchArray
                                                                                                    });
                                                                                                    //already uptodate
                                                                                                }
                                                                                            }).catch();
                                                                                        } else {
                                                                                            dbo.collection(temp_match).updateOne({
                                                                                                currentU: req.body.cid
                                                                                            }, {
                                                                                                $set: {
                                                                                                    matchA: matchArray
                                                                                                }
                                                                                            }).then((r1) => {
                                                                                                if (r1['result']['n'] == 1) {
                                                                                                    //Updated successfully
                                                                                                    res.json({
                                                                                                        status: "1",
                                                                                                        message: "success",
                                                                                                        notification_type: 2,
                                                                                                        match: matchArray
                                                                                                    });
                                                                                                } else {
                                                                                                    res.json({
                                                                                                        status: "1",
                                                                                                        message: "updated or fail to update",
                                                                                                        notification_type: 2,
                                                                                                        match: matchArray
                                                                                                    });
                                                                                                    //already uptodate
                                                                                                }
                                                                                            }).catch();
                                                                                        }
                                                                                    }
                                                                                    // clearInterval(interval)
                                                                                } else {
                                                                                    res.json({
                                                                                        status: "1",
                                                                                        type: "0",
                                                                                        message: "success"
                                                                                    });
                                                                                    // clearInterval(interval)
                                                                                    break;
                                                                                }
                                                                            }
                                                                        }
                                                                        // var interval = setInterval(function () {
                                                                        //
                                                                        // }, 3000)
                                                                    }
                                                                })

                                                            }
                                                        })
                                                    } else {
                                                        res.json({status: "0", message: "Error : " + responce});
                                                    }
                                                }).catch((e) => {
                                                    res.json({status: "0", message: "Error" + e});
                                                })
                                            }
                                        }
                                    }
                                }
                            } else {
                                res.json({status: "0", message: "No user found with this ID"});
                            }
                        }).catch((er) => {
                            res.json({status: "0", message: "Error" + er});
                        });
                    }
                }
            });
            //--------------------------------------------------------------------------------------------------------------

            //--------------------------------------------------------------------------------------------------------------
            //Get old match
            app.post('/api/getOldMatch', (req, res) => {
                var Auth_Token = req.header('Auth_Token');
                if (!Auth_Token || Auth_Token == null) {
                    res.json({status: "6", message: "Auth token missing"});
                } else {
                    dbo.collection(temp_match).find({
                        currentU: req.body.userID
                    }).toArray((error, result) => {
                        if (error) {
                            res.json({status: "0", message: "error : " + error})
                        }
                        if (!isEmpty(result)) {
                            res.json({status: "1", message: "Success", user_data: result});
                        }
                    })
                }
            })
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
                                userNumber = result[0]["Phone_Number"][i]["Contry_Code"] + "-" + result[0]["Phone_Number"][i]["Number"];
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
                    var dataArray = dbo.collection(switlover).find({
                        Auth_Token: Auth_Token
                    }).toArray();
                    dataArray.then((data) => {
                        if (!isEmpty(data)) {
                            if (data[0]["is_Block"] == 0) {
                                if (!isEmpty(data[0]['Contact_List'])) {
                                    var numberArray = [];
                                    for (var i = 0; i < (data[0]['Contact_List']).length; i++) {
                                        var number;
                                        var myObj;
                                        // if ((data[0]['Contact_List'][i]['number']).includes(data[0]['Contact_List'][i]['code'])) {
                                        number = data[0]['Contact_List'][i]['number'];
                                        // } else {
                                        //     number = data[0]['Contact_List'][i]['code'] + "" + data[0]['Contact_List'][i]['number'];
                                        // }
                                        var myLikesArray = data[0]['Like'];
                                        if (!isEmpty(myLikesArray)) {
                                            for (var j = 0; j < myLikesArray.length; j++) {
                                                if (myLikesArray[j].length < 15) {
                                                    var numbe = myLikesArray[j].split("-")[1];
                                                    if (numbe == number) {
                                                        myObj = {
                                                            name: data[0]['Contact_List'][i]['name'],
                                                            image: data[0]['Contact_List'][i]['image'],
                                                            code: data[0]['Contact_List'][i]['code'],
                                                            number: data[0]['Contact_List'][i]['number'],
                                                            isRemovedByAdmin: data[0]['Contact_List'][i]['isRemovedByAdmin'],
                                                            isRemovedByUser: data[0]['Contact_List'][i]['isRemovedByUser'],
                                                            isLiked: 1,
                                                            isUnlike: 0
                                                        };
                                                        break;
                                                    } else {
                                                        var unLikesArray = data[0]["UnLikes"];
                                                        if (!isEmpty(unLikesArray)) {
                                                            for (var h = 0; h < unLikesArray.length; h++) {
                                                                if (unLikesArray[h] == number) {
                                                                    myObj = {
                                                                        name: data[0]['Contact_List'][i]['name'],
                                                                        image: data[0]['Contact_List'][i]['image'],
                                                                        code: data[0]['Contact_List'][i]['code'],
                                                                        number: data[0]['Contact_List'][i]['number'],
                                                                        isRemovedByAdmin: data[0]['Contact_List'][i]['isRemovedByAdmin'],
                                                                        isRemovedByUser: data[0]['Contact_List'][i]['isRemovedByUser'],
                                                                        isLiked: 0,
                                                                        isUnlike: 1
                                                                    };
                                                                }
                                                            }
                                                        } else {
                                                            myObj = {
                                                                name: data[0]['Contact_List'][i]['name'],
                                                                image: data[0]['Contact_List'][i]['image'],
                                                                code: data[0]['Contact_List'][i]['code'],
                                                                number: data[0]['Contact_List'][i]['number'],
                                                                isRemovedByAdmin: data[0]['Contact_List'][i]['isRemovedByAdmin'],
                                                                isRemovedByUser: data[0]['Contact_List'][i]['isRemovedByUser'],
                                                                isLiked: 0,
                                                                isUnlike: 0
                                                            };
                                                        }
                                                    }
                                                }
                                            }
                                            numberArray.push(myObj);
                                        } else {
                                            myObj = {
                                                name: data[0]['Contact_List'][i]['name'],
                                                image: data[0]['Contact_List'][i]['image'],
                                                code: data[0]['Contact_List'][i]['code'],
                                                number: data[0]['Contact_List'][i]['number'],
                                                isRemovedByAdmin: data[0]['Contact_List'][i]['isRemovedByAdmin'],
                                                isRemovedByUser: data[0]['Contact_List'][i]['isRemovedByUser'],
                                                isLiked: 0,
                                                isUnlike: 0
                                            };
                                            numberArray.push(myObj);
                                        }
                                    }

                                } else {
                                    res.json({status: "0", message: "Please sync your contact first"});
                                }
                                res.json({
                                    status: "1",
                                    message: "Contact List",
                                    userdata: numberArray
                                });
                            } else {
                                res.json({status: "7", message: "You have been blocked by Admin"});
                            }
                        }
                    }).catch((err) => {
                        res.json({status: "3", message: "Internal Server error" + err});
                    });
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
                                        // for (var j = 0; j < (data[0]['Contact_List'][i]['number']).length; j++) {
                                        // if (data[0]['Contact_List'][i]['isRemovedByAdmin'] == 0 && data[0]['Contact_List'][i]['isRemovedByUser'] == 0) {
                                        var number;
                                        var myObj;
                                        // if ((data[0]['Contact_List'][i]['number']).includes(data[0]['Contact_List'][i]['code'])) {
                                        number = data[0]['Contact_List'][i]['number'];
                                        // } else {
                                        //     number = data[0]['Contact_List'][i]['code'] + "" + data[0]['Contact_List'][i]['number'];
                                        // }

                                        var myLikesArray = data[0]['Like'];

                                        if (!isEmpty(myLikesArray)) {
                                            for (var j = 0; j < myLikesArray.length; j++) {
                                                var num = myLikesArray[j].split("-")[1];
                                                if (num == number) {
                                                    myObj = {
                                                        name: data[0]['Contact_List'][i]['name'],
                                                        image: data[0]['Contact_List'][i]['image'],
                                                        code: data[0]['Contact_List'][i]['code'],
                                                        number: data[0]['Contact_List'][i]['number'],
                                                        isRemovedByAdmin: data[0]['Contact_List'][i]['isRemovedByAdmin'],
                                                        isRemovedByUser: data[0]['Contact_List'][i]['isRemovedByUser'],
                                                        isLiked: 1
                                                    };
                                                    numberArray.push(myObj);
                                                }
                                            }
                                        } else {
                                            res.json({status: "1", message: "Sorry there is no likes to display"});
                                        }
                                        // }
                                        // }
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
                        }).toArray();
                        dataArray.then((result) => {
                            if (isEmpty(result)) {
                                res.json({status: "0", message: "User not found"});
                            } else {
                                if (result[0]["is_Block"] == 0) {
                                    var currentEmail = result[0]['Email']['EmailAddress'];
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
                                    var isUsernameUnique = true;
                                    var newUsername;
                                    if (!isEmpty(UsernameArray)) {
                                        var existUser = UsernameArray[UsernameArray.length - 1];
                                        newUsername = req.body.Username;
                                        if (newUsername != existUser) {
                                            dbo.collection(switlover).find({}).toArray((err1, result1) => {
                                                if (err1) res.json({status: "0", message: "Error : " + err1});
                                                if (!isEmpty(result1)) {
                                                    for (var a = 0; a < result1.length; a++) {
                                                        if (result1[a]['Username'][(result1[a]['Username'].length) - 1] == newUsername) {
                                                            isUsernameUnique = false;
                                                            break;
                                                        } else {
                                                            isUsernameUnique = true;
                                                        }
                                                    }
                                                    if (isUsernameUnique) {
                                                        var UsernameArray = [];
                                                        UsernameArray.push(req.body.Username);
                                                        // UsernameArray.splice(0, 0, req.body.Username);
                                                        if (req.body.number || req.body.number != null) {
                                                            var arrayContact = req.body.number;
                                                            var jsonObject = JSON.parse(arrayContact);
                                                        }

                                                        if (req.body.Username != null && req.body.Username && req.body.Email_Address != null && req.body.Email_Address && !isEmpty(jsonObject)) {
                                                            if (currentEmail == req.body.Email_Address) {
                                                                dbo.collection(switlover).updateOne(
                                                                    {
                                                                        Auth_Token: Auth_Token
                                                                    },
                                                                    {
                                                                        $set: {
                                                                            Username: UsernameArray,
                                                                            Phone_Number: jsonObject,
                                                                            updatedAt: new Date()
                                                                        }
                                                                    }).then((data) => {
                                                                    if (data['result']['n'] == 1) {
                                                                        res.json({
                                                                            status: "1",
                                                                            message: "Profile updated successfully"
                                                                        });
                                                                    } else {
                                                                        res.json({
                                                                            status: "3",
                                                                            message: "Profile updation field"
                                                                        });
                                                                    }
                                                                });
                                                            } else {
                                                                dbo.collection(switlover).updateOne(
                                                                    {
                                                                        Auth_Token: Auth_Token
                                                                    },
                                                                    {
                                                                        $set: {
                                                                            Email: {
                                                                                EmailAddress: req.body.Email_Address,
                                                                                Verified: 'false'
                                                                            },
                                                                            Username: UsernameArray,
                                                                            Phone_Number: jsonObject,
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
                                                                                res.json({
                                                                                    status: "3",
                                                                                    message: "Mail sending faild"
                                                                                });
                                                                            }
                                                                        })
                                                                    } else {
                                                                        res.json({
                                                                            status: "3",
                                                                            message: "Profile updation field"
                                                                        });
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
                                                                        res.json({
                                                                            status: "1",
                                                                            message: "Profile updated successfully"
                                                                        });
                                                                    } else {
                                                                        res.json({
                                                                            status: "3",
                                                                            message: "Profile updation field"
                                                                        });
                                                                    }
                                                                });
                                                            } else {
                                                                dbo.collection(switlover).updateOne(
                                                                    {
                                                                        Auth_Token: Auth_Token
                                                                    },
                                                                    {
                                                                        $set: {
                                                                            Email: {
                                                                                EmailAddress: req.body.Email_Address,
                                                                                Verified: 'false'
                                                                            },
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
                                                                                res.json({
                                                                                    status: "3",
                                                                                    message: "Mail sending faild"
                                                                                });
                                                                            }
                                                                        })
                                                                    } else {
                                                                        res.json({
                                                                            status: "3",
                                                                            message: "Profile updation field"
                                                                        });
                                                                    }
                                                                });
                                                            }
                                                        } else if (req.body.Username != null && req.body.Username && !isEmpty(jsonObject)) {
                                                            dbo.collection(switlover).updateOne(
                                                                {
                                                                    Auth_Token: Auth_Token
                                                                },
                                                                {
                                                                    $set: {
                                                                        Username: UsernameArray,
                                                                        Phone_Number: jsonObject,
                                                                        updatedAt: new Date()
                                                                    }
                                                                }).then((data) => {
                                                                if (data['result']['n'] == 1) {
                                                                    res.json({
                                                                        status: "1",
                                                                        message: "Profile updated successfully"
                                                                    });
                                                                } else {
                                                                    res.json({
                                                                        status: "3",
                                                                        message: "Profile updation field"
                                                                    });
                                                                }
                                                            });
                                                        } else if (req.body.Email_Address != null && req.body.Email_Address && !isEmpty(jsonObject)) {
                                                            if (currentEmail == req.body.Email_Address) {
                                                                dbo.collection(switlover).updateOne(
                                                                    {
                                                                        Auth_Token: Auth_Token
                                                                    },
                                                                    {
                                                                        $set: {
                                                                            Phone_Number: jsonObject,
                                                                            updatedAt: new Date()
                                                                        }
                                                                    }).then((data) => {
                                                                    if (data['result']['n'] == 1) {
                                                                        res.json({
                                                                            status: "1",
                                                                            message: "Profile updated successfully"
                                                                        });
                                                                    } else {
                                                                        res.json({
                                                                            status: "3",
                                                                            message: "Profile updation field"
                                                                        });
                                                                    }
                                                                });
                                                            } else {
                                                                dbo.collection(switlover).updateOne(
                                                                    {
                                                                        Auth_Token: Auth_Token
                                                                    },
                                                                    {
                                                                        $set: {
                                                                            Email: {
                                                                                EmailAddress: req.body.Email_Address,
                                                                                Verified: 'false'
                                                                            },
                                                                            Phone_Number: jsonObject,
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
                                                                                res.json({
                                                                                    status: "3",
                                                                                    message: "Mail sending faild"
                                                                                });
                                                                            }
                                                                        })
                                                                    } else {
                                                                        res.json({
                                                                            status: "3",
                                                                            message: "Profile updation field"
                                                                        });
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

                                                                if (data['result']['n'] == 1) {
                                                                    res.json({
                                                                        status: "1",
                                                                        message: "Profile updated successfully"
                                                                    });
                                                                } else {
                                                                    res.json({
                                                                        status: "3",
                                                                        message: "Profile updation field"
                                                                    });
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
                                                                        res.json({
                                                                            status: "1",
                                                                            message: "Profile updated successfully"
                                                                        });
                                                                    } else {
                                                                        res.json({
                                                                            status: "3",
                                                                            message: "Profile updation field"
                                                                        });
                                                                    }
                                                                });
                                                            } else {
                                                                dbo.collection(switlover).updateOne(
                                                                    {
                                                                        Auth_Token: Auth_Token
                                                                    },
                                                                    {
                                                                        $set: {
                                                                            Email: {
                                                                                EmailAddress: req.body.Email_Address,
                                                                                Verified: 'false'
                                                                            },
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
                                                                                res.json({
                                                                                    status: "3",
                                                                                    message: "Mail sending faild"
                                                                                });
                                                                            }
                                                                        })
                                                                    } else {
                                                                        res.json({
                                                                            status: "3",
                                                                            message: "Profile updation field"
                                                                        });
                                                                    }
                                                                });
                                                            }

                                                        } else if (!isEmpty(jsonObject)) {

                                                            dbo.collection(switlover).updateOne({
                                                                Auth_Token: Auth_Token,
                                                                is_Block: {$ne: 1}
                                                            }, {
                                                                $set: {Phone_Number: jsonObject, updatedAt: new Date()}
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
                                                                            res.json({
                                                                                status: "7",
                                                                                message: "You have been blocked by Admin"
                                                                            });
                                                                        }
                                                                    }).catch((finalerr) => {
                                                                        res.json({
                                                                            status: "3",
                                                                            message: "1Internal server error"
                                                                        });
                                                                    })
                                                                } else {
                                                                    res.json({
                                                                        status: "3",
                                                                        message: "2Internal server error"
                                                                    });
                                                                }
                                                            }).catch((catcherr) => {
                                                                res.json({status: "3", message: "3Internal Server error"});
                                                            });
                                                        }
                                                    } else {
                                                        res.json({status: "0", message: "Username already exist"});
                                                    }
                                                }
                                            })
                                        } else {
                                            if (req.body.number || req.body.number != null) {
                                                var arrayContact = req.body.number;
                                                var jsonObject = JSON.parse(arrayContact);
                                            }

                                            if (req.body.Username != null && req.body.Username && req.body.Email_Address != null && req.body.Email_Address && !isEmpty(jsonObject)) {
                                                if (currentEmail == req.body.Email_Address) {
                                                    dbo.collection(switlover).updateOne(
                                                        {
                                                            Auth_Token: Auth_Token
                                                        },
                                                        {
                                                            $set: {
                                                                Username: UsernameArray,
                                                                Phone_Number: jsonObject,
                                                                updatedAt: new Date()
                                                            }
                                                        }).then((data) => {
                                                        if (data['result']['n'] == 1) {
                                                            res.json({
                                                                status: "1",
                                                                message: "Profile updated successfully"
                                                            });
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
                                                                Email: {
                                                                    EmailAddress: req.body.Email_Address,
                                                                    Verified: 'false'
                                                                },
                                                                Username: UsernameArray,
                                                                Phone_Number: jsonObject,
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
                                                            res.json({
                                                                status: "1",
                                                                message: "Profile updated successfully"
                                                            });
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
                                                                Email: {
                                                                    EmailAddress: req.body.Email_Address,
                                                                    Verified: 'false'
                                                                },
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
                                            } else if (req.body.Username != null && req.body.Username && !isEmpty(jsonObject)) {
                                                dbo.collection(switlover).updateOne(
                                                    {
                                                        Auth_Token: Auth_Token
                                                    },
                                                    {
                                                        $set: {
                                                            Username: UsernameArray,
                                                            Phone_Number: jsonObject,
                                                            updatedAt: new Date()
                                                        }
                                                    }).then((data) => {
                                                    if (data['result']['n'] == 1) {
                                                        res.json({status: "1", message: "Profile updated successfully"});
                                                    } else {
                                                        res.json({status: "3", message: "Profile updation field"});
                                                    }
                                                });
                                            } else if (req.body.Email_Address != null && req.body.Email_Address && !isEmpty(jsonObject)) {
                                                if (currentEmail == req.body.Email_Address) {
                                                    dbo.collection(switlover).updateOne(
                                                        {
                                                            Auth_Token: Auth_Token
                                                        },
                                                        {
                                                            $set: {
                                                                Phone_Number: jsonObject,
                                                                updatedAt: new Date()
                                                            }
                                                        }).then((data) => {
                                                        if (data['result']['n'] == 1) {
                                                            res.json({
                                                                status: "1",
                                                                message: "Profile updated successfully"
                                                            });
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
                                                                Email: {
                                                                    EmailAddress: req.body.Email_Address,
                                                                    Verified: 'false'
                                                                },
                                                                Phone_Number: jsonObject,
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
                                                            res.json({
                                                                status: "1",
                                                                message: "Profile updated successfully"
                                                            });
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
                                                                Email: {
                                                                    EmailAddress: req.body.Email_Address,
                                                                    Verified: 'false'
                                                                },
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

                                            } else if (!isEmpty(jsonObject)) {

                                                dbo.collection(switlover).updateOne({
                                                    Auth_Token: Auth_Token,
                                                    is_Block: {$ne: 1}
                                                }, {
                                                    $set: {Phone_Number: jsonObject, updatedAt: new Date()}
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
                                                                res.json({
                                                                    status: "7",
                                                                    message: "You have been blocked by Admin"
                                                                });
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
                                        }
                                    } else {
                                        newUsername = req.body.Username;
                                        dbo.collection(switlover).find({}).toArray((err1, result1) => {
                                            if (err1) res.json({status: "0", message: "Error : " + err1});
                                            if (!isEmpty(result1)) {
                                                for (var a = 0; a < result1.length; a++) {
                                                    if (result1[a]['Username'][(result1[a]['Username'].length) - 1] == newUsername) {
                                                        isUsernameUnique = false;
                                                        break;
                                                    } else {
                                                        isUsernameUnique = true;
                                                    }
                                                }
                                                if (isUsernameUnique) {
                                                    var UsernameArray = [];
                                                    UsernameArray.push(req.body.Username);
                                                    // UsernameArray.splice(0, 0, req.body.Username);
                                                    if (req.body.number || req.body.number != null) {
                                                        var arrayContact = req.body.number;
                                                        var jsonObject = JSON.parse(arrayContact);
                                                    }

                                                    if (req.body.Username != null && req.body.Username && req.body.Email_Address != null && req.body.Email_Address && !isEmpty(jsonObject)) {
                                                        if (currentEmail == req.body.Email_Address) {
                                                            dbo.collection(switlover).updateOne(
                                                                {
                                                                    Auth_Token: Auth_Token
                                                                },
                                                                {
                                                                    $set: {
                                                                        Username: UsernameArray,
                                                                        Phone_Number: jsonObject,
                                                                        updatedAt: new Date()
                                                                    }
                                                                }).then((data) => {
                                                                if (data['result']['n'] == 1) {
                                                                    res.json({
                                                                        status: "1",
                                                                        message: "Profile updated successfully"
                                                                    });
                                                                } else {
                                                                    res.json({
                                                                        status: "3",
                                                                        message: "Profile updation field"
                                                                    });
                                                                }
                                                            });
                                                        } else {
                                                            dbo.collection(switlover).updateOne(
                                                                {
                                                                    Auth_Token: Auth_Token
                                                                },
                                                                {
                                                                    $set: {
                                                                        Email: {
                                                                            EmailAddress: req.body.Email_Address,
                                                                            Verified: 'false'
                                                                        },
                                                                        Username: UsernameArray,
                                                                        Phone_Number: jsonObject,
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
                                                                            res.json({
                                                                                status: "3",
                                                                                message: "Mail sending faild"
                                                                            });
                                                                        }
                                                                    })
                                                                } else {
                                                                    res.json({
                                                                        status: "3",
                                                                        message: "Profile updation field"
                                                                    });
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
                                                                    res.json({
                                                                        status: "1",
                                                                        message: "Profile updated successfully"
                                                                    });
                                                                } else {
                                                                    res.json({
                                                                        status: "3",
                                                                        message: "Profile updation field"
                                                                    });
                                                                }
                                                            });
                                                        } else {
                                                            dbo.collection(switlover).updateOne(
                                                                {
                                                                    Auth_Token: Auth_Token
                                                                },
                                                                {
                                                                    $set: {
                                                                        Email: {
                                                                            EmailAddress: req.body.Email_Address,
                                                                            Verified: 'false'
                                                                        },
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
                                                                            res.json({
                                                                                status: "3",
                                                                                message: "Mail sending faild"
                                                                            });
                                                                        }
                                                                    })
                                                                } else {
                                                                    res.json({
                                                                        status: "3",
                                                                        message: "Profile updation field"
                                                                    });
                                                                }
                                                            });
                                                        }
                                                    } else if (req.body.Username != null && req.body.Username && !isEmpty(jsonObject)) {
                                                        dbo.collection(switlover).updateOne(
                                                            {
                                                                Auth_Token: Auth_Token
                                                            },
                                                            {
                                                                $set: {
                                                                    Username: UsernameArray,
                                                                    Phone_Number: jsonObject,
                                                                    updatedAt: new Date()
                                                                }
                                                            }).then((data) => {
                                                            if (data['result']['n'] == 1) {
                                                                res.json({
                                                                    status: "1",
                                                                    message: "Profile updated successfully"
                                                                });
                                                            } else {
                                                                res.json({status: "3", message: "Profile updation field"});
                                                            }
                                                        });
                                                    } else if (req.body.Email_Address != null && req.body.Email_Address && !isEmpty(jsonObject)) {
                                                        if (currentEmail == req.body.Email_Address) {
                                                            dbo.collection(switlover).updateOne(
                                                                {
                                                                    Auth_Token: Auth_Token
                                                                },
                                                                {
                                                                    $set: {
                                                                        Phone_Number: jsonObject,
                                                                        updatedAt: new Date()
                                                                    }
                                                                }).then((data) => {
                                                                if (data['result']['n'] == 1) {
                                                                    res.json({
                                                                        status: "1",
                                                                        message: "Profile updated successfully"
                                                                    });
                                                                } else {
                                                                    res.json({
                                                                        status: "3",
                                                                        message: "Profile updation field"
                                                                    });
                                                                }
                                                            });
                                                        } else {
                                                            dbo.collection(switlover).updateOne(
                                                                {
                                                                    Auth_Token: Auth_Token
                                                                },
                                                                {
                                                                    $set: {
                                                                        Email: {
                                                                            EmailAddress: req.body.Email_Address,
                                                                            Verified: 'false'
                                                                        },
                                                                        Phone_Number: jsonObject,
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
                                                                            res.json({
                                                                                status: "3",
                                                                                message: "Mail sending faild"
                                                                            });
                                                                        }
                                                                    })
                                                                } else {
                                                                    res.json({
                                                                        status: "3",
                                                                        message: "Profile updation field"
                                                                    });
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

                                                            if (data['result']['n'] == 1) {
                                                                res.json({
                                                                    status: "1",
                                                                    message: "Profile updated successfully"
                                                                });
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
                                                                    res.json({
                                                                        status: "1",
                                                                        message: "Profile updated successfully"
                                                                    });
                                                                } else {
                                                                    res.json({
                                                                        status: "3",
                                                                        message: "Profile updation field"
                                                                    });
                                                                }
                                                            });
                                                        } else {
                                                            dbo.collection(switlover).updateOne(
                                                                {
                                                                    Auth_Token: Auth_Token
                                                                },
                                                                {
                                                                    $set: {
                                                                        Email: {
                                                                            EmailAddress: req.body.Email_Address,
                                                                            Verified: 'false'
                                                                        },
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
                                                                            res.json({
                                                                                status: "3",
                                                                                message: "Mail sending faild"
                                                                            });
                                                                        }
                                                                    })
                                                                } else {
                                                                    res.json({
                                                                        status: "3",
                                                                        message: "Profile updation field"
                                                                    });
                                                                }
                                                            });
                                                        }

                                                    } else if (!isEmpty(jsonObject)) {

                                                        dbo.collection(switlover).updateOne({
                                                            Auth_Token: Auth_Token,
                                                            is_Block: {$ne: 1}
                                                        }, {
                                                            $set: {Phone_Number: jsonObject, updatedAt: new Date()}
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
                                                                        res.json({
                                                                            status: "7",
                                                                            message: "You have been blocked by Admin"
                                                                        });
                                                                    }
                                                                }).catch((finalerr) => {
                                                                    res.json({
                                                                        status: "3",
                                                                        message: "1Internal server error"
                                                                    });
                                                                })
                                                            } else {
                                                                res.json({status: "3", message: "2Internal server error"});
                                                            }
                                                        }).catch((catcherr) => {
                                                            res.json({status: "3", message: "3Internal Server error"});
                                                        });
                                                    }
                                                } else {
                                                    res.json({status: "0", message: "Username already exist"});
                                                }
                                            }
                                        })
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

                smtpTransport.sendMail(mailOptions, function (error, response) {
                    if (error) {

                        res.end("error" + error);
                    } else {

                        res.end("sent" + response);
                    }
                });
            });
            //--------------------------------------------------------------------------------------------------------------

            //--------------------------------------------------------------------------------------------------------------
            //Email Verification
            app.get('/verify', (req, res) => {

                if ((req.protocol + "://" + req.get('host')) == ("http://" + host)) {

                    if (req.query.id == rand) {

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
            });
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
            });
            //--------------------------------------------------------------------------------------------------------------

            //--------------------------------------------------------------------------------------------------------------
            //get single user contact list based on ID
            app.post('/api/singleUserNumber', (req, res) => {
                var dataArray = dbo.collection(switlover).find({
                    _id: new ObjectId(req.body.id)
                }).toArray((err, result) => {
                    if (!isEmpty(result)) {

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
                        var isRemovedByAdmin;
                        var isRemovedByUser;
                        var buttonAction;

                        for (var i = 0; i < dataresult['Contact_List'].length; i++) {
                            if (dataresult["Contact_List"][i]["isRemovedByAdmin"] == 0) {
                                isRemovedByAdmin = "No";
                                buttonAction = "<button id='remove' class='btn btn-outline-danger btn-sm'>Remove</button>"
                            } else {
                                isRemovedByAdmin = "Yes";
                                buttonAction = "<button id='remove' class='btn btn-outline-warning btn-sm'>Put Back</button>"
                            }

                            if (dataresult["Contact_List"][i]["isRemovedByUser"] == 0) {
                                isRemovedByUser = "No";
                            } else {
                                isRemovedByUser = "Yes";
                            }
                            var data = [
                                i + 1,
                                dataresult.Contact_List[i]["code"],
                                dataresult.Contact_List[i]["number"],
                                dataresult.Contact_List[i]["name"],
                                isRemovedByUser,
                                isRemovedByAdmin,
                                buttonAction
                            ];
                            dataArray1.push(data);
                            // }
                        }
                        res.json({
                            data: dataArray1
                        });
                    } else {
                        res.json({
                            status: "0"
                        });
                    }
                });
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

                var dataArray = dbo.collection(switlover).find({
                    _id: new ObjectId(req.body.id)
                }).toArray();
                dataArray.then((result) => {
                    if (!isEmpty(result)) {
                        for (var i = 0; i < result[0]["Contact_List"].length; i++) {
                            // for (var j = 0; j < result[0]["Contact_List"][i]['number'].length; j++) {

                            if (result[0]["Contact_List"][i]["number"] == req.body.number) {
                                if (result[0]["Contact_List"][i]["isRemovedByAdmin"] == 1) {

                                    dbo.collection(switlover).updateOne(
                                        {
                                            _id: new ObjectId(req.body.id),
                                            'Contact_List.number': req.body.number
                                        },
                                        {
                                            $set: {'Contact_List.$.isRemovedByAdmin': 0}
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
                                            'Contact_List.number': req.body.number
                                        },
                                        {
                                            $set: {'Contact_List.$.isRemovedByAdmin': 1}
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
                            // }
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
                                    $set: {is_Deleted: 1, is_Block: 1, updatedAt: new Date()}
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
                                    $set: {is_Deleted: 0, is_Block: 0, updatedAt: new Date()}
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
                            var number;
                            var myObj;
                            if ((data[0]['Contact_List'][i]['number']).includes(data[0]['Contact_List'][i]['code'])) {
                                number = data[0]['Contact_List'][i]['number'];
                            } else {
                                number = data[0]['Contact_List'][i]['code'] + "" + data[0]['Contact_List'][i]['number'];
                            }
                            var isRemovedByAdmin;
                            var counter = 0;
                            var isRemovedByUser;
                            var myLikesArray = data[0]['Like'];
                            if (!isEmpty(myLikesArray)) {
                                for (var j = 0; j < myLikesArray.length; j++) {
                                    var numb = myLikesArray[j].split("-")[1];
                                    var code = myLikesArray[j].split("-")[0];
                                    var num = code + "" + numb;
                                    if (num.length < 15) {
                                        counter = counter + 1;
                                        if (num == number) {
                                            if (data[0]["Contact_List"][i]["isRemovedByAdmin"] == 0) {
                                                isRemovedByAdmin = "No";
                                            } else {
                                                isRemovedByAdmin = "Yes";
                                            }
                                            if (data[0]["Contact_List"][i]["isRemovedByUser"] == 0) {
                                                isRemovedByUser = "No";
                                            } else {
                                                isRemovedByUser = "Yes";
                                            }
                                            myObj = [
                                                counter,
                                                data[0]['Contact_List'][i]['code'],
                                                data[0]['Contact_List'][i]['number'],
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
                    else {
                        var dataresult = result[0];
                        delete dataresult._id;
                        delete dataresult.userID;
                        res.json({status: "1", message: "success", userdata: result});
                    }
                }).catch((err) => {
                    res.json({status: "3 ", message: "notification updated failed"});
                });
            });
            //--------------------------------------------------------------------------------------------------------------

            //--------------------------------------------------------------------------------------------------------------
            //Set Notification Settings
            app.post('/api/SetNotificationadmin', (req, res) => {
                console.log(req.body)
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
                        console.log(req.body);

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

                            if (result['result']['n'] == 1)
                                res.json({status: "1", message: "notification updated successfully"});
                            else
                                res.json({status: "3", message: "notification updated failed"});
                        }).catch((err) => {
                            res.json({status: "3 ", message: "notification updated failed"});
                        });
                    }
                }).catch((err) => {
                    res.json({status: "3 ", message: "Internal server error" + err});
                });
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
