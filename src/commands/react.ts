import { EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder, ChannelType, TextChannel, ComponentEmojiResolvable, ColorResolvable } from 'discord.js';
import { SlashCommand } from '../lib/types';

const reactCommand: SlashCommand = {
  command: new SlashCommandBuilder()
    .setName('react')
    .setDescription('React to the newest message in a channel')
    .addChannelOption((option) => option.setName('channel').setDescription('The name of the channel').addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement).setRequired(true))
    .addStringOption((option) => option.setName('emoji').setDescription('The emoji to react with').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const channel = <TextChannel>interaction.options.getChannel('channel');
    const emoji = interaction.options.getString('emoji');
    if (!channel || !emoji) return console.log('Channel or Emoji not found');

    try {
      channel.lastMessage?.react(emoji);

      const confirmEmbed = new EmbedBuilder().setDescription(`Reacted to ${channel.lastMessage} with ${emoji}`).setColor(process.env.CONFIRM_COLOR as ColorResolvable);
      interaction.reply({ embeds: [confirmEmbed], ephemeral: true });
    } catch (err) {
      console.error(err);
      const errorEmbed = new EmbedBuilder().setDescription(`Failed to react with ${emoji}`).setColor(process.env.ERROR_COLOR as ColorResolvable);
      interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }
  }
};

export default reactCommand;
