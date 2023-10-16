import { EmbedBuilder, SlashCommandBuilder, PermissionFlagsBits, ChannelType, ColorResolvable, GuildMember, AutocompleteInteraction } from 'discord.js';
import { SlashCommand } from '../lib/types';
import Playlist, { PlaylistDocument } from '../schemas/PlaylistSchema';
import sendErrorEmbed from '../lib/sendErrorEmbed';

interface Choice {
  name: string;
  link: string;
}

async function getPlaylists(choices: Choice[]) {
  await Playlist.find({}, (err: any, data: PlaylistDocument[]) => {
    if (err) {
      return console.log(err);
    }

    if (!data) {
      console.log(`Couldn't find any data for custom playlists.`);
    } else {
      for (const playlist of data) {
        choices.push({
          name: playlist.name,
          link: playlist.link
        });
      }
    }
  }).clone();
}

const customPlaylistCommand: SlashCommand = {
  command: new SlashCommandBuilder()
    .setName('customplaylist')
    .setDescription('Create or play a custom playlist')
    .addSubcommand((subcommand) =>
      subcommand
        .setName('create')
        .setDescription('Add a new playlist to the database')
        .addStringOption((option) => option.setName('name').setDescription('Playlist name').setRequired(true))
        .addStringOption((option) => option.setName('link').setDescription('YouTube playlist link').setRequired(true))
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('play')
        .setDescription('Play a pre-defined playlist')
        .addStringOption((option) => option.setName('name').setDescription('Playlist name').setRequired(true).setAutocomplete(true))
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    if (interaction.options.getSubcommand() === 'create') {
      const newPlaylistName = interaction.options.getString('name')?.toLowerCase();
      const newPlaylistLink = interaction.options.getString('link');

      await Playlist.findOne({ name: newPlaylistName }, (err: any, data: PlaylistDocument) => {
        if (err) {
          return sendErrorEmbed(interaction, err);
        }

        if (!data) {
          Playlist.create({
            name: newPlaylistName,
            link: newPlaylistLink
          }).catch((err) => console.log(err));

          console.log(`Created a new playlist for ${newPlaylistName}`);
          const confirmEmbed = new EmbedBuilder().setDescription(`Created custom playlist for **${newPlaylistName}**`).setColor(process.env.MUSIC_COLOR as ColorResolvable);
          interaction.reply({ embeds: [confirmEmbed] });
        } else {
          data.link = newPlaylistLink ?? 'fakelink'; // data.name is already the same as newPlaylistName
          data.save();

          const confirmEmbed = new EmbedBuilder().setDescription(`Updated playlist link for **${newPlaylistName}**`).setColor(process.env.MUSIC_COLOR as ColorResolvable);
          interaction.reply({ embeds: [confirmEmbed] });
        }
      }).clone();
    } else if (interaction.options.getSubcommand() === 'play') {
      if (interaction.isAutocomplete()) {
        const autoCompleteInteraction = <AutocompleteInteraction>interaction;
        const focusedValue = autoCompleteInteraction.options.getFocused();
        const choices: Choice[] = [];
        await getPlaylists(choices);
        const filtered = choices.filter((choice) => choice.name.startsWith(focusedValue));
        await autoCompleteInteraction.respond(filtered.map((choice) => ({ name: choice.name, value: choice.name })));
      } else {
        const playlist = interaction.options.getString('name');

        await Playlist.findOne({ name: playlist }, (err: any, data: PlaylistDocument) => {
          if (err) {
            return sendErrorEmbed(interaction, err);
          }

          if (!data) {
            const dataEmbed = new EmbedBuilder().setDescription(`**${playlist}** custom playlist does not exist`).setColor(process.env.ERROR_COLOR as ColorResolvable);
            return interaction.reply({ embeds: [dataEmbed] });
          } else {
            const member = <GuildMember>interaction.member;
            const voiceChannel = member.voice.channel;

            if (voiceChannel) {
              interaction.client.musicPlayer
                .play(voiceChannel, data.link, {
                  member
                })
                .catch((err) => {
                  console.log(err);
                  const errEmbed = new EmbedBuilder().setDescription(`An error occurred in /customplaylist.`).setColor(process.env.ERROR_COLOR as ColorResolvable);
                  return interaction.reply({ embeds: [errEmbed] });
                });

              if (voiceChannel.type === ChannelType.GuildStageVoice) {
                interaction.guild?.members.me?.voice.setSuppressed(false); // set bot as Stage speaker
              }

              const confirmEmbed = new EmbedBuilder().setDescription(`Now playing **${playlist}** in ${voiceChannel}`).setColor(process.env.MUSIC_COLOR as ColorResolvable);
              interaction.reply({ embeds: [confirmEmbed] });
            } else {
              const errEmbed = new EmbedBuilder().setDescription(`You must join a voice channel!`).setColor(process.env.ERROR_COLOR as ColorResolvable);
              return interaction.reply({ embeds: [errEmbed] });
            }
          }
        }).clone();
      }
    }
  }
};

export default customPlaylistCommand;
