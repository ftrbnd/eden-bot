import fs, { readFile } from 'fs';
import path from 'path';
import { ColorResolvable, EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import { SlashCommand } from '../lib/types';
import readFilePath from '../lib/readFilePath';

const lyricsCommand: SlashCommand = {
  command: new SlashCommandBuilder()
    .setName('lyrics')
    .setDescription('Get the lyrics of a song')
    .addStringOption((option) => option.setName('song').setDescription('The song to go get the lyrics of').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.UseApplicationCommands),

  async execute(interaction) {
    let song = interaction.options.getString('song')?.toLowerCase();

    const lyricsFolder = path.resolve(__dirname, '../lyrics');
    const songFiles = fs.readdirSync(lyricsFolder).filter((file) => file.endsWith('.txt'));

    for (let i = 0; i < songFiles.length; i++) {
      let songName = songFiles[i].slice(0, -4); // remove '.txt'
      switch (
        songName // handle ---- to ????, start--end to start//end, etc.
      ) {
        case '----':
          songName = '????';
          break;
        case 'start--end':
          songName = 'start//end';
          break;
        case 'lost--found':
          songName = 'lost//found';
          break;
        case 'forever--over':
          songName = 'forever//over';
          break;
      }

      if (song === songName.toLowerCase()) {
        // if the song the user requested and the current song are the same
        const lyrics = await readFilePath(`${lyricsFolder}/${songFiles[i]}`); // get the lyrics
        const lyricsString = lyrics?.join('\n');
        song = songName;

        if (songName.toLowerCase() === 'Fumes'.toLowerCase()) songName = 'Fumes (feat. gnash)';

        let lyricsEmbed = new EmbedBuilder()
          .setTitle(songName)
          .setDescription(lyricsString ?? 'Lyric')
          .setColor(process.env.ERROR_COLOR as ColorResolvable);

        const albumsFolder = path.resolve(__dirname, '../albums');
        const albumFiles = fs.readdirSync(albumsFolder).filter((file) => file.endsWith('.txt'));
        for (let i = 0; i < albumFiles.length; i++) {
          // check if the song belongs to any album
          const albumTracks = await readFilePath(`${albumsFolder}/${albumFiles[i]}`);
          const embedColor = `${albumTracks?.pop()}`;
          const albumCover = albumTracks?.pop();
          if (albumTracks?.includes(songName)) {
            lyricsEmbed.setColor(embedColor as ColorResolvable);
            lyricsEmbed.setThumbnail(albumCover ?? 'Album Cover');
            break;
          } else {
            // if the song is not from any album
            lyricsEmbed.setColor('Grey');
            lyricsEmbed.setThumbnail('https://i.imgur.com/rQmm1FM.png');
          }
        }

        return interaction.reply({ embeds: [lyricsEmbed] });
      }
    }

    if (!songFiles.includes(song ?? 'Song name')) {
      const errEmbed = new EmbedBuilder().setDescription(`**${song}** is not a valid song, please try again!`).setColor(process.env.ERROR_COLOR as ColorResolvable);
      return interaction.reply({ embeds: [errEmbed], ephemeral: true });
    }
  }
};

export default lyricsCommand;
