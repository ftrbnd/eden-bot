const { EmbedBuilder, ActivityType } = require('discord.js');

module.exports = {
  name: 'ready',
  once: true,
  async execute(client) {
    // const songs = ['02:09', 'End Credits', 'Gravity', 'Nocturne', 'Interlude', 'Wake Up',
    // 'catch me if you can', 'Billie Jean', 'sex', 'drugs', 'and', 'rock + roll',
    // 'Fumes', 'XO', 'Circles', 'wrong', 'take care', 'start//end', 'wings', 'icarus',
    // 'lost//found', 'crash', 'gold', 'forever//over', 'float', 'wonder',
    // 'love; not wrong (brave)', 'falling in reverse', 'about time', 'stutter', 'all you need is love',
    // 'nowhere else', '909', 'good morning', 'in', 'hertz', 'static', 'projector',
    // 'love, death, distraction', 'how to sleep', 'calm down', 'just saying', 'fomo',
    // 'so far so good', 'isohel', 'tides', 'rushing', '$treams', '2020', 'out', 'untitled',
    // 'Peaked', 'Cold Feet', 'Stingray', 'cant help', '🔒 (demo)', 'Modern Warfare'];
    const songs = ['A Call', 'Balling', 'Sci-Fi', 'Modern Warfare', 'Waiting Room', 'Closer 2', 'PS1', 'Call Me Back', 'Duvidha', 'Elsewhere', 'Reaching 2'];
    // client.user.setPresence({ activities: [{ name: song, type: ActivityType.Listening}]});

    let updateDelay = 180; // seconds
    let currentIndex = 0;

    setInterval(() => {
      const activity = songs[currentIndex];

      client.user.setPresence({ activities: [{ name: activity, type: ActivityType.Listening }] });

      // update currentIndex
      // if it's the last one, get back to 0
      currentIndex = currentIndex >= songs.length - 1 ? 0 : currentIndex + 1;
    }, updateDelay * 1000);

    const logChannel = client.channels.cache.get(process.env.LOGS_CHANNEL_ID);
    if (logChannel) {
      const readyEmbed = new EmbedBuilder().setDescription(`**${client.user.tag}** has restarted and is now online`).setColor(process.env.CONFIRM_COLOR);
      logChannel.send({ embeds: [readyEmbed] });
    }

    console.log(`${client.user.tag} has restarted and is now online`);
  }
};
