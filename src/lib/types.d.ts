import { SlashCommandBuilder, CommandInteraction, Collection, PermissionResolvable, Message, AutocompleteInteraction, ChatInputCommandInteraction } from 'discord.js';
import DisTube from 'distube';

export interface SlashCommand {
  command: SlashCommandBuilder;
  execute: (interaction: ChatInputCommandInteraction) => void;
  autocomplete?: (interaction: AutocompleteInteraction) => void;
  cooldown?: number; // in seconds
}

export type GuildOption = keyof GuildOptions;
export interface BotEvent {
  name: string;
  once?: boolean | false;
  execute: (...args) => void;
}

declare module 'discord.js' {
  export interface Client {
    slashCommands: Collection<string, SlashCommand>;
    commands: Collection<string, Command>;
    cooldowns: Collection<string, number>;
    musicPlayer: DisTube;
  }
}
