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

const uri = "mongodb+srv://ArjunDobaria:Pravin@143@switlover-bjxu8.mongodb.net/test?retryWrites=true"
const client = new MongoClient(uri, {useNewUrlParser: true});

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
                            if (result[0]['is_Block'] == 1) {
                                res.json({status: "7", type: "1", message: "Sorry you are block for this app. Contact to our support team.", user_data: result});
                            }
                            if (result[0]['is_Deleted'] == 1) {
                                res.json({status: "7", type: "2", message: "Sorry you are deleted from this app. If you not do this then please contact to support team.", user_data: result});
                            }
                            for(var i = 0; i < result[0]['Phone_Number'].length; i++)
                            {
                                if (result[0]['Phone_Number'][i]['is_OverVerification'] == 1) {
                                    res.json({status: "7", type: "3", message: "Sorry this number is block for over verification. Please contact to our support team", user_data: result});
                                }
                            }
                        }
                        res.json({status: "1", message: "User is available", user_data: result});
                    else
                        res.json({status: "0", message: "User is not available"});
                    }).catch((err) => {
                        res.json({status: "3", message: "Internal server error"});
                    })
                }
            }
        });
        //--------------------------------------------------------------------------------------------------------------

        //--------------------------------------------------------------------------------------------------------------
        //My Like
        app.post('/api/MyLikes', (req, res) => {
            var Auth_Token = req.header('Auth_Token');
            if (!Auth_Token || Auth_Token == null) {
                res.json({status: "6", message: "Auth token missing"});
            } else {
                if (!req.body || isEmpty(req.body)) {
                    res.json({status: "4", message: "Parameter missing or Invalid"});
                } else {
                    var number = [];
                    number = req.body.Number;
                    for (var i = 0; i < number.length; i++) {
                        var dataArray = dbo.collection(switlover).find({
                            'Phone_Number.Contry_Code': number[i]['code'],
                            'Phone_Number.Number': number[i]['number']
                        }).toArray();
                        dataArray.then((result) => {
                            if (!isEmpty(result)) {

                                var userID = result[0]['_id'];
                                console.log(userID);
                                var likeArray = [];
                                likeArray.push(userID);
                                dbo.collection(switlover).updateOne({
                                        Auth_Token: Auth_Token,
                                    },
                                    {
                                        $set: {Like: likeArray}
                                    }).then((resultdata) => {
                                    if (resultdata['result']['n'] == 1) {
                                        res.json({status: "1", message: "success"});
                                    } else {
                                        res.json({status: "3", message: "1Internal server error"})
                                    }
                                }).catch((errdata) => {
                                    res.json({status: "3", message: "2Internal server error"})
                                })
                            } else {
                                //No user found
                            }
                        }).catch((err) => {
                            res.json({status: "3", message: "3Internal server error"})
                        })
                    }
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
                                        res.json({status: "1", message: "User is available", user_data: finalresult});
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

                        res.json({status: "1", message: "success", user_data: result});
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
                var numberArray = [];
                dataArray.then((data) => {
                    if (!isEmpty(data[0]['Contact_List'])) {

                        for (var i = 0; i < data[0]['Contact_List'].length; i++) {
                            if (data[0]['Contact_List'][i]['isRemovedByAdmin'] == 0 && data[0]['Contact_List'][i]['isRemovedByUser'] == 0) {
                                var arrayNumber = [];
                                for (var j = 0; j < data[0]['Contact_List'][i]['numberList'].length; j++) {
                                    // var phoneNumber = data[0]['Contact_List'][i]['numberList'][j]['code'] + "" + data[0]['Contact_List'][i]['numberList'][j]['number'];
                                    if (data[0]['Contact_List'][i]['numberList'][j]['isRemovedByAdmin'] == 0 && data[0]['Contact_List'][i]['numberList'][j]['isRemovedByUser'] == 0) {
                                        var numberCode = {
                                            code: data[0]['Contact_List'][i]['numberList'][j]['code'],
                                            number: data[0]['Contact_List'][i]['numberList'][j]['number']
                                        }
                                        arrayNumber.push(numberCode)
                                    }
                                }
                                var myObj = {
                                    Name: data[0]['Contact_List'][i]['name'],
                                    Image: data[0]['Contact_List'][i]['image'],
                                    Number: arrayNumber
                                };
                                numberArray.push(myObj);
                            } else {
                                if (isEmpty(numberArray)) {
                                    res.json({status: "0", message: "Sorry there is no contact to display"});
                                }
                            }
                        }
                        res.json({status: "1", message: "Contact List", user_data: numberArray});
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
                    dbo.collection(switlover).updateOne(
                        {
                            Auth_Token: Auth_Token
                        },
                        {
                            $set: {Contact_List: req.body.Contact_List, updatedAt: new Date()}
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


    }
})
;

var port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.listen(port, () => {
    console.log('Server is up and running on port number ' + port);
});