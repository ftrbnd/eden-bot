const { EmbedBuilder, SlashCommandBuilder } = require('discord.js')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('playskip')
		.setDescription('Skip the current song and immediately play your song')
        .addStringOption(option => 
            option.setName('song')
            .setDescription('Search query or YouTube link')
            .setRequired(true)),
		
	async execute(interaction) {
        const chosenSong = interaction.options.getString('song')
        const voiceChannel = interaction.member.voice.channel

        if(voiceChannel) {
            await interaction.client.DisTube.play(interaction.member.voice.channel, chosenSong, {
                member: interaction.member,
                textChannel: interaction.channel,
                skip: true
            }).catch(err => {
                console.log(err)
                const errEmbed = new EmbedBuilder()
                    .setDescription(`An error occurred in /playskip.`)
                    .setColor('0xdf0000')
                return interaction.reply({ embeds: [errEmbed]})
            })
    
            const playEmbed = new EmbedBuilder()
                .setDescription(`Your entry: **${chosenSong}**`)
    
            interaction.reply({ embeds: [playEmbed], ephemeral: true })

        } else {
            const errEmbed = new EmbedBuilder()
                .setDescription(`You must join a voice channel!`)
                .setColor('0xdf0000')
            return interaction.reply({ embeds: [errEmbed] })
        }
	},
}