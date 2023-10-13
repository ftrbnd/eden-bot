const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'guildMemberUpdate',
  async execute(oldMember, newMember) {
    const modChannel = newMember.guild.channels.cache.get(process.env.MODERATORS_CHANNEL_ID);
    if (!modChannel) return;

    if (oldMember.communicationDisabledUntil === null && newMember.communicationDisabledUntil !== null) {
      // a user is timed out
      const timeoutEmbed = new EmbedBuilder()
        .setTitle(`${newMember.user.username} was timed out.`)
        .addFields([
          { name: 'User: ', value: `${newMember.user}` },
          { name: 'ID: ', value: `${newMember.user.id}` }
        ])
        .setColor(process.env.ERROR_COLOR)
        .setThumbnail(newMember.user.displayAvatarURL({ dynamic: true }))
        .setFooter({
          text: newMember.guild.name,
          iconURL: newMember.guild.iconURL({ dynamic: true })
        })
        .setTimestamp();

      return modChannel.send({ embeds: [timeoutEmbed] });
    } else if (oldMember.communicationDisabledUntil !== null && newMember.communicationDisabledUntil === null) {
      // a timeout is removed
      const timeoutEmbed = new EmbedBuilder()
        .setTitle(`${newMember.user.username}'s timeout was removed.`)
        .addFields([
          { name: 'User: ', value: `${newMember.user}` },
          { name: 'ID: ', value: `${newMember.user.id}` }
        ])
        .setColor(process.env.CONFIRM_COLOR)
        .setThumbnail(newMember.user.displayAvatarURL({ dynamic: true }))
        .setFooter({
          text: newMember.guild.name,
          iconURL: newMember.guild.iconURL({ dynamic: true })
        })
        .setTimestamp();

      return modChannel.send({ embeds: [timeoutEmbed] });
    }

    // check if premium role was removed -> remove custom color role
    const logChannel = newMember.guild.channels.cache.get(process.env.LOGS_CHANNEL_ID);
    if (!logChannel) return;

    if (oldMember._roles.includes(process.env.SUBSCRIBER_ROLE_ID) && !newMember._roles.includes(process.env.SUBSCRIBER_ROLE_ID)) {
      const customColorRole = newMember.roles.cache.find((role) => role.name == 'Subscriber Custom Color');
      if (!customColorRole) return;

      newMember.roles.remove(customColorRole, 'No longer a premium member').then((member) => {
        if (customColorRole.members.size == 0) {
          customColorRole.delete('Role had 0 members left');
        }
      });

      const colorRemoveEmbed = new EmbedBuilder()
        .setTitle(`${newMember.user.tag} is no longer a Premium Member`)
        .setDescription(`Their custom color role was removed`)
        .setColor(customColorRole.hexColor)
        .setTimestamp();

      logChannel.send({ embeds: [colorRemoveEmbed] });
    }
  }
};
