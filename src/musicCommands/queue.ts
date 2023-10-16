import { ColorResolvable, EmbedBuilder, GuildMember, SlashCommandBuilder } from 'discord.js';
import { SlashCommand } from '../lib/types';
import getAllowedRoleId from '../lib/getAllowedRoleId';

const queueCommand: SlashCommand = {
  command: new SlashCommandBuilder().setName('queue').setDescription('View the current queue'),

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

    const queueList = queue.songs.map((song, id) => `${id + 1}) [${song.name}](${song.url}) - \`${song.formattedDuration}\``).join('\n');

    let repeatMode = '';
    switch (queue.repeatMode) {
      case 0:
        repeatMode = 'Off';
        break;
      case 1:
        repeatMode = 'Song';
        break;
      case 2:
        repeatMode = 'Queue';
        break;
    }

    const queueEmbed = new EmbedBuilder()
      .setDescription(queueList)
      .setColor(process.env.MUSIC_COLOR as ColorResolvable)
      .setFooter({
        text: `Repeat mode: ${repeatMode}`
      });
    interaction.reply({ embeds: [queueEmbed] });
  }
};

export default queueCommand;
