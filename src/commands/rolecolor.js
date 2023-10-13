const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const { validateHTMLColorHex } = require('validate-color');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rolecolor')
    .setDescription('Set your custom color')
    .addStringOption((option) => option.setName('hex').setDescription('hex color code (ex: #8dbff3)').setRequired(true)),

  async execute(interaction) {
    if (!interaction.member.roles.cache.has(process.env.SUBSCRIBER_ROLE_ID)) {
      const permsEmbed = new EmbedBuilder()
        .setTitle('You are not a Server Subscriber!')
        .setDescription(`https://discord.com/channels/${interaction.guild.id}/role-subscriptions`)
        .setColor(process.env.ERROR_COLOR);
      return interaction.reply({ embeds: [permsEmbed], ephemeral: true });
    }

    let color = interaction.options.getString('hex');
    if (!color.startsWith('#')) color = `#${color}`;

    if (!validateHTMLColorHex(color)) {
      const permsEmbed = new EmbedBuilder().setDescription('Please enter a valid hex color code.').setColor(process.env.ERROR_COLOR);
      return interaction.reply({ embeds: [permsEmbed], ephemeral: true });
    }

    let verb;
    if (interaction.member.roles.cache.find((role) => role.name == 'Subscriber Custom Color')) {
      const colorRole = interaction.member.roles.cache.find((role) => role.name == 'Subscriber Custom Color');
      colorRole.setColor(color);
      verb = 'Updated';
    } else {
      const colorRole = await interaction.guild.roles.create({
        name: 'Subscriber Custom Color',
        color: color,
        position: interaction.guild.roles.cache.get(process.env.TIER_3_ROLE_ID).position + 1
      });

      interaction.member.roles.add(colorRole);
      verb = 'Set';
    }

    const confirmEmbed = new EmbedBuilder().setDescription(`${verb} your custom color to ${color}`).setColor(color);
    interaction.reply({ embeds: [confirmEmbed] });
  }
};
