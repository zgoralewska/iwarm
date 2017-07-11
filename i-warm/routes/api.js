/**
 * Created by DELL on 2016-01-31.
 */
var models  = require('../models');
var express = require('express');
var router = express.Router();
var passport = require('passport');
var sha1 = require('sha1');
var path = require('path');
var nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport({
    host: 'aspmx.l.google.com',
    port: 25,
    secure: false
});


/* GET home page. */
router.get('/', function(req, res, next) {
    res.json({ message: 'hooray! welcome to our api!' });
});

router.post('/register', function (req, res) {
    models.User.findOrCreate({where: {Email: req.body.email, Password: sha1(req.body.password)}}).then(function (instance, created) {
        if (instance[0].$options.isNewRecord) {
            res.json({status: "Registration successful"});
        }
        else{
            res.json({err: "User already exists"});
        }
    });
});

router.route('/login')
    .post(passport.authenticate('local'), function(req, res) {
        res.json({status: 'Login successful!'});
    });

router.get('/logout', function(req, res) {
    req.logout();
    res.clearCookie('connect.sid');
    res.json({"status": 'Bye'});
});

router.get('/dashboard/inhabitants/:houseId', function(req, res) {
    var houseId = req.params.houseId,
        inhabitantsOutside = [],
        inhabitantsInside = [];

    models.User.findAll( {where: { House_id : houseId }}).then(function(users){
        if(users){
            for(var i=0; i < users.length; i++){
                if(users[i].Status === "Entered"){
                    inhabitantsInside.push(users[i]);
                }
                else{
                    inhabitantsOutside.push(users[i]);
                }
            }
            res.json({"status": {inhabitantsInside: inhabitantsInside, inhabitantsOutside: inhabitantsOutside}});
        }
    });
});

router.route('/dashboard/temp/antifrost')
    .get(function(req, res) {
        var loggedId = req.user.Id;

        models.User.findById(loggedId, {include: [models.House]}).then(function(userData){
            if(userData)res.json({"temp": userData.House.Antifrost_Temp});
            else res.sendStatus(500);
        });
    })
    .post(function (req, res) {
        var loggedId = req.user.Id,
            chosenTemp = req.body.temp;

        models.User.findById(loggedId, {include: [models.House]}).then(function(userData){
            if(userData){
                models.HouseOnline.update({Antifrost_Temp: chosenTemp}, {where: { Id : userData.House.House_Online_Id }});
                res.sendStatus(200);
            }
            else{
                res.sendStatus(500);
            }
        });
    });


router.post('/dashboard/temp', function(req, res) {
    var loggedId = req.user.Id,
        chosenTemp = req.body.temp;

    models.User.findById(loggedId, {include: [models.House]}).then(function(userData){
        if(userData){
            models.HouseOnline.update({Preferable_Temp: chosenTemp}, {where: { Id : userData.House.House_Online_Id }});
            res.sendStatus(200);
        }
        else{
            res.sendStatus(500);
        }
    });
});

router.get('/dashboard', function(req, res) {
    var loggedId = req.user.Id,
        result = {};

    if(loggedId){
        models.User.findById(loggedId, {include: [models.House]}).then(function(userData){
            if(userData){

                result = {
                    houseName: userData.House.Name,
                    houseUniqueName: userData.House.UniqueName,
                    loggedUser: userData.Email,
                    houseId: userData.House_id
                };

                if(userData.House.House_Online_Id){
                    models.HouseOnline.findById(userData.House.House_Online_Id).then(function(houseOnline){
                        if(houseOnline){
                            result['tempActual'] = houseOnline.Actual_Temp;
                            result['tempChosen'] = houseOnline.Preferable_Temp;
                            result['tempAntifrost'] = houseOnline.Antifrost_Temp;
                        }
                        res.json({"status": result});
                    });
                }
                else{
                    models.HouseOnline
                        .create({
                            Actual_Temp: 0,
                            Preferable_Temp: 0,
                            Heat_Status: 0,
                            Status: 'Exited'
                        })
                        .then(function(houseOnline){
                            models.House.findById(userData.House_id).then(function(house) {
                                if (house) {
                                    houseOnline.setHouse(house);
                                }
                                res.json({"status": result});
                            });
                        });
                }
            }
        });
    }
});

router.get('/email/:activateId', function(req, res) {
    var activateHash = req.params.activateId,
        result;

    models.User.findAll({attributes: ['Email']}).then(function(users) {
        if(users){
            result = getProperEmail(activateHash, users);

            if(result){
                activateUser(result);
                res.redirect('/');
            }
        }
    });

    function activateUser(email){
        models.User.update({Active: 1}, {where: { Email : email }});
    }

    function getProperEmail(hash, emails) {
        var i,
            el;

        for(i=0; i<emails.length; i++) {
            el = emails[i].dataValues.Email;
            if (sha1(el) === hash) {
                return el;
            }
        }
    }

});

