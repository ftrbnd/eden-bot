import { EmbedBuilder, SlashCommandBuilder, PermissionFlagsBits, ColorResolvable } from 'discord.js';
import { SlashCommand } from '../lib/types';
import MusicPermission, { MusicPermissionDocument } from '../schemas/MusicPermissionSchema';

const permissionsCommand: SlashCommand = {
  command: new SlashCommandBuilder()
    .setName('permissions')
    .setDescription('Set music command permissions to @everyone or Server Moderators only')
    .addStringOption((option) =>
      option
        .setName('role')
        .setDescription('The role to grant music permission to')
        .setRequired(true)
        .addChoices({ name: '@Server Moderator', value: '691882703674540042' }, { name: '@everyone', value: '655655072885374987' })
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  execute: async (interaction) => {
    const role = interaction.options.getString('role');
    if (!role) return console.log('Role not found');
    const chosenRole = interaction.guild?.roles.cache.get(role);

    await MusicPermission.findOne({ role: chosenRole?.id }, (err: any, data: MusicPermissionDocument) => {
      if (err) {
        const errEmbed = new EmbedBuilder().setDescription('An error occurred.').setColor(process.env.ERROR_COLOR as ColorResolvable);
        interaction.reply({ embeds: [errEmbed] });
        return console.log(err);
      }

      if (!data) {
        MusicPermission.create({
          roleName: chosenRole?.name,
          roleId: chosenRole?.id
        }).catch((err) => console.log(err));
      } else {
        data.roleName = chosenRole?.name ?? 'fakerolename';
        data.roleId = chosenRole?.id ?? 'fakeid';
        data.save();
      }

      const confirmEmbed = new EmbedBuilder().setDescription(`Set music permissions to ${chosenRole}`).setColor(process.env.MUSIC_COLOR as ColorResolvable);
      interaction.reply({ embeds: [confirmEmbed] });
    }).clone();
  }
};

export default permissionsCommand;
