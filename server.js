const
    express = require('express'),
    path = require('path')

const
    app = express(),
    server = require('http').Server(app)
	
	
// set the port of our application
// process.env.PORT lets the port be set by Heroku
const port = process.env.PORT || 8080;


// make express look in the public directory for assets (css/js/img)
app.use(express.static('./'))

// set the view engine to ejs
app.set('view engine', 'ejs');

// set the home page route
app.get('/', function(req, res) {
    // ejs render automatically looks in the views folder
    res.render('index');
});

// database
const db = require('./db')

require('./sockets')(server, db)


server.listen(port)
