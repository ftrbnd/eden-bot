import { ColorResolvable, EmbedBuilder } from 'discord.js';
import { BotEvent } from '../lib/types';
import { Queue } from 'distube';

const emptyEvent: BotEvent = {
  name: 'empty',
  execute: async (queue: Queue) => {
    const emptyEmbed = new EmbedBuilder().setDescription(`**${queue.voiceChannel?.name}** is empty - disconnecting...`).setColor(process.env.MUSIC_COLOR as ColorResolvable);

    if (queue.textChannel) {
      queue.textChannel.send({ embeds: [emptyEmbed] });
    }
  }
};

export default emptyEvent;
