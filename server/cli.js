// CLI here

// Dependencies
var readline = require('readline');
var util = require('util');
var debug = util.debuglog('cli');
var events = require('events');

class _events extends events{};
var e = new _events();

// Instantiate the cli module object
var cli = {};

// Input listeners
e.on('man',function(str){
  cli.responders.help();
});

e.on('help',function(str){
  cli.responders.help();
});

e.on('exit',function(str){
  cli.responders.exit();
});

// Responders object
cli.responders = {};
 
// Help / Man
cli.responders.help = function(){
 
   // Codify the commands and their explanations
   var commands = {
     'exit' : 'Kill the CLI (and the rest of the application)',
     'man' : 'Show this help page',
     'help' : 'Alias of the "man" command',
     'stats' : 'Get statistics on the underlying operating system and resource utilization',
     'list users' : 'Show a list of all the registered (undeleted) users in the system',
     'more user info --{userId}' : 'Show details of a specified user',
     'list orders --up --down' : 'Show a list of all the active checks in the system, including their state. The "--up" and "--down flags are both optional."',
     'more order info --{checkId}' : 'Show details of a specified check',
     'menu' : 'Show available menu'
   };
 
   // Show a header for the help page that is as wide as the screen
   cli.horizontalLine();
   cli.centered('CLI MANUAL');
   cli.horizontalLine();
   cli.verticalSpace(2);
 
   // Show each command, followed by its explanation, in white and yellow respectively
   for(var key in commands){
      if(commands.hasOwnProperty(key)){
         var value = commands[key];
         var line = '      \x1b[33m '+key+'      \x1b[0m';
         var padding = 60 - line.length;
         for (i = 0; i < padding; i++) {
             line+=' ';
         }
         line+=value;
         console.log(line);
         cli.verticalSpace();
      }
   }
   cli.verticalSpace(1);
 
   // End with another horizontal line
   cli.horizontalLine();
 
};

// Exit
cli.responders.exit = function(){
  process.exit(0);
};

// Aux functions

// Create a vertical space
cli.verticalSpace = function(lines){
  lines = typeof(lines) == 'number' && lines > 0 ? lines : 1;
  for (i = 0; i < lines; i++) {
      console.log('');
  }
};

// Create a horizontal line across the screen
cli.horizontalLine = function(){

  // Get the available screen size
  var width = process.stdout.columns;

  // Put in enough dashes to go across the screen
  var line = '';
  for (i = 0; i < width; i++) {
      line+='-';
  }
  console.log(line);


};

// Create centered text on the screen
cli.centered = function(str){
  str = typeof(str) == 'string' && str.trim().length > 0 ? str.trim() : '';

  // Get the available screen size
  var width = process.stdout.columns;

  // Calculate the left padding there should be
  var leftPadding = Math.floor((width - str.length) / 2);

  // Put in left padded spaces before the string itself
  var line = '';
  for (i = 0; i < leftPadding; i++) {
      line+=' ';
  }
  line+= str;
  console.log(line);
};

////////////////////////////////////////

// Input processor
cli.processInput = function(str){
  str = typeof(str) == 'string' && str.trim().length > 0 ? str.trim() : false;
  // Only process the input if the user actually wrote something, otherwise ignore it
  if(str){
    // Codify the unique strings that identify the different unique questions allowed be the asked
    var uniqueInputs = [
      'man',
      'help',
      'exit',
      'stats',
      'list users',
      'more user info',
      'list checks',
      'more check info',
      'menu'
    ];

    // Go through the possible inputs, emit event when a match is found
    var matchFound = false;
    uniqueInputs.some(function(input){
      if(str.toLowerCase().startsWith(input)){
        matchFound = true;
        // Emit event matching the unique input, and include the full string given
        e.emit(input,str);
        return true;
      }
    });

    // If no match is found, tell the user to try again
    if(!matchFound){
      // console.log("Sorry, try again");
      e.emit('man',str);
    }

  }
};

// Init script
cli.init = function(){
 
  // Send to console, in dark blue
  console.log('\x1b[34m%s\x1b[0m','The CLI is running');

  // Start the interface
  var _interface = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: '>>'
  });

  // Create an initial prompt
  _interface.prompt();

  // Handle each line of input separately
  _interface.on('line', function(str){

    // Send to the input processor
    cli.processInput(str);

    // Re-initialize the prompt afterwards
    _interface.prompt();
  });

  // If the user stops the CLI, kill the associated process
  _interface.on('close', function(){
    process.exit(0);
  });

};

// Export the module
module.exports = cli;