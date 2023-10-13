const { EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('slowmode')
    .setDescription('Enable slowmode in a channel')
    .addChannelOption((option) => option.setName('channel').setDescription('The channel to enable slowmode in').setRequired(true))
    .addIntegerOption((option) => option.setName('seconds').setDescription('The interval of seconds').setMinValue(0).setMaxValue(3600).setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator), // only the Server Moderator role can use this command

  async execute(interaction) {
    const targetChannel = interaction.options.getChannel('channel');
    const seconds = interaction.options.getInteger('seconds');

    targetChannel.setRateLimitPerUser(seconds);

    const slowmodeEmbed = new EmbedBuilder().setDescription(`Enabled slowmode in ${targetChannel} for ${seconds} seconds`).setColor(process.env.CONFIRM_COLOR);

    interaction.reply({ embeds: [slowmodeEmbed], ephemeral: true });
  }
};
