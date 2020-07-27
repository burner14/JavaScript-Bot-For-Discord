const Discord = require('discord.js');
const client = new Discord.Client(); 
const ytdl = require('ytdl-core');

const token = 'TOKEN';

var servers = {};

const PREFIX = '!'; //adds a prefix to make sure that the bot is being talked to.

client.once('ready', () => { // notifies in console when bot is active on discord
    console.log('Ready!');
});

client.on('message', msg => { // makes sure bot is functioning in discord 
    if(msg.content === 'ping') {
        msg.reply('pong');
    }
});

client.on('message', message => {
    let args = message.content.substring(PREFIX.length).split(' '); //allows a space to be placed between video link and command

    switch (args[0]) {
        case 'play': // making a case variable for play

            function play(connection, message){
                var server = servers[message.guild.id];
                server.dispatcher = connection.playStream(ytdl(server.queue[0], {filter: "audioonly"})); // allows to bot to download song in audio form

                server.queue.shift(); // moves the queue down to create another song.

                server.dispatcher.on("end", function() { // when an audio clip ends
                    if(server.queue[0]){
                        play(connection, message); // moving from on song to the other
                    }

                    else {
                        connection.disconnect(); // disconnect for voice channel
                    }
                });
            }

            if(!args[1]) {
                message.reply("You need to provide a link address"); // user issues with music on discord
                return;
            }

            if(!message.member.voiceChannel) {
                message.reply("You need to be in a voice channel");
                return;
            }

            if(!servers[message.guild.id]) servers[message.guild.id] = { // Produces a queue for songs
                queue: []
            }

            var server = servers[message.guild.id]; // Adding server to the Array of servers above 

            server.queue.push(args[1]); // pushing new song down one on the list

            if(!message.guild.voiceConnection) message.member.voiceChannel.join().then(function(connection) {
                play(connection, message); // makes sure member is on voice channel before working (maybe the issue)
            });

        break;

        case 'skip':
            var server = servers[message.guild.id]; //detects the server array

            message.channel.send("skipping song"); 
            if(server.dispatcher) server.dispatcher.end(); //goes to end of song

        break;

        case 'stop':
            var server = servers[message.guild.id]; //detects the server array

            if(message.guild.voiceConnection) {
                for(var i = server.queue.length -1; i >= 0; i--) { // removing songs from queue
                    server.queue.splice(i, 1);
                }

                server.dispatcher.end(); // goes to end of song

                message.channel.send("ending song and queue of song");
                console.log("stopped the queue");
            }

            if(message.guild.connection) message.guild.voiceConnection.disconnect(); // disconnects from voice channel

        break;

        case 'help': //helps user use all of the commands
            message.reply("This is the commands that you can use with the bot:");
            message.channel.send("/// !play (plays music in voice channel)");
            message.channel.send("/// !stop (stops music in voice channel");
            message.channel.send("/// !skip (skippes to the nest song in the queue)");  
        break;

    }
});

client.login(token); // makes sure the token works with discord
