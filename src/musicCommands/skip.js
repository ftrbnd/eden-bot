const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('skip')
		.setDescription('Skip the current song in the queue'),
		
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
                .setDescription(`The queue is empty!`)
                .setColor(process.env.ERROR_COLOR);
            return interaction.reply({ embeds: [errEmbed] });
        }

        if(queue.songs.length == 1) {
            queue.stop();

            const skipEndEmbed = new EmbedBuilder()
                .setDescription(`Skipped **${queue.songs[0].name}** and the queue is now empty`)
                .setColor(process.env.MUSIC_COLOR);
            return interaction.reply({ embeds: [skipEndEmbed] });
        }

        try {
            const song = await queue.skip();

            const queueEmbed = new EmbedBuilder()
                .setDescription(`Skipped to **${song.name}**`)
                .setColor(process.env.MUSIC_COLOR);
            interaction.reply({ embeds: [queueEmbed] });

        } catch(error) {
            console.error(error);
            const errEmbed = new EmbedBuilder()
                .setDescription(`An error occurred in /skip.`)
                .setColor(process.env.ERROR_COLOR);
            interaction.reply({ embeds: [errEmbed] });
        }
	},
}