// Load required packages
var mongoose = require('mongoose');

var VehicleLocationSchema   = new mongoose.Schema({
  vehiclenumber: String,
  trackerid: String,
  loc: [Number],
    //   {
    // type: String,
    // coordinates: [Number],  // [<longitude>, <latitude>]
    // index: '2d'      // create the geospatial index
    // },
  speed: String,
  kms: String,
  packetdatetime: Date,
  ignition: Number,
});

// Export the Mongoose model
module.exports = mongoose.model('VehicleLocation', VehicleLocationSchema);