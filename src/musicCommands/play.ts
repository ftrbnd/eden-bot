import { EmbedBuilder, SlashCommandBuilder, ChannelType, PermissionFlagsBits, GuildMember, ColorResolvable } from 'discord.js';
import { SlashCommand } from '../lib/types';
import getAllowedRoleId from '../lib/getAllowedRoleId';

const playCommand: SlashCommand = {
  command: new SlashCommandBuilder()
    .setName('play')
    .setDescription('Play music using YouTube, Spotify, or SoundCloud')
    .addStringOption((option) => option.setName('song').setDescription('Search query or YouTube/Spotify/SoundCloud links').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.UseApplicationCommands),

  execute: async (interaction) => {
    await interaction.deferReply({ ephemeral: true });

    const member = <GuildMember>interaction.member;
    async function checkPermissions() {
      try {
        const allowedRoleId = await getAllowedRoleId(interaction);

        if (!member.roles.cache.has(allowedRoleId) && allowedRoleId != interaction.guild?.roles.everyone.id) {
          const errEmbed = new EmbedBuilder().setDescription(`You do not have permission to use music commands right now!`).setColor(process.env.ERROR_COLOR as ColorResolvable);
          return interaction.editReply({ embeds: [errEmbed] });
        }
      } catch (e) {
        return console.error(e);
      }
    }

    async function checkVoiceChannel() {
      try {
        const voiceChannel = member.voice.channel;

        if (!voiceChannel) {
          const errEmbed = new EmbedBuilder().setDescription(`You must join a voice channel!`).setColor(process.env.ERROR_COLOR as ColorResolvable);
          return interaction.editReply({ embeds: [errEmbed] });
        }
      } catch (e) {
        return console.error(e);
      }
    }

    async function unSuppress() {
      const voiceChannel = member.voice.channel;

      if (voiceChannel?.type === ChannelType.GuildStageVoice) {
        try {
          await interaction.guild?.members.me?.voice.setSuppressed(false); // set bot as Stage speaker
        } catch (e) {
          return console.error(e);
        }
      }
    }

    async function playSong() {
      const chosenSong = interaction.options.getString('song');
      const voiceChannel = member.voice.channel;
      if (!chosenSong || !voiceChannel) return console.log('Voice channel not found');

      try {
        await interaction.client.musicPlayer.play(voiceChannel, chosenSong, {
          member
        });

        let description = '👍';
        if (voiceChannel?.type === ChannelType.GuildStageVoice) {
          description += ' (promote me to Speaker pls)';
        }

        const confirmEmbed = new EmbedBuilder().setDescription(description).setColor(process.env.MUSIC_COLOR as ColorResolvable);
        await interaction.editReply({ embeds: [confirmEmbed] });
      } catch (e) {
        console.error(e);
        const errEmbed = new EmbedBuilder().setDescription(`An error occurred in /play.`).setColor(process.env.ERROR_COLOR as ColorResolvable);
        return interaction.editReply({ embeds: [errEmbed] });
      }
    }

    await checkPermissions();
    await checkVoiceChannel();
    // await unSuppress();
    await playSong();
  }
};

export default playCommand;
