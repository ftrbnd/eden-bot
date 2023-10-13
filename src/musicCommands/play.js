const { EmbedBuilder, SlashCommandBuilder, ChannelType } = require('discord.js');
const getAllowedRoleId = require('../helperFunctions/getAllowedRoleId');
const sendErrorEmbed = require('../helperFunctions/sendErrorEmbed');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('play')
		.setDescription('Play music using YouTube, Spotify, or SoundCloud')
        .addStringOption(option => 
            option.setName('song')
            .setDescription('Search query or YouTube/Spotify/SoundCloud links')
            .setRequired(true)),
		
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        async function checkPermissions() {
            try {
                const allowedRoleId = await getAllowedRoleId.execute(interaction);
                
                if (!interaction.member._roles.includes(allowedRoleId) && allowedRoleId != interaction.guild.roles.everyone.id) {
                    const errEmbed = new EmbedBuilder()
                        .setDescription(`You do not have permission to use music commands right now!`)
                        .setColor(process.env.ERROR_COLOR);
                    return interaction.editReply({ embeds: [errEmbed] });
                }
            } catch (e) {
                return console.error(e);
            }
        }

        async function checkVoiceChannel() {
            try {
                const voiceChannel = interaction.member.voice.channel;

                if (!voiceChannel) {
                    const errEmbed = new EmbedBuilder()
                        .setDescription(`You must join a voice channel!`)
                        .setColor(process.env.ERROR_COLOR);
                    return interaction.editReply({ embeds: [errEmbed] });
                }
            } catch (e) {
                return console.error(e);
            }
        }
        
        async function unSuppress() {
            const voiceChannel = interaction.member.voice.channel;
            
            if (voiceChannel.type === ChannelType.GuildStageVoice) {
                try {
                    await interaction.guild.members.me.voice.setSuppressed(false); // set bot as Stage speaker
                } catch (e) {
                    return console.error(e);
                }
            }
        }

        async function playSong() {
            const chosenSong = interaction.options.getString('song');
            const voiceChannel = interaction.member.voice.channel;

            try {
                await interaction.client.DisTube.play(voiceChannel, chosenSong, {
                    member: interaction.member
                });

                let description = '👍';
                if (voiceChannel.type === ChannelType.GuildStageVoice) {
                    description += ' (promote me to Speaker pls)';
                }

                const confirmEmbed = new EmbedBuilder()
                    .setDescription(description)
                    .setColor(process.env.MUSIC_COLOR);
                await interaction.editReply({ embeds: [confirmEmbed] });
            } catch (e) {
                console.error(e);
                const errEmbed = new EmbedBuilder()
                    .setDescription(`An error occurred in /play.`)
                    .setColor(process.env.ERROR_COLOR);
                return interaction.editReply({ embeds: [errEmbed] });
            };
        }

         
        await checkPermissions();
        await checkVoiceChannel();
        // await unSuppress();
        await playSong();
	},
}