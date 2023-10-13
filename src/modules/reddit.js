const Snooper = require('reddit-snooper');
const { EmbedBuilder } = require('discord.js');

module.exports = {
	async execute(client) {
        const snooper = new Snooper({
            app_id: process.env.APP_ID,
            api_secret: process.env.API_SECRET,
            automatic_retries: true,
            api_requests_per_minute: 60
        });

        try {
            snooper.watcher.getPostWatcher('eden') // blank argument or 'all' looks at the entire website
            .on('post', function(post) {
                console.log(`New Reddit post: ${post.data.title.substring(0, 255)}`);
                const subredditChannel = client.channels.cache.get(process.env.SUBREDDIT_CHANNEL_ID);
                
                const redditEmbed = new EmbedBuilder()
                    .setTitle(post.data.title.substring(0, 255))
                    .setURL(`https://reddit.com${post.data.permalink}`)
                    .setImage(post.data.url)
                    .setColor('FF4500')
                    .setFooter({ 
                        text: `Posted by u/${post.data.author} on r/${post.data.subreddit}`,
                        iconURL: 'https://logodownload.org/wp-content/uploads/2018/02/reddit-logo-16.png'
                    })
                    .setTimestamp();

                if (post.data.selftext !== '')
                    redditEmbed.setDescription(post.data.selftext);

                subredditChannel.send({ embeds: [redditEmbed] })
                    .then(() => subredditChannel.messages.fetch({ limit: 1 }) // fetch latest message
                        .then(messages => {
                            let lastMessage = messages.first(); // message retrieved
                            const upvoteEmoji = client.emojis.cache.get(process.env.UPVOTE_EMOJI_ID);
                            const downvoteEmoji = client.emojis.cache.get(process.env.DOWNVOTE_EMOJI_ID);

                            lastMessage.react(upvoteEmoji)     // react with upvote
                                .then(() => lastMessage.react(downvoteEmoji)); // react with downvote
                        })
                        .catch(console.error));

            })
            .on('error', console.error);

        } catch(error) {
            console.log(error);
        }
    }
}