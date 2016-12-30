# TESTBOT for Slack

## Installation

### Bot API Key

You need an API key for your bot.

Go to your Slack instance, go to Integrations, then Bot integrations, and make a new one.

Grab that API key. Copy it for use in the bot's config file in the next section.

### Install + Config

Clone this repo, make sure you have `node` and `npm` installed!

Edit the `package.json` with your name.

Rename `config.sample.js` to `config.js` and edit it with your own config (your API key and the bot's name).

### Manually...

Go to the directory where you cloned this bot. [Make sure you have `node` 7.x installed.](nodejs.org)

Run `npm install` to install dependencies.

Run `node /path/to/bot.js /path/to/config.js` to get it running. Even if your config file is in the same directory as the bot, you still have to specify the relative path, i.e. `node bot.js ./config.js`.

### ... or with Docker

You can also use this with Docker! Update the `Dockerfile` with your email address.

    docker build -t your-name/testbot .
    docker run -d your-name/testbot

Nice.

## Usage

Invite testbot to your channel! It'll be in your default `#general` channel by default.

Right now the testbot just echos things whenever anybody talks. Yaaaay! It's a start.

Add more responses and whatnot by editing the `parse_message()` function.
