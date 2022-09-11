const { EmbedBuilder, SlashCommandBuilder } = require('discord.js')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('previous')
		.setDescription('Play the previous song in the queue'),
		
	async execute(interaction) {
        const voiceChannel = interaction.member.voice.channel

        if(voiceChannel) {
            const queue = interaction.client.DisTube.getQueue(interaction.guild)

            if(!queue) {
                const errEmbed = new EmbedBuilder()
                    .setDescription(`The queue is empty!`)
                    .setColor('0xdf0000')
                return interaction.reply({ embeds: [errEmbed] })
            }

            try {
                const song = await queue.previous()

                const queueEmbed = new EmbedBuilder()
                    .setDescription(`Playing previous song **${song.name}**`)
                    .setColor(process.env.MUSIC_COLOR)
        
                interaction.reply({ embeds: [queueEmbed] })

            } catch(error) {
                console.log(error)
                const errEmbed = new EmbedBuilder()
                    .setDescription(`There is no previous song in this queue`)
                    .setColor('0xdf0000')
                return interaction.reply({ embeds: [errEmbed] })
            }

        } else {
            const errEmbed = new EmbedBuilder()
                .setDescription(`You must join a voice channel!`)
                .setColor('0xdf0000')
            return interaction.reply({ embeds: [errEmbed] })
        }
	},
}