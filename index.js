const Discord = require("discord.js");
const tokenfile = require("./tokenfile.json");
const botconfig = require("./botconfig.json");
const bot = new Discord.Client({disableEveryone: true});
const fs = require("fs");
const randomPuppy = require('random-puppy');
const superagent = require('superagent');
const { checkout } = require("superagent");
const { channel } = require("diagnostics_channel");
const ms = require("ms");
var weather = require(`weather-js`);
const discord = require('discord.js'); 
const client = new discord.Client(); 
const db = require("quick.db");
const CoinGecko = require('coingecko-api');
const CoinGeckoClient = new CoinGecko();
const os = require('os');
const { version, MessageEmbed } = require('discord.js');
///////////////////////////////////////
bot.commands = new Discord.Collection();
bot.aliases = new Discord.Collection();
bot.snipes = new Discord.Collection();

bot.categories = fs.readdirSync("./commands/");

["command"].forEach(handler => {
    require(`./handlers/${handler}`)(bot)
});

bot.on("message", async message => {
    let prefix = botconfig.prefix;


    if(message.author.bot) return;
    if(!message.guild) return;
    if(!message.content.startsWith(prefix)) return;
    if(!message.member) message.member = await message.guild.fetchMember(message)

    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    const cmd = args.shift().toLowerCase();

    if(cmd.length === 0) return;

    let command = bot.commands.get(cmd);
    if(!command) command = bot.commands.get(bot.aliases.get(cmd));

    if(command)
    command.run(client, message, args);
});
let botname = "Jupiter"
bot.on("ready" , async() => {
    console.log(`${bot.user.username} elindult!`)
    let státuszok = [
        "verzió: 2.0.0",
        "prefix: ?",
        "Fejlesztők: Kingston4417, venya",
        `${bot.guilds.cache.size}  szerver`,
        "A helpért: ?help",
    ]
    setInterval(function() {
        let status = státuszok[Math.floor(Math.random()* státuszok.length)]
        bot.user.setActivity(status, {type: "WATCHING"})
    }, 3000)
})
bot.on("message", async message => {
    var MessageArray = message.content.split(" "); 
    var cmd = MessageArray[0]; 
    var args = MessageArray.slice(1);  
    var prefix = botconfig.prefix;

    if(cmd === `${prefix}setwelcome`){

        let welcome = message.mentions.channels.first()

        db.set(`welcomechanneldb_${message.guild.id}`, welcome.id)

        message.channel.send(`Sikeresen beállítottad a ${welcome} szobát üdvözlő csatornának`)

        if(!welcome) {
            return message.channel.send("Jelöld meg az üdvözlő csatornát")
          }
    }


    if(cmd === `${prefix}setbye`){

        let bye = message.mentions.channels.first()

        db.set(`byechanneldb_${message.guild.id}`, bye.id)

        message.channel.send(`Sikeresen beállítottad a ${bye} szobát kilépő csatornának`)

        if(!bye) {
            return message.channel.send("Jelöld meg a kilépő csatornát")
        }
    }

    if(cmd ==`${prefix}setlog`){
        if(args[0] === "on"){

            let ch = message.mentions.channels.first()

            if(!ch){
                message.channel.send("Adj meg egy csatornát ahova logolhatok")
            }

            db.set(`logch_${message.guild.id}`, ch.id)
            message.channel.send(`Sikeresen beállítottad log csatornának a(z) ${ch} csatornát!`)
        }
        if(args[0] === "off"){

            db.delete(`logch_${message.guild.id}`)
            message.channel.send("Sikeresen kikapcsoltad a log rendszert!")

        }

        if(!args[0]){

            message.channel.send(`Kérlek add meg hogy mit akarsz csinálni! \n> Bekapcs: ${prefix}setlog on #csatorna \n> Kikapcs: ${prefix}setlog off`)
        }
    }

    if(cmd === `${prefix}ping`){
        var yourping = new Date().getTime() - message.createdTimestamp
        var botping = Math.round(bot.ws.ping)
        
        message.channel.send(`A te pinged -🏓 : ${yourping} \nA bot pingje -🏓 : ${botping}`)
}

    if(cmd === `${prefix}botinfo`){
        const embed = new MessageEmbed()
        .setTitle('Bot Statisztkák')
        .setColor('RANDOM')
        .addFields(
            {
                name: '<:server:879374547864936448> Szerverek',
                value: `Összesen ${client.guilds.cache.size} szerveren.`,
                inline: true
            },
            {
                name: '<:channels:879515584407162982> Csatornák',
                value: `Összesen ${client.channels.cache.size} ennyi csatorna.`,
                inline: true
            },
            {
                name: '<:user:879371469048664115> Felhasználók',
                value: `Összesen ${client.users.cache.size} ennyi felhasználó.`,
                inline: true
            },
            {
                name: '<:djs:879371469094805564> Discord.js verzió',
                value: `${version}`,
                inline: true
            },
            {
                name: '<:node:879371469015097374> Node.js verzió',
                value: `${process.version}`,
                inline: true
            },
            {
                name: '<:computer:879379500322922507> ARCH',
                value: `\`${os.arch()}\``,
                inline: true
            },
            {
                name: '<:computer:879379500322922507> Platform',
                value: `\`${os.platform()}\``,
                inline: true
            },
            {
                name: '<:memory:879371468876701786> Memória',
                value: `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)}mb`,
                inline: true
            },
            {
                name: '<:cpu:879371469052846110> CPU',
                value: `\`\`\`md\n${os.cpus().map(i => `${i.model}`)[0]}\`\`\``,
                inline: true
            },
        )   
    await message.channel.send(embed)
}

    

})
    


    
bot.on('guildMemberAdd', member => {

    let welcomechannel = db.get(`welcomechanneldb_${member.guild.id}`)

    if(welcomechannel === null) { 
        return;
    }
const wembed = new Discord.MessageEmbed()
.setTitle(` Üdvözöllek a szerveren: ${member.user.username} `)
.setDescription(`Érezd jól magadat a szerveren`)



    bot.channels.cache.get(welcomechannel).send(wembed)

});


