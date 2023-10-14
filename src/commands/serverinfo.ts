import { ColorResolvable, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { SlashCommand } from '../lib/types';

const serverInfoCommand: SlashCommand = {
  command: new SlashCommandBuilder().setName('serverinfo').setDescription(`Get basic info about this server`),

  async execute(interaction) {
    const owner = interaction.guild?.members.cache.get(interaction.guild?.ownerId);

    const serverInfo = new EmbedBuilder()
      .setTitle(`***${interaction.guild ?? 'Guild'}*** Server Information`)
      .setDescription(interaction.guild?.description ?? 'Server Description')
      .setThumbnail(interaction.guild?.iconURL() ?? 'Server Icon')
      .setColor('f03200' as ColorResolvable)
      .addFields([
        { name: 'Owner', value: `${owner}` },
        { name: 'Date Created', value: interaction.guild?.createdAt.toDateString() ?? new Date().toDateString() },
        { name: 'Member Count', value: `${interaction.guild?.memberCount ?? 0}` },
        { name: 'Server Level', value: `${interaction.guild?.premiumTier ?? 0}` }, // remove 'TIER_' from 'TIER_#'
        { name: 'Server Boosts', value: `${interaction.guild?.premiumSubscriptionCount ?? 0}` }
      ]);

    return interaction.reply({ embeds: [serverInfo] });
  }
};

export default serverInfoCommand;
