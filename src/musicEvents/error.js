const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'error',
  async execute(channel, error) {
    console.error(error);

    const errEmbed = new EmbedBuilder().setTitle(`${error.name}: An error occurred.`).setDescription(error.message).setColor(process.env.ERROR_COLOR);

    channel.send({ embeds: [errEmbed] });
  }
};
