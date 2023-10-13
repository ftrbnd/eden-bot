const { EmbedBuilder, SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('lockdown')
    .setDescription('In the event of large amounts of spam')
    .addSubcommand((subcommand) => subcommand.setName('close').setDescription('Close all text channels'))
    .addSubcommand((subcommand) => subcommand.setName('open').setDescription('Re-open all text channels'))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles), // any permission that the Helper role has access to should work

  async execute(interaction) {
    const roles = [
      interaction.guild.roles.cache.get('704966097434312766'), // server boosters
      interaction.guild.roles.cache.get('702225844113899591'), // no future
      interaction.guild.roles.cache.get('702225672147566642'), // vertigo
      interaction.guild.roles.cache.get('702226305164509185'), // ityttmom
      interaction.guild.roles.cache.get('702226350324318299'), // End Credits
      interaction.guild.roles.cache.get('655655072885374987')
    ]; // @everyone

    if (interaction.options.getSubcommand() === 'close') {
      // Close all text channels
      const removedPermissions = [
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.CreateInstantInvite,
        PermissionFlagsBits.ChangeNickname,
        PermissionFlagsBits.AddReactions,
        PermissionFlagsBits.UseExternalEmojis,
        PermissionFlagsBits.UseExternalStickers,
        PermissionFlagsBits.ReadMessageHistory,
        PermissionFlagsBits.Connect,
        PermissionFlagsBits.Speak,
        PermissionFlagsBits.Stream,
        PermissionFlagsBits.UseVAD,
        PermissionFlagsBits.RequestToSpeak
      ];

      roles.forEach((role) => role.setPermissions(removedPermissions));

      const confirmEmbed = new EmbedBuilder().setDescription(`**${interaction.guild.name}** is now on lockdown.`).setColor(process.env.ERROR_COLOR);
      interaction.reply({ embeds: [confirmEmbed] });
    } else if (interaction.options.getSubcommand() === 'open') {
      // Open all text channels
      const defaultPermissions = [
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.CreateInstantInvite,
        PermissionFlagsBits.ChangeNickname,
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.UsePublicThreads,
        PermissionFlagsBits.EmbedLinks,
        PermissionFlagsBits.AttachFiles,
        PermissionFlagsBits.AddReactions,
        PermissionFlagsBits.UseExternalEmojis,
        PermissionFlagsBits.UseExternalStickers,
        PermissionFlagsBits.ReadMessageHistory,
        PermissionFlagsBits.UseSlashCommands,
        PermissionFlagsBits.Connect,
        PermissionFlagsBits.Speak,
        PermissionFlagsBits.Stream,
        PermissionFlagsBits.UseVAD,
        PermissionFlagsBits.RequestToSpeak
      ];

      roles.forEach((role) => {
        role.setPermissions(defaultPermissions);
      });

      const confirmEmbed = new EmbedBuilder().setDescription(`**${interaction.guild.name}** is now open!`).setColor(process.env.CONFIRM_COLOR);
      interaction.reply({ embeds: [confirmEmbed] });
    }
  }
};
