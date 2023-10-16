import { ColorResolvable, EmbedBuilder, GuildMember, SlashCommandBuilder } from 'discord.js';
import { SlashCommand } from '../lib/types';

const pauseCommand: SlashCommand = {
  command: new SlashCommandBuilder().setName('pause').setDescription('Pause the currently playing song'),

  async execute(interaction) {
    if (!interaction.guild) return console.log('Guild not found');
    const member = <GuildMember>interaction.member;

    const getAllowedRoleId = require('../helperFunctions/getAllowedRoleId');
    const allowedRoleId = await getAllowedRoleId.execute(interaction);
    if (!member.roles.cache.has(allowedRoleId) && allowedRoleId != interaction.guild?.roles.everyone.id) {
      const errEmbed = new EmbedBuilder().setDescription(`You do not have permission to use music commands right now!`).setColor(process.env.ERROR_COLOR as ColorResolvable);
      return interaction.reply({ embeds: [errEmbed] });
    }

    const voiceChannel = member.voice.channel;
    if (!voiceChannel) {
      const errEmbed = new EmbedBuilder().setDescription(`You must join a voice channel!`).setColor(process.env.ERROR_COLOR as ColorResolvable);
      return interaction.reply({ embeds: [errEmbed] });
    }

    const queue = interaction.client.musicPlayer.getQueue(interaction.guild);
    if (!queue) {
      const errEmbed = new EmbedBuilder().setDescription(`The queue is empty`).setColor(process.env.ERROR_COLOR as ColorResolvable);
      return interaction.reply({ embeds: [errEmbed] });
    }

    if (queue.paused) {
      queue.resume();
      const pauseEmbed = new EmbedBuilder().setDescription(`Resumed the song`).setColor(process.env.MUSIC_COLOR as ColorResolvable);
      return interaction.reply({ embeds: [pauseEmbed] });
    }

    queue.pause();
    const pauseEmbed = new EmbedBuilder().setDescription(`Paused the song`).setColor(process.env.MUSIC_COLOR as ColorResolvable);
    return interaction.reply({ embeds: [pauseEmbed] });
  }
};

export default pauseCommand;
