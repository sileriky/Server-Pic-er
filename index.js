//Import discord API functionality
const Discord = require('discord.js');

//Import google image API functionality
const GoogleImages = require('google-images');

//Import values from a local file
/* Values imported
token = token ID provided by discord 
CSEID = Google custom search engine ID
APIKEY = Google custom search api key
*/
const hv = require('./hiddenvars.js');

const bot = new Discord.Client();
const clientImg = new GoogleImages(hv.CSEID, hv.APIKEY);

var drinkers = {};

bot.once('ready', () => {
    console.log('Ready!');
    bot.user.setStatus("invisible");

    //Shows help command as status
    bot.user.setActivity('for !SP', {
            type: 'WATCHING'
        })
        .then(presence => console.log(`Activity set to ${presence.game ? presence.game.name : 'none'}`))
        .catch(console.error);
});

//Some random node.js error pops up every once in a while for some reason.
//Until further notice, this line ensures the bot will keep running and just log the error
bot.on('error', console.error);

//Message handlers
bot.on('message', message => {
    //The bot can make itself run commands; this check ensures 
    if (message.author.username === "Server Pic-er") {
        console.log("I just said this: " + message.content);
    } else {
        //left for debugging
        //console.log("Chat: " + message.content);
        //console.log("Author: " + message.author.username);

        //left for fun
        if (message.content === '!ping') {
            // send back "Pong." to the channel the message was sent in
            message.channel.send('Pong!');
        }

        //Adds the powa' of communication
        if (message.content.split(' ', 1)[0] === "!say") {
            var txtToSend = message.content.slice(5);
            message.delete()
                //.then(msg => console.log(`Deleted message from ${msg.author.username}`))
                .catch(console.error);
            message.channel.send(txtToSend)
                .then(message => console.log(`Sent message: ${message.content}`))
                .catch(console.error);
        }

        //Should inform users about all of their commands
        if ((message.content === '!SP') || (message.content === "!help")) {
            message.channel.send(
                'Welcome to your friendly neighborhood bot! Please, command me:\n' +
                '!SP or !help - Shows this menu!\n' +
                '!ping - Pong!\n' +
                '!image - Make me search for stuff!\n' +
                '!say ... - Make me say stuff!\n' +
                '!coffee - For when you need that extra kick!\n' +
                '!memory - For when you are feeling nostalgic (up to 100 messages ago)!\n'
            );
        }

        //React to being mentioned (BA#1)
        if (message.isMentioned(bot.user)) {
            message.reply('https://imgflip.com/i/um58q');
        }

        //Google for an image(BA#2)
        //CRASH: When no query (aka no text to search with)
        if (message.content.startsWith("!image")) {
            var txtToSrch = message.content.slice(7);
            //Select a random result from the first page of results
            var randSelect = Math.floor(Math.random() * 10);
            clientImg.search(txtToSrch, {
                    num: 1,
                    searchType: 'image'
                })
                .then(image => {
                    //console.log('I found this image: ' + image[0].url);
                    message.channel.send(image[randSelect].url);
                });
        }

        //Implement Coffee (BA#4)
        //Warning: Implemented poorly
        //TODO: raise arms in despair whilst shouting NOOOO and fixing this
        if (message.content.startsWith("!coffee")) {
            if (message.content.slice(8) === "reset") {
                drinkers = {};
                message.channel.send("All drink counters have been reset!");
            } else {
                var curUser = message.member.nickname || message.author.username;
                if (!Object.keys(drinkers).includes(curUser)) {
                    drinkers[curUser] = 1;
                } else {
                    drinkers[curUser] += 1;
                }
                //console.log(drinkers);
                message.channel.send(curUser + " just drank some coffee!\nThey had " + drinkers[curUser] + " cups so far.");
            }
        }

        //Posts one random message from the channel it got called in (BA#5)
        if (message.content.startsWith("!memory")) {
            message.channel.fetchMessages({ limit: 100 })
                .then(messages => message.channel.send(messages.random().content))
                .catch(console.error);
        }

        //BOT ADMIN COMMANDS
        //This ensures that I'm the only person able to perform admin commands
        //TODO: Check for a more unique check
        if (message.author.username === 'sileriky') {

            if (message.content === "!admin") {
                message.channel.send('Yessss?\n' +
                    '!update_pic\n' +
                    '!off\n' +
                    '!hide\n' +
                    '!unhide\n' +
                    '!emoji\n'
                );
            }

            //TODO: Implement updating pic of self
            if (message.content === "!update_pic") {
                console.log('Updating profile picture!');
                //Update work
            }

            if (message.content === "!off") {
                console.log("Turning off");
                message.channel.send("Bai!");
                bot.destroy();
            }

            if (message.content === "!hide") {
                console.log("Engage shush mode...");
                bot.user.setStatus("invisible");
            }

            if (message.content === "!unhide") {
                console.log("Engage unshush mode...");
                bot.user.setStatus('online');
            }

            //Blame Alex for this #3
            //Emoji creation admin interface and engine (BA#3)
            if (message.content.startsWith("!emoji")) {
                console.log("I'm adding an emoji to the server!");
                var msgParams = message.content.split(' ');
                var emojiUrl = msgParams[1];
                var emojiName = msgParams[2];
                message.guild.createEmoji(emojiUrl, emojiName)
                    .then(emoji => console.log(`Created new emoji with name ${emoji.name}`))
                    .catch(console.error);
            }
        }
    }
});

//Start bot
bot.login(hv.token);