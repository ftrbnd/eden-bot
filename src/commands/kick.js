const { EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Kick a user from the server')
    .addUserOption((option) => option.setName('user').setDescription('The user to be kicked').setRequired(true))
    .addStringOption((option) => option.setName('reason').setDescription('The reason for the kick').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator), // only the Server Moderator role can use this command

  async execute(interaction) {
    const userToKick = interaction.options.getUser('user');
    const reasonForKick = interaction.options.getString('reason');

    const modChannel = interaction.guild.channels.cache.get(process.env.MODERATORS_CHANNEL_ID);
    if (!modChannel) return;

    try {
      interaction.guild.members.kick(userToKick, (options = { reason: reasonForKick }));
    } catch (err) {
      return console.log(err);
    }

    const logEmbed = new EmbedBuilder()
      .setTitle(userToKick.tag + ' was kicked.')
      .addFields([
        { name: 'User ID: ', value: `${userToKick.id}` },
        { name: 'By: ', value: `${interaction.user}` },
        { name: 'Reason: ', value: reasonForKick }
      ])
      .setColor(process.env.ERROR_COLOR)
      .setThumbnail(userToKick.displayAvatarURL({ dynamic: true }))
      .setFooter({
        text: interaction.guild.name,
        iconURL: interaction.guild.iconURL({ dynamic: true })
      })
      .setTimestamp();
    modChannel.send({ embeds: [logEmbed] });

    const kickEmbed = new EmbedBuilder()
      .setTitle(`You were kicked from **${interaction.guild.name}**.`)
      .setDescription(reasonForKick)
      .setColor(process.env.ERROR_COLOR)
      .setFooter({
        text: interaction.guild.name,
        iconURL: interaction.guild.iconURL({ dynamic: true })
      })
      .setTimestamp();

    try {
      await userToKick.send({ embeds: [kickEmbed] });
    } catch (err) {
      return console.error(err);
    }

    const kickedEmbed = new EmbedBuilder().setDescription(`${userToKick} was kicked.`).setColor(process.env.CONFIRM_COLOR);
    interaction.reply({ embeds: [kickedEmbed] });
  }
};
