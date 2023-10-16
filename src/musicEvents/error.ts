import { ColorResolvable, EmbedBuilder, TextChannel } from 'discord.js';
import { BotEvent } from '../lib/types';

const errorEvent: BotEvent = {
  name: 'error',
  execute: async (channel: TextChannel, error: Error) => {
    console.error(error);

    const errEmbed = new EmbedBuilder()
      .setTitle(`${error.name}: An error occurred.`)
      .setDescription(error.message)
      .setColor(process.env.ERROR_COLOR as ColorResolvable);

    channel.send({ embeds: [errEmbed] });
  }
};

export default errorEvent;
