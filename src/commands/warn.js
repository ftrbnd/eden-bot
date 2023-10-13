const { EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } = require('discord.js');
const User = require('../schemas/UserSchema');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('warn')
    .setDescription('Warn a user')
    .addUserOption((option) => option.setName('user').setDescription('The user to be warned').setRequired(true))
    .addStringOption((option) => option.setName('reason').setDescription('The reason for the warn').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles), // any permission that the Helper role has access to should work

  async execute(interaction) {
    const userToWarn = interaction.options.getUser('user');
    const reasonForWarn = interaction.options.getString('reason');
    const modChannel = interaction.guild.channels.cache.get(process.env.MODERATORS_CHANNEL_ID);
    if (!modChannel) return;

    let warnCount;
    await User.findOne({ discordId: userToWarn.id }, (err, data) => {
      if (err) return console.error(err);

      if (!data) {
        // if the user isn't already in the database, add their data
        User.create({
          discordId: userToWarn.id,
          username: userToWarn.username,
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
        data.username = userToWarn.username;
        data.save();
        warnCount = data.warnings;
      }

      const logEmbed = new EmbedBuilder()
        .setTitle(userToWarn.tag + ' was warned.')
        .addFields([
          { name: 'User ID: ', value: `${userToWarn.id}` },
          { name: 'By: ', value: `${interaction.user}` },
          { name: 'Reason: ', value: reasonForWarn },
          { name: 'Warnings: ', value: `${warnCount}` }
        ])
        .setColor('ffd100')
        .setThumbnail(userToWarn.displayAvatarURL({ dynamic: true }))
        .setFooter({
          text: interaction.guild.name,
          iconURL: interaction.guild.iconURL({ dynamic: true })
        })
        .setTimestamp();
      modChannel.send({ embeds: [logEmbed] });

      const warnEmbed = new EmbedBuilder()
        .setTitle(`You were warned in **${interaction.guild.name}**.`)
        .setDescription(reasonForWarn)
        .addFields([{ name: 'Warnings: ', value: `${warnCount}` }])
        .setColor('ffd100')
        .setFooter({
          text: interaction.guild.name,
          iconURL: interaction.guild.iconURL({ dynamic: true })
        })
        .setTimestamp();

      try {
        userToWarn.send({ embeds: [warnEmbed] });
      } catch (err) {
        return console.error(err);
      }

      const warnedEmbed = new EmbedBuilder().setDescription(`${userToWarn} was warned.`).setColor('ffd100');
      interaction.reply({ embeds: [warnedEmbed] });
    }).clone();
  }
};
