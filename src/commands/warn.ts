import { APIEmbedField, ColorResolvable, EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder, TextChannel } from 'discord.js';
import User, { UserDocument } from '../schemas/UserSchema';
import { SlashCommand } from '../lib/types';

const warnCommand: SlashCommand = {
  command: new SlashCommandBuilder()
    .setName('warn')
    .setDescription('Warn a user')
    .addUserOption((option) => option.setName('user').setDescription('The user to be warned').setRequired(true))
    .addStringOption((option) => option.setName('reason').setDescription('The reason for the warn').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles), // any permission that the Helper role has access to should work

  async execute(interaction) {
    const userToWarn = interaction.options.getUser('user');
    const reasonForWarn = interaction.options.getString('reason');
    const modChannel = <TextChannel>interaction.guild?.channels.cache.get(process.env.MODERATORS_CHANNEL_ID!);
    if (!modChannel) return;

    let warnCount;
    await User.findOne({ discordId: userToWarn?.id }, (err: any, data: UserDocument) => {
      if (err) return console.error(err);

      if (!data) {
        // if the user isn't already in the database, add their data
        User.create({
          discordId: userToWarn?.id,
          username: userToWarn?.username,
          warnings: 1
        }).catch((err) => console.log(err));
        warnCount = 1;
      } else {
        // if they already were in the database, simply update and save
        if (!data.warnings) {
          data.warnings = 1;
        } else {
          data.warnings += 1;
        }
        data.username = userToWarn?.username ?? 'Username';
        data.save();
        warnCount = data.warnings;
      }

      const fields: APIEmbedField[] = [
        { name: 'User ID: ', value: `${userToWarn?.id}` },
        { name: 'By: ', value: `${interaction.user}` },
        { name: 'Reason: ', value: reasonForWarn ?? 'Reason' },
        { name: 'Warnings: ', value: `${warnCount}` }
      ];
      const logEmbed = new EmbedBuilder()
        .setTitle(userToWarn?.tag + ' was warned.')
        .addFields(fields)
        .setColor('ffd100' as ColorResolvable)
        .setThumbnail(userToWarn?.displayAvatarURL() ?? 'Avatar URL')
        .setFooter({
          text: interaction.guild?.name ?? 'Server Name',
          iconURL: interaction.guild?.iconURL() ?? 'Server Icon'
        })
        .setTimestamp();
      modChannel.send({ embeds: [logEmbed] });

      const warnEmbed = new EmbedBuilder()
        .setTitle(`You were warned in **${interaction.guild?.name}**.`)
        .setDescription(reasonForWarn)
        .addFields([{ name: 'Warnings: ', value: `${warnCount}` }])
        .setColor('ffd100' as ColorResolvable)
        .setFooter({
          text: interaction.guild?.name ?? 'Server Name',
          iconURL: interaction.guild?.iconURL() ?? 'Server Icon'
        })
        .setTimestamp();

      try {
        userToWarn?.send({ embeds: [warnEmbed] });
      } catch (err) {
        return console.error(err);
      }

      const warnedEmbed = new EmbedBuilder().setDescription(`${userToWarn} was warned.`).setColor('ffd100' as ColorResolvable);
      interaction.reply({ embeds: [warnedEmbed] });
    }).clone();
  }
};

export default warnCommand;
