import { ColorResolvable, EmbedBuilder, GuildMember, PermissionFlagsBits, RoleResolvable, SlashCommandBuilder } from 'discord.js';
import { validateHTMLColorHex } from 'validate-color';
import { SlashCommand } from '../lib/types';

const roleColorCommand: SlashCommand = {
  command: new SlashCommandBuilder()
    .setName('rolecolor')
    .setDescription('Set your custom color')
    .addStringOption((option) => option.setName('hex').setDescription('hex color code (ex: #8dbff3)').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.UseApplicationCommands),

  async execute(interaction) {
    const member = <GuildMember>interaction.member;
    if (!member.roles.cache.has(process.env.SUBSCRIBER_ROLE_ID!)) {
      const permsEmbed = new EmbedBuilder()
        .setTitle('You are not a Server Subscriber!')
        .setDescription(`https://discord.com/channels/${interaction.guild?.id}/role-subscriptions`)
        .setColor(process.env.ERROR_COLOR as ColorResolvable);
      return interaction.reply({ embeds: [permsEmbed], ephemeral: true });
    }

    let color = interaction.options.getString('hex');
    if (!color?.startsWith('#')) color = `#${color}`;

    if (!validateHTMLColorHex(color)) {
      const permsEmbed = new EmbedBuilder().setDescription('Please enter a valid hex color code.').setColor(process.env.ERROR_COLOR as ColorResolvable);
      return interaction.reply({ embeds: [permsEmbed], ephemeral: true });
    }

    let verb;
    if (member.roles.cache.find((role) => role.name == 'Subscriber Custom Color')) {
      const colorRole = member.roles.cache.find((role) => role.name == 'Subscriber Custom Color');
      colorRole?.setColor(color as ColorResolvable);
      verb = 'Updated';
    } else {
      const colorRole = await interaction.guild?.roles.create({
        name: 'Subscriber Custom Color',
        color: color as ColorResolvable,
        position: (interaction.guild.roles.cache.get(process.env.TIER_3_ROLE_ID!)?.position ?? 0) + 1
      });

      member.roles.add(colorRole as RoleResolvable);
      verb = 'Set';
    }

    const confirmEmbed = new EmbedBuilder().setDescription(`${verb} your custom color to ${color}`).setColor(color as ColorResolvable);
    interaction.reply({ embeds: [confirmEmbed] });
  }
};

export default roleColorCommand;
