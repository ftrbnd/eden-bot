require('dotenv').config()

const { EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } = require('discord.js')
const User = require('../schemas/UserSchema')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('mute')
		.setDescription('Mute a user by giving them the Muted role')
        .addUserOption(option =>
            option.setName('user')
            .setDescription('The user to be muted')
            .setRequired(true))
        .addStringOption(option => 
            option.setName('reason')
            .setDescription('The reason for the mute')
            .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles), // any permission that the Helper role has access to should work
		
	async execute(interaction) {
        if(interaction.member.roles.cache.has(process.env.MODERATORS_ROLE_ID) || interaction.member.roles.cache.has(process.env.HELPER_ROLE_ID)) { // Moderator and Helper roles
            const userToMute = interaction.options.getUser('user')
            const reasonForMute = interaction.options.getString('reason')

            const modChannel = interaction.guild.channels.cache.get(process.env.MODERATORS_CHANNEL_ID)
            if(!modChannel) return

            var oneWeek
            await User.findOne({ discordId: userToMute.id }, (err, data) => {
                if(err) return console.log(err)

                oneWeek = new Date()
                oneWeek.setDate(oneWeek.getDate() + 7)

                if(!data) { // if the user isn't already in the database, add their data
                    User.create({
                        discordId: userToMute.id,
                        username: userToMute.username,
                        muteEnd: oneWeek
                    }).catch(err => console.log(err))
                } else { // if they already were in the database, simply update and save
                    data.muteEnd = oneWeek
                    data.username = userToMute.username
                    data.save()
                }
            }).clone()

            try {
                userToMuteMember = interaction.guild.members.cache.get(`${userToMute.id}`)
                userToMuteMember.roles.set([process.env.MUTE_ROLE_ID]) // Mute role
            } catch(err) {
                return console.log(err)
            }

            const logEmbed = new EmbedBuilder()
                .setTitle(userToMute.tag + ' was muted for a week.')
                .addFields([
                    { name: 'User ID: ', value: `${userToMute.id}` },
                    { name: 'By: ', value: `${interaction.user}` },
                    { name: 'Reason: ', value: reasonForMute },
                    { name: 'Mute Ends: ', value: oneWeek.toDateString() },
                ])
                .setColor('0x000001')
                .setThumbnail(userToMute.displayAvatarURL({ dynamic : true }))
                .setFooter({
                    text: interaction.guild.name, 
                    iconURL: interaction.guild.iconURL({ dynamic : true })
                })
                .setTimestamp()
            modChannel.send({ embeds: [logEmbed] })

            const muteEmbed = new EmbedBuilder()
                .setTitle(`You were muted in **${interaction.guild.name}** for a week.`)
                .addFields([
                    { name: 'Reason: ', value: reasonForMute },
                    { name: 'Mute Ends: ', value: oneWeek.toDateString() },
                ])
                .setColor('0x000001')
                .setFooter({
                    text: interaction.guild.name, 
                    iconURL: interaction.guild.iconURL({ dynamic : true })
                })
                .setTimestamp()
            
            try {
                await userToMute.send({ embeds: [muteEmbed] })
            } catch(err) {
                return console.log(err)
            }

            const mutedEmbed = new EmbedBuilder()
                .setDescription(`${userToMute} was muted.`)
                .setColor('0x32ff25')
            interaction.reply({ embeds: [mutedEmbed] })
        } else {
            const permsEmbed = new EmbedBuilder()
                .setDescription('You do not have permission to use this command.')
                .setColor('0xdf0000')
            return interaction.reply({ embeds: [permsEmbed], ephemeral: true })
        }
	},
}