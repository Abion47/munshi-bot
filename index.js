const Discord = require('discord.js');
const client = new Discord.Client();

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', msg => {
    if (msg.content === '.ping') {
        msg.channel.send('pong');
    }
});

client.login('NDQxODU5NzM1MjY5MTQ2NjU1.Dc2ZiQ.Ntmc8Lvcj6mcDaHyRvOuIcJKXus');