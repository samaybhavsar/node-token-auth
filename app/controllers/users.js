// Load required packages
var User = require('../models/user');
var http = require('http');
var config = require('../../config');
var fs = require('fs')
var replaceall = require("replaceall");
var randomstring = require("randomstring");

var nodemailer = require('nodemailer');
var ses = require('nodemailer-ses-transport');
var transporter = nodemailer.createTransport(ses({
    accessKeyId: config.accessKeyId,
    secretAccessKey: config.secretAccessKey,
    region: config.region
}));
// Create endpoint /api/users for POST
exports.postUsers = function(req, res) {
  var user = new User({
    username: req.body.username,
    password: req.body.password
  });

  user.save(function(err) {
    if (err)
      res.send(err);
    res.json({ message: 'New beer drinker added to the locker room!' });
  });
};

exports.verifyPhone = function (req, res) {
  User.findOne({phone: req.params.phone}, function(err, user) {
    if(user) {
      if(user.otp == req.params.otp) {
        user.is_phone_verified = 1;
        user.save(function(err) {
          if (err)
            res.send(err);
          res.json({success:true, data: {msg: 'Phone verified successfully.'}});
        });
      } else {
        res.json({success:false, data: {msg: 'Error in verifying phone.'}});
      }
    } else {
      res.json({success:false, data: {msg: 'This phone is not registered.'}});
    }
  });
}

exports.verifyEmail = function  (req, res) {
  User.findOne({email: req.params.email}, function(err, user) {
    if(user) {
      if(user.evc == req.params.evc) {
        user.is_email_verified = 1;
        user.save(function(err) {
          if (err)
            res.send(err);
          res.json({success:true, data: {msg: 'Email verified successfully.'}});
        });
      } else {
        res.json({success:false, data: {msg: 'Error in verifying email.'}});
      }
    } else {
      res.json({success:false, data: {msg: 'This email is not registered.'}});
    }
  });
}

exports.registerUser = function (req, res) {
  var newUser = new User({
    username: req.body.email,
    password: req.body.password,
    first_name: req.body.first_name,
    last_name: req.body.last_name,
    phone: req.body.phone,
    email: req.body.email,
    is_phone_verified: 0,
    is_email_verified: 0
  });
  console.log('http'+http);
  User.findOne({email: req.body.email}, function(err, user) {
    if(user) {
      res.json({success:false, data: {msg: 'User already exists.'}});
    } else {
      var otp = Math.floor(Math.random()*90000) + 10000;
      var evc = randomstring.generate();
      var confirmation_link = "http://easymovr.com/verify-email/" + newUser.email + "/" + evc;
      newUser.otp = otp;
      newUser.evc = evc;
      var options = {
        host: 'trans.magicsms.co.in',
        path: '/api/v3/index.php?method=sms&api_key=A8925addfa8820923e1ab86ec05649b01&to='+newUser.phone+'&sender=ESYMVR&message='+encodeURIComponent('Your Easymovr OTP is ')+''+otp+'&unicode=1'

      };
      callback = function(response) {
        console.log('inside callback');
        var str = '';
        response.on('data', function (chunk) {
          str += chunk;
        });
        //the whole response has been recieved, so we just print it out here
        response.on('end', function () {
          console.log(str);
        });
      }
      http.request(options, callback).end();

      var confirmation_txt = fs.readFileSync("/Users/samaybhavsar/Code/em/app/views/emails/confirmation.txt", 'utf8');
      confirmation_txt = confirmation_txt.replace('|NAME|', newUser.first_name);
      confirmation_txt = confirmation_txt.replace('|CONFRIMATIONLINK|', confirmation_link);

      var confirmation_html = fs.readFileSync("/Users/samaybhavsar/Code/em/app/views/emails/confirmation.html", 'utf8');
      confirmation_html = confirmation_html.replace('|NAME|', newUser.first_name);
      confirmation_html = replaceall('|CONFIRMATIONLINK|', confirmation_link, confirmation_html);

      transporter.sendMail({
        from: 'Easymovr <noreply@easymovr.com>',
        to: newUser.email,
        subject: 'Verify your email',
        text: confirmation_txt, // plaintext body
        html: confirmation_html // html body
      });

      newUser.save(function(err, user, numberAffected) {
        if(err)
          res.send(err);
        if(numberAffected === 1) {
          res.json({success:true, data: {msg: 'User created success.'}});
        } else {
          res.json({success:false, data: {msg: 'Could not create a user.'}});
        }
      });
    }
  });
}
// Create endpoint /api/users for GET
exports.getUsers = function(req, res) {
  if(typeof req.query._id != 'undefined')  {
    User.findById(req.query._id, function(err, users) {
      if (err)
      res.send(err);
      res.json(users);
    });
  } else {
    User.find(function(err, users) {
      if (err)
        res.send(err);

      res.json(users);
    });
  }

};
