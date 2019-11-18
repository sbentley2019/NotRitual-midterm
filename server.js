// load .env data into process.env
require('dotenv').config();

// Imported Modules
const restaurants = require('./lib/database/restaurants');

// Web server config
const PORT       = process.env.PORT || 8080;
const ENV        = process.env.ENV || "development";
const express    = require("express");
const bodyParser = require("body-parser");
const sass       = require("node-sass-middleware");
const app        = express();
const morgan     = require('morgan');
const cookieSession = require('cookie-session');
const methodOverride = require('method-override');

// PG database client/connection setup
const { Pool } = require('pg');
const dbParams = require('./lib/database/db.js');
const db = new Pool(dbParams);
db.connect();

// Load the logger first so all (static) HTTP requests are logged to STDOUT
// 'dev' = Concise output colored by response status for development use.
//         The :status token will be colored red for server error codes, yellow for client error codes, cyan for redirection codes, and uncolored for all other codes.
app.use(morgan('dev'));

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/styles", sass({
  src: __dirname + "/styles",
  dest: __dirname + "/public/styles",
  debug: true,
  outputStyle: 'expanded'
}));

app.use(express.static("public"));


/* Session Manager */
app.use(cookieSession({
  name: 'session',
  keys: ['user_id'],
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

// Separated Routes for each Resource
// Note: Feel free to replace the example routes below with your own
const usersRoutes = require("./routes/users");
const apiRoutes = require('./routes/apiRoutes.js');


// Mount all resource routes
// Note: Feel free to replace the example routes below with your own
app.use("/api/users", usersRoutes(db));

// Note: mount other resources here, using the same pattern above

/* /api/endpoints/ */

app.use('/api', apiRoutes(db));

app.get('/', (req, res) => {
  res.status(200);
  restaurants.findAllRestaurants().then(restaurants => {
    let allRestaurants = restaurants;
    res.render('index', {title: 'Ritual', restaurants: allRestaurants});
  });
});

app.get("/restaurant", (req, res) => {
  res.render("restaurant");
});

// Home page
// Warning: avoid creating more routes in this file!
// Separate them into separate routes files (see above).


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
