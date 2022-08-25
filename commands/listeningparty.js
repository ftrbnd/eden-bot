require('dotenv').config()

const { EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder, ChannelType, GuildScheduledEventPrivacyLevel, GuildScheduledEventEntityType } = require('discord.js')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('listeningparty')
		.setDescription('Open a listening party chat and stage channel')
        .addSubcommand(subcommand =>
            subcommand
                .setName('create')
                .setDescription('Create the listening party channels')
                .addStringOption(option => 
                    option.setName('name')
                    .setDescription('The name of the listening party')
                    .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('announce')
                .setDescription('Create a Discord Scheduled Event and announce it')
                .addStringOption(option => 
                    option.setName('event-description')
                    .setDescription('The description of the event may vary based on album/tour etc')
                    .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('preview')
                .setDescription('Everyone can view the channels but are unable to chat/join'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('open')
                .setDescription('Allow everyone to chat and join'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('close')
                .setDescription('Make the channels private'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('archive')
                .setDescription('Delete the Stage channel and move the text channel to the Archived category'))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),  // only the Server Moderator role can use this command

	async execute(interaction) {
		if(interaction.member.roles.cache.has(process.env.MODERATORS_ROLE_ID)) { // Moderator role
            if(interaction.options.getSubcommand() === 'create') {
                const listeningPartyName = interaction.options._hoistedOptions[0].value

                const categoryChannel = await interaction.guild.channels.create({
                    name: 'Listening Party',
                    type: ChannelType.GuildCategory,
                    position: 2,
                    permissionOverwrites: [
                        {
                            id: interaction.guild.roles.everyone.id, 
                            deny: [PermissionFlagsBits.ViewChannel]
                        },
                        {
                            id: interaction.client.user.id, // this bot itself
                            allow: [PermissionFlagsBits.ViewChannel]
                        }
                    ]
                })

                const listeningPartyChat = await categoryChannel.children.create({
                    name: 'listening party chat',
                    type: ChannelType.GuildText,
                    permissionOverwrites: [
                        {
                            id: interaction.guild.roles.everyone.id, 
                            deny: [PermissionFlagsBits.ViewChannel]
                        },
                        {
                            id: interaction.guild.roles.cache.find(role => role.name === 'Bot').id, // all other bots
                            deny: [PermissionFlagsBits.ViewChannel]
                        },
                        {
                            id: interaction.client.user.id, // this bot itself
                            allow: [PermissionFlagsBits.ViewChannel]
                        }
                    ]
                })

                const stageChannel = await categoryChannel.children.create({
                    name: listeningPartyName,
                    type: ChannelType.GuildStageVoice,
                    permissionOverwrites: [
                        {
                            id: interaction.guild.roles.everyone.id,
                            allow: [PermissionFlagsBits.ViewChannel],
                            deny: [PermissionFlagsBits.Connect]
                        },
                        {
                            id: interaction.client.user.id, // this bot itself
                            allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.Connect]
                        }
                    ]
                })

                const confirmEmbed = new EmbedBuilder()
                    .setDescription(`**${listeningPartyName}** channels have been created!`)
                    .setColor('0x32ff25')
                return interaction.reply({ embeds: [confirmEmbed] })

            } else if(interaction.options.getSubcommand() === 'preview') {
                var categoryChannel = await interaction.guild.channels.cache.find(channel => channel.name === 'Listening Party')
                categoryChannel.edit({
                    permissionOverwrites: [
                        {
                            id: interaction.guild.roles.everyone.id, 
                            allow: [PermissionFlagsBits.ViewChannel]
                        }
                    ]
                })

                var listeningPartyChat = await categoryChannel.children.cache.find(channel => channel.name === 'listening-party-chat')
                listeningPartyChat.edit({
                    permissionOverwrites: [
                        {
                            id: interaction.guild.roles.everyone.id, 
                            allow: [PermissionFlagsBits.ViewChannel],
                            deny: [PermissionFlagsBits.SendMessages]
                        },
                        {
                            id: interaction.guild.roles.cache.find(role => role.name === 'Bot').id,
                            deny: [PermissionFlagsBits.ViewChannel]
                        },
                        {
                            id: interaction.client.user.id, // this bot itself
                            allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages]
                        }
                    ]
                })

                var stageChannel = await categoryChannel.children.cache.find(channel => channel.type === ChannelType.GuildStageVoice)
                stageChannel.edit({
                    permissionOverwrites: [
                        {
                            id: interaction.guild.roles.everyone.id, 
                            allow: [PermissionFlagsBits.ViewChannel],
                            deny: [PermissionFlagsBits.Connect]
                        },
                        {
                            id: interaction.client.user.id, // this bot itself
                            allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.Connect]
                        }
                    ]
                })
                stageChannel.setTopic(`Listening to ${stageChannel.name}!`)

                const confirmEmbed = new EmbedBuilder()
                    .setDescription(`**${stageChannel.name}** channels are now public but locked.`)
                    .setColor('0x32ff25')
                interaction.reply(({ embeds: [confirmEmbed] }))


            } else if(interaction.options.getSubcommand() === 'announce') {
                const description = interaction.options._hoistedOptions[0].value

                // check if the Stage channel has been created yet
                const stageChannel = await interaction.guild.channels.cache.find(channel => channel.type === ChannelType.GuildStageVoice)
                if(!stageChannel) {
                    const errEmbed = new EmbedBuilder()
                        .setDescription('Please use **/listeningparty create** before using this command')
                        .setColor('0xdf0000')
                    return interaction.reply({ embeds: [errEmbed]})
                }
                
                const tomorrow = new Date()
                tomorrow.setDate(tomorrow.getDate() + 1)

                try {
                    var scheduledEvent = await interaction.guild.scheduledEvents.create({
                        name: `${stageChannel.name} Listening Party`,
                        scheduledStartTime: tomorrow,
                        privacyLevel: GuildScheduledEventPrivacyLevel.GuildOnly,
                        entityType:GuildScheduledEventEntityType.StageInstance,
                        description: description,
                        channel: stageChannel
                    })
                } catch(err) {
                    return console.log(err)
                }

                const confirmEmbed = new EmbedBuilder()
                    .setDescription(`The **${stageChannel.name}** Event has been created!`)
                    .setColor('0x32ff25')
                const announcementEmbed = new EmbedBuilder()
                    .setDescription(`Now, please enter the message that will be posted in **#announcements**`)
                    .setColor('0xfffb25')
                
                // once created, ask for the announcement text
                interaction.reply(({ embeds: [confirmEmbed, announcementEmbed] }))

                // maybe: with the announcement text, add an option for the pic url, 
                //      and set the event's banner to that img
                // also append the event url to the final announcement
                const filter = m => m.author === interaction.user
                const collector = interaction.channel.createMessageCollector({ filter, time: 180000 }) // one minute to collect

                collector.on('collect', m => {
                    var announcementText = `${m.content} @everyone ${scheduledEvent.url}`
                    const announcementChannel = interaction.guild.channels.cache.get(process.env.ANNOUNCEMENTS_CHANNEL_ID)

                    announcementChannel.send({ content: announcementText })

                    collector.stop()
                })

                collector.on('end', collected => {
                    if(collected.size === 0) { // if no message was entered
                        const couldntFindEmbed = new EmbedBuilder()
                            .setDescription(`You did not type within 3 minutes, please use the **/say** command to post the announcement.`)
                            .setColor('0xdf0000')
                            .setFooter({
                                text: interaction.guild.name, 
                                iconURL: interaction.guild.iconURL({ dynamic : true})
                            })
                        interaction.followUp({ embeds: [couldntFindEmbed], ephemeral: true })
                    } else {
                        // do something
                        const announcedEmbed = new EmbedBuilder()
                            .setDescription(`The announcement was sent!`)
                            .setColor('0x32ff25')
                        const editDateEmbed = new EmbedBuilder()
                            .setDescription(`Now manually edit the Event's start time.`)
                            .setColor('0xfffb25')
                        interaction.followUp({ embeds: [announcedEmbed, editDateEmbed] })
                    }
                })

            } else if(interaction.options.getSubcommand() === 'open') {
                var categoryChannel = await interaction.guild.channels.cache.find(channel => channel.name === 'Listening Party')
                categoryChannel.edit({
                    permissionOverwrites: [
                        {
                            id: interaction.guild.roles.everyone.id, 
                            allow: [PermissionFlagsBits.ViewChannel]
                        }
                    ]
                })

                var listeningPartyChat = await categoryChannel.children.cache.find(channel => channel.name === 'listening-party-chat')
                listeningPartyChat.edit({
                    permissionOverwrites: [
                        {
                            id: interaction.guild.roles.everyone.id, 
                            allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages]
                        },
                        {
                            id: interaction.guild.roles.cache.find(role => role.name === 'Bot').id,
                            deny: [PermissionFlagsBits.ViewChannel]
                        },
                        {
                            id: interaction.client.user.id, // this bot itself
                            allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages]
                        }
                    ]
                })

                var stageChannel = await categoryChannel.children.cache.find(channel => channel.type === ChannelType.GuildStageVoice)
                stageChannel.edit({
                    permissionOverwrites: [
                        {
                            id: interaction.guild.roles.everyone.id, 
                            allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.Connect]
                        },
                        {
                            id: interaction.client.user.id, // this bot itself
                            allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.Connect]
                        }
                    ]
                })
                stageChannel.setTopic(`Listening to ${stageChannel.name}!`)

                const confirmEmbed = new EmbedBuilder()
                    .setDescription(`**${stageChannel.name}** channels have been opened to everyone!`)
                    .setColor('0x32ff25')
                interaction.reply(({ embeds: [confirmEmbed] }))

            } else if(interaction.options.getSubcommand() === 'close') {
                var categoryChannel = await interaction.guild.channels.cache.find(channel => channel.name === 'Listening Party')
                categoryChannel.edit({
                    permissionOverwrites: [
                        {
                            id: interaction.guild.roles.everyone.id, 
                            deny: [PermissionFlagsBits.ViewChannel]
                        },
                        {
                            id: interaction.client.user.id, // this bot itself
                            allow: [PermissionFlagsBits.ViewChannel]
                        }
                    ]
                })

                var listeningPartyChat = await categoryChannel.children.cache.find(channel => channel.name === 'listening-party-chat')
                listeningPartyChat.edit({
                    permissionOverwrites: [
                        {
                            id: interaction.guild.roles.everyone.id, 
                            deny: [PermissionFlagsBits.ViewChannel]
                        },
                        {
                            id: interaction.guild.roles.cache.find(role => role.name === 'Bot').id,
                            deny: [PermissionFlagsBits.ViewChannel]
                        },
                        {
                            id: interaction.client.user.id, // this bot itself
                            allow: [PermissionFlagsBits.ViewChannel]
                        }
                    ]
                })

                var stageChannel = await categoryChannel.children.cache.find(channel => channel.type === ChannelType.GuildStageVoice)
                stageChannel.edit({
                    permissionOverwrites: [
                        {
                            id: interaction.guild.roles.everyone.id, 
                            deny: [PermissionFlagsBits.ViewChannel]
                        },
                        {
                            id: interaction.client.user.id, // this bot itself
                            allow: [PermissionFlagsBits.ViewChannel]
                        }
                    ]
                })

                const confirmEmbed = new EmbedBuilder()
                    .setDescription(`**${stageChannel.name}** channels have been closed.`)
                    .setColor('0x32ff25')
                interaction.reply(({ embeds: [confirmEmbed] }))

            } else if(interaction.options.getSubcommand() === 'archive') {
                var categoryChannel = await interaction.guild.channels.cache.find(channel => channel.name === 'Listening Party')
                var listeningPartyChat = await categoryChannel.children.cache.find(channel => channel.name === 'listening-party-chat')
                var stageChannel = await categoryChannel.children.cache.find(channel => channel.type === ChannelType.GuildStageVoice)
                var archivesChannel = await interaction.guild.channels.cache.find(channel => channel.name === 'archived')
                
                await listeningPartyChat.edit({
                    parent: archivesChannel
                })

                await stageChannel.delete()
                await categoryChannel.delete()

                const confirmEmbed = new EmbedBuilder()
                    .setDescription(`**${listeningPartyChat.name}** has been archived.`)
                    .setColor('0x32ff25')
                interaction.reply(({ embeds: [confirmEmbed] }))
                
            }

        } else {
        const permsEmbed = new EmbedBuilder()
            .setDescription('You do not have permission to use this command.')
            .setColor('0xdf0000')
        return interaction.reply({ embeds: [permsEmbed], ephemeral: true })
        }
	},
}