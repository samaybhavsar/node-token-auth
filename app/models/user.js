// get an instance of mongoose and mongoose.Schema
var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

// Define our user schema
var UserSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: true,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  first_name: {
    type: String
  },
  last_name: {
    type: String
  },
  country_code: {
    type: String
  },
  phone: {
    type: String
  },
  is_phone_verified: {
    type: Number
  },
  email: {
    type: String
  },
  is_email_verified: {
    type: Number
  },
  otp: Number,
  evc: String
});

// Execute before each user.save() call
UserSchema.pre('save', function(callback) {
  var user = this;

  // Break out if the password hasn't changed
  if (!user.isModified('password')) return callback();

  // Password changed so we need to hash it
  bcrypt.genSalt(5, function(err, salt) {
    if (err) return callback(err);

    bcrypt.hash(user.password, salt, null, function(err, hash) {
      if (err) return callback(err);
      user.password = hash;
      callback();
    });
  });
});

UserSchema.methods.verifyPassword = function(password, cb) {
    console.log('password:'+password+'-'+this.password);
    bcrypt.compare(password, this.password, function(err, isMatch) {
      if (err) return cb(err);
      cb(null, isMatch);
    });
};

// Export the Mongoose model
module.exports = mongoose.model('User', UserSchema);
