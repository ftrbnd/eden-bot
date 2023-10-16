import { ColorResolvable, EmbedBuilder, GuildMember, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import { SlashCommand } from '../lib/types';
import getAllowedRoleId from '../lib/getAllowedRoleId';

const volumeCommand: SlashCommand = {
  command: new SlashCommandBuilder()
    .setName('volume')
    .setDescription("Adjust the bot's volume for everyone")
    .addNumberOption((option) => option.setName('percent').setDescription('The volume percentage').setMinValue(0).setMaxValue(200).setRequired(true))
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
    const percent = interaction.options.getNumber('percent');
    if (!guild || !percent) return console.log('Guild not found');

    interaction.client.musicPlayer.setVolume(guild, percent);

    const volumeEmbed = new EmbedBuilder().setDescription(`Adjusted volume to **${percent}%**`).setColor(process.env.MUSIC_COLOR as ColorResolvable);
    interaction.reply({ embeds: [volumeEmbed] });
  }
};

export default volumeCommand;
