import { EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder, ChannelType, TextChannel, ColorResolvable } from 'discord.js';
import { SlashCommand } from '../lib/types';

const sayCommand: SlashCommand = {
  command: new SlashCommandBuilder()
    .setName('say')
    .setDescription('Make the bot say something')
    .addChannelOption((option) =>
      option.setName('channel').setDescription('The channel the message should be sent in').addChannelTypes(ChannelType.GuildAnnouncement, ChannelType.GuildText).setRequired(true)
    )
    .addStringOption((option) => option.setName('message').setDescription('What the bot should say').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator), // only the Server Moderator role can use this command

  async execute(interaction) {
    const targetChannel = <TextChannel>interaction.options.getChannel('channel');
    const messageToSend = interaction.options.getString('message');
    if (!targetChannel || !messageToSend) return console.log('Channel or Message not found');

    targetChannel.send(messageToSend);

    const sentEmbed = new EmbedBuilder().setDescription(`Said **"${messageToSend}"** in ${targetChannel}`).setColor(process.env.CONFIRM_COLOR as ColorResolvable);

    interaction.reply({ embeds: [sentEmbed] });
  }
};

export default sayCommand;
