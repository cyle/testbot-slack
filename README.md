# TESTBOT for Slack

## Installation

### Bot API Key

You need an API key for your bot.

Go to your Slack instance, go to Integrations, then Bot integrations, and make a new one.

Grab that API key. Save it for the config file in a second.

### Manually...

Clone this repo, make sure you have `node` and `npm` installed!

Edit the `package.json` with your name.

Run `npm install` to install dependencies.

Rename `config.sample.js` to `config.js` and edit it with your own config.

Run `node /path/to/bot.js /path/to/config.js` to get it running.

Invite testbot to your channel!

### ... or with Docker

You can also use this with Docker! Update the `Dockerfile` with your email address.

    docker build -t your-name/testbot .
    docker run -d your-name/testbot

Nice.

## Usage

The testbot will respond with whatever the message following the bot trigger along with the user and the channel. For example, if you set the trigger as `.test`, a message of `.test yo` will respond with "[user] said 'yo' in [channel]".

![Imgur](http://i.imgur.com/O0ESEpz.png)
