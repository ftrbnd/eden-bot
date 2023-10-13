const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('repeat')
		.setDescription('Repeat the current song, queue, or turn repeat off')
        .addIntegerOption(option => 
            option.setName('mode')
            .setDescription('The repeat mode')
            .setRequired(true)
            .addChoices(
                { name: 'Off', value: 0 },
                { name: 'Song', value: 1 },
                { name: 'Queue', value: 2 },
            )),
		
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
                .setColor(process.env.ERROR_COLOR)
            return interaction.reply({ embeds: [errEmbed] })
        }

        let mode = interaction.options.getInteger('mode');
        mode = queue.setRepeatMode(mode);

        let repeatMode = '';
        switch(mode) {
            case 0:
                repeatMode = 'Off';
                break;
            case 1:
                repeatMode = 'Song';
                break;
            case 2:
                repeatMode = 'Queue';
                break;
        }

        const repeatEmbed = new EmbedBuilder()
            .setDescription(`Set repeat mode to **${repeatMode}**`)
            .setColor(process.env.MUSIC_COLOR);
        interaction.reply({ embeds: [repeatEmbed] });
	},
}