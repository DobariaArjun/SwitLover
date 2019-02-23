const MongoClient = require('mongodb').MongoClient;
const bodyParser = require('body-parser');
const express = require('express');
const promise = require('promise');
const isEmpty = require('is-empty');
const SendOtp = require('sendotp');
const randtoken = require('rand-token');
const sendOtp = new SendOtp('220558AWw8c1QK8F5b22554d');
const app = express();

const nodemailer = require("nodemailer");

const uri = "mongodb+srv://ArjunDobaria:Pravin@143@switlover-bjxu8.mongodb.net/test?retryWrites=true"
const client = new MongoClient(uri, {useNewUrlParser: true});

function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}

var smtpTransport = nodemailer.createTransport({
    service: "Gmail",
    auth: {
        user: "arjun.dobaria12@gmail.com",
        pass: "Harshu2007"
    }
});
var rand, mailOptions, host, link;

//--------------------------------------------------------------------------------------------------------------
//COLLECTIONS
var counter = "counters";
var switlover = "switlover";
//--------------------------------------------------------------------------------------------------------------


client.connect((err, db) => {
    if (err)
        console.log("Error while connecting to Mongo");
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
        app.get('/api/GenerateRequestToken', (req, res) => {
            var token = randtoken.generate(64);
            res.json({status: "1", message: token.toString()});
        });
        //--------------------------------------------------------------------------------------------------------------

        //--------------------------------------------------------------------------------------------------------------
        //Counter For Download but not Login
        app.get('/api/NotLoginYet', (req, res) => {

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
                        console.log(result['result']['n']);
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
        //ResendOTP API
        app.post('/api/ResendOTP', (req, res) => {
            if (!req.body.Contry_Code || req.body.Contry_Code == null && !req.body.Number || req.body.Number == null) {
                res.json({status: "4", message: "Parameter missing or Invalid"});
            } else {
                var Phone_Number = req.body.Contry_Code + "" + req.body.Number;

                var randomOTP = getRandomInt(999999);
                sendOtp.send(Phone_Number, "PRIIND", randomOTP, (error, smssent) => {
                    if (error)
                        res.json({status: "3", message: "Sms sending failed, Please resend the sms for OTP"});
                    else {
                        res.json({status: "1", message: randomOTP.toString()});
                    }
                });
            }


        });
        //--------------------------------------------------------------------------------------------------------------

        //--------------------------------------------------------------------------------------------------------------
        //Login API
        app.post('/api/Login', (req, res) => {
            if (!req.body.Contry_Code || req.body.Contry_Code == null && !req.body.Number || req.body.Number == null) {
                res.json({status: "4", message: "Parameter missing or Invalid"});
            } else {
                var Phone_Number = req.body.Contry_Code + "" + req.body.Number;
                var dataArray = dbo.collection(switlover).find({
                    'Phone_Number.Number': req.body.Number,
                    'Phone_Number.Contry_Code': req.body.Contry_Code,
                    isBlock: {$ne: 1}
                }).toArray();
                dataArray.then((data) => {
                    var randomOTP = getRandomInt(999999);
                    sendOtp.send(Phone_Number, "PRIIND", randomOTP, (error, smssent) => {
                        if (error)
                            res.json({status: "3", message: "Sms sending failed, Please resend the sms for OTP"});
                        else {

                            res.json({
                                status: "1",
                                message: "success",
                                data: {code: randomOTP.toString(), request_token: randtoken.generate(64).toString()}
                            });
                        }


                    });
                }).catch((err) => {
                    res.json({status: "3", message: "Internal Server error"});
                });
            }

        });
        //--------------------------------------------------------------------------------------------------------------

        //--------------------------------------------------------------------------------------------------------------
        //OTP Verification
        app.post('/api/Verified', (req, res) => {
            if (!req.body.Request_token || req.body.Request_token == null) {
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
                            }, {$set: {Request_token: req.body.Request_token}}).then((dataresult) => {
                                if (dataresult['result']['n'] == 1) {
                                    res.json({status: "1", message: "User is available", user_data: result});
                                } else {
                                    res.json({status: "3", message: "Internal server error"});
                                }
                            }).catch((catcherr) => {
                                res.json({status: "3", message: "Internal Server error"});
                            })
                        } else {
                            var myObj = {
                                Request_token: req.body.Request_token,
                                Auth_Token: token.toString(),
                                Username: [],
                                Phone_Number: {
                                    Contry_Code: req.body.Contry_Code,
                                    Number: req.body.Number,
                                    Location: req.body.Location,
                                    Verified: req.body.Verified,
                                    is_OverVerification: 0
                                },
                                Email: {EmailAddress: "", Verified: "false"},
                                Contact_List: "",
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
                            dbo.collection("switlover").insertOne(myObj, (err, result) => {
                                if (err)
                                    res.json({status: "3", message: "Error while inserting records"});
                                else {
                                    var dataArray = dbo.collection(switlover).find({
                                        Request_token: req.body.Request_token,
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
        //Update Profile - after login first time
        app.post('/api/UpdateProfile', (req, res) => {
            if (!req.body.Auth_Token || req.body.Auth_Token == null) {
                res.json({status: "6", message: "Auth token missing"});
            } else {
                if (!req.body.Username || req.body.Username == null) {
                    res.json({status: "4", message: "Parameter missing or Invalid"});
                } else {
                    var dataArray = dbo.collection(switlover).find({
                        Auth_Token: req.body.Auth_Token,
                        is_Block: {$ne: 1}
                    }).toArray();
                    dataArray.then((result) => {
                        var UsernameArray = result[0]['Username'];
                        var existUser = UsernameArray[UsernameArray.length - 1];
                        var newUsername = req.body.Username;
                        if (newUsername != existUser) {
                            UsernameArray.push(req.body.Username);
                        }
                        if (req.body.Email_Address != null || !req.body.Email_Address) {
                            dbo.collection('switlover').updateOne(
                                {
                                    Auth_Token: req.body.Auth_Token
                                },
                                {
                                    $set: {
                                        Email: {EmailAddress: req.body.Email_Address, Verified: 'false'},
                                        Username: UsernameArray
                                    }
                                }).then((data) => {
                                if (data['result']['n'] == 1) {
                                    res.json({status: "1", message: "Profile updated successfully"});
                                } else {
                                    res.json({status: "3", message: "Profile updation field"});
                                }
                            });
                        } else {
                            dbo.collection('switlover').updateOne(
                                {
                                    Auth_Token: req.body.Auth_Token
                                },
                                {
                                    $set: {Username: UsernameArray}
                                }).then((data) => {
                                if (data['result']['n'] == 1) {
                                    res.json({status: "1", message: "Profile updated successfully"});
                                } else {
                                    res.json({status: "3", message: "Profile updation field"});
                                }
                            }).catch((error) => {
                                res.json({status: "0", message: "Profile not found"});
                            })
                        }
                    }).catch((err) => {
                        res.json({status: "3", message: "Internal server error"});
                    });
                }
            }
        });
        //--------------------------------------------------------------------------------------------------------------

        //--------------------------------------------------------------------------------------------------------------
        //OTP Verification
        app.post('/api/OverVerification', (req, res) => {
            if (!req.body.Auth_Token || req.body.Auth_Token == null) {
                res.json({status: "6", message: "Auth token missing"});
            } else {
                dbo.collection(switlover).updateOne(
                    {
                        'Auth_Token': req.body.Auth_Token
                    },
                    {
                        $set: {'Phone_Number.is_OverVerification': 1}
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
        app.post('/api/ContactList', (req, res) => {
            if (!req.body.Auth_Token || req.body.Auth_Token == null) {
                res.json({status: "6", message: "Auth token missing"});
            } else {
                if (!req.body.Contact_List || req.body.Contact_List == null) {
                    res.json({status: "4", message: "Parameter missing or Invalid"});
                } else {
                    dbo.collection('switlover').updateOne(
                        {
                            Auth_Token: req.body.Auth_Token
                        },
                        {
                            $set: {Contact_List: req.body.Contact_List}
                        }).then((result) => {
                        if (result['result']['n'] == 1) {
                            res.json({status: "1", message: "Contact list updated successfully"});
                        } else {
                            res.json({status: "3", message: "Internal Server error"});
                        }
                    }).catch((err) => {
                        res.json({status: "3", message: "Internal Server error"});
                    });
                }

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
        app.get('/verify', function (req, res) {
            console.log(req.protocol + ":/" + req.get('host'));
            if ((req.protocol + "://" + req.get('host')) == ("http://" + host)) {
                console.log("Domain is matched. Information is from Authentic email");
                if (req.query.id == rand) {
                    console.log("email is verified");
                    res.end("<h1>Email " + mailOptions.to + " is been Successfully verified");
                    dbo.collection('switlover').updateOne(
                        {
                            'Email.EmailAddress': mailOptions.to
                        },
                        {
                            $set: {'Email.Verified': 'true'},
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


    }
})
;

var port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.listen(port, () => {
    console.log('Server is up and running on port number ' + port);
});