const { EmbedBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');

module.exports = {
  name: 'voiceStateUpdate',
  async execute(oldState, newState) {
    if (newState.member.user.bot) return; // ignore bots

    const logChannel = oldState.guild.channels.cache.get(process.env.LOGS_CHANNEL_ID);
    if (!logChannel) return;
    const voiceChat = oldState.guild.channels.cache.get(process.env.VOICE_CHAT_ID);
    if (!voiceChat) return;

    if (newState.channel !== null && newState.channel.id === process.env.JOIN_TO_CREATE_ID) {
      // if they join the 'join to create' vc
      const parentCategory = newState.channel.parent;

      const customVoiceChannel = await newState.guild.channels.create({
        name: `${newState.member.displayName}'s channel`,
        type: ChannelType.GuildVoice,
        parent: parentCategory,
        PermissionOverwrites: [
          {
            id: newState.member.id,
            allow: [PermissionFlagsBits.ManageChannels]
          }
        ]
      });
      await newState.setChannel(customVoiceChannel);

      const helloEmbed = new EmbedBuilder()
        .setDescription(
          'You just created your own voice channel! Feel free to edit the channel name to let others know what your channel is about. \nNOTE: Make sure you have **Two-Factor Authentication** enabled on your Discord account.'
        )
        .setColor(process.env.CONFIRM_COLOR)
        .setFooter({
          text: newState.guild.name,
          iconURL: newState.guild.iconURL({ dynamic: true })
        });

      voiceChat.send({ content: `${newState.member}`, embeds: [helloEmbed] }).then((message) => {
        setTimeout(() => message.delete(), 60000); // delete after one minute
      });

      const vcUpdateEmbed = new EmbedBuilder()
        .setDescription(`${newState.member.user.tag} created **${customVoiceChannel.name}**`)
        .setColor(process.env.CONFIRM_COLOR)
        .setFooter({
          text: `User ID: ${newState.member.user.id}`,
          iconURL: newState.member.user.displayAvatarURL({ dynamic: true })
        });
      return logChannel.send({ embeds: [vcUpdateEmbed] });
    }

    if (!oldState.channel) {
      // if they join a channel
      const joinEmbed = new EmbedBuilder()
        .setDescription(`${newState.member.user} joined **${newState.channel.name}**`)
        .setColor(process.env.CONFIRM_COLOR)
        .setTimestamp()
        .setFooter({
          text: `User ID: ${newState.member.user.id}`,
          iconURL: newState.member.user.displayAvatarURL({ dynamic: true })
        });

      return logChannel.send({ embeds: [joinEmbed] });
    } else if (!newState.channel) {
      // if they leave a channel
      const leaveEmbed = new EmbedBuilder()
        .setDescription(`${oldState.member.user} left **${oldState.channel.name}**`)
        .setColor(process.env.ERROR_COLOR)
        .setTimestamp()
        .setFooter({
          text: `User ID: ${oldState.member.user.id}`,
          iconURL: oldState.member.user.displayAvatarURL({ dynamic: true })
        });

      logChannel.send({ embeds: [leaveEmbed] });
    }

    if (oldState.channel.members.size === 0 && oldState.channel.parent.id === process.env.JOIN_TO_CREATE_CATEGORY_ID && oldState.channel.id !== process.env.JOIN_TO_CREATE_ID) {
      // once a custom channel is empty
      const vcUpdateEmbed = new EmbedBuilder().setDescription(`**${oldState.channel.name}** was deleted after being empty.`).setColor(process.env.ERROR_COLOR).setTimestamp();

      oldState.channel.delete(`**${oldState.channel.name}** was deleted after being empty.`);

      logChannel.send({ embeds: [vcUpdateEmbed] });
    } else if (oldState.channel.members.size === 1 && oldState.channel.members.has(process.env.CLIENT_ID) && oldState.channel.parentId === process.env.JOIN_TO_CREATE_CATEGORY_ID) {
      // bot is only one left in custom channel
      const vcUpdateEmbed = new EmbedBuilder().setDescription(`**${oldState.channel.name}** was deleted after being empty.`).setColor(process.env.ERROR_COLOR).setTimestamp();

      oldState.channel.delete(`**${oldState.channel.name}** was deleted after being empty.`);

      logChannel.send({ embeds: [vcUpdateEmbed] });
    }
  }
};
