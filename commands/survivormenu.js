require('dotenv').config();
const fs = require('fs');
const path = require('path');

const { EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, SelectMenuBuilder } = require('discord.js');
const SurvivorRound = require('../schemas/SurvivorRoundSchema');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('survivormenu')
        .setDescription('New version of Survivor with menus and hidden votes')
        .addSubcommand(subcommand =>
            subcommand.setName('round')
            .setDescription('Start a new round of Survivor! (new version)')
            .addStringOption(option => 
                option.setName('album')
                .setDescription('The name of the album/ep')
                .setRequired(true)
                .addChoices(
                    { name: 'End Credits', value: 'End Credits' },
                    { name: 'i think you think too much of me', value: 'i think you think too much of me' },
                    { name: 'vertigo', value: 'vertigo' },
                    { name: 'no future', value: 'no future' },
                    { name: 'ICYMI', value: 'ICYMI' },
                    { name: 'Champions', value: 'Champions' },
                )))
        .addSubcommand(subcommand =>
            subcommand.setName('standings')
            .setDescription('Get the current votes for this round')
            .addStringOption(option => 
                option.setName('album')
                .setDescription('The name of the album/ep')
                .setRequired(true)
                .addChoices(
                    { name: 'End Credits', value: 'End Credits' },
                    { name: 'i think you think too much of me', value: 'i think you think too much of me' },
                    { name: 'vertigo', value: 'vertigo' },
                    { name: 'no future', value: 'no future' },
                    { name: 'ICYMI', value: 'ICYMI' },
                    { name: 'Champions', value: 'Champions' },
                )))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),  // only the Server Moderator role can use this command
		
	async execute(interaction) {
        if(interaction.member.roles.cache.has(process.env.MODERATORS_ROLE_ID)) { // Moderator role
            const survivorChannel = interaction.guild.channels.cache.find(channel => channel.name === process.env.SURVIVOR_CHANNEL_NAME);
            if(!survivorChannel) {
                const errEmbed = new EmbedBuilder()
                    .setDescription(`There is no channel named **${process.env.SURVIVOR_CHANNEL_NAME}** - please create one!`)
                    .setColor('0xdf0000');
                return interaction.reply({ embeds: [errEmbed] });
            }

            if(interaction.options.getSubcommand() === 'standings') { // get current votes
                const albumName = interaction.options.getString('album');

                const albumsFolder = path.resolve(__dirname, '../albums');
                let albumTracks = await readFile(`${albumsFolder}/${albumName}.txt`); // get all of the album tracks
                const embedColor = `0x${albumTracks.pop()}`;
                const albumCover = albumTracks.pop();

                await SurvivorRound.findOne({ album: albumName }, (err, data) => {
                    if (err) {
                        const errEmbed = new EmbedBuilder()
                            .setDescription('An error occured.')
                            .setColor('0xdf0000');
                        interaction.reply({ embeds: [errEmbed] });
                        return console.log(err);
                    }

                    if (!data) {
                        const errEmbed = new EmbedBuilder()
                            .setDescription(`No data exists for **${albumName}**`)
                            .setColor('0xdf0000');
                        interaction.reply({ embeds: [errEmbed] });
                        return console.log(`No data exists for ${albumName}`);
    
                    } else { // if data exists, get votes
                        const songVotes = [];
                        data.votes.forEach((userIds, song) => { // find the song with the most votes
                            if (data.tracks.includes(song)) // if the song hasn't been eliminated yet
                                songVotes.push(`${song} - \`${userIds.length}\``);
                        });

                        const standingsEmbed = new EmbedBuilder()
                            .setTitle(`**${albumName}** Survivor - Round ${data.roundNumber} Standings`)
                            .setDescription(songVotes.join("\n\n"))
                            .setThumbnail(albumCover)
                            .setColor(embedColor);

                        return interaction.reply({ embeds: [standingsEmbed] });
                    }
                }).clone();

            } else if (interaction.options.getSubcommand() === 'round') {
                if (interaction.channel == survivorChannel) {
                    const errEmbed = new EmbedBuilder()
                        .setDescription(`Please use this command in ${interaction.guild.channels.cache.get(process.env.COMMANDS_CHANNEL_ID)}`)
                        .setColor('0xdf0000');
                    return interaction.reply({ embeds: [errEmbed], ephemeral: true });
                }
    
                const albumName = interaction.options.getString('album');
                const survivorRole = interaction.guild.roles.cache.get(process.env.SURVIVOR_ROLE_ID);
    
                const albumsFolder = path.resolve(__dirname, '../albums');
                let albumTracks = await readFile(`${albumsFolder}/${albumName}.txt`); // get all of the album tracks
                const embedColor = `0x${albumTracks.pop()}`;
                const albumCover = albumTracks.pop();
    
                let roundNumber;
                let isLastRound = false;
                    
                let survivorEmbed, row;
    
                // update the database
                await SurvivorRound.findOne({ album: albumName }, (err, data) => {
                    if (err) {
                        const errEmbed = new EmbedBuilder()
                            .setDescription('An error occured.')
                            .setColor('0xdf0000');
                        interaction.reply({ embeds: [errEmbed] });
                        return console.log(err);
                    }
    
                    const songVotesMap = new Map(); // empty map with empty vote arrays for new rounds
                    for (const track of albumTracks)
                        songVotesMap.set(`${track}`, new Array());
    
                    if (!data) { // if the survivor album isn't already in the database, add it
                        SurvivorRound.create({
                            album: albumName,
                            tracks: albumTracks,
                            votes: songVotesMap, // key:song, value: [userIds]
                            roundNumber: 1
                        }).catch(err => console.log(err));
                        console.log(`Created a new ${albumName} document in database`);
    
                    } else { // if they already were in the database, compute the next round
                        // find most voted song and remove it from current tracks list
                        let mostVotedSong, max = 0;
                        data.votes.forEach((userIds, song) => { // find the song with the most votes
                            if (userIds.length > max) {
                                max = userIds.length;
                                mostVotedSong = song;
                            }
                        });
    
                        data.tracks.pull(mostVotedSong); // remove the most voted song from the database
                        data.votes = songVotesMap;
                        data.save();
    
                        // compute the round number
                        roundNumber = albumTracks.length - data.tracks.length + 1;
    
                        if (data.tracks.length == 1) { // announce the winner if only one song left
                            isLastRound = true;
    
                            survivorEmbed = new EmbedBuilder()
                                .setTitle(`**${albumName}** Survivor - Winner!`)
                                .setDescription(`👑 ${data.tracks[0]}`)
                                .setThumbnail(albumCover)
                                .setColor(embedColor)
                                .setFooter({
                                    text: `Runner-up: ${mostVotedSong} (${max} votes)`, 
                                    iconURL: interaction.guild.iconURL({ dynamic : true})
                                })
    
                            survivorChannel.send({ content: `${survivorRole}`, embeds: [survivorEmbed] })
                                .then((message) => {
                                    data.lastMessageId = message.id;
                                    data.roundNumber = roundNumber;
                                    data.save();
                                });
    
                            data.tracks = albumTracks; // reset the database tracks
                            data.votes.forEach((userIds) => {
                                userIds = []; // clear all votes for next year's round
                            });
    
                        } else { // compute the next round
                            // create the list of surviving songs for the next round embed description
                            const tracksListDescription = [];
                            data.tracks.forEach((track) => {
                                tracksListDescription.push(`${track}`)
                            });
    
                            survivorEmbed = new EmbedBuilder()
                                .setTitle(`**${albumName}** Survivor - Round ${roundNumber}`)
                                .setDescription(tracksListDescription.join("\n\n"))
                                .setThumbnail(albumCover)
                                .setColor(embedColor);
                            
                            // if this isn't the first round then we have a song that was voted out
                            if (mostVotedSong) {
                                survivorEmbed.addFields([
                                    { name: 'Eliminated Song', value: `${mostVotedSong} (${max} votes)` }
                                ]);
                            }
    
                            const options = [];
                            for (const track of data.tracks) { // create the song options for the select menu
                                const entries = new Map();
                                entries.set('label', track);
                                entries.set('value', track);
                                const obj = Object.fromEntries(entries);
                                options.push(obj);
                            }
    
                            row = new ActionRowBuilder()
                                .addComponents(new SelectMenuBuilder()
                                    .setCustomId('select')
                                    .setPlaceholder('Vote for your LEAST favorite song!')
                                    .addOptions(options)
                                );
    
                            survivorChannel.send({ content: `${survivorRole}`, embeds: [survivorEmbed], components: [row] })
                                .then((message) => { // update the database with the newest round numbers and latest message id for reaction purposes
                                    data.lastMessageId = message.id;
                                    data.roundNumber = roundNumber;
                                    data.save();
                                });
                        }
                    }
                }).clone();
    
                const description = roundNumber > 0 ? `Started round ${roundNumber} in ${survivorChannel}` : `Reset **${albumName}** document in database - use **/survivormenu** again`;    
                const confirmEmbed = new EmbedBuilder()
                    .setColor(embedColor)
                    .setDescription(description);
                return interaction.reply({ embeds: [confirmEmbed] });
            }
        } else {
            const permsEmbed = new EmbedBuilder()
                .setDescription('You do not have permission to use this command.')
                .setColor('0xdf0000');
            return interaction.reply({ embeds: [permsEmbed], ephemeral: true });
        }
	},
}

async function readFile(filename) {
    try {
        const contents = await fs.promises.readFile(filename, 'utf-8');
        const arr = contents.split(/\r?\n/);

        return arr;
    } catch(err) {
        console.log(err);
    }
}