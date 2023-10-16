import { ColorResolvable, EmbedBuilder, GuildMember, SlashCommandBuilder } from 'discord.js';
import { SlashCommand } from '../lib/types';
import getAllowedRoleId from '../lib/getAllowedRoleId';

const resumeCommand: SlashCommand = {
  command: new SlashCommandBuilder().setName('resume').setDescription('Resume playing the song'),

  execute: async (interaction) => {
    const member = <GuildMember>interaction.member;

    const allowedRoleId = await getAllowedRoleId(interaction);
    if (!member.roles.cache.has(allowedRoleId) && allowedRoleId != interaction.guild?.roles.everyone.id) {
      const errEmbed = new EmbedBuilder().setDescription(`You do not have permission to use music commands right now!`).setColor(process.env.ERROR_COLOR as ColorResolvable);
      return interaction.reply({ embeds: [errEmbed] });
    }

    const voiceChannel = member.voice.channel;
    if (!voiceChannel) {
      const errEmbed = new EmbedBuilder().setDescription(`You must join a voice channel!`).setColor(process.env.ERROR_COLOR as ColorResolvable);
      return interaction.reply({ embeds: [errEmbed] });
    }

    const guild = interaction.guild;
    if (!guild) return console.log('Guild not found');

    const queue = interaction.client.musicPlayer.getQueue(guild);
    if (!queue) {
      const errEmbed = new EmbedBuilder().setDescription(`The queue is empty`).setColor(process.env.ERROR_COLOR as ColorResolvable);
      return interaction.reply({ embeds: [errEmbed] });
    }

    if (!queue.paused) {
      const errEmbed = new EmbedBuilder().setDescription(`The queue is already playing`).setColor(process.env.ERROR_COLOR as ColorResolvable);
      return interaction.reply({ embeds: [errEmbed] });
    }

    queue.resume();
    const pauseEmbed = new EmbedBuilder().setDescription(`Resumed the queue`).setColor(process.env.MUSIC_COLOR as ColorResolvable);
    interaction.reply({ embeds: [pauseEmbed] });
  }
};

export default resumeCommand;
