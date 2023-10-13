const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('stop')
		.setDescription('Stop the music and delete the queue'),
		
	async execute(interaction) {
        const getAllowedRoleId = require('../helperFunctions/getAllowedRoleId');
        const allowedRoleId = await getAllowedRoleId.execute(interaction);
        if (!interaction.member._roles.includes(allowedRoleId) && allowedRoleId != interaction.guild.roles.everyone.id) {
            const errEmbed = new EmbedBuilder()
                .setDescription(`You do not have permission to use music commands right now!`)
                .setColor(process.env.ERROR_COLOR);
            return interaction.reply({ embeds: [errEmbed] });
        }

        const voiceChannel = interaction.member.voice.channel;
        if(!voiceChannel) {
            const errEmbed = new EmbedBuilder()
                .setDescription(`You must join a voice channel!`)
                .setColor(process.env.ERROR_COLOR);
            return interaction.reply({ embeds: [errEmbed] });
        }

        const queue = interaction.client.DisTube.getQueue(interaction.guild);
        if(!queue) {
            const errEmbed = new EmbedBuilder()
                .setDescription(`The queue is empty`)
                .setColor(process.env.ERROR_COLOR);
            return interaction.reply({ embeds: [errEmbed] });
        }

        queue.stop();

        const stopEmbed = new EmbedBuilder()
            .setDescription('Stopped the queue')
            .setColor(process.env.MUSIC_COLOR);
        interaction.reply({ embeds: [stopEmbed] });
	},
}