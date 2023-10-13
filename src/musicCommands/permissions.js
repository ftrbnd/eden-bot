const { EmbedBuilder, SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const MusicPermission = require('../schemas/MusicPermissionSchema');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('permissions')
		.setDescription('Set music command permissions to @everyone or Server Moderators only')
        .addStringOption(option =>
            option.setName('role')
            .setDescription('The role to grant music permission to')
            .setRequired(true)
            .addChoices(
                { name: '@Server Moderator', value: '691882703674540042' },
                { name: '@everyone', value: '655655072885374987' },
            ))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),  // only the Server Moderator role can use this command
		
	async execute(interaction) {
        const chosenRole = interaction.guild.roles.cache.get(interaction.options.getString('role'));

        await MusicPermission.findOne({ role: chosenRole.id }, (err, data) => {
            if (err) {
                const errEmbed = new EmbedBuilder()
                    .setDescription('An error occurred.')
                    .setColor(process.env.ERROR_COLOR);
                interaction.reply({ embeds: [errEmbed] });
                return console.log(err);
            }

            if (!data) {
                MusicPermission.create({
                    roleName: chosenRole.name,
                    roleId: chosenRole.id
                }).catch(err => console.log(err));

            } else {
                data.roleName = chosenRole.name;
                data.roleId = chosenRole.id;
                data.save();
            }

            const confirmEmbed = new EmbedBuilder()
                .setDescription(`Set music permissions to ${chosenRole}`)
                .setColor(process.env.MUSIC_COLOR);
            interaction.reply({ embeds: [confirmEmbed] });
        }).clone();
	},
}