import { ColorResolvable, EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import { SlashCommand } from '../lib/types';
import sendErrorEmbed from '../lib/sendErrorEmbed';

const dmCommand: SlashCommand = {
  command: new SlashCommandBuilder()
    .setName('dm')
    .setDescription('DM a message to a user')
    .addUserOption((option) => option.setName('user').setDescription('The user to message').setRequired(true))
    .addStringOption((option) => option.setName('message').setDescription('What the bot should send').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator), // only the Server Moderator role can use this command

  async execute(interaction) {
    const targetUser = interaction.options.getUser('user');
    const messageToSend = interaction.options.getString('message');
    if (!targetUser || !messageToSend) return console.log('User or Message not found');

    try {
      const dmChannel = await targetUser.createDM();
      await dmChannel.sendTyping();
      dmChannel.send(messageToSend);
    } catch (err) {
      console.error(err);
      return sendErrorEmbed(interaction, err);
    }

    const sentEmbed = new EmbedBuilder().setDescription(`Sent **"${messageToSend}"** to ${targetUser}`).setColor(process.env.CONFIRM_COLOR as ColorResolvable);

    await interaction.reply({ embeds: [sentEmbed] });
  }
};

export default dmCommand;
