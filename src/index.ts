import { readdirSync } from 'fs';
import { Client, Collection, Partials, GatewayIntentBits } from 'discord.js';
import { DisTube } from 'distube';
import { SpotifyPlugin } from '@distube/spotify';
import { SoundCloudPlugin } from '@distube/soundcloud';
import mongoDB from './lib/mongoDB';
import firebase from './lib/firebase';

require('dotenv').config();

// Discord
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildModeration,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.DirectMessages
  ],
  partials: [Partials.Channel]
});

client.slashCommands = new Collection();
const commandFiles = readdirSync('./commands').filter((file) => file.endsWith('.ts')); // Command handler
for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  // set a new item in the Collection
  // with the key as the command name and the value as the exported module
  client.commands.set(command.data.name, command);
}

const eventFiles = readdirSync('./events').filter((file) => file.endsWith('.ts')); // Event handler
for (const file of eventFiles) {
  const event = require(`./events/${file}`);
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args));
  } else {
    client.on(event.name, (...args) => event.execute(...args));
  }
}

// DisTube - music bot

client.musicPlayer = new DisTube(client, {
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
        clientSecret: process.env.SPOTIFY_CLIENT_SECRET
      }
    }),
    new SoundCloudPlugin()
  ]
});

const musicCommandFiles = readdirSync('./musicCommands').filter((file) => file.endsWith('.js')); // Command handler
for (const file of musicCommandFiles) {
  const musicCommand = require(`./musicCommands/${file}`);
  client.commands.set(musicCommand.data.name, musicCommand); // the commands Collection was initialized before the regular commands
}

const musicEventFiles = readdirSync('./musicEvents').filter((file) => file.endsWith('.js')); // Event handler
for (const file of musicEventFiles) {
  const musicEvent = require(`./musicEvents/${file}`);
  if (musicEvent.once) {
    client.musicPlayer.once(musicEvent.name, (...args: any) => musicEvent.execute(...args));
  } else {
    client.musicPlayer.on(musicEvent.name, (...args: any) => musicEvent.execute(...args));
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
mongoDB.execute(client);

// Firebase
firebase.execute(client);
