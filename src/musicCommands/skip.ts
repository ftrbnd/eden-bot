import { ColorResolvable, EmbedBuilder, GuildMember, SlashCommandBuilder } from 'discord.js';
import { SlashCommand } from '../lib/types';
import getAllowedRoleId from '../lib/getAllowedRoleId';

const skipCommand: SlashCommand = {
  command: new SlashCommandBuilder().setName('skip').setDescription('Skip the current song in the queue'),

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
      const errEmbed = new EmbedBuilder().setDescription(`The queue is empty!`).setColor(process.env.ERROR_COLOR as ColorResolvable);
      return interaction.reply({ embeds: [errEmbed] });
    }

    if (queue.songs.length == 1) {
      queue.stop();

      const skipEndEmbed = new EmbedBuilder().setDescription(`Skipped **${queue.songs[0].name}** and the queue is now empty`).setColor(process.env.MUSIC_COLOR as ColorResolvable);
      return interaction.reply({ embeds: [skipEndEmbed] });
    }

    try {
      const song = await queue.skip();

      const queueEmbed = new EmbedBuilder().setDescription(`Skipped to **${song.name}**`).setColor(process.env.MUSIC_COLOR as ColorResolvable);
      interaction.reply({ embeds: [queueEmbed] });
    } catch (error) {
      console.error(error);
      const errEmbed = new EmbedBuilder().setDescription(`An error occurred in /skip.`).setColor(process.env.ERROR_COLOR as ColorResolvable);
      interaction.reply({ embeds: [errEmbed] });
    }
  }
};

export default skipCommand;
