/*

    testbot. whoa.

*/

// the offical slack client lib
var slack_client = require('slack-client');
var Message = require('./node_modules/slack-client/src/message');

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

// init new instance of the slack real time client
// second param is autoReconnect, which seems to be broken, so setting to FALSE
var slack = new slack_client(config.api_token, false, false);

slack.on('open', function() {
	console.log(bot_name + ' is online, listening...');
	connected = true;
});

slack.on('error', function(err) {
	console.error('there was an error with slack: ');
	console.error(err);
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
		if (message.user === undefined) {
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

// intentionally crashing on websocket close
slack.on('close', function() {
	console.error('websocket closed for some reason, crashing!');
	process.exit(1);
});

// add a trim() method for strings
String.prototype.trim = function() { return this.replace(/^\s\s*/, '').replace(/\s\s*$/, ''); };

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
// "where" needs to be a channel/group/dm object
function say(with_what, where) {
	if (with_what === undefined || where === undefined) {
		console.error('uhhh dunno what to say or where');
		return;
	}
	// first send typing indicator
	var typing_indicator = new Message(slack, {
		'type': 'typing'
	});
	where.sendMessage(typing_indicator);
	// ok now send the actual message in a little while
	// this fuzziness makes the bot seem almost human
	setTimeout(function() {
		var the_message = new Message(slack, {
			'type': 'message',
			'text': with_what,
			'link_names': 1,
			'parse': 'full'
		});
		where.sendMessage(the_message);
	}, getRandomInt(500, 1200));
}

// send an attachment to the specified channel/group/whatever
// "where" needs to be a channel/group/dm object
function attach(with_what, where) {
	if (with_what === undefined || where === undefined) {
		console.error('uhhh dunno what to say or where');
		return;
	}
	// first send typing indicator
	var typing_indicator = new Message(slack, {
		'type': 'typing'
	});
	where.sendMessage(typing_indicator);
	// ok now send the actual message in a little while
	// this fuzziness makes the bot seem almost human
	setTimeout(function() {
		// there are a lot of options here, i've filled out a bunch
		// figure out how you want to use the with_what variable from the function call
		// documentation: https://api.slack.com/docs/attachments
		var attachments = [
			{
				"fallback": "Required plain-text summary of the attachment.",
				"pretext": "Optional text that appears above the attachment block",
				"title": "An optional title for your attachment thing",
				"title_link": "http://whatever.com/lol/",
				"color": "#00ff00",
				"text": "The actual attachment text here, *bold* _italics_ `code`",
				"mrkdwn_in": ["text"]
			}
		];
		var params = {
			"type": "message",
			"channel": where.id,
			"as_user": true,
			"parse": "full",
			"attachments": JSON.stringify(attachments)
		};
		slack._apiCall('chat.postMessage', params, function(wat) {
			if (wat.ok === false) {
				console.error(wat);
			}
		});
	}, getRandomInt(500, 900));
}

// parse incoming message object, username, and message type
function parse_message(message_obj, user, message_type) {
	var username = user.name;

	// don't watch your own messages, stupid bot
	if (username === bot_name) {
		return;
	}

	var chatline = message_obj.text.trim();
	// fetch channel/group/dm object
	var where = slack.getChannelGroupOrDMByID(message_obj.channel);
	//console.log(where);
	// where has .id and .name, if needed

    if (/^.+$/i.test(chatline)) {
		//console.log('new chat: ' + chatline);
		// say something in the same channel that this came from:
		say(username + ' said: ' + chatline, where);
	}

	// use an attachment, see function above
	//attach('lol', where);

}

// actually log in and connect!
slack.login();