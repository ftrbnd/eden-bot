const { EmbedBuilder, SlashCommandBuilder, MessageType } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('typingtest')
		.setDescription('Test your WPM by typing EDEN songs!'),
		
	async execute(interaction) {
        const words = ['02:09', 'End Credits', 'Gravity', 'Nocturne', 'Interlude', 'Wake Up', 'catch me if you can', 'Billie Jean',
                'Hey Ya', 'i think you think too much of me', 'sex', 'drugs', 'and', 'rock + roll', 'Fumes', 'XO', 'Circles', 'vertigo',
                'wrong', 'take care', 'start//end', 'wings', 'icarus', 'lost//found', 'crash', 'gold', 'forever//over', 'float', 'wonder', 'love; not wrong (brave)',
                'falling in reverse', 'about time', 'stutter', 'all you need is love', 'nowhere else', '909', 'no future', 'good morning',
                'in', 'hertz', 'static', 'projector', 'love, death, distraction', 'how to sleep', 'calm down', 'just saying',
                'fomo', 'so far so good', 'isohel', '????', 'tides', 'rushing', '$treams', '2020', 'out', 'untitled', 'Peaked',
                'Cold Feet', 'Stingray'];

        // adding words to the random quote
        let textToType = words[Math.floor(Math.random()*(words.length))];
        for(var i = 0; i < 9; i++)
            textToType += ' ' + words[Math.floor(Math.random()*(words.length))];
        
        // embed that will show the quote
        const typingTestEmbed = new EmbedBuilder()
            .setTitle('Typing Test')
            .setThumbnail('https://support.signal.org/hc/article_attachments/360016877511/typing-animation-3x.gif') // typing animation
            .setColor('fdfaff')
            .setDescription(textToType)
            .setFooter({
                text: interaction.user.username, 
                iconURL: interaction.user.displayAvatarURL({ dynamic : true })
            });

        await interaction.reply({ embeds: [typingTestEmbed] });

        // using message collector, collect message that starts with the keyword
        const filter = m => m.author === interaction.user && m.type !== MessageType.ChatInputCommand; // without message type check, it would instantly calculate a WPM of 0
        const collector = interaction.channel.createMessageCollector({ filter, time: 60000 });

        let typingResult = '';
        const start = new Date();
        let messageToReply;
        collector.on('collect', m => {
            typingResult += m.content; // once message is collected, add the typed words to a variable
            messageToReply = m;
            collector.stop();
        })

        collector.on('end', collected => {
            if(collected.size === 0) { // if no message was entered
                const couldntFindEmbed = new EmbedBuilder()
                    .setDescription(`You did not type within a minute, please try again!`)
                    .setColor(process.env.ERROR_COLOR)
                    .setFooter({
                        text: interaction.guild.name, 
                        iconURL: interaction.guild.iconURL({ dynamic : true})
                    });

                interaction.followUp({ embeds: [couldntFindEmbed], ephemeral: true });
            } else {
                const end = new Date();
        
                const diffSeconds = (Math.abs(end - start)) / 1000; // calculate time difference in seconds
                const numChars = typingResult.length;
                const wpm = (((numChars / 5) / diffSeconds) * 60).toFixed(2); // keep to 2 decimal places
        
                // accuracy calculation
                let accuracyCount = 0;
                textToType.split(' '); // make into arrays
                typingResult.split(' ');
                for(let i = 0; i < textToType.length; i++)
                    if(textToType[i] === typingResult[i])
                        accuracyCount++;
                
                accuracyCount /= textToType.length;
                accuracyCount = (accuracyCount * 100).toFixed(2);
        
                let color;
                if(wpm >= 100)
                    color = '8000db';
                else if(90 <= wpm && wpm < 100)
                    color = '34eb43';
                else if(80 <= wpm && wpm < 90)
                    color = '9ceb34';
                else if(70 <= wpm && wpm < 80)
                    color = 'f5e431';
                else if(60 <= wpm && wpm < 70)
                    color = 'ff9100';
                else
                    color = 'e30e0e';
        
                const wpmEmbed = new EmbedBuilder()
                    .setTitle('Typing Test Results')
                    .setColor(color)
                    .addFields([
                        { name: 'WPM', value: wpm},
                        { name: 'Acuracy', value: accuracyCount + '%'},
                    ])
                    .setFooter({
                        text: interaction.user.username, 
                        iconURL: interaction.user.displayAvatarURL({ dynamic : true })
                    });
        
                messageToReply.reply({ embeds: [wpmEmbed] });
            }
        })
	},
}