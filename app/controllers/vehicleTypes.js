// Load required packages
var VehicleType = require('../models/vehicleType');

exports.postVehicleType = function(req, res) {
  var vehicleType = new VehicleType();

  vehicleType.name = req.body.name;

  vehicleType.save(function(err) {
    if (err)
      res.send(err);

    res.json({ message: 'Vehicle Type added to the database!', data: vehicleType });
  });
};

exports.getVehicleTypes = function(req, res) {
  VehicleType.find(function(err, vehicleTypes) {
    if (err)
      res.send(err);

    res.json(vehicleTypes);
  });
};

exports.getVehicleType = function(req, res) {
  VehicleType.findById(req.params.vehicleType_id, function(err, vehicleType) {
    if (err)
      res.send(err);

    res.json(vehicleType);
  });
};

exports.putVehicleType = function(req, res) {
  VehicleType.findById(req.params.vehicleType_id, function(err, vehicleType) {
    if (err)
      res.send(err);

    vehicleType.name = req.body.name;

    vehicleType.save(function(err) {
      if (err)
        res.send(err);

      res.json(vehicleType);
    });
  });
};

exports.deleteVehicleType = function(req, res) {
  VehicleType.findByIdAndRemove(req.params.vehicleType_id, function(err) {
    if (err)
      res.send(err);

    res.json({ message: 'vehicleType removed from the database!' });
  });
};
