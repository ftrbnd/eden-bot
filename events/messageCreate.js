const { EmbedBuilder, ChannelType, MessageType, Message } = require('discord.js')

module.exports = {
	name: 'messageCreate',
	async execute(message) {
        if(message.author.bot) return // ignore bot messages

        if(message.channel.type === ChannelType.DM) { // message is a DM
            const logChannel = message.client.guilds.cache.get(process.env.GUILD_ID).channels.cache.get(process.env.LOGS_CHANNEL_ID)
            if(!logChannel) return

            if(message.attachments.size > 0) return // ignore any media sent to DMs

            const dmEmbed = new EmbedBuilder()
                .setAuthor({
                    name: `DM from ${message.author.tag}`,
                    iconURL: `${message.author.displayAvatarURL({ dynamic : true })}` // message + their avatar
                })
                .setDescription(message.content)
                .setColor('0x7289da')
                .setFooter({
                    text: `User ID: ${message.author.id}`
                })
                .setTimestamp()

            return logChannel.send({ embeds: [dmEmbed] })

        } else { // message is not a DM
            const welcomeChannel = message.guild.channels.cache.get(process.env.WELCOME_CHANNEL_ID)
            if(!welcomeChannel) return
            const generalChannel = message.guild.channels.cache.get(process.env.GENERAL_CHANNEL_ID)
            if(!generalChannel) return
            const introductionsChannel = message.guild.channels.cache.get(process.env.INTRODUCTIONS_CHANNEL_ID)
            if(!introductionsChannel) return

            // introductions channel
            if(message.channel.id === process.env.INTRODUCTIONS_CHANNEL_ID) {
                const kermitHearts = message.guild.emojis.cache.get(process.env.KERMITHEARTS_EMOJI_ID)
                message.react(kermitHearts)
            }

            const boostEmbed = new EmbedBuilder()
                .setAuthor({
                    name: `${message.member.displayName} just boosted the server!`,
                    iconURL: `${message.member.user.displayAvatarURL({ dynamic : true })}` // message + their avatar
                })        
                .setColor('0xf47fff') // pink boost color
                .setThumbnail('https://emoji.gg/assets/emoji/1819_boostingtop.gif') // nitro boost gif
                .addFields([
                    { name: 'Server Level', value: `${message.guild.premiumTier}`},
                    { name: 'Server Boosts', value: `${message.guild.premiumSubscriptionCount}`},
                ])
                .setFooter({
                    text: `${message.guild.name}`, // server name
                    iconURL: `${message.guild.iconURL({ dynamic : true })}` // server icon
                })
                .setTimestamp() // when the boost happened

            const futureboundRole = message.guild.roles.cache.get(process.env.FUTUREBOUND_ROLE_ID)
            switch(message.type) {
                case MessageType.GuildBoostTier3:
                    announceBoost(`\n**${message.guild.name}** has achieved **Level 3**!`)
                    break 
                case MessageType.GuildBoostTier2:
                    announceBoost(`\n**${message.guild.name}** has achieved **Level 2**!`)
                    break 
                case MessageType.GuildBoostTier1:
                    announceBoost(`\n**${message.guild.name}** has achieved **Level 1**!`)
                    break 
                case MessageType.GuildBoost:
                    announceBoost(' ')
                    break 
            }

            function announceBoost(level) {
                console.log('Someone just boosted the server.')
                boostEmbed.setDescription(`Server booster role: ${futureboundRole} ${level}`)
                welcomeChannel.send({ content: `${message.author}`, embeds: [boostEmbed]})
                generalChannel.send({ embeds: [boostEmbed] })
            }

            if(message.mentions.has(message.client.user) && !message.author.bot) {
                if(message.content.includes('good morning') || message.content.includes('gomo') || message.content.includes('Gomo') || message.content.includes('Morning') || message.content.includes('morning') || message.content.includes('gm') || message.content.includes('Good Morning') || message.content.includes('Good morning') || message.content.includes('GOOD MORNING')) {
                    const messages = ['GOOD MORNING!', 'good morning x', 'goooood morning', 'mornin', 'gomo'] 
                    var randomMessage = messages[Math.floor(Math.random() * messages.length)] 
                    message.reply({ content: randomMessage})
                }
                else if(message.content.includes('good night') || message.content.includes('goodnight') || message.content.includes('nini') || message.content.includes('gn') || message.content.includes('night')) {
                    const messages = ['nini', 'night night', 'gn x', 'good night x', 'dont let the bed bugs bite x'] 
                    var randomMessage = messages[Math.floor(Math.random() * messages.length)] 
                    message.reply({ content: randomMessage})
                }
                else if(message.content.includes('hey') || message.content.includes('hi') || message.content.includes('hello') || message.content.includes('Hi') || message.content.includes('Hello') || message.content.includes('Hey')) {
                    const messages = ['hello x', 'hey', 'hi x'] 
                    var randomMessage = messages[Math.floor(Math.random() * messages.length)] 
                    message.reply({ content: randomMessage})
                }
                else if(message.content.includes('how are you') || message.content.includes('how are u') || message.content.includes('how r u')) {
                    const messages = ['i am ok', 'just vibing', 'im good !', ':/'] 
                    var randomMessage = messages[Math.floor(Math.random() * messages.length)] 
                    message.reply({ content: randomMessage})
                }
                else if(message.content.includes('what\'s up') || message.content.includes('whats up') || message.content.includes('sup') || message.content.includes('What\'s up') || message.content.includes('Sup')) {
                    const messages = ['nothing much', 'just vibing', 'been looking at the sky', 'sup'] 
                    var randomMessage = messages[Math.floor(Math.random() * messages.length)] 
                    message.reply({ content: randomMessage})
                }
                else if(message.content.includes('sex') || message.content.includes('catching feelings')) {
                    message.channel.send(`catching feelings > sex`) 
                }
                else if(message.content.includes('love') || message.content.includes('ily')) {
                    const messages = ['i love you too x', 'ily2 x'] 
                    var randomMessage = messages[Math.floor(Math.random() * messages.length)] 
                    message.reply({ content: randomMessage})
                }
                else if(message.content.includes('miss you') || message.content.includes('miss u')) {
                    const messages = ['i miss you too :((', 'miss u 2 x'] 
                    var randomMessage = messages[Math.floor(Math.random() * messages.length)] 
                    message.reply({ content: randomMessage})
                }
                else if(message.content.includes('how old are you') || message.content.includes('how old are u') || message.content.includes('how old')) {
                    const messages = ['i am 26', '26'] 
                    var randomMessage = messages[Math.floor(Math.random() * messages.length)] 
                    message.reply({ content: randomMessage})
                }
                else if(message.content.includes('grape')) {
                    const messages = ['shut up you grape lookin 🍇', '🍇'] 
                    var randomMessage = messages[Math.floor(Math.random() * messages.length)] 
                    message.reply({ content: randomMessage})
                }
                else if(message.content.includes('oh no')) {
                    message.reply({ content: `i think i'm catching feelings`})
                }
            }
        }
	},
}