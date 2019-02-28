// CLI here

// Dependencies
var path = require('path');
var fs = require('fs');
var readline = require('readline');
var util = require('util');
var debug = util.debuglog('cli');
var events = require('events');

var _data = require('./data');

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

e.on('list users',function(str){
  cli.responders.listUsers();
});

e.on('more user info',function(str){
  cli.responders.moreUserInfo(str);
});

e.on('list new users', function(str){
  cli.responders.listNewUsers();
});

e.on('list orders',function(str){
  cli.responders.listOrders(str);
});

e.on('more order info',function(str){
  cli.responders.moreOrderInfo(str);
});

e.on('list new orders',function(str){
  cli.responders.listNewOrders(str);
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
     'list new users' : 'Show a list of all the registered ( undeleted ) users in the system for the last 24 hrs',
     'more user info --{email}' : 'Show details of a specified user',
     'list orders --optionalFlag' : 'Show a list of all the active orders in the system, including their status, optionalFlag is "accepted", "updated" or "payed/ check mail"',
     'list new orders' : 'Show a list of all the registered ( undeleted ) orders in the system for the last 24 hrs',
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

// List Users
cli.responders.listUsers = function(){
  _data.list('users',function(err,userIds){
    if(!err && userIds && userIds.length > 0){
      cli.verticalSpace();
      userIds.forEach(function(userId){
        _data.read('users',userId.replace('.json',''),function(err,userData){
          if(!err && userData){
            var line = 'Name: '+userData.name+' '+' Email: '+userData.email+' Address: '+userData.address+' Orders: ';
            var numberOfOrders = typeof(userData.orders) == 'object' && userData.orders instanceof Array && userData.orders.length > 0 ? userData.orders.length : 0;
            line+=numberOfOrders;
            console.log(line);
            cli.verticalSpace();
          }
        });
      });
    }
  });
};

// More user info
cli.responders.moreUserInfo = function(str){
  // Get ID from string
  var arr = str.split('--');
  var userId = typeof(arr[1]) == 'string' && arr[1].trim().length > 0 ? arr[1].trim() : false;
  if(userId){
    // Lookup the user
    _data.read('users',userId,function(err,userData){
      if(!err && userData){
        // Remove the hashed password
        delete userData.hashedPassword;

        // Print their JSON object with text highlighting
        cli.verticalSpace();
        console.dir(userData,{'colors' : true});
        cli.verticalSpace();
      }
    });
  }

};

// List new Users ( Signed Up in the last 24 hrs )
cli.responders.listNewUsers = function(){
  _data.list('users',function(err,userIds){
    if(!err && userIds && userIds.length > 0){
      cli.verticalSpace();
      var now = Date.now();
      var userFilePath = path.join(__dirname,'./.data/users/');
      userIds.forEach(function(userId){
        var userFileCreated = fs.statSync(userFilePath+userId).birthtimeMs;

        if(now-userFileCreated<24*60*60*1000){ // if created within 24 hrs
          var line = 'User Email: '+userId+' Signed Up: '+((now-userFileCreated)/1000/60/60).toFixed(1)+' hours ago';
          console.log(line);
          cli.verticalSpace();
        }
      });
    }
  });
};

// List Orders
cli.responders.listOrders = function(str){
  _data.list('orders',function(err,orderIds){
    if(!err && orderIds && orderIds.length > 0){
      cli.verticalSpace();
      orderIds.forEach(function(orderId){
        _data.read('orders',orderId.replace('.json',''),function(err,orderData){
          if(!err && orderData){
            var loweredString = str.toLowerCase();
            var userStatus = loweredString.length>11 ? loweredString.slice(14) : 'undefined';
            if(loweredString.length === 11 || (orderData.status===userStatus)){
              var line = 'ID: '+orderData.id+' '+' Status: '+ orderData.status;
              console.log(line);
              cli.verticalSpace();
            }
          }
        });
      });
    }
  });
};

// More order info
cli.responders.moreOrderInfo = function(str){
  // Get ID from string
  var arr = str.split('--');
  var orderId = typeof(arr[1]) == 'string' && arr[1].trim().length > 0 ? arr[1].trim() : false;
  if(orderId){
    // Lookup the user
    _data.read('orders',orderId,function(err,orderData){
      if(!err && orderData){

        // Print their JSON object with text highlighting
        cli.verticalSpace();
        console.dir(orderData,{'colors' : true});
        cli.verticalSpace();
      }
    });
  }
};

// List new Orders ( registered in the last 24 hrs )
cli.responders.listNewOrders = function(){
  _data.list('orders',function(err,orderIds){
    if(!err && orderIds && orderIds.length > 0){
      cli.verticalSpace();
      var now = Date.now();
      var orderFilePath = path.join(__dirname,'./.data/orders/');
      orderIds.forEach(function(orderId){
        var orderFileCreated = fs.statSync(orderFilePath+orderId).birthtimeMs;

        if(now-orderFileCreated<24*60*60*1000){ // if created within 24 hrs
          var line = 'OrderID: '+orderId+' created: '+((now-orderFileCreated)/1000/60/60).toFixed(1)+' hours ago';
          console.log(line);
          cli.verticalSpace();
        }
      });
    }
  });
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
      'list new users',
      'list orders',
      'more order info',
      'list new orders',
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