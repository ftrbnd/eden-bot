import { ColorResolvable, EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder, TextChannel } from 'discord.js';
import { SlashCommand } from '../lib/types';

const clearCommand: SlashCommand = {
  command: new SlashCommandBuilder()
    .setName('clear')
    .setDescription('Delete a certain amount of messages')
    .addIntegerOption((option) => option.setName('amount').setDescription('The amount of messages to delete (1-100)').setMinValue(1).setMaxValue(100).setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator), // only the Server Moderator role can use this command

  async execute(interaction) {
    const amountToDelete = interaction.options.getInteger('amount');
    if (!amountToDelete) return console.log('Amount not found');
    const channel = <TextChannel>interaction.channel;

    await channel.bulkDelete(amountToDelete, true);

    const singularOrPlural = amountToDelete == 1 ? 'message' : 'messages';
    const amountDescription = `Successfully deleted ${amountToDelete} ${singularOrPlural}!`;

    const clearEmbed = new EmbedBuilder().setDescription(amountDescription).setColor(process.env.CONFIRM_COLOR as ColorResolvable);
    await interaction.reply({ embeds: [clearEmbed], ephemeral: true });
  }
};

export default clearCommand;
