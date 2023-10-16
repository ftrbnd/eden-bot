import { ColorResolvable, EmbedBuilder, GuildMember, SlashCommandBuilder } from 'discord.js';
import { SlashCommand } from '../lib/types';

const leaveCommand: SlashCommand = {
  command: new SlashCommandBuilder().setName('leave').setDescription('Leave your voice channel'),

  async execute(interaction) {
    try {
      const member = <GuildMember>interaction.member;

      const getAllowedRoleId = require('../helperFunctions/getAllowedRoleId');
      const allowedRoleId = await getAllowedRoleId.execute(interaction);
      if (!member?.roles.cache.has(allowedRoleId) && allowedRoleId != interaction.guild?.roles.everyone.id) {
        const errEmbed = new EmbedBuilder().setDescription(`You do not have permission to use music commands right now!`).setColor(process.env.ERROR_COLOR as ColorResolvable);
        return interaction.reply({ embeds: [errEmbed] });
      }

      const voiceChannel = member.voice.channel;
      if (!voiceChannel) {
        const errEmbed = new EmbedBuilder().setDescription(`Not in a voice channel`).setColor(process.env.ERROR_COLOR as ColorResolvable);
        return interaction.reply({ embeds: [errEmbed] });
      }

      interaction.client.musicPlayer.voices.leave(voiceChannel);

      const leaveEmbed = new EmbedBuilder().setDescription(`Left **${member.voice.channel.name}**`).setColor(process.env.MUSIC_COLOR as ColorResolvable);
      interaction.reply({ embeds: [leaveEmbed] });
    } catch (e) {
      console.error(e);
    }
  }
};

export default leaveCommand;
