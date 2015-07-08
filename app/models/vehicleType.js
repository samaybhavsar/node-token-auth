// Load required packages
var mongoose = require('mongoose');

// Define our beer schema
var VehicleTypeSchema   = new mongoose.Schema({
  name: String
});

// Export the Mongoose model
module.exports = mongoose.model('VehicleType', VehicleTypeSchema);