import { ColorResolvable, EmbedBuilder, GuildMember, TextChannel } from 'discord.js';
import { BotEvent } from '../lib/types';

const guildMemberRemoveEvent: BotEvent = {
  name: 'guildMemberRemove',
  execute: async (member: GuildMember) => {
    const logChannel = <TextChannel>member.guild.channels.cache.get(process.env.LOGS_CHANNEL_ID!);
    if (!logChannel) return;

    const leaveEmbed = new EmbedBuilder()
      .setAuthor({
        name: member.displayName + ' has left the server.',
        iconURL: member.user.displayAvatarURL()
      })
      .addFields([{ name: 'User ID: ', value: `${member.user.id}` }])
      .setColor(process.env.ERROR_COLOR as ColorResolvable)
      .setThumbnail(member.user.displayAvatarURL())
      .setFooter({
        text: member.guild.name,
        iconURL: member.guild.iconURL() ?? 'Server Icon'
      })
      .setTimestamp();

    logChannel.send({ embeds: [leaveEmbed] });
  }
};

export default guildMemberRemoveEvent;
