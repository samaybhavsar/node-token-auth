// Load required packages
var VehicleLocation = require('../models/vehicleLocation');

exports.postVehicleLocation = function(req, res) {

  var vehicleLocation = new VehicleLocation();
  var vData = new Array();
  for(i=0;i<req.body.data.length;i++) {
      var jsonData = {};
      jsonData['vehiclenumber'] = req.body.data[i].vehiclenumber;
      jsonData['trackerid'] = req.body.data[i].trackerid;
      jsonData['loc'] = [req.body.data[i].latitude, req.body.data[i].longitude]
      jsonData['speed'] = req.body.data[i].speed;
      jsonData['kms'] = req.body.data[i].kms;
      var str = req.body.data[i].packetdatetime;
      var packetdatetime = new Date(str.substring(0, 4)+'-'+str.substring(4, 6)+'-'+str.substring(6, 8)+'T'+str.substring(8, 10)+':'+str.substring(10, 12)+':'+str.substring(12, 14));
      jsonData['packetdatetime'] = packetdatetime;
      jsonData['ignition'] = req.body.data[i].ignition;
      vData.push(jsonData);
  }
  vehicleLocation.collection.insert(vData,function(err) {
    if (err)
      res.send(err);
    res.json({ status: 1, message: 'Vehicle Location added to the database!' });
  });
};


exports.getVehicleLocation = function(req, res) {
  VehicleLocation.findById(req.params.vehicleLocation_id, function(err, vehicleLocation) {
    if (err)
      res.send(err);

    res.json(vehicleLocation);
  });
};

