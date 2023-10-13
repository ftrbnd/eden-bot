const { EmbedBuilder, SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const Playlist = require('../schemas/PlaylistSchema');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('customplaylist')
		.setDescription('Create or play a custom playlist')
        .addSubcommand(subcommand =>
            subcommand
            .setName('create')
            .setDescription('Add a new playlist to the database')
            .addStringOption(option => 
                option.setName('name')
                .setDescription('Playlist name')
                .setRequired(true))
            .addStringOption(option => 
                option.setName('link')
                .setDescription('YouTube playlist link')
                .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
            .setName('play')
            .setDescription('Play a pre-defined playlist')
            .addStringOption(option => 
                option.setName('name')
                .setDescription('Playlist name')
                .setRequired(true)
                .setAutocomplete(true)))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),  // only the Server Moderator role can use this command
		
	async execute(interaction) {
        if (interaction.options.getSubcommand() === 'create') {
            const newPlaylistName = interaction.options.getString('name').toLowerCase();
            const newPlaylistLink = interaction.options.getString('link');

            await Playlist.findOne({ name: newPlaylistName }, (err, data) => {
                if (err) {
                    const errEmbed = new EmbedBuilder()
                        .setDescription('An error occured.')
                        .setColor(process.env.ERROR_COLOR);
                    interaction.reply({ embeds: [errEmbed] });
                    return console.log(err);
                }

                if (!data) {
                    Playlist.create({
                        name: newPlaylistName,
                        link: newPlaylistLink
                    }).catch(err => console.log(err));

                    console.log(`Created a new playlist for ${newPlaylistName}`);
                    const confirmEmbed = new EmbedBuilder()
                        .setDescription(`Created custom playlist for **${newPlaylistName}**`)
                        .setColor(process.env.MUSIC_COLOR);
                    interaction.reply({ embeds: [confirmEmbed] });

                } else {
                    data.link = newPlaylistLink; // data.name is already the same as newPlaylistName
                    data.save();

                    const confirmEmbed = new EmbedBuilder()
                        .setDescription(`Updated playlist link for **${newPlaylistName}**`)
                        .setColor(process.env.MUSIC_COLOR);
                    interaction.reply({ embeds: [confirmEmbed] });
                }
            }).clone();

        } else if (interaction.options.getSubcommand() === 'play') {
            if (interaction.isAutocomplete()) {
                const focusedValue = interaction.options.getFocused();
                const choices = [];
                await getPlaylists(choices);
                const filtered = choices.filter(choice => choice[0].startsWith(focusedValue));
                await interaction.respond(
                    filtered.map(choice => ({ name: choice[0], value: choice[0] })),
                );

            } else {
                const playlist = await interaction.options.getString('name');
                
                await Playlist.findOne({ name: playlist }, (err, data) => {
                    if (err) {
                        const errEmbed = new EmbedBuilder()
                            .setDescription('An error occurred.')
                            .setColor(process.env.ERROR_COLOR);
                        interaction.reply({ embeds: [errEmbed] });
                        return console.log(err);
                    }

                    if (!data) {
                        const dataEmbed = new EmbedBuilder()
                            .setDescription(`**${playlist}** custom playlist does not exist`)
                            .setColor(process.env.ERROR_COLOR);
                        return interaction.reply({ embeds: [dataEmbed] });

                    } else {
                        const voiceChannel = interaction.member.voice.channel;

                        if(voiceChannel) {
                            interaction.client.DisTube.play(voiceChannel, data.link, {
                                member: interaction.member
                            }).catch(err => {
                                console.log(err);
                                const errEmbed = new EmbedBuilder()
                                    .setDescription(`An error occurred in /customplaylist.`)
                                    .setColor(process.env.ERROR_COLOR);
                                return interaction.reply({ embeds: [errEmbed] });
                            })

                            if (voiceChannel.type === ChannelType.GuildStageVoice) {
                                interaction.guild.members.me.voice.setSuppressed(false); // set bot as Stage speaker
                            }
                    
                            const confirmEmbed = new EmbedBuilder()
                                .setDescription(`Now playing **${playlist}** in ${voiceChannel}`)
                                .setColor(process.env.MUSIC_COLOR);
                            interaction.reply({ embeds: [confirmEmbed] });

                        } else {
                            const errEmbed = new EmbedBuilder()
                                .setDescription(`You must join a voice channel!`)
                                .setColor(process.env.ERROR_COLOR);
                            return interaction.reply({ embeds: [errEmbed] });
                        }
                    }
                }).clone();
            }
        }
	},
}

async function getPlaylists(choices) {
    await Playlist.find({}, (err, data) => {
        if (err) {
            return console.log(err);
        }

        if (!data) {
            console.log(`Couldn't find any data for custom playlists.`);

        } else {
            for (const playlist of data) {
                const playlistData = new Array(2);
                playlistData[0] = playlist.name;
                playlistData[1] = playlist.link
                
                choices.push(playlistData);
            }
        }
    }).clone();
}