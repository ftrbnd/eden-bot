const { EmbedBuilder } = require('discord.js')

module.exports = {
    async execute(interaction, error) {
        const textChannel = interaction.channel;

        const errorEmbed = new EmbedBuilder()
            .setTitle(error.name)
            .setDescription(error.message)
            .setColor(process.env.ERROR_COLOR);
        
        textChannel.send({ embeds: [errorEmbed] });
    }
}