const fs = require('fs');
const path = require('path');
const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder().setName('guessthesong').setDescription('Guess the song within 15 seconds!'),

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

    let lyrics = await readFile(`${lyricsFolder}/${randomSongFile}`); // get the lyrics
    lyrics = lyrics.filter((item) => item); // get rid of empty strings ''

    let randomIndex = Math.floor(Math.random() * lyrics.length);
    if (randomIndex === lyrics.length - 1)
      // if the last line is selected, move back one line so we are able to select 2 lines
      randomIndex--;

    const randomLyric = lyrics[randomIndex] + '\n' + lyrics[randomIndex + 1];

    const guessTheSongEmbed = new EmbedBuilder()
      .setTitle(`Guess The Song`)
      .setThumbnail('https://i.imgur.com/rQmm1FM.png') // EDEN's logo
      .setColor('fa57c1')
      .setDescription(`${randomLyric}`)
      .setFooter({
        text: interaction.guild.name,
        iconURL: interaction.guild.iconURL({ dynamic: true })
      });
    interaction.reply({ embeds: [guessTheSongEmbed] });

    const filter = (m) => m.content.toLowerCase().includes(songName.toLowerCase());
    const collector = interaction.channel.createMessageCollector({ filter, time: 15_000 }); // collector stops checking after 15 seconds

    collector.on('collect', (m) => {
      const winnerEmbed = new EmbedBuilder()
        .setTitle(m.author.username + ' guessed the song!')
        .addFields([{ name: 'Song', value: songName }])
        .setDescription(`${randomLyric}`)
        .setThumbnail(m.author.displayAvatarURL({ dynamic: true }))
        .setColor(process.env.CONFIRM_COLOR)
        .setFooter({
          text: m.guild.name,
          iconURL: m.guild.iconURL({ dynamic: true })
        });

      m.reply({ embeds: [winnerEmbed] });
      collector.stop();
    });

    collector.on('end', (collected) => {
      if (collected.size == 0) {
        // if no correct song was guessed (collected by the MessageCollector)
        const timesUpEmbed = new EmbedBuilder()
          .setTitle('Nobody guessed the song within 15 seconds.')
          .addFields([{ name: 'Song', value: songName }])
          .setDescription(`${randomLyric}`)
          .setColor(process.env.ERROR_COLOR)
          .setFooter({
            text: interaction.guild.name,
            iconURL: interaction.guild.iconURL({ dynamic: true })
          });

        interaction.followUp({ embeds: [timesUpEmbed] });
      }
    });
  }
};

async function readFile(filename) {
  try {
    const contents = await fs.promises.readFile(filename, 'utf-8');
    const arr = contents.split(/\r?\n/);

    return arr;
  } catch (err) {
    console.error(err);
  }
}
