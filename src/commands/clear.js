const { EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('clear')
    .setDescription('Delete a certain amount of messages')
    .addIntegerOption((option) => option.setName('amount').setDescription('The amount of messages to delete (1-100)').setMinValue(1).setMaxValue(100).setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator), // only the Server Moderator role can use this command

  async execute(interaction) {
    const amountToDelete = interaction.options.getInteger('amount');

    interaction.channel.bulkDelete(amountToDelete, true);

    const singularOrPlural = amountToDelete == 1 ? 'message' : 'messages';
    const amountDescription = `Successfully deleted ${amountToDelete} ${singularOrPlural}!`;

    const clearEmbed = new EmbedBuilder().setDescription(amountDescription).setColor(process.env.CONFIRM_COLOR);
    interaction.reply({ embeds: [clearEmbed], ephemeral: true });
  }
};
