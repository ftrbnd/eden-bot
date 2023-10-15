import { EmbedBuilder, ChannelType, ColorResolvable, VoiceChannel, TextChannel } from 'discord.js';
import { BotEvent } from '../lib/types';

const channelUpdateEvent: BotEvent = {
  name: 'channelUpdate',
  execute: async (oldChannel: TextChannel | VoiceChannel, newChannel: TextChannel | VoiceChannel) => {
    const logChannel = <TextChannel>oldChannel.guild.channels.cache.get(process.env.LOGS_CHANNEL_ID!);
    if (!logChannel) return;

    const channelType = oldChannel.type === ChannelType.GuildText ? 'text' : 'voice'; // if oldChannel type is GUILD_TEXT, then set channelType to text

    if (oldChannel.name != newChannel.name) {
      const changedEmbed = new EmbedBuilder()
        .setTitle(`A ${channelType} channel's name was changed.`)
        .addFields([
          { name: 'Previous name', value: oldChannel.name },
          { name: 'New name', value: newChannel.name }
        ])
        .setColor(process.env.CONFIRM_COLOR as ColorResolvable)
        .setFooter({
          text: `${oldChannel.guild.name}` ?? 'Server Name',
          iconURL: oldChannel.guild.iconURL() ?? 'Server Icon'
        })
        .setTimestamp();

      logChannel.send({ embeds: [changedEmbed] });
    }
  }
};

export default channelUpdateEvent;
