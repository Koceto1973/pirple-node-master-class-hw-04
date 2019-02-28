// Primary file for API

// Dependencies
var server = require('./server/server');
var cli = require('./server/cli');

// Declare the app
var app = {};

// Init function
app.init = function(){

  // Start the server
  server.init();

  // Start the CLI, but make sure it starts last
  setTimeout(function(){
    cli.init();
  },50);

};

// Self executing
app.init();
