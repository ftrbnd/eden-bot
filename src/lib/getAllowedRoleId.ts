import { ChatInputCommandInteraction, ColorResolvable, EmbedBuilder } from 'discord.js';
import MusicPermission, { MusicPermissionDocument } from '../schemas/MusicPermissionSchema';

const getAllowedRoleId = async (interaction: ChatInputCommandInteraction) => {
  const roleData = await MusicPermission.find({}, (err: any, data: MusicPermissionDocument) => {
    if (err) {
      const errEmbed = new EmbedBuilder().setDescription('An error occurred.').setColor(process.env.ERROR_COLOR as ColorResolvable);
      interaction.reply({ embeds: [errEmbed] });
      return console.log(err);
    }

    if (!data) {
      const errEmbed = new EmbedBuilder().setDescription('No data found.').setColor(process.env.ERROR_COLOR as ColorResolvable);
      return interaction.reply({ embeds: [errEmbed] });
    } else {
      return data;
    }
  }).clone();

  return roleData[0].roleId;
};

export default getAllowedRoleId;
