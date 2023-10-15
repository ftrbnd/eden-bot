import { ColorResolvable, EmbedBuilder, GuildBan, TextChannel } from 'discord.js';
import { BotEvent } from '../lib/types';

const guildBanAddEvent: BotEvent = {
  name: 'guildBanAdd',
  execute: async (ban: GuildBan) => {
    const modChannel = <TextChannel>ban.guild.channels.cache.get(process.env.MODERATORS_CHANNEL_ID!);
    if (!modChannel) return;

    const logEmbed = new EmbedBuilder()
      .setTitle(`${ban.user.username} was banned.`)
      .addFields([
        { name: 'User: ', value: `${ban.user}` },
        { name: 'ID: ', value: `${ban.user.id}` }
      ])
      .setColor(process.env.ERROR_COLOR as ColorResolvable)
      .setThumbnail(ban.user.displayAvatarURL())
      .setFooter({
        text: ban.guild.name,
        iconURL: ban.guild.iconURL() ?? 'Server Icon'
      })
      .setTimestamp();

    modChannel.send({ embeds: [logEmbed] });
  }
};

export default guildBanAddEvent;
