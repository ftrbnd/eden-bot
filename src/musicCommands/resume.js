const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('resume')
		.setDescription('Resume playing the song'),
		
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

        if(!queue.paused) {
            const errEmbed = new EmbedBuilder()
                .setDescription(`The queue is already playing`)
                .setColor(process.env.ERROR_COLOR);
            return interaction.reply({ embeds: [errEmbed] });
        }
         
        queue.resume();
        const pauseEmbed = new EmbedBuilder()
            .setDescription(`Resumed the queue`)
            .setColor(process.env.MUSIC_COLOR);
        interaction.reply({ embeds: [pauseEmbed] });
	},
}