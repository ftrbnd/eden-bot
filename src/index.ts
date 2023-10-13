require('dotenv').config();
const fs = require('fs');

// Discord
const { Client, Collection, Partials, GatewayIntentBits} = require('discord.js');
const client = new Client({ 
    intents: [GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildModeration,
        GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates, GatewayIntentBits.DirectMessages],
    partials: [Partials.Channel]
});

client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));  // Command handler
for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	// set a new item in the Collection
	// with the key as the command name and the value as the exported module
	client.commands.set(command.data.name, command);
}

const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js')); // Event handler
for(const file of eventFiles) {
	const event = require(`./events/${file}`);
	if(event.once) {
        client.once(event.name, (...args) => event.execute(...args));
	} else {
        client.on(event.name, (...args) => event.execute(...args));
	}
}

// DisTube - music bot
const { DisTube } = require('distube');
const { SpotifyPlugin } = require('@distube/spotify');
const { SoundCloudPlugin } = require('@distube/soundcloud');
client.DisTube = new DisTube(client, {
    leaveOnStop: false,
    leaveOnEmpty: true,
    emptyCooldown: 1,
    emitNewSongOnly: true,
    emitAddSongWhenCreatingQueue: false,
    emitAddListWhenCreatingQueue: true,
    plugins: [
        new SpotifyPlugin({
            api: {
                clientId: process.env.SPOTIFY_CLIENT_ID,
                clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
            },
        }),
        new SoundCloudPlugin(),
    ],
});

const musicCommandFiles = fs.readdirSync('./musicCommands').filter(file => file.endsWith('.js'));  // Command handler
for (const file of musicCommandFiles) {
	const musicCommand = require(`./musicCommands/${file}`);
	client.commands.set(musicCommand.data.name, musicCommand); // the commands Collection was initialized before the regular commands
}

const musicEventFiles = fs.readdirSync('./musicEvents').filter(file => file.endsWith('.js')); // Event handler
for(const file of musicEventFiles) {
	const musicEvent = require(`./musicEvents/${file}`);
    if(musicEvent.once) {
        client.DisTube.once(musicEvent.name, (...args) => musicEvent.execute(...args));
    } else {
        client.DisTube.on(musicEvent.name, (...args) => musicEvent.execute(...args));
    }
}

client.login(process.env.DISCORD_TOKEN);

// Twitter
// const twitter = require('./modules/twitter');
// twitter.execute(client);

// Reddit
// const reddit = require('./modules/reddit');
// reddit.execute(client);

// Mongo DB
const mongoDB = require('./modules/mongoDB');
mongoDB.execute(client);

// Firebase
const firebase = require('./modules/firebase');
firebase.execute(client);