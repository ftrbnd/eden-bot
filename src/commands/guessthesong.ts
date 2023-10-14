import fs from 'fs';
import path from 'path';
import { ColorResolvable, EmbedBuilder, Message, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import { SlashCommand } from '../lib/types';
import readFilePath from '../lib/readFilePath';

const guessTheSongCommand: SlashCommand = {
  command: new SlashCommandBuilder().setName('guessthesong').setDescription('Guess the song within 15 seconds!').setDefaultMemberPermissions(PermissionFlagsBits.UseApplicationCommands),

  async execute(interaction) {
    const lyricsFolder = path.resolve(__dirname, '../lyrics');

    const songFiles = fs.readdirSync(lyricsFolder).filter((file) => file.endsWith('.txt'));
    let randomSongFile = songFiles[Math.floor(Math.random() * songFiles.length)]; // choose a random song.txt
    let songName = randomSongFile.slice(0, -4);

    // handle ---- to ????, start--end to start//end, etc.
    switch (songName) {
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

    let lyrics = await readFilePath(`${lyricsFolder}/${randomSongFile}`); // get the lyrics
    if (!lyrics) return console.log('No lyrics found');
    lyrics = lyrics.filter((item: string) => item); // get rid of empty strings ''

    let randomIndex = Math.floor(Math.random() * lyrics.length);
    if (randomIndex === lyrics.length - 1)
      // if the last line is selected, move back one line so we are able to select 2 lines
      randomIndex--;

    const randomLyric = lyrics[randomIndex] + '\n' + lyrics[randomIndex + 1];

    const guessTheSongEmbed = new EmbedBuilder()
      .setTitle(`Guess The Song`)
      .setThumbnail('https://i.imgur.com/rQmm1FM.png') // EDEN's logo
      .setColor('fa57c1' as ColorResolvable)
      .setDescription(`${randomLyric}`)
      .setFooter({
        text: interaction.guild?.name ?? 'Server Name',
        iconURL: interaction.guild?.iconURL() ?? 'Server Icon'
      });
    interaction.reply({ embeds: [guessTheSongEmbed] });

    const filter = (m: Message) => m.content.toLowerCase().includes(songName.toLowerCase());
    const collector = interaction.channel?.createMessageCollector({ filter, time: 15_000 }); // collector stops checking after 15 seconds

    collector?.on('collect', (m) => {
      const winnerEmbed = new EmbedBuilder()
        .setTitle(m.author.username + ' guessed the song!')
        .addFields([{ name: 'Song', value: songName }])
        .setDescription(`${randomLyric}`)
        .setThumbnail(m.author.displayAvatarURL())
        .setColor(process.env.CONFIRM_COLOR as ColorResolvable)
        .setFooter({
          text: m.guild?.name ?? 'Server Name',
          iconURL: m.guild?.iconURL() ?? 'Server Icon'
        });

      m.reply({ embeds: [winnerEmbed] });
      collector.stop();
    });

    collector?.on('end', (collected) => {
      if (collected.size == 0) {
        // if no correct song was guessed (collected by the MessageCollector)
        const timesUpEmbed = new EmbedBuilder()
          .setTitle('Nobody guessed the song within 15 seconds.')
          .addFields([{ name: 'Song', value: songName }])
          .setDescription(`${randomLyric}`)
          .setColor(process.env.ERROR_COLOR as ColorResolvable)
          .setFooter({
            text: interaction.guild?.name ?? 'Server Name',
            iconURL: interaction.guild?.iconURL() ?? 'Server Icon'
          });

        interaction.followUp({ embeds: [timesUpEmbed] });
      }
    });
  }
};

export default guessTheSongCommand;
