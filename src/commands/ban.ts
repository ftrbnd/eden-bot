import { ColorResolvable, EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder, TextChannel } from 'discord.js';
import { SlashCommand } from '../lib/types';
import sendErrorEmbed from '../lib/sendErrorEmbed';

const banCommand: SlashCommand = {
  command: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Ban a user from the server')
    .addUserOption((option) => option.setName('user').setDescription('The user to be banned').setRequired(true))
    .addStringOption((option) => option.setName('reason').setDescription('The reason for the ban').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator), // only the Server Moderator role can use this

  async execute(interaction) {
    const userToBan = interaction.options.getUser('user');
    const reasonForBan = interaction.options.getString('reason');
    if (!userToBan || !reasonForBan || !interaction.guild) return console.log('User or Reason not found');
    const modChannel = <TextChannel>interaction.guild.channels.cache.get(process.env.MODERATORS_CHANNEL_ID!);
    if (!modChannel) return console.log('Mod channel not found');
    try {
      await interaction.guild.members.ban(userToBan, { reason: reasonForBan });
    } catch (err) {
      return sendErrorEmbed(interaction, err);
    }

    const logEmbed = new EmbedBuilder()
      .setTitle(userToBan.tag + ' was banned.')
      .addFields([
        { name: 'User ID: ', value: `${userToBan.id}` },
        { name: 'By: ', value: `${interaction.user}` },
        { name: 'Reason: ', value: reasonForBan }
      ])
      .setColor(process.env.ERROR_COLOR as ColorResolvable)
      .setThumbnail(userToBan.displayAvatarURL())
      .setFooter({
        text: interaction.guild.name,
        iconURL: interaction.guild.iconURL() ?? ''
      })
      .setTimestamp();
    modChannel.send({ embeds: [logEmbed] });

    const banEmbed = new EmbedBuilder()
      .setTitle(`You were banned from **${interaction.guild?.name}**.`)
      .setDescription(reasonForBan)
      .setColor(process.env.ERROR_COLOR as ColorResolvable)
      .setFooter({
        text: interaction.guild?.name,
        iconURL: interaction.guild?.iconURL() ?? ''
      })
      .setTimestamp();

    try {
      await userToBan.send({ embeds: [banEmbed] });
    } catch (err) {
      console.error(err);
      const msgFailEmbed = new EmbedBuilder().setDescription(`Failed to send message to ${userToBan}.`).setColor(process.env.CONFIRM_COLOR as ColorResolvable);
      modChannel.send({ embeds: [msgFailEmbed] });
    }

    const bannedEmbed = new EmbedBuilder().setDescription(`${userToBan} was banned.`).setColor(process.env.CONFIRM_COLOR as ColorResolvable);
    await interaction.reply({ embeds: [bannedEmbed] });
  }
};

export default banCommand;
