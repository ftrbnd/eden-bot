require('dotenv').config()

const { EmbedBuilder } = require('discord.js')

module.exports = {
	name: 'messageDelete',
	async execute(message) {
        const logChannel = message.guild.channels.cache.get(process.env.LOGS_CHANNEL_ID)
		if(!logChannel) return
		if(message.author.bot) return
			
		const msgDeleteEmbed = new EmbedBuilder()
			.setAuthor({
				name: `${message.author.tag} deleted a message.`, 
				iconURL: message.author.displayAvatarURL({ dynamic : true })
			})
			.setDescription(message.content)
			.addFields([
				{ name: 'Channel', value: message.channel.name},
			])
			.setColor(0xdf0000)
			.setTimestamp()
		logChannel.send({ embeds: [msgDeleteEmbed] })
	},
}