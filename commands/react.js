const { EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder, ChannelType } = require('discord.js');
const sendErrorEmbed = require('../utils/sendErrorEmbed');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('react')
    .setDescription('React to the newest message in a channel')
    .addChannelOption((option) => option.setName('channel').setDescription('The name of the channel').addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement).setRequired(true))
    .addStringOption((option) => option.setName('emoji').setDescription('The emoji to react with').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator), // only the Server Moderator role can use this command

  async execute(interaction) {
    try {
      const channel = interaction.options.getChannel('channel');
      const emoji = interaction.options.getString('emoji');

      channel.lastMessage.react(emoji);

      const confirmEmbed = new EmbedBuilder().setDescription(`Reacted to ${channel.lastMessage} with ${emoji}`).setColor(process.env.CONFIRM_COLOR);

      interaction.reply({ embeds: [confirmEmbed], ephemeral: true });
    } catch (err) {
      sendErrorEmbed(interaction, err);
    }
  }
};
