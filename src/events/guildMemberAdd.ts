import { ColorResolvable, EmbedBuilder, GuildMember, TextChannel } from 'discord.js';
import { BotEvent } from '../lib/types';

const guildMemberAddEvent: BotEvent = {
  name: 'guildMemberAdd',
  execute: async (member: GuildMember) => {
    const welcomeChannel = <TextChannel>member.guild.channels.cache.get(process.env.WELCOME_CHANNEL_ID!);
    if (!welcomeChannel) return;
    const rolesChannel = <TextChannel>member.guild.channels.cache.get(process.env.ROLES_CHANNEL_ID!);
    if (!rolesChannel) return;

    const welcomeEmbed = new EmbedBuilder()
      .setAuthor({
        name: member.displayName + ' just joined the server!',
        iconURL: member.user.displayAvatarURL()
      })
      .setColor(process.env.CONFIRM_COLOR as ColorResolvable)
      .setThumbnail(member.user.displayAvatarURL())
      .setDescription(`Go to ${rolesChannel} to pick your favorite EP/album, and a color will be added to your name.`)
      .setFooter({
        text: member.guild.name,
        iconURL: member.guild.iconURL() ?? 'Server Icon'
      })
      .setTimestamp();

    welcomeChannel.send({ content: `${member}`, embeds: [welcomeEmbed] });
  }
};

export default guildMemberAddEvent;
