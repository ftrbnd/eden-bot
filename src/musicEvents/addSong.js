const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'addSong',
  async execute(queue, song) {
    const playEmbed = new EmbedBuilder().setDescription(`Queued [${song.name}](${song.url}) [${song.user}]`).setColor(process.env.MUSIC_COLOR);

    if (queue.textChannel) {
      queue.textChannel.send({ embeds: [playEmbed] });
    }
  }
};
