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
        pass: "Krishna143"
    }
});
var rand,mailOptions,host,link;

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
            res.json({status: "0", message: "Server is running..."});
        });
        //--------------------------------------------------------------------------------------------------------------

        //--------------------------------------------------------------------------------------------------------------
        //Generate Request Token
        app.get('/api/GenerateRequestToken', (req, res) => {
            var token = randtoken.generate(64);
            res.json({status: "0", message: token.toString()});
        });
        //--------------------------------------------------------------------------------------------------------------

        //--------------------------------------------------------------------------------------------------------------
        //Generate Auth Token
        app.get('/api/GenerateAuthToken', (req, res) => {
            var token = randtoken.generate(64);
            res.json({status: "0", message: token.toString()});
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
                            CurrentlyLive: 0,
                            DownloadPerDay: 0,
                            DownloadPerHour: 0,
                            AccessPerDay: 0,
                            AccessPerHour: 0,
                        },
                        Location: {
                            TimeSpentOnApp: "00:00:00"
                        },
                        User: {
                            ContactNotRecognized: 0,
                            AddNewNumberViaApp: 0,
                            ContactRemoveRation: 0,
                            TwoOut2Ratio: 0,
                            OneOut1Ratio: 0,
                            AnonymousChatRatio: 0,
                            NotInAppPurchase: 0,
                            TimeSpentOnApp: "00:00:00"
                        }
                    };

                    dbo.collection(counter).insertOne(myObj, (err, result) => {
                        if (err)
                            res.json({status: "1", message: "Inserting faild"});
                        else {
                            res.json({status: "0", message: "Counter added successfully"});
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
                            res.json({status: "0", message: "counter updated successfully"});
                        else
                            res.json({status: "1", message: "counter updated failed"});
                    }).catch((err) => {
                        res.json({status: "1", message: "counter updated failed"});
                    });
                }
            }).catch((err) => {
                res.json({status: "1", message: "Internal Server error"});
            });


        });
        //--------------------------------------------------------------------------------------------------------------

        //--------------------------------------------------------------------------------------------------------------
        //Register API
        app.post('/api/Register', (req, res) => {

            var dataArray = dbo.collection(switlover).find({
                'Phone_Number.Number': req.body.Number,
                'Phone_Number.Contry_Code': req.body.Contry_Code
            }).toArray();
            dataArray.then((data) => {

                if (isEmpty(data)) {
                    var Phone_Number = req.body.Contry_Code + "" + req.body.Number;
                    var randomOTP = getRandomInt(999999);
                    sendOtp.send(Phone_Number, "PRIIND", randomOTP, (error, smssent) => {
                        if (error)
                            console.error("Error in send sms : " + error);
                        else {
                            var myObj = {
                                Username: "",
                                Phone_Number: {
                                    Contry_Code: req.body.Contry_Code,
                                    Number: req.body.Number,
                                    Location: req.body.Location,
                                    Verified: "false"
                                },
                                Email: "",
                                Contact_List: "",
                                PowerID: {Power_Of_Match: "0", Power_Of_Time: "0", Golden_Power: "0"},
                                is_Deleted: "0",
                                is_Online: "0",
                                is_Block: "0",
                                is_OverVerification: "0",
                                createdAt: new Date(),
                                updatedAt: new Date(),
                                deletedAt: "",
                                Request_token: req.body.Request_token,
                                Auth_Token: "",
                                Device: "0",
                                language: "en"
                            };
                            dbo.collection("switlover").insertOne(myObj, (err, result) => {
                                if (err)
                                    res.json({status: "1", message: "Sms sending field"});
                                else {
                                    res.json({status: "0", message: randomOTP.toString()});
                                }
                            });
                        }
                    });
                } else {
                    res.json({status: "1", message: "User already exists...!!!"});
                }
            }).catch((err) => {
                res.json({status: "1", message: "Internal Server error"});
            });
        });
        //--------------------------------------------------------------------------------------------------------------

        //--------------------------------------------------------------------------------------------------------------
        //ResendOTP API
        app.post('/api/ResendOTP', (req, res) => {

            var Phone_Number = req.body.Contry_Code + "" + req.body.Number;

            var randomOTP = getRandomInt(999999);
            sendOtp.send(Phone_Number, "PRIIND", randomOTP, (error, smssent) => {
                if (error)
                    res.json({status: "1", message: "Sms sending failed"});
                else {
                    res.json({status: "0", message: randomOTP});
                }
            });
        });
        //--------------------------------------------------------------------------------------------------------------

        //--------------------------------------------------------------------------------------------------------------
        //OTP Verification
        app.post('/api/Verified', (req, res) => {
            var token = randtoken.generate(64);
            dbo.collection(switlover).updateOne(
                {
                    'Request_token': req.body.Request_token
                },
                {
                    $set: {'Phone_Number.Verified': 'true', 'Auth_Token': token.toString()},
                    $currentDate: {updatedAt: true}
                }
            ).then((result) => {
                if (result['result']['n'] == 1) {
                    var dataArray = dbo.collection(switlover).find({
                        'Request_token': req.body.Request_token
                    }).toArray();
                    dataArray.then((data) => {
                        res.json({status: "0", message: "Verification successfully", data: data[0]});
                    }).catch((err) => {
                        console.log("Catch Err : " + err);
                    })
                } else {
                    res.json({status: "1", message: "Internal Server error"});
                }

            }).catch((err) => {
                res.json({status: "1", message: "Internal Server error"});
            })
        });
        //--------------------------------------------------------------------------------------------------------------

        //--------------------------------------------------------------------------------------------------------------
        //Login API
        app.post('/api/Login', (req, res) => {
            var Phone_Number = req.body.Contry_Code + "" + req.body.Number;
            var dataArray = dbo.collection(switlover).find({
                'Phone_Number.Number': req.body.Number,
                'Phone_Number.Contry_Code': req.body.Contry_Code
            }).toArray();
            dataArray.then((data) => {
                if (isEmpty(data))
                    res.json({status: "1", message: "User not found"});
                else {
                    var randomOTP = getRandomInt(999999);
                    sendOtp.send(Phone_Number, "PRIIND", randomOTP, (error, smssent) => {
                        if (error)
                            console.error("Error in send sms : " + error);
                        else {
                            res.json({status: "0", message: randomOTP.toString(), data: data[0]['Request_token']});
                        }
                    });
                }
            }).catch((err) => {
                res.json({status: "1", message: "Internal Server error"});
            })
        });
        //--------------------------------------------------------------------------------------------------------------

        //--------------------------------------------------------------------------------------------------------------
        //Get Contact List
        app.post('/api/ContactList', (req, res) => {
            dbo.collection('switlover').updateOne(
                {
                    Auth_Token: req.body.Auth_Token
                },
                {
                    $set: {Contact_List: req.body.Contact_List},
                    $currentDate: {updatedAt: true}
                }).then((result) => {
                if (result['result']['n'] == 1) {
                    res.json({status: "0", message: "Contact list updated successfully"});
                } else {
                    res.json({status: "1", message: "Internal Server error"});
                }
            }).catch((err) => {
                res.json({status: "1", message: "Internal Server error"});
            });
        })
        //--------------------------------------------------------------------------------------------------------------



        //--------------------------------------------------------------------------------------------------------------
        //Send Email For Verification
        app.get('/api/EmailVerification',(req,res) => {
            rand=Math.floor((Math.random() * 1000) + 54);
            host=req.get('host');
            link="http://"+req.get('host')+"/verify?id="+rand;
            mailOptions={
                to : req.query.Email,
                subject : "Please confirm your Email account",
                html : "Hello,<br> Please Click on the link to verify your email.<br><a href="+link+">Click here to verify</a>"
            }
            console.log(mailOptions);
            smtpTransport.sendMail(mailOptions, function(error, response){
                if(error){
                    console.log(error);
                    res.end("error"+error);
                }else{
                    console.log("Message sent: " + response);
                    res.end("sent"+response);
                }
            });
        });
        //--------------------------------------------------------------------------------------------------------------

        //--------------------------------------------------------------------------------------------------------------
        //Email Verification
        app.get('/verify',function(req,res){
            console.log(req.protocol+":/"+req.get('host'));
            if((req.protocol+"://"+req.get('host'))==("http://"+host))
            {
                console.log("Domain is matched. Information is from Authentic email");
                if(req.query.id==rand)
                {
                    console.log("email is verified");
                    res.end("<h1>Email "+mailOptions.to+" is been Successfully verified");
                }
                else
                {
                    console.log("email is not verified");
                    res.end("<h1>Bad Request</h1>");
                }
            }
            else
            {
                res.end("<h1>Request is from unknown source");
            }
        });
        //--------------------------------------------------------------------------------------------------------------



    }
});

var port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.listen(port, () => {
    console.log('Server is up and running on port number ' + port);
});