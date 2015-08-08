/*

    testbot. whoa.

*/

// coffeescript is needed for the slack-client lib
var CoffeeScript = require('coffee-script');

// the offical slack client lib
var slack_client = require('slack-client');

// check for a config file when calling this script, we need it
if (process.argv.length < 3 || process.argv[2] == undefined) {
  console.log('testbot requires a config file passed to it, please see README.');
  process.exit(1);
}

// load bot config
console.log('requiring config in file: ' + process.argv[2]);
var config_file = './' + process.argv[2];
var config = require(config_file);

// primary bot config
var bot_name = config.bot_name;

// init new instance of the slack real time client
var slack = new slack_client(config.api_token);

slack.on('open', function() {
  console.log(bot_name + ' is online, listening...');
  connected = true;
});

slack.on('message', function(message) {

  // relevant:
  // message.type = message,

  if (message.type == 'message') {

    // relevant: message.text, message.channel, message.user, message.ts

    // store what kind of message this is
    var message_realtype = 'unknown';
    if (message.channel[0] == 'C') {
      message_realtype = 'channel';
    } else if (message.channel[0] == 'G') {
      message_realtype = 'group';
    } else if (message.channel[0] == 'D') {
      message_realtype = 'dm';
    }

    // if there is no user, then it's probably not something we need to worry about
    if (message.user == undefined) {
      return;
    }

    // get user info
    var user_from = slack.getUserByID(message.user);
    // console.log(user_from);
    //console.log(user_from);
    // user_from has .name and .id and more

    // fetch channel/group/dm object
    var where = slack.getChannelGroupOrDMByID(message.channel);
    // console.log(where);
    // where has .id and .name

        if (message_realtype != 'channel') {
            say('sorry, but i do not respond to direct messages or in private groups; you could be cheating!', where);
            return;
        }

    // send the incoming message off to be parsed + responded to
    parse_message(message, user_from, message_realtype);
  } else {
    console.log(message);
    return; // do nothing with other types of messages for now
  }
});

// add a trim() method for strings
String.prototype.trim = function() { return this.replace(/^\s\s*/, '').replace(/\s\s*$/, ''); };

// get a random integer between range
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// send a message to the specified channel/group/whatever
// "where" needs to be a channel/group/dm object
function say(with_what, where) {
  // first send typing indicator
  where.sendMessage({"type": "typing"});
  // ok now send the actual message in a little while
  // this fuzziness makes the bot seem almost human
  setTimeout(function() {
    where.sendMessage({'type': 'message', 'text': with_what, 'link_names': 1, 'parse': 'full'});
  }, getRandomInt(500, 1200));
}

// parse incoming message object, username, and message type
function parse_message(message_obj, user, message_type) {
  var username = user.name;

  var chatline = message_obj.text.trim();
  // fetch channel/group/dm object
  var where = slack.getChannelGroupOrDMByID(message_obj.channel);
  // console.log(where);
  // where has .id and .name, if needed

    if (/^.+$/i.test(chatline)) {
    console.log('new chat: ' + chatline);
  }

}

// actually log in and connect!
slack.login();
