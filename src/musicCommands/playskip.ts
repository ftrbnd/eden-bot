import getAllowedRoleId from '../lib/getAllowedRoleId';
import { SlashCommand } from '../lib/types';
import { ColorResolvable, EmbedBuilder, GuildMember, PermissionFlagsBits, SlashCommandBuilder, TextChannel } from 'discord.js';

const playSkipCommand: SlashCommand = {
  command: new SlashCommandBuilder()
    .setName('playskip')
    .setDescription('Skip the current song and immediately play your song')
    .addStringOption((option) => option.setName('song').setDescription('Search query or YouTube link').setRequired(true))
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

    const chosenSong = interaction.options.getString('song');
    if (!chosenSong || !interaction.channel) return console.log('Chosen song or text channel not found');
    const textChannel = <TextChannel>interaction.channel;

    await interaction.client.musicPlayer
      .play(member.voice.channel, chosenSong, {
        member,
        textChannel,
        skip: true
      })
      .catch((err) => {
        console.log(err);
        const errEmbed = new EmbedBuilder().setDescription(`An error occurred in /playskip.`).setColor(process.env.ERROR_COLOR as ColorResolvable);
        return interaction.reply({ embeds: [errEmbed] });
      });

    const playEmbed = new EmbedBuilder().setDescription(`Your entry: **${chosenSong}**`);
    interaction.reply({ embeds: [playEmbed], ephemeral: true });
  }
};

export default playSkipCommand;
