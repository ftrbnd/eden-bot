import { ColorResolvable, EmbedBuilder, GuildMember, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import { SlashCommand } from '../lib/types';
import getAllowedRoleId from '../lib/getAllowedRoleId';

const repeatCommand: SlashCommand = {
  command: new SlashCommandBuilder()
    .setName('repeat')
    .setDescription('Repeat the current song, queue, or turn repeat off')
    .addIntegerOption((option) =>
      option.setName('mode').setDescription('The repeat mode').setRequired(true).addChoices({ name: 'Off', value: 0 }, { name: 'Song', value: 1 }, { name: 'Queue', value: 2 })
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.UseApplicationCommands),

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

    let mode = interaction.options.getInteger('mode');
    if (!mode) return console.log('Mode not found');

    mode = queue.setRepeatMode(mode);

    let repeatMode = '';
    switch (mode) {
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

    const repeatEmbed = new EmbedBuilder().setDescription(`Set repeat mode to **${repeatMode}**`).setColor(process.env.MUSIC_COLOR as ColorResolvable);
    interaction.reply({ embeds: [repeatEmbed] });
  }
};

export default repeatCommand;
