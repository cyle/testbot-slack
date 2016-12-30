/*

    a testbot for slack

*/

var RtmClient = require('@slack/client').RtmClient;
var MemoryDataStore = require('@slack/client').MemoryDataStore;
var CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS;
var RTM_EVENTS = require('@slack/client').RTM_EVENTS;

// check for a config file when calling this script, we need it
if (process.argv.length < 3 || process.argv[2] === undefined) {
	console.log('testbot requires a config file passed to it, please see README.');
	process.exit(1);
}

// load bot config
console.log('requiring config in file: ' + process.argv[2]);
var config = require(process.argv[2]);

// primary bot config
var bot_name = config.bot_name;
var bot_token = config.api_token;

// get a random integer between range
function getRandomInt(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

// add a unicode blank space to a string
// useful for using names in messages without triggering, i.e. add_zerowidth(username)
function add_zerowidth(wat) {
	return wat.substring(0, 1) + '\u200B' + wat.substring(1);
}

// send a message to the specified channel/group/whatever
// "what" should be your string of text to send
// "where" needs to be a channel/group/dm object
function say(what, where) {
	if (what === undefined || where === undefined) {
		console.error('uhhh dunno what to say or where');
		return;
	}
	// first send typing indicator
	rtm.sendTyping(where);
	// ok now send the actual message in a little while
	// this fuzziness makes the bot seem almost human
	setTimeout(function() {
		rtm.sendMessage(what, where);
	}, getRandomInt(500, 1200));
}

// parse incoming message object, username, and message type
function parse_message(message_obj) {
	var username = rtm.dataStore.getUserById(message_obj.user).name;

	// don't watch your own messages, stupid bot
	if (username === bot_name) {
		return;
	}

    var where = message_obj.channel;
    var channel_name = rtm.dataStore.getChannelGroupOrDMById(where).name;
	var chatline = message_obj.text.trim();

    if (/^.+$/i.test(chatline)) {
		//console.log('new chat: ' + chatline);
		// say something in the same channel that this came from:
		say(add_zerowidth(username) + ' said: ' + chatline, where);
	}
}

// make a new slack rtm client
var rtm = new RtmClient(bot_token, {
    logLevel: 'error', // check this out for more on logger: https://github.com/winstonjs/winston
    dataStore: new MemoryDataStore() // pass a new MemoryDataStore instance to cache information
});

// The client will emit an RTM.AUTHENTICATED event on successful connection
rtm.on(CLIENT_EVENTS.RTM.AUTHENTICATED, function(rtmStartData) {
    console.log('logged in as %s to team %s', rtmStartData.self.name, rtmStartData.team.name);
});

// you need to wait for the client to fully connect before you can send messages
rtm.on(CLIENT_EVENTS.RTM.RTM_CONNECTION_OPENED, function() {
    console.log('connected!');
});

// handle incoming message events
rtm.on(RTM_EVENTS.MESSAGE, function handleRtmMessage(message) {
    parse_message(message);
});

// kick everything off
rtm.start();
