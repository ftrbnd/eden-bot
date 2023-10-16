import { ColorResolvable, EmbedBuilder, GuildMember, SlashCommandBuilder } from 'discord.js';
import { SlashCommand } from '../lib/types';
import getAllowedRoleId from '../lib/getAllowedRoleId';

const previousCommand: SlashCommand = {
  command: new SlashCommandBuilder().setName('previous').setDescription('Play the previous song in the queue'),

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

    try {
      const song = await queue.previous();

      const queueEmbed = new EmbedBuilder().setDescription(`Playing previous song **${song.name}**`).setColor(process.env.MUSIC_COLOR as ColorResolvable);
      interaction.reply({ embeds: [queueEmbed] });
    } catch (error) {
      console.error(error);
      const errEmbed = new EmbedBuilder().setDescription(`There is no previous song in this queue`).setColor(process.env.ERROR_COLOR as ColorResolvable);
      interaction.reply({ embeds: [errEmbed] });
    }
  }
};

export default previousCommand;
