// Require the necessary discord.js classes
require('dotenv').config();
const { Client, Intents } = require('discord.js');
require('moment');
const DATE_FORMATER = require( 'dateformat' );

// Create a new client instance
const bot = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

const token = process.env.token;
const prefix = process.env.prefix;
const db_username =  process.env.sql_username;
const db_name =  process.env.sql_username;
const db_password =  process.env.sql_username;


/* ----------- DATABASE ----------- */

const Sequelize = require("sequelize");
const sequelize = new Sequelize(db_username, db_name, db_password,  {
  dialect: "mysql",
  host: "localhost",
  operatorsAliases: 0, 
  timezone: "+03:00"
});

const User = sequelize.define("dsUser", {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false
    },
    userid: {
      type: Sequelize.BIGINT,
      allowNull: false
    },
    xp: {
      type: Sequelize.INTEGER,
      allowNull: false
    }
});
sequelize.sync().then(result=>{
    console.log(result);
})
.catch(err=> console.log(err));

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min; //Максимум и минимум включаются
  }


bot.on('message', message => {
    let usr = message.author;
    let usrid = BigInt(usr.id)
    if (message.author.bot) return;
    
    switch (message.content) {
        case `${prefix}hello`:
            console.log(message.content, message.author);
            message.channel.send('Антихайп, ' + message.author.username + '!');
            break;
        case `${prefix}server`:
            console.log(message.content, message.author);
            message.channel.send(`Сообщество: ${message.guild.name}\nУчастников: ${message.guild.memberCount}`);
            break;
        case `${prefix}ping`:
            console.log(message.content, message.author);
            message.channel.send(`pong!`);
            break;
        case `${prefix}php`:
            console.log(message.content, message.author);
            message.channel.send(`Это, бесспорно, лучший язык программирования!`);
            break;
        case `${prefix}level`:
            console.log(message.content, message.author);
            User.findOne({where: {userid: usrid}})
            .then(user=>{
                
                message.channel.send(`ID: ${user.id}\nXP: ${user.xp}`);
            }).catch(err=>console.log(err));
            break;
        default:
            
            User.findOne({where: {userid: usrid}})
            .then(user=>{
                if(!user) {
                    User.create({
                        userid: usrid,
                        xp: 0
                    }).then(res=>{
                        console.log(res);
                    }).catch(err=>console.log(err));
                    return;
                } else {
                    if (user.updatedAt) {
                        let dateResult = Math.abs(new Date() - new Date(user.updatedAt)) / 60000;
                        
                        if (dateResult >= 1) {
                            User.update({ xp: user.xp + getRandomInt(15, 30) }, {
                                where: {userid: usrid}
                            }).then((res) => {
                                console.log(res);
                                console.log(user.updatedAt);
                            });
                            console.log("Минута прошла, опыт начислился");
                        } else if (dateResult < 1) {
                            console.log("Прошло меньше минуты, опыта не дам!");
                        } else {
                            console.error("Хуй знамо чё");
                        }
                        
                    }
                }
            }).catch(err=>console.log(err));
    }
});

/* ----------- BOT ----------- */

bot.login(token);

// Запуск бота

bot.on('ready', () => {
    console.info(`Logged in as ${bot.user.tag}!`);
    console.info(`Current prefix: ${prefix}`);
});