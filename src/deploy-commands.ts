import { readdirSync } from 'fs';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';

const commands = [];

const commandFiles = readdirSync('./commands').filter((file) => file.endsWith('.ts'));
for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  commands.push(command.data.toJSON());
}

const musicCommandFiles = readdirSync('./musicCommands').filter((file) => file.endsWith('.ts'));
for (const file of musicCommandFiles) {
  const musicCommand = require(`./musicCommands/${file}`);
  commands.push(musicCommand.data.toJSON());
}

const rest = new REST({ version: '9' }).setToken(process.env.DISCORD_TOKEN!);

(async () => {
  try {
    console.log('Started refreshing application (/) commands.');

    await rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID!, process.env.GUILD_ID!), { body: commands });

    console.log('Successfully registered application (/) commands.');
  } catch (error) {
    console.error(error);
  }
})();
