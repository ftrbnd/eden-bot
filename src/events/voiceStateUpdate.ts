import { EmbedBuilder, PermissionFlagsBits, ChannelType, VoiceState, ColorResolvable, TextChannel } from 'discord.js';
import { BotEvent } from '../lib/types';

const voiceStateUpdateEvent: BotEvent = {
  name: 'voiceStateUpdate',
  execute: async (oldState: VoiceState, newState: VoiceState) => {
    if (newState.member?.user.bot) return; // ignore bots

    const logChannel = <TextChannel>oldState.guild.channels.cache.get(process.env.LOGS_CHANNEL_ID!);
    if (!logChannel) return;
    const voiceChat = <TextChannel>oldState.guild.channels.cache.get(process.env.VOICE_CHAT!);
    if (!voiceChat) return;

    if (newState.channel !== null && newState.channel.id === process.env.JOIN_TO_CREATE!) {
      // if they join the 'join to create' vc
      const parentCategory = newState.channel.parent;

      const customVoiceChannel = await newState.guild.channels.create({
        name: `${newState.member?.displayName}'s channel`,
        type: ChannelType.GuildVoice,
        parent: parentCategory,
        permissionOverwrites: [
          {
            id: newState.member?.id ?? 'fakeid',
            allow: [PermissionFlagsBits.ManageChannels]
          }
        ]
      });
      await newState.setChannel(customVoiceChannel);

      const helloEmbed = new EmbedBuilder()
        .setDescription(
          'You just created your own voice channel! Feel free to edit the channel name to let others know what your channel is about. \nNOTE: Make sure you have **Two-Factor Authentication** enabled on your Discord account.'
        )
        .setColor(process.env.CONFIRM_COLOR as ColorResolvable)
        .setFooter({
          text: newState.guild.name,
          iconURL: newState.guild.iconURL() ?? 'Server Icon'
        });

      const sentMessage = await voiceChat.send({ content: `${newState.member}`, embeds: [helloEmbed] });
      setTimeout(() => {
        sentMessage.delete();
      }, 60000);

      const vcUpdateEmbed = new EmbedBuilder()
        .setDescription(`${newState.member?.user.tag} created **${customVoiceChannel.name}**`)
        .setColor(process.env.CONFIRM_COLOR as ColorResolvable)
        .setFooter({
          text: `User ID: ${newState.member?.user.id}`,
          iconURL: newState.member?.user.displayAvatarURL()
        });
      return logChannel.send({ embeds: [vcUpdateEmbed] });
    }

    if (!oldState.channel) {
      // if they join a channel
      const joinEmbed = new EmbedBuilder()
        .setDescription(`${newState.member?.user} joined **${newState.channel?.name}**`)
        .setColor(process.env.CONFIRM_COLOR as ColorResolvable)
        .setTimestamp()
        .setFooter({
          text: `User ID: ${newState.member?.user.id}`,
          iconURL: newState.member?.user.displayAvatarURL()
        });

      return logChannel.send({ embeds: [joinEmbed] });
    } else if (!newState.channel) {
      // if they leave a channel
      const leaveEmbed = new EmbedBuilder()
        .setDescription(`${oldState.member?.user} left **${oldState.channel.name}**`)
        .setColor(process.env.ERROR_COLOR as ColorResolvable)
        .setTimestamp()
        .setFooter({
          text: `User ID: ${oldState.member?.user.id}`,
          iconURL: oldState.member?.user.displayAvatarURL()
        });

      logChannel.send({ embeds: [leaveEmbed] });
    }

    if (oldState.channel.members.size === 0 && oldState.channel.parent?.id === process.env.JOIN_TO_CREATE_CATEGORY_ID && oldState.channel.id !== process.env.JOIN_TO_CREATE_ID) {
      // once a custom channel is empty
      const vcUpdateEmbed = new EmbedBuilder()
        .setDescription(`**${oldState.channel.name}** was deleted after being empty.`)
        .setColor(process.env.ERROR_COLOR as ColorResolvable)
        .setTimestamp();

      oldState.channel.delete(`**${oldState.channel.name}** was deleted after being empty.`);

      logChannel.send({ embeds: [vcUpdateEmbed] });
    } else if (oldState.channel.members.size === 1 && oldState.channel.members.has(process.env.CLIENT_ID!) && oldState.channel.parentId === process.env.JOIN_TO_CREATE_CATEGORY_ID) {
      // bot is only one left in custom channel
      const vcUpdateEmbed = new EmbedBuilder()
        .setDescription(`**${oldState.channel.name}** was deleted after being empty.`)
        .setColor(process.env.ERROR_COLOR as ColorResolvable)
        .setTimestamp();

      oldState.channel.delete(`**${oldState.channel.name}** was deleted after being empty.`);

      logChannel.send({ embeds: [vcUpdateEmbed] });
    }
  }
};

export default voiceStateUpdateEvent;
