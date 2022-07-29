require('dotenv').config()

const { SlashCommandBuilder } = require('@discordjs/builders')
const { MessageEmbed } = require('discord.js')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('survivor')
		.setDescription('Start a new round of Survivor!')
        .addChannelOption(option =>
            option.setName('channel')
            .setDescription('The channel to send the Survivor message')
            .setRequired(true))
        .addStringOption(option => 
            option.setName('album')
            .setDescription('The name of the album/ep')
            .setRequired(true))
        .addStringOption(option => 
            option.setName('eliminated song')
            .setDescription('The song that was eliminated in the previous round.')
            .setRequired(false))
        .addStringOption(option => 
            option.setName('songs')
            .setDescription('The names of the songs, separated by commas (02:09, End Credits, Gravity)')
            .setRequired(true)),
		
	async execute(interaction) {
        if(interaction.member.roles.cache.has(process.env.MODERATORS_ROLE_ID)) { // Moderator role
            
            const targetChannel = interaction.options._hoistedOptions[0].channel
            const albumName = interaction.options._hoistedOptions[1].value
            const eliminatedSong = interaction.options._hoistedOptions[2].value
            const songNames = interaction.options._hoistedOptions[3].value

            if(!songNames.includes(',')) {
                const commaEmbed = new MessageEmbed()
                    .setDescription(`Please separate the song names with commas.`)
                    .setColor(0xdf0000)
                return interaction.reply({ embeds: [commaEmbed], ephemeral: true })
            }

            const numberEmojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟',
                '929631863549595658', '929631863440556043', '929631863520243784', '929634144667983892', 
                '929634144777031690', '929634144588288020', '929634144537944064', '929634144491819018', 
                '929634144487612416']
            const emojiIds = ['929631863549595658', '929631863440556043', '929631863520243784', '929634144667983892', 
                '929634144777031690', '929634144588288020', '929634144537944064', '929634144491819018', 
                '929634144487612416']

            try {
                // separate song names into an array
                var songNamesList = songNames.split(',')
                songNamesList.forEach((songName, index) => {
                    var numberEmoji = numberEmojis[index]
                    if(emojiIds.includes(numberEmoji)) {
                        numberEmoji = interaction.guild.emojis.cache.get(numberEmoji)
                    }

                    songNamesList[index] = `${numberEmoji} ${songName.trim()}`
                })

                var embedTitle = ""
                if(eliminatedSong == null) {
                    embedTitle = `${eliminatedSong} was eliminated!`
                } else {
                    embedTitle = `${albumName} - Survivor`
                }

                const survivorEmbed = new MessageEmbed()
                    .setTitle(embedTitle)
                    .setDescription(`${songNamesList.join("\n\n")}`)
                    .setFooter({
                        text: 'Vote for your LEAST favorite song!', 
                        iconURL: interaction.guild.iconURL({ dynamic : true}) 
                    })
                await targetChannel.send({ content: '<@&929642070874939392>', embeds: [survivorEmbed] })

                // x amount of reactions for x number of songs
                for(i = 0; i < songNamesList.length; i++) {
                    targetChannel.lastMessage.react(numberEmojis[i])
                }

                const confirmEmbed = new MessageEmbed()
                    .setDescription(`New round of **${albumName} Survivor** sent in ${targetChannel}`)
                interaction.reply({ embeds: [confirmEmbed] })

            } catch(error) {
                console.log(error)
                const errorEmbed = new MessageEmbed()
                    .setDescription('Could not find the emojis for the songs.')
                    .setColor(0xdf0000)
                interaction.reply({ embeds: [errorEmbed], ephemeral: true })
            }
        } else {
            const permsEmbed = new MessageEmbed()
                .setDescription('You do not have permission to use this command.')
                .setColor(0xdf0000)
            return interaction.reply({ embeds: [permsEmbed], ephemeral: true })
        }
	},
}