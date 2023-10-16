import { EmbedBuilder, SlashCommandBuilder, ChannelType, ColorResolvable, GuildMember } from 'discord.js';
import { SlashCommand } from '../lib/types';

const joinCommand: SlashCommand = {
  command: new SlashCommandBuilder().setName('join').setDescription('Get the bot to join your voice channel'),

  async execute(interaction) {
    try {
      const member = <GuildMember>interaction.member;

      const getAllowedRoleId = require('../helperFunctions/getAllowedRoleId');
      const allowedRoleId = await getAllowedRoleId.execute(interaction);
      if (!member?.roles.cache.has(allowedRoleId) && allowedRoleId != interaction.guild?.roles.everyone.id) {
        const errEmbed = new EmbedBuilder().setDescription(`You do not have permission to use music commands right now!`).setColor(process.env.ERROR_COLOR as ColorResolvable);
        return interaction.reply({ embeds: [errEmbed] });
      }

      const voiceChannel = member?.voice.channel;
      if (!voiceChannel) {
        const errEmbed = new EmbedBuilder().setDescription(`You must join a voice channel!`).setColor(process.env.ERROR_COLOR as ColorResolvable);
        return interaction.reply({ embeds: [errEmbed] });
      }

      await interaction.client.musicPlayer.voices.join(voiceChannel);

      if (voiceChannel.type === ChannelType.GuildStageVoice) {
        await interaction.guild?.members.me?.voice.setSuppressed(false); // set bot as Stage speaker
      }

      const joinEmbed = new EmbedBuilder().setDescription(`Joined **${voiceChannel.name}**`).setColor(process.env.MUSIC_COLOR as ColorResolvable);
      interaction.reply({ embeds: [joinEmbed] });
    } catch (e) {
      console.error(e);
    }
  }
};

export default joinCommand;