bot.on('guildMemberRemove', member => {

    let byechannel = db.get(`byechanneldb_${member.guild.id}`)

    if(byechannel === null) { 
        return;
    }
    const lembed = new Discord.MessageEmbed()
    .setTitle(` Elhagyta a szervert: ${member.user.username} `)
    .setDescription(`Reméljük valamikor visszatérsz egyszer köreinkbe`)

    bot.channels.cache.get(byechannel).send(lembed)

});
    bot.on("channelDelete", channel => {
        let ch = db.get(`logch_${channel.guild.id}`)
        if(ch === null){
            return;
        }
    
        bot.channels.cache.get(ch).send(`Töröltek egy csatornát a neve ${channel.name}`)
    })
    
    bot.on("emojiCreate", emoji => {
        let ch = db.get(`logch_${emoji.guild.id}`)
        if(ch === null){
            return;
        }
    
        bot.channels.cache.get(ch).send(`Létrehoztak egy emojit: ${emoji} a neve :${emoji.name}:`)
    })
    
    bot.on("emojiDelete", emoji => {
        let ch = db.get(`logch_${emoji.guild.id}`)
        if(ch === null){
            return;
        }
    
        bot.channels.cache.get(ch).send(`Töröltek egy emojit a neve :${emoji.name}:`)
    })
    bot.on("guildMemberAdd", member => {
        let ch = db.get(`logch_${member.guild.id}`)
        if(ch === null){
            return;
        }
    
        bot.channels.cache.get(ch).send(`Csatlakozott egy ember a neve ${member.user.tag}`)
    })
    
    bot.on("guildMemberRemove", member => {
        let ch = db.get(`logch_${member.guild.id}`)
        if(ch === null){
            return;
        }
    
        bot.channels.cache.get(ch).send(`Kilépett egy ember a neve ${member.user.tag}`)
    })
    
    bot.on("inviteCreate", invite => {
        let ch = db.get(`logch_${invite.guild.id}`)
        if(ch === null){
            return;
        }
    
        bot.channels.cache.get(ch).send(`Létrehoztak egy új meghívót: ${invite}`)
    })
    
    bot.on("inviteDelete", invite => {
        let ch = db.get(`logch_${invite.guild.id}`)
        if(ch === null){
            return;
        }
    
        bot.channels.cache.get(ch).send(`Töröltek egy meghívót : ${invite}`)
    })
    
    bot.on("messageDelete", message => {
        let ch = db.get(`logch_${message.guild.id}`)
        if(ch === null){
            return;
        }
    
        bot.channels.cache.get(ch).send(`Töröltek egy üzenetet az üzenet: ${message}`)
    })
    
    
    bot.on("roleCreate", role => {
        let ch = db.get(`logch_${role.guild.id}`)
        if(ch === null){
            return;
        }
    
        bot.channels.cache.get(ch).send(`Létrehoztak egy rangot a rang neve: ${role}`)
    })
    bot.on("roleDelete", role => {
        let ch = db.get(`logch_${role.guild.id}`)
        if(ch === null){
            return;
        }
    
        bot.channels.cache.get(ch).send(`Töröltek egy rangot a rang neve: ${role.name}`)
    })
 /*   bot.on("channelPinsUpdate", role => {
        let ch = db.get(`logch_${role.guild.id}`)
        if(ch === null){
            return;
        }
    
        bot.channels.cache.get(ch).send(`Töröltek egy rangot a rang neve: ${role.name}`)
    })*/

    
    
    
bot.login(tokenfile.token);