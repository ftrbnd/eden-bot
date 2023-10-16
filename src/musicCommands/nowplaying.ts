import { ColorResolvable, EmbedBuilder, GuildMember, SlashCommandBuilder } from 'discord.js';
import { SlashCommand } from '../lib/types';

const nowPlayingCommand: SlashCommand = {
  command: new SlashCommandBuilder().setName('nowplaying').setDescription('See what song is currently playing'),

  async execute(interaction) {
    if (!interaction.guild) return console.log('Guild not found');

    const member = <GuildMember>interaction.member;

    const getAllowedRoleId = require('../helperFunctions/getAllowedRoleId');
    const allowedRoleId = await getAllowedRoleId.execute(interaction);
    if (!member.roles.cache.has(allowedRoleId) && allowedRoleId != interaction.guild?.roles.everyone.id) {
      const errEmbed = new EmbedBuilder().setDescription(`You do not have permission to use music commands right now!`).setColor(process.env.ERROR_COLOR as ColorResolvable);
      return interaction.reply({ embeds: [errEmbed] });
    }

    const voiceChannel = interaction.client.musicPlayer.voices.get(interaction.guild);
    if (!voiceChannel) {
      const errEmbed = new EmbedBuilder().setDescription(`Not in a voice channel`).setColor(process.env.ERROR_COLOR as ColorResolvable);
      return interaction.reply({ embeds: [errEmbed] });
    }

    const queue = interaction.client.musicPlayer.getQueue(interaction.guild);
    if (!queue) {
      const errEmbed = new EmbedBuilder().setDescription(`There is nothing playing`).setColor(process.env.ERROR_COLOR as ColorResolvable);
      return interaction.reply({ embeds: [errEmbed] });
    }

    const npEmbed = new EmbedBuilder().setDescription(`Now playing [${queue.songs[0].name}](${queue.songs[0].url}) [${queue.songs[0].user}]`).setColor(process.env.MUSIC_COLOR as ColorResolvable);
    interaction.reply({ embeds: [npEmbed] });
  }
};

export default nowPlayingCommand;
