const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'guildMemberAdd',
  async execute(member) {
    const welcomeChannel = member.guild.channels.cache.get(process.env.WELCOME_CHANNEL_ID);
    if (!welcomeChannel) return;
    const rolesChannel = member.guild.channels.cache.get(process.env.ROLES_CHANNEL_ID);
    if (!rolesChannel) return;

    const welcomeEmbed = new EmbedBuilder()
      .setAuthor({
        name: member.displayName + ' just joined the server!',
        iconURL: member.user.displayAvatarURL({ dynamic: true })
      })
      .setColor(process.env.CONFIRM_COLOR)
      .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
      .setDescription(`Go to ${rolesChannel} to pick your favorite EP/album, and a color will be added to your name.`)
      .setFooter({
        text: member.guild.name,
        iconURL: member.guild.iconURL({ dynamic: true })
      })
      .setTimestamp();

    welcomeChannel.send({ content: `${member}`, embeds: [welcomeEmbed] });
  }
};