router.post('/email', function(req, res) {
    var email = req.body.email,
        mailOptions;


    mailOptions = {
        from: 'Iwarm programowanie.mail@gmail.com', // sender address
        to: email, // list of receivers
        subject: 'Iwarm account activation', // Subject line
        text: 'Account activation', // plaintext body
        html: '<strong>Click it <a href="http://zgoralewska.me:3000/api/email/' + sha1(email)+ '">Activate me</a></strong>'
    };

    transporter.sendMail(mailOptions, function(error, info) {
        if (error) {
            console.log(error);
            res.sendStatus(500);
        }
        else{
            console.log('Message sent: ' + info.response);
            res.sendStatus(200);
        }
    });
});

router.get('/user/status', function(req, res) {
    var response = {};

    if (req.user)
        response = {status: "OK"};
    else
        response = {status: "NOT"};

    res.json(response);
});

router.route('/users')
    .get(function(req, res) {
        models.User.findAll().then(function(users) {
            res.json(users);
        });
    });


router.route('/users/:user_id')
    .get(function(req, res) {
        models.User.findById(req.params.user_id).then(function(users) {
            res.json(users);
        });
    })
    .put(function (req, res) {
        models.User.forge({id: req.params.user_id})
            .fetch({require: true})
            .then(function (user) {
                user.save({
                    name: req.body.name || user.get('name'),
                    email: req.body.email || user.get('email')
                })
                    .then(function () {
                        res.json({error: false, data: {message: 'User details updated'}});
                    })
                    .catch(function (err) {
                        res.status(500).json({error: true, data: {message: err.message}});
                    });
            })
            .catch(function (err) {
                res.status(500).json({error: true, data: {message: err.message}});
            });
    });

router.route('/house/add')
    .post(function(req, res) {
        var radius = req.body.radius,
            lat = req.body.lat,
            lng = req.body.lng,
            loggedId = req.user.Id,
            houseName = req.body.houseName,
            houseUniqueName;

        var getRandomHouseId = function(){
            var text = "";
            var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789#$!+*";

            for( var i=0; i < 5; i++ )
                text += possible.charAt(Math.floor(Math.random() * possible.length));

            return text;
        };

        if(loggedId){
            houseUniqueName = getRandomHouseId();
            models.House
                .create({
                    Name: houseName,
                    Lat: lat,
                    Lng: lng,
                    Radius: radius,
                    UniqueName: houseUniqueName
                })
                .then(function(house){
                    models.User.findById(loggedId).then(function(user) {
                        if (user) {
                            house.setInhabitants(user);
                            res.json("status: OK");
                        }
                    });
                });

        }

    });

router.get('/house/user', function(req, res){
    models.User.findById(req.user.Id).then(function(user) {
        if(user){
            res.json({"status": user.House_id !== null});
        }
    });

});

router.route('/house/user/add')
    .post(function(req, res){
        var houseUniqueName = req.body.uniqueName,
            loggedId = req.user.Id;

        if(loggedId){
            models.House.findOne({ where: {UniqueName: houseUniqueName} }).then(function(house){
                if(house){
                    models.User.update({House_id: house.Id}, {where: { Id : loggedId }});
                    res.json({"status": "ok"})
                }
                else{
                    res.sendStatus(500);
                }
            })
        }
    });

router.delete('/house/user/delete', function(req, res){
    var loggedId = req.user.Id;

    if(loggedId){
        models.User.update({House_id: null}, {where: { Id : loggedId }});
        res.json({"status": "ok"})
    }
});

router.route('/houses/:house_id/users')
    .get(function(req, res) {
        models.House.findById(req.params.house_id).then(function(house) {
            house.getInhabitants().then(function(users){
                res.json(users);
            })
        });
    });


router.route('/android/login')
    .post(function(req, res) {
        var email = req.body.email,
            password = req.body.password,
            houseUniqueName = req.body.houseId;

        console.log("post from android");

        models.User.findOne({where: {Email: email, Password: sha1(password)}}).then(function(user) {
            if(user){
                models.House.findById(user.House_id).then(function(house){
                    if(house){
                        console.log("House unique name from android", houseUniqueName);
                        console.log("House unique name from database", house.UniqueName);
                        if(house.UniqueName == houseUniqueName)
                            res.json({"cLat": house.Lat, "cLng": house.Lng, "radius": house.Radius});
                        else
                            res.sendStatus(500);
                    }
                    else{
                        res.sendStatus(500);
                    }
                })
            }
        });
    });




module.exports = router;
