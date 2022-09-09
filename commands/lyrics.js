require('dotenv').config()
const fs = require('fs')
const path = require('path')

const { EmbedBuilder, SlashCommandBuilder } = require('discord.js')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('lyrics')
		.setDescription('Get the lyrics of a song')
        .addStringOption(option =>
            option.setName('song')
            .setDescription('The song to go get the lyrics of')
            .setRequired(true)),
		
	async execute(interaction) {
        var song = interaction.options.getString('song').toLowerCase()

        const lyricsFolder = path.resolve(__dirname, '../lyrics')
        const songFiles = fs.readdirSync(lyricsFolder).filter(file => file.endsWith('.txt'))

        for(let i = 0; i < songFiles.length; i++) {
            let songName = songFiles[i].slice(0, -4) // remove '.txt'
            switch(songName) { // handle ---- to ????, start--end to start//end, etc.
                case "----":
                    songName = "????"
                    break
                case "start--end":
                    songName = "start//end"
                    break
                case "lost--found":
                    songName = "lost//found"
                    break
                case "forever--over":
                    songName = "forever//over"
                    break
                default:
                    // do nothing
            }

            if(song === songName.toLowerCase()) { // if the song the user requested and the current song are the same
                const lyrics = await readFile(`${lyricsFolder}/${songFiles[i]}`) // get the lyrics
                const lyricsString = lyrics.join('\n')
                song = songName

                if(songName.toLowerCase() === "Fumes".toLowerCase()) {
                    songName = "Fumes (feat. gnash)"
                }

                let lyricsEmbed = new EmbedBuilder()
                    .setTitle(songName)
                    .setDescription(lyricsString)
                    .setColor('0xdf0000')

                const survivorFolder = path.resolve(__dirname, '../survivor')
                const albumFiles = fs.readdirSync(survivorFolder).filter(file => file.endsWith('.txt'))
                for(let i = 0; i < albumFiles.length; i++) { // check if the song belongs to any album
                    let album = albumFiles[i]

                    var albumTracks = await readFile(`${survivorFolder}/${albumFiles[i]}`) // get the album tracks
                    const embedColor = `0x${albumTracks.pop()}`
                    const albumCover = albumTracks.pop()
                    if(albumTracks.includes(songName)) {
                        lyricsEmbed.setColor(embedColor)
                        lyricsEmbed.setThumbnail(albumCover)
                        break // exit out of this loop once we find the album
                    } else { // if the song is not from any album
                        lyricsEmbed.setColor('Grey')
                        lyricsEmbed.setThumbnail('https://i.imgur.com/rQmm1FM.png')
                    }
                }

                return interaction.reply({ embeds: [lyricsEmbed] })
            }
        }

        if(!songFiles.includes(song)) {
            const errEmbed = new EmbedBuilder()
                .setDescription(`**${song}** is not a valid song, please try again!`)
                .setColor('0xdf0000')
            return interaction.reply({ embeds: [errEmbed] })
        }
	},
}

async function readFile(filename) {
    try {
        const contents = await fs.promises.readFile(filename, 'utf-8')
        const arr = contents.split(/\r?\n/)

        return arr
    } catch(err) {
        console.log(err)
    }
}