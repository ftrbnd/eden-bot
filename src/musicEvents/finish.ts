import { ColorResolvable, EmbedBuilder } from 'discord.js';
import { BotEvent } from '../lib/types';
import { Queue } from 'distube';

const finishEvent: BotEvent = {
  name: 'finish',
  execute: async (queue: Queue) => {
    const finishEmbed = new EmbedBuilder().setDescription(`The queue has finished playing`).setColor(process.env.MUSIC_COLOR as ColorResolvable);

    if (queue.textChannel) {
      queue.textChannel.send({ embeds: [finishEmbed] });
    }
  }
};

export default finishEvent;
