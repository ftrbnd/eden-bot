import { ColorResolvable, EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder, TextChannel } from 'discord.js';
import { SlashCommand } from '../lib/types';
import sendErrorEmbed from '../lib/sendErrorEmbed';

const kickCommand: SlashCommand = {
  command: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Kick a user from the server')
    .addUserOption((option) => option.setName('user').setDescription('The user to be kicked').setRequired(true))
    .addStringOption((option) => option.setName('reason').setDescription('The reason for the kick').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator), // only the Server Moderator role can use this

  async execute(interaction) {
    const userToKick = interaction.options.getUser('user');
    const reasonForKick = interaction.options.getString('reason');
    if (!userToKick || !reasonForKick) return console.log('User or Reason not found');

    const modChannel = <TextChannel>interaction.guild?.channels.cache.get(process.env.MODERATORS_CHANNEL_ID!);
    if (!modChannel) return;

    try {
      await interaction.guild?.members.kick(userToKick, reasonForKick);
    } catch (err) {
      return sendErrorEmbed(interaction, err);
    }

    const logEmbed = new EmbedBuilder()
      .setTitle(userToKick.tag + ' was kicked.')
      .addFields([
        { name: 'User ID: ', value: `${userToKick.id}` },
        { name: 'By: ', value: `${interaction.user}` },
        { name: 'Reason: ', value: reasonForKick }
      ])
      .setColor(process.env.ERROR_COLOR as ColorResolvable)
      .setThumbnail(userToKick.displayAvatarURL())
      .setFooter({
        text: interaction.guild?.name ?? 'Server Name',
        iconURL: interaction.guild?.iconURL() ?? 'Server Icon'
      })
      .setTimestamp();
    modChannel.send({ embeds: [logEmbed] });

    const kickEmbed = new EmbedBuilder()
      .setTitle(`You were kicked from **${interaction.guild?.name}**.`)
      .setDescription(reasonForKick)
      .setColor(process.env.ERROR_COLOR as ColorResolvable)
      .setFooter({
        text: interaction.guild?.name ?? 'Server Name',
        iconURL: interaction.guild?.iconURL() ?? 'Server Icon'
      })
      .setTimestamp();

    try {
      await userToKick.send({ embeds: [kickEmbed] });
    } catch (err) {
      return console.error(err);
    }

    const kickedEmbed = new EmbedBuilder().setDescription(`${userToKick} was kicked.`).setColor(process.env.CONFIRM_COLOR as ColorResolvable);
    await interaction.reply({ embeds: [kickedEmbed] });
  }
};

export default kickCommand;
