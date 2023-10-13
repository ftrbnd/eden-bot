const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'finish',
  async execute(queue) {
    const finishEmbed = new EmbedBuilder().setDescription(`The queue has finished playing`).setColor(process.env.MUSIC_COLOR);

    if (queue.textChannel) {
      queue.textChannel.send({ embeds: [finishEmbed] });
    }
  }
};
