const { EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const Giveaway = require('../schemas/GiveawaySchema');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('giveaway')
    .setDescription('Run a giveaway')
    .addSubcommand((subcommand) =>
      subcommand
        .setName('start')
        .setDescription('Start a giveaway')
        .addStringOption((option) => option.setName('prize').setDescription('The giveaway prize').setRequired(true))
        .addStringOption((option) => option.setName('description').setDescription('A short description').setRequired(true))
        .addStringOption((option) =>
          option.setName('unit').setDescription('unit of time').addChoices({ name: 'Minutes', value: 'minutes' }, { name: 'Hours', value: 'hours' }, { name: 'Days', value: 'days' }).setRequired(true)
        )
        .addIntegerOption((option) => option.setName('amount').setDescription('amount of specified time unit').setMinValue(1).setRequired(true))
        .addStringOption((option) => option.setName('image').setDescription('The image url').setRequired(false))
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('end')
        .setDescription('End a currently running giveaway')
        .addStringOption((option) => option.setName('id').setDescription('The giveaway id in the database').setRequired(true))
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator), // only the Server Moderator role can use this command

  async execute(interaction) {
    const announcementChannel = interaction.guild.channels.cache.get(process.env.ANNOUNCEMENTS_CHANNEL_ID);

    if (interaction.options.getSubcommand() === 'start') {
      const prize = interaction.options.getString('prize');
      const description = interaction.options.getString('description');
      const imageURL = interaction.options.getString('image');

      const endDate = new Date();

      const unit = interaction.options.getString('unit');
      const amount = interaction.options.getInteger('amount');
      switch (unit) {
        case 'minutes':
          endDate.setMinutes(endDate.getMinutes() + amount);
          break;
        case 'hours':
          endDate.setHours(endDate.getHours() + amount);
          break;
        case 'days':
          endDate.setDate(endDate.getDate() + amount);
          break;
      }
      const timestamp = `${endDate.getTime()}`.substring(0, 10);

      const giveaway = new Giveaway({
        prize,
        description,
        endDate,
        imageURL
      });

      giveaway.save(function (err) {
        if (err) {
          const errEmbed = new EmbedBuilder().setDescription(`An error occurred, please try againE`).setColor(process.env.ERROR_COLOR);
          interaction.reply({ embeds: [errEmbed] });
          return console.error(err);
        }

        console.log(`Saved ${prize} giveaway to database!`);

        const giveawayEmbed = new EmbedBuilder()
          .setTitle(`Giveaway: ${prize}`)
          .setDescription(description)
          .addFields([{ name: 'End Date', value: `<t:${timestamp}>` }])
          .setColor(process.env.GIVEAWAY_COLOR);
        if (imageURL) giveawayEmbed.setThumbnail(imageURL);

        const row = new ActionRowBuilder().addComponents(
          new ButtonBuilder().setCustomId(giveaway.id).setStyle(ButtonStyle.Primary).setEmoji(process.env.GIVEAWAY_EMOJI_ID),
          new ButtonBuilder().setLabel('Subscribe').setStyle(ButtonStyle.Link).setURL(`https://discord.com/channels/${interaction.guild.id}/role-subscriptions`)
        );

        announcementChannel.send({ embeds: [giveawayEmbed], components: [row] });

        const confirmEmbed = new EmbedBuilder()
          .setDescription(`Started giveaway for **${prize}** in ${announcementChannel}, ends in ${amount} ${amount == 1 ? unit.substring(0, unit.length - 1) : unit}`)
          .addFields([{ name: 'End Date', value: `<t:${timestamp}>` }])
          .setColor(process.env.CONFIRM_COLOR);

        interaction.reply({ embeds: [confirmEmbed] });
      });
    } else if (interaction.options.getSubcommand() === 'end') {
      interaction.reply({ content: `hi` });
    }
  }
};
