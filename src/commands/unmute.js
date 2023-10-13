const { EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unmute')
    .setDescription('Unmute a user by removing their unmuted role')
    .addUserOption((option) => option.setName('user').setDescription('The user to be ununmuted').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles), // any permission that the Helper role has access to should work

  async execute(interaction) {
    const userToUnmute = interaction.options.getUser('user');

    const modChannel = interaction.guild.channels.cache.get(process.env.MODERATORS_CHANNEL_ID);
    if (!modChannel) return;

    try {
      const userToUnmuteMember = interaction.guild.members.cache.get(`${userToUnmute.id}`);
      userToUnmuteMember.roles.set([]);
    } catch (err) {
      return console.error(err);
    }

    const logEmbed = new EmbedBuilder()
      .setTitle(userToUnmute.tag + ' was unmuted.')
      .addFields([
        { name: 'User ID: ', value: `${userToUnmute.id}` },
        { name: 'By: ', value: `${interaction.user}` }
      ])
      .setColor(process.env.CONFIRM_COLOR)
      .setThumbnail(userToUnmute.displayAvatarURL({ dynamic: true }))
      .setFooter({
        text: interaction.guild.name,
        iconURL: interaction.guild.iconURL({ dynamic: true })
      })
      .setTimestamp();
    modChannel.send({ embeds: [logEmbed] });

    const unmuteEmbed = new EmbedBuilder()
      .setTitle(`You were unmuted in **${interaction.guild.name}**.`)
      .setColor(process.env.CONFIRM_COLOR)
      .setFooter({
        text: interaction.guild.name,
        iconURL: interaction.guild.iconURL({ dynamic: true })
      })
      .setTimestamp();

    try {
      await userToUnmute.send({ embeds: [unmuteEmbed] });
    } catch (err) {
      return console.error(err);
    }

    const unmutedEmbed = new EmbedBuilder().setDescription(`${userToUnmute} was unmuted.`).setColor(process.env.CONFIRM_COLOR);
    interaction.reply({ embeds: [unmutedEmbed] });
  }
};
