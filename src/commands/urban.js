const urban = require('urban');
const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('urban')
		.setDescription('Look up a word/phrase from the Urban Dictionary')
        .addStringOption(option => 
            option.setName('word')
            .setDescription('The word to be looked up')
            .setRequired(true)),
		
	async execute(interaction) {
        const searchEntry = interaction.options.getString('word');
        
        const urbanResults = urban(searchEntry);

        urbanResults.first(function(json) {
            let jsonDefinition = json.definition;
            jsonDefinition = jsonDefinition.split('[').join('');
            jsonDefinition = jsonDefinition.split(']').join('');
            // want to get rid of brackets in json.definition and json.example
            let jsonExample = json.example;
            jsonExample = jsonExample.split('[').join('');
            jsonExample = jsonExample.split(']').join('');

            let jsonDate = json.written_on.toString().slice(0, 10); // make the date more reader-friendly
        
            const urbanEmbed = new EmbedBuilder()
                .setTitle(json.word.toUpperCase())
                .setThumbnail('https://i.imgur.com/azXqb1w.png')
                .setColor('134fe6')
                .addFields([
                    {
                        name: 'Definition',
                        value: jsonDefinition,
                    },
                    {
                        name: 'Example',
                        value: jsonExample,
                    }
                ])
                .addFields([
                    { name: 'Urban Dictionary', value: `[link](${json.permalink})`},
                ])
                .setFooter({
                    text: 'by ' + json.author + ' on ' + jsonDate
                });

            interaction.reply({ embeds: [urbanEmbed] });
        })
	},
}