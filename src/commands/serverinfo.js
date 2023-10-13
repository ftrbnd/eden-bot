const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('serverinfo')
		.setDescription(`Get basic info about this server`),
		
	async execute(interaction) {
        const owner = interaction.guild.members.cache.get(interaction.guild.ownerId);

        const serverInfo = new EmbedBuilder()
            .setTitle(`***${interaction.guild}*** Server Information`)
            .setDescription(interaction.guild.description)
            .setThumbnail(interaction.guild.iconURL({ dynamic : true}))
            .setColor('f03200')
            .addFields([
                { name: 'Owner', value: `${owner}` },
                { name: 'Date Created', value: interaction.guild.createdAt.toDateString() },
                { name: 'Member Count', value: `${interaction.guild.memberCount}` },
                { name: 'Server Level', value: `${interaction.guild.premiumTier}` }, // remove 'TIER_' from 'TIER_#'
                { name: 'Server Boosts', value: `${interaction.guild.premiumSubscriptionCount}` },     
            ]);

		return interaction.reply({ embeds: [serverInfo] });
	},
}