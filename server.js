// =================================================================
// get the packages we need ========================================
// =================================================================
var express 	= require('express');
var app         = express();
var bodyParser  = require('body-parser');
var morgan      = require('morgan');
var mongoose    = require('mongoose');
var userController = require('./app/controllers/users');
var vehicleTypeController = require('./app/controllers/vehicleTypes');
var vehicleLocationController = require('./app/controllers/vehicleLocations');
var jwt    = require('jsonwebtoken'); // used to create, sign, and verify tokens
var config = require('./config'); // get our config file
var User   = require('./app/models/user'); // get our mongoose model

// =================================================================
// configuration ===================================================
// =================================================================
var port = process.env.PORT || 8080; // used to create, sign, and verify tokens
mongoose.connect(config.database); // connect to database
app.set('superSecret', config.secret); // secret variable

// use body parser so we can get info from POST and/or URL parameters
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// use morgan to log requests to the console
app.use(morgan('dev'));

// =================================================================
// routes ==========================================================
// =================================================================
// 
//apiRoutes.route()
app.post('/users/register',userController.registerUser);
app.get('/users/verify-phone/:phone/:otp',userController.verifyPhone);
app.get('/users/verify-email/:email/:evc',userController.verifyEmail);
app.get('/setup', function(req, res) {

	// create a sample user
	var nick = new User({ 
		username: 'magesh', 
		password: 'google',
		admin: true 
	});
	nick.save(function(err) {
		if (err) throw err;

		console.log('User saved successfully');
		res.json({ success: true });
	});
});

// basic route (http://localhost:8080)
app.get('/', function(req, res) {
	res.send('Hello! The API is at http://localhost:' + port + '/api/v1');
});

// ---------------------------------------------------------
// get an instance of the router for api routes
// ---------------------------------------------------------
var apiRoutes = express.Router(); 

// ---------------------------------------------------------
// authentication (no middleware necessary since this isnt authenticated)
// ---------------------------------------------------------
// http://localhost:8080/api/authenticate

apiRoutes.post('/authenticate', function(req, res) {

	// find the user
	User.findOne({
		name: req.body.name
	}, function(err, user) {

		if (err) throw err;

		if (!user) {
			res.json({ success: false, message: 'Authentication failed. User not found.' });
		} else if (user) {


		      // Make sure the password is correct
		      user.verifyPassword(req.body.password, function(err, isMatch) {
		        if (err) { return callback(err); }

		        // Password did not match
		        if (!isMatch) { return callback(null, false); }
		        console.log(user);
		        // Success
		        user2 = user.toObject();
		        //user2.toObject();
		        delete user2.password;
		        delete user2['password'];
		        delete user2[1];
		        console.log(typeof user2);

		        console.log(user2);
		        var token = jwt.sign(user, app.get('superSecret'), {
					expiresIn: "20000 days"// expires in 24 hours
				});

				res.json({
					success: true,
					message: 'Enjoy your token!',
					token: token
				});
		        //return callback(null, user);
		      });

		}

	});
});

// ---------------------------------------------------------
// route middleware to authenticate and check token
// ---------------------------------------------------------
apiRoutes.use(function(req, res, next) {

	// check header or url parameters or post parameters for token
	var token = req.body.token || req.query.token || req.headers['x-access-token'];

	// decode token
	if (token) {

		// verifies secret and checks exp
		jwt.verify(token, app.get('superSecret'), function(err, decoded) {			
			if (err) {
				return res.json({ success: false, message: 'Failed to authenticate token.' });		
			} else {
				// if everything is good, save to request for use in other routes
				req.decoded = decoded;	
				next();
			}
		});

	} else {

		// if there is no token
		// return an error
		return res.status(403).send({ 
			success: false, 
			message: 'No token provided.'
		});
		
	}
	
});

apiRoutes.route('/users')
.get(userController.getUsers);

// ---------------------------------------------------------
// authenticated routes
// ---------------------------------------------------------
//
apiRoutes.route('/vehicleLocation')
	.get(vehicleLocationController.getVehicleLocation)
	.post(vehicleLocationController.postVehicleLocation);
apiRoutes.route('/vehicleTypes')
	.get(vehicleTypeController.getVehicleTypes)
	.post(vehicleTypeController.postVehicleType);
apiRoutes.route('/vehicleTypes/:vehicleType_id')
	.get(vehicleTypeController.getVehicleType)
	.put(vehicleTypeController.putVehicleType)
	.delete(vehicleTypeController.deleteVehicleType);

apiRoutes.get('/', function(req, res) {
	res.json({ message: 'Welcome to the coolest API on earth!' });
});
/*
apiRoutes.get('/users', function(req, res) {
	User.find({}, function(err, users) {
		res.json(users);
	});
});
*/
apiRoutes.get('/check', function(req, res) {
	res.json(req.decoded);
});

app.use('/api/v1', apiRoutes);

// =================================================================
// start the server ================================================
// =================================================================
app.listen(port);
console.log('Magic happens at http://localhost:' + port);
