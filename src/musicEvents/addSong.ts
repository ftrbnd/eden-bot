import { ColorResolvable, EmbedBuilder } from 'discord.js';
import { BotEvent } from '../lib/types';
import { Queue, Song } from 'distube';

const addSongEvent: BotEvent = {
  name: 'addSong',
  execute: async (queue: Queue, song: Song) => {
    const playEmbed = new EmbedBuilder().setDescription(`Queued [${song.name}](${song.url}) [${song.user}]`).setColor(process.env.MUSIC_COLOR as ColorResolvable);

    if (queue.textChannel) {
      queue.textChannel.send({ embeds: [playEmbed] });
    }
  }
};

export default addSongEvent;
