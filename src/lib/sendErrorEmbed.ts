import { CacheType, ChatInputCommandInteraction, ColorResolvable, EmbedBuilder } from 'discord.js';

export default async function sendErrorEmbed(interaction: ChatInputCommandInteraction<CacheType>, error: any) {
  const textChannel = interaction.channel;
  if (!textChannel) return;

  const errorEmbed = new EmbedBuilder()
    .setTitle(error.name)
    .setDescription(error.message)
    .setColor(process.env.ERROR_COLOR as ColorResolvable);

  await textChannel.send({ embeds: [errorEmbed] });
}
