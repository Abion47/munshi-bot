const Discord = require('discord.js');
const client = new Discord.Client();

const welcomeChannels = {};

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', msg => {
    if (msg.content === '.ping') {
        msg.channel.send('pong');
    }

    if (msg.content.startsWith('.welcomeChannel')) {
        let split = msg.split(' ', 2);
        if (split.length != 2) { return }

        let channels = msg.guild.channels;
        for (let i = 0; i < channels; i++) {
            if (channels[i].name === split[1]) {
                welcomeChannels[msg.guild.name] = channels[i];
                msg.channel.send(`Added ${split[1]} as a welcome channel for server ${msg.guild.name}.`);
                break;
            }
        }
    }
});

client.on('guildMemberAdd', member => {
    let guildName = member.guild.name;
    let channel = welcomeChannels[guildName];
    
    if (channel) {
        channel.send(`Oh hi. Didn't hear you come in. @${member.displayName}, right?  Please have a seat, and read the #rules.`);
    }
});

client.login('NDQxODU5NzM1MjY5MTQ2NjU1.Dc2ZiQ.Ntmc8Lvcj6mcDaHyRvOuIcJKXus');