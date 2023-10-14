import { ImgurClient } from 'imgur';
import { PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import { SlashCommand } from '../lib/types';
import sendErrorEmbed from '../lib/sendErrorEmbed';

const client = new ImgurClient({
  clientId: process.env.IMGUR_CLIENT_ID,
  clientSecret: process.env.IMGUR_CLIENT_SECRET
});

const edenCommand: SlashCommand = {
  command: new SlashCommandBuilder().setName('eden').setDescription('Get a random picture of EDEN').setDefaultMemberPermissions(PermissionFlagsBits.UseApplicationCommands),

  async execute(interaction) {
    try {
      const [albumOne, albumTwo, albumThree] = await Promise.all([client.getAlbum('3Zh414x'), client.getAlbum('DZ913Hd'), client.getAlbum('PUfyYtt')]);

      const images = albumOne.data.images.concat(albumTwo.data.images).concat(albumThree.data.images);

      const randomImage = images[Math.floor(Math.random() * images.length)].link;

      await interaction.reply({ files: [randomImage] });
    } catch (err) {
      sendErrorEmbed(interaction, err);
    }
  }
};

export default edenCommand;
