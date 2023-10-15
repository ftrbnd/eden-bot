import { BaseInteraction, CacheType, ChatInputCommandInteraction, ColorResolvable, EmbedBuilder } from 'discord.js';

export default async function sendErrorEmbed(interaction: BaseInteraction, error: any) {
  const textChannel = interaction.channel;
  if (!textChannel) return console.log('Channel not found');

  const errorEmbed = new EmbedBuilder()
    .setTitle(error.name)
    .setDescription(error.message)
    .setColor(process.env.ERROR_COLOR as ColorResolvable);

  console.log(error);
  await textChannel.send({ embeds: [errorEmbed] });
}
