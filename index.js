const Discord = require('discord.js');
const sqlite = require('sqlite');
const config = require('./config.json');

const client = new Discord.Client();
const dbPromise = sqlite.open('./store.db', { Promise });
const welcomeChannels = {};
const ruleChannels = {};

var db;

client.on('ready', async () => {
    console.log(`Logged in as ${client.user.tag}!`);

    try {
        db = await dbPromise;

        // Repopulate welcomeChannels
        // Repopulate rulesChannels
        const [wc, rc] = await Promise.all([
            db.all('SELECT guild_name, channel_name FROM welcomeChannels;'),
            db.all('SELECT guild_name, channel_name FROM rulesChannels;'),
        ]);

        for (let i = 0; i < wc.length; i++) {
            welcomeChannels[wc[i].guild_name] = wc[i].channel_name;
        }
        console.log(JSON.stringify(welcomeChannels));

        for (let i = 0; i < rc.length; i++) {
            ruleChannels[rc[i].guild_name] = rc[i].channel_name;
        }
        console.log(JSON.stringify(ruleChannels));
    } catch (err) {
        
    }
});

client.on('message', async msg => {
    if(msg.author.bot) return;
    if(!msg.content.startsWith('.')) return;

    const split = msg.content.split(' ');
    const cmd = split[0];
    const args = split.slice(1);

    // Ping
    if (cmd === '.ping') {
        msg.channel.send('pong');
    }

    // Set Welcome Channel
    if (cmd === '.setwelcome') {
        if (args.length !== 1) { return }

        let channel = msg.guild.channels.find('name', args[0]);
        if (channel) {
            welcomeChannels[msg.guild.name] = args[0];
            
            let stmt = db.prepare('INSERT OR REPLACE INTO welcomeChannels (guild_name, channel_name) VALUES (?,?);');
            await stmt.run(msg.guild.name, args[0]);

            msg.channel.send(`Added ${args[0]} as a welcome channel for server '${msg.guild.name}'.`);
        } else {
            msg.channel.send(`Could not find channel '${args[0]}' on the server '${msg.guild.name}'.`)
        }
    }

    // Set Rules Channel
    if (cmd === '.setrules') {
        if (args.length !== 1) { return }

        let channel = msg.guild.channels.find('name', args[0]);
        if (channel) {
            ruleChannels[msg.guild.name] = args[0];
            
            let stmt = db.prepare('INSERT OR REPLACE INTO rulesChannels (guild_name, channel_name) VALUES (?,?);');
            await stmt.run(msg.guild.name, args[0]);

            msg.channel.send(`Added '${args[0]}' as a rule channel for server '${msg.guild.name}'.`);
        } else {
            msg.channel.send(`Could not find channel '${args[0]}' on the server '${msg.guild.name}'.`)
        }
    }

    // Query HPL3 Wiki
    if (cmd === '.hpl3') {
        if (args.length === 0) { return }
        if (args[0] === '-setalias') {
            if (msg.member.permissions.has('KICK_MEMBERS', true)) {
                if (args.length !== 3) {
                    msg.reply('This command requires three arguments (`.hpl3 -setalias <alias name> <keyword>`)');
                } else {
                    await db.run('INSERT OR REPLACE INTO hpl3Alias (alias, keyword) VALUES (?,?);', args[1], args[2]);
                    msg.reply(`Added alias \`${args[1]}\` for keyword \`${args[2]}\` successfully.`);
                }
            } else {
                msg.reply('You do not have sufficient privileges to access this command.');
            }
        } else {
            let data = null;
            let row = await db.get('SELECT keyword, url FROM hpl3Reference WHERE keyword = ?', args[0]);
            if (row) {
                data = row;
            } else {
                let alias = await db.get('SELECT alias, keyword FROM hpl3Alias WHERE alias = ?', args[0]);
                if (alias) {
                    row = await db.get('SELECT keyword, url FROM hpl3Reference WHERE keyword = ?', alias.keyword);
                    if (row) {
                        data = row;
                    }
                }
            }

            if (data) {
                msg.channel.send({
                    embed: {
                        fields: [
                            {
                                name: "Function Name",
                                value: '`' + data.keyword + '`'
                            },
                            {
                                name: "Wiki Reference",
                                value: data.url
                            }
                        ]
                    }
                });
            } else {
                msg.channel.send(`Could not find an HPL3 script reference for the term '${args[0]}'.`);
            }
        }
    }
});

// New user joined server
client.on('guildMemberAdd', member => {
    let guildName = member.guild.name;
    let channel = member.guild.channels.find('name', welcomeChannels[guildName]);
    let rule = member.guild.channels.find('name', ruleChannels[guildName]);
    
    if (channel && rule) {
        channel.send(`Oh hi. Didn't hear you come in. ${member}, right?  Please have a seat, and read the ${rule}.`);
    } else {
        console.log('Welcome message sending failed.');
        if (!channel) {
            console.log(`Could not find welcome channel '${args[0]}' on the server '${msg.guild.name}'.`);
        }
        if (!rule) {
            console.log(`Could not find rules channel '${args[0]}' on the server '${msg.guild.name}'.`);
        }
    }
});

client.login(config.token);