const { ETwitterStreamEvent, TwitterApi } = require('twitter-api-v2');

module.exports = {
    async execute(discordClient) {
        try {
            const twitterClient = new TwitterApi(process.env.TWITTER_BEARER_TOKEN);
            const roClient = twitterClient.readOnly;
            
            // Get and delete old rules if needed
            const rules = await twitterClient.v2.streamRules();
            if (rules.data?.length) {
                await twitterClient.v2.updateStreamRules({
                    delete: { ids: rules.data.map(rule => rule.id) },
                });
            }

            // Add our rules
            await twitterClient.v2.updateStreamRules({
                add: [
                    { value: `from:${process.env.TWITTER_USER} -is:reply -is:retweet` }
                ],
            });

            const stream = await twitterClient.v2.searchStream();
        
            // Enable auto reconnect
            stream.autoReconnect = true;

            // Awaits for a tweet
            stream.on(ETwitterStreamEvent.ConnectionError, err => {
                console.log('Twitter connection error!', err);
            });
            stream.on(ETwitterStreamEvent.ConnectionClosed, () => {
                console.log('Twitter connection has been closed.');
                stream.reconnect();
            });
            stream.on(ETwitterStreamEvent.ConnectionLost, () =>
                console.log('Twitter connection has been lost.'),
            );
            stream.on(ETwitterStreamEvent.ReconnectAttempt, () =>
                console.log('Twitter attempting reconnect...'),
            );
            stream.on(ETwitterStreamEvent.Connected, () =>
                console.log('Twitter connection successful!'),
            );
            stream.on(ETwitterStreamEvent.ConnectError, err => {
                console.log('Twitter connection error.', err);
            });
            stream.on(ETwitterStreamEvent.Reconnected, () =>
                console.log('Twitter reconnection successful!.'),
            );
            stream.on(ETwitterStreamEvent.ReconnectError, err => {
                console.log('Twitter reconnection error.', err);
            });
            stream.on(ETwitterStreamEvent.ReconnectLimitExceeded, () => {
                console.log('Twitter reconnect limit exceeded.');
            });
            stream.on(ETwitterStreamEvent.Data, async tweet => {                
                const tweetURL = `https://twitter.com/${process.env.TWITTER_USER}/status/${tweet.data.id}`;
                console.log(tweetURL);

                const tweetChannel = discordClient.channels.cache.get(process.env.TWEET_CHANNEL_ID);
                const retweetEmoji = discordClient.emojis.cache.get(process.env.RETWEET_EMOJI_ID);

                tweetChannel.send({ content: tweetURL }) // send tweet
                    .then(() => tweetChannel.messages.fetch({ limit: 1 }) // fetch latest message
                        .then(messages => {
                            const lastMessage = messages.first(); // message retrieved
                            lastMessage.react(retweetEmoji)     // react with retweet
                                .then(() => lastMessage.react('❤')); // react with heart
                        })
                        .catch(console.error));
            });
            stream.on(ETwitterStreamEvent.DataKeepAlive, () => {
                // console.log('Twitter has a keep-alive packet.'),
            });
            stream.on(ETwitterStreamEvent.DataError, err =>
                console.log('Twitter data error.', err),
            );
            stream.on(ETwitterStreamEvent.TweetParseError, err => 
                console.log('Tweet parse error.', err),
            );
            stream.on(ETwitterStreamEvent.Error, err =>
                console.log('General error. ', err),
            );
                
        } catch(e) {
            console.error("Twitter error:", e);
        }
    }
}