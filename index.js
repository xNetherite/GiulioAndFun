const Discord = require('discord.js');
const client = new Discord.Client({ partials: ['MESSAGE', 'CHANNEL', 'REACTION'] });

const mysql = require("mysql");
const Parser = require('expr-eval').Parser;
const moment = require('moment');

client.login(process.env.token);

client.on("ready", () => {
    console.log("-----GIULIOANDFUN ONLINE-----")

    var utente = client.users.cache.get("793768313934577664");
    var embed = new Discord.MessageEmbed()
        .setTitle("GiulioAndFun è ONLINE")
        .setThumbnail("https://i.postimg.cc/rmzJw77v/Profilo-bot3.png")
        .setColor("#72CA63")
    utente.send(embed);
})

var con = mysql.createPool({ //Connessione database Heroku
    connectionLimit: 1000,
    connectTimeout: 60 * 60 * 1000,
    acquireTimeout: 60 * 60 * 1000,
    timeout: 60 * 60 * 1000,
    host: 'eu-cdbr-west-03.cleardb.net',
    port: 3306,
    user: 'befa7e54b6975f',
    password: process.env.passworddb,
    database: 'heroku_331d3452eab82c9',
    charset: 'utf8mb4'
})

var ruoliMod = [
    "793796029878370326", //ADMIN
    "820031809046708254", //MOD "FINTO"
    "799925821904125962", //MOD
    "793804156430188594", //BOT
]

client.on("message", message => {
    message.content = message.content.trim().toLowerCase();

    if (message.author.bot) return
    if (message.channel.type == "dm") return

    con.query(`SELECT * FROM serverstats`, (err, result) => {
        if (err) {
            console.log(err);
            return
        }
        var serverstats = result[0];

        con.query(`SELECT * FROM userstats`, (err, result) => {
            if (err) {
                console.log(err);
                return
            }
            var userstatsList = result;

            //CANCELLARE COMANDO IN CANALE SBAGLIATO
            var comandiGiulioAndCommunityBot = {
                "!test": [],

                "-!cset": [],

                "-!cuser": ["801019779480944660", "793781899796938802"],
                "-!cuserstats": ["801019779480944660", "793781899796938802"],
                "-!cuserinfo": ["801019779480944660", "793781899796938802"],

                "-!cserver": ["801019779480944660", "793781899796938802"],
                "-!cserverstats": ["801019779480944660", "793781899796938802"],
                "-!cserverinfo": ["801019779480944660", "793781899796938802"],
            }

            var nomeComando;

            var utenteMod = false;
            for (var i = 0; i < ruoliMod.length; i++) {
                if (message.member.roles.cache.has(ruoliMod[i])) utenteMod = true;
            }

            var trovatoGiulioAndCommunityBot = false;
            var trovatoBot = false

            if (!trovatoBot) {
                for (var i = 0; i < Object.keys(comandiGiulioAndCommunityBot).length; i++) {
                    if (Object.keys(comandiGiulioAndCommunityBot)[i][0] == "-") {
                        if (message.content.startsWith(Object.keys(comandiGiulioAndCommunityBot)[i].slice(1))) {
                            trovatoGiulioAndCommunityBot = true;
                            nomeComando = Object.keys(comandiGiulioAndCommunityBot)[i]
                            if (message.content.length != Object.keys(comandiGiulioAndCommunityBot)[i].length - 1) {
                                if (message.content.slice(Object.keys(comandiGiulioAndCommunityBot)[i].length - 1)[0] != " ") {
                                    trovatoGiulioAndCommunityBot = false;
                                }
                            }
                        }
                    }
                    else {
                        if (message.content == Object.keys(comandiGiulioAndCommunityBot)[i]) {
                            trovatoGiulioAndCommunityBot = true;
                            nomeComando = Object.keys(comandiGiulioAndCommunityBot)[i]

                        }
                    }
                }
            }

            var canaleNotConcesso = false;
            if (trovatoGiulioAndCommunityBot) { //Comando esistente
                for (var i = 0; i < Object.keys(comandiGiulioAndCommunityBot).length; i++) {//Controllo canale corretto
                    for (var j = 0; j < eval("comandiGiulioAndCommunityBot['" + nomeComando + "']").length; j++) {
                        if (eval("comandiGiulioAndCommunityBot['" + nomeComando + "']")[j] != message.channel.id) {
                            canaleNotConcesso = true;
                        }
                        else {
                            canaleNotConcesso = false;
                            break
                        }
                    }
                }

                if (nomeComando[0] == "-") {
                    nomeComando = nomeComando.slice(1)
                }

                if (canaleNotConcesso) {
                    var canaliAdmin = ["804688929109966848", "793781905740922900", "793781906478858269"]

                    if (!canaliAdmin.includes(message.channel.id)) {
                        return
                    }
                }
            }
            else {
                if (message.content.startsWith("!") && !trovatoBot) {
                    //Comando non esistente
                    return
                }
            }

            //COUNTING
            var canaleCounting = "793781899796938802";
            if (message.channel == canaleCounting) {
                try {
                    if (message.content == "cos") return

                    var numero = Parser.evaluate(message.content); //Get numero scritto o risultato espressione

                    var index = userstatsList.findIndex(x => x.id == message.author.id);
                    var userstats;

                    if (index < 0) { //Se questo utente non c'è nel database

                        userstatsList[userstatsList.length] = {
                            id: message.author.id,
                            username: message.member.user.tag,
                            lastScore: 0,
                            bestScore: 0,
                            timeBestScore: 0,
                            timeLastScore: 0,
                            correct: 0,
                            incorrect: 0
                        }

                        var index = userstatsList.findIndex(x => x.id == message.author.id);
                        userstats = userstatsList[index];

                        addUserToUserstats(message.member)
                    }
                    else {
                        userstats = userstatsList[index];
                    }

                    if (message.author.id == serverstats.ultimoUtente) { //Se giocato lo stesso utente piu volte
                        var titleRandom = ["MA SAPETE COME SI GIOCA?", "MA È COSÌ DIFFICILE QUESTO GIOCO?", "NOOOO, PERCHÈ..."]
                        var embed = new Discord.MessageEmbed()
                            .setColor("#EB3140")
                            .setDescription("Ogni utente può scrivere un solo numero alla volta")
                        embed.setTitle(titleRandom[Math.floor(Math.random() * titleRandom.length)])
                        message.channel.send(embed)

                        userstats.incorrect = userstats.incorrect + 1;

                        serverstats.numero = 0;
                        serverstats.ultimoUtente = "NessunUtente";

                        message.react("🔴");
                    }
                    else if (numero - 1 != serverstats.numero) { //Numero sbagliato
                        var embed = new Discord.MessageEmbed()
                            .setColor("#EB3140")
                            .setDescription("Numero errato, dovevi inserire `" + (serverstats.numero + 1) + "`")

                        if (serverstats.numero == 0) {
                            var titleRandom = ["RIUSCIAMO A COMINCIARE ALMENO?", "DAI... ALMENO ARRIVIAMO A 10", "NON SO SE LO SAI MA IL PRIMO NUMERO È 1"]
                            embed.setTitle(titleRandom[Math.floor(Math.random() * titleRandom.length)])
                        }
                        else if (serverstats.numero <= 10) {
                            embed.setTitle(`FORTUNA CHE ERAVAMO SOLO A ${serverstats.numero}`)
                        }
                        else if (serverstats.numero <= 30) {
                            embed.setTitle(`MA SIETE SICURI DI SAPER CONTARE?`)
                        }
                        else if (serverstats.numero <= 50) {
                            var titleRandom = ["NOOOO, PERCHÈ...", "MEGLIO SE TORNATE A PROGRAMMARE", "PROPRIO ORA DOVEVATE SBAGLIARE?", "DAIII, STAVAMO FACENDO IL RECORD", message.member.user.username + " HAI ROVINATO I SOGNI DI TUTTI"]
                            embed.setTitle(titleRandom[Math.floor(Math.random() * titleRandom.length)])
                        }
                        else {
                            var titleRandom = ["IMMAGINO AVRETE 5 IN MATEMATICA, GIUSTO?", "MEGLIO SE TORNATE A PROGRAMMARE", "SIETE DELLE CAPRE"]
                            embed.setTitle(titleRandom[Math.floor(Math.random() * titleRandom.length)])
                        }
                        message.channel.send(embed)

                        userstats.incorrect = userstats.incorrect + 1;

                        serverstats.numero = 0;
                        serverstats.ultimoUtente = "NessunUtente";

                        message.react("🔴");
                    }
                    else { //Numero corretto
                        numero >= serverstats.bestScore ? message.react("🔵") : message.react("🟢")
                        numero >= serverstats.bestScore ? serverstats.timeBestScore = new Date().getTime().toString() : serverstats.timeBestScore;
                        serverstats.numero = serverstats.numero + 1;
                        serverstats.ultimoUtente = message.author.id
                        serverstats.bestScore = numero > serverstats.bestScore ? serverstats.bestScore = numero : serverstats.bestScore

                        userstats.username = message.member.user.tag;
                        userstats.lastScore = numero;
                        userstats.timeBestScore = numero > userstats.bestScore ? new Date().getTime() : userstats.timeBestScore;
                        userstats.timeLastScore = new Date().getTime();
                        userstats.bestScore = numero > userstats.bestScore ? userstats.bestScore = numero : userstats.bestScore;
                        userstats.correct = userstats.correct + 1;

                    }
                    updateServerstats(serverstats)
                    updateUserstats(userstats, message.member)
                }
                catch {
                }
            }

            if (message.content.startsWith("!cuser")) {
                if (message.content == "!cuser" || message.content == "!cuserstats" || message.content == "!cuserinfo") {
                    var utente = message.member;
                }
                else {
                    var utente = message.mentions.members.first()
                    if (!utente) { //Per id
                        var args = message.content.split(/\s+/);
                        var utente = Object.fromEntries(message.guild.members.cache.filter(utente => utente.id == args[1]))[Object.keys(Object.fromEntries(message.guild.members.cache.filter(utente => utente.id == args[1])))[0]];
                        if (!utente) { //Per username
                            if (message.content.startsWith("!userstats")) {
                                var nome = message.content.slice(12).trim()
                            }
                            else if (message.content.startsWith("!userinfo")) {
                                var nome = message.content.slice(11).trim()

                            }
                            else {
                                var nome = message.content.slice(7).trim()
                            }
                            var utente = Object.fromEntries(message.guild.members.cache.filter(utente => utente.user.username.toLowerCase() == nome.toLowerCase()))[Object.keys(Object.fromEntries(message.guild.members.cache.filter(utente => utente.user.username.toLowerCase() == nome.toLowerCase())))[0]];
                            if (!utente) { //Per tag
                                var utente = Object.fromEntries(message.guild.members.cache.filter(utente => utente.user.tag.toLowerCase() == nome.toLowerCase()))[Object.keys(Object.fromEntries(message.guild.members.cache.filter(utente => utente.user.tag.toLowerCase() == nome.toLowerCase())))[0]];
                            }
                        }
                    }
                }
                if (!utente) {
                    var embed = new Discord.MessageEmbed()
                        .setTitle("Utente non trovato")
                        .setThumbnail("https://i.postimg.cc/zB4j8xVZ/Error.png")
                        .setColor("#ED1C24")
                        .setDescription("`!userinfo [user]`")

                    message.channel.send(embed).then(msg => {
                        message.delete({ timeout: 7000 })
                        msg.delete({ timeout: 7000 })
                    })
                    return
                }

                var index = userstatsList.findIndex(x => x.id == utente.user.id);
                if (index < 0) { //Se questo utente non c'è nel database
                    var embed = new Discord.MessageEmbed()
                        .setTitle("Non ha mai giocato")
                        .setThumbnail("https://i.postimg.cc/JnJw1q5M/Giulio-Sad.png")
                        .setColor("#8F8F8F")
                        .setDescription("Questo utente non ha mai giocato a Couting")

                    message.channel.send(embed).then(msg => {
                        message.delete({ timeout: 7000 })
                        msg.delete({ timeout: 7000 })
                    })
                    return
                }

                userstats = userstatsList[index];

                var leaderboard = userstatsList.sort((a, b) => (a.bestScore < b.bestScore) ? 1 : ((b.bestScore < a.bestScore) ? -1 : 0))
                var position = leaderboard.findIndex(x => x.id == utente.user.id) + 1

                if (err) console.log(err);
                if (!err && Object.keys(result).length > 0) {
                    var position = result.findIndex(x => x.id == utente.user.id) + 1
                }

                var embed = new Discord.MessageEmbed()
                    .setTitle("COUNTING - " + utente.user.tag)
                    .setDescription("Tutte le statistiche di **counting** su questo utente")
                    .setThumbnail(utente.user.avatarURL({ dynamic: true }))
                    .addField(":trophy: Best score", "```" + userstats.bestScore + " (" + moment(new Date(parseInt(userstats.timeBestScore))).fromNow() + ")```", true)
                    .addField(":chart_with_upwards_trend: Rank", "```#" + position + "```", true)
                    .addField(":medal: Last score", "```" + userstats.lastScore + " (" + moment(new Date(parseInt(userstats.timeLastScore))).fromNow() + ")```", true)
                    .addField(":white_check_mark: Total correct", "```" + userstats.correct + " (" + (100 * userstats.correct / (userstats.correct + userstats.incorrect)).toFixed(2) + "%)```", true)
                    .addField(":x: Total incorrect", "```" + userstats.incorrect + " (" + (100 * userstats.incorrect / (userstats.correct + userstats.incorrect)).toFixed(2) + "%)```", true)

                message.channel.send(embed)
            }

            if (message.content == "!cserver" || message.content == "!cserverinfo" || message.content == "!cserverstats") {

                var leaderboardBestScoreList = userstatsList.sort((a, b) => (a.bestScore < b.bestScore) ? 1 : ((b.bestScore < a.bestScore) ? -1 : 0))

                var leaderboardBestScore = "";
                var utente;
                for (var i = 0; i < 10; i++) {
                    if (leaderboardBestScoreList.length - 1 < i) {
                        break
                    }

                    utente = leaderboardBestScoreList[i].username.slice(0, -5);
                    switch (i) {
                        case 0:
                            leaderboardBestScore += ":first_place: ";
                            break
                        case 1:
                            leaderboardBestScore += ":second_place: "
                            break
                        case 2:
                            leaderboardBestScore += ":third_place: "
                            break
                        default:
                            leaderboardBestScore += "**#" + (i + 1) + "** "


                    }
                    leaderboardBestScore += utente + " - **" + leaderboardBestScoreList[i].bestScore + "**\r";
                }

                var leaderboardCorrectList = userstatsList.sort((a, b) => (a.correct < b.correct) ? 1 : ((b.correct < a.correct) ? -1 : 0))
                var leaderboardCorrect = "";
                for (var i = 0; i < 10; i++) {
                    if (leaderboardCorrectList.length - 1 < i) {
                        break
                    }
                    var utente = leaderboardCorrectList[i].username.slice(0, -5);
                    switch (i) {
                        case 0:
                            leaderboardCorrect += ":first_place: ";
                            break
                        case 1:
                            leaderboardCorrect += ":second_place: "
                            break
                        case 2:
                            leaderboardCorrect += ":third_place: "
                            break
                        default:
                            leaderboardCorrect += "**#" + (i + 1) + "** "


                    }
                    leaderboardCorrect += utente + " - **" + leaderboardCorrectList[i].correct + "**\r";
                }

                var embed = new Discord.MessageEmbed()
                    .setTitle("COUNTING - GiulioAndCommunity")
                    .setThumbnail(message.member.guild.iconURL({ dynamic: true }))
                    .setDescription("La classifica del server su **counting**")
                    .addField(":1234: Current Number", "```" + serverstats.numero + "```", true)
                    .addField(":medal: Last user", serverstats.ultimoUtente != "NessunUtente" ? "```" + client.users.cache.find(u => u.id == serverstats.ultimoUtente).username + "```" : "```None```", true)
                    .addField(":trophy: Best score", "```" + serverstats.bestScore + " - " + leaderboardBestScoreList[0].username + " (" + moment(parseInt(serverstats.timeBestScore)).fromNow() + ")```", false)
                    .addField("Leaderboard (by Best Score)", leaderboardBestScore, true)
                    .addField("Leaderboard (by Correct)", leaderboardCorrect, true)

                message.channel.send(embed)
            }

            if (message.content.startsWith("!cset")) {
                if (!utenteMod) {
                    var embed = new Discord.MessageEmbed()
                        .setTitle("Non hai il permesso")
                        .setThumbnail("https://i.postimg.cc/D0scZ1XW/No-permesso.png")
                        .setColor("#9E005D")
                        .setDescription("Non puoi eseguire il comando `!test` perchè non hai il permesso")

                    message.channel.send(embed).then(msg => {
                        message.delete({ timeout: 7000 })
                        msg.delete({ timeout: 7000 })
                    })
                    return
                }

                var args = message.content.split(/\s+/);
                if (!args[1]) {
                    var embed = new Discord.MessageEmbed()
                        .setTitle("Inserire un valore")
                        .setThumbnail("https://i.postimg.cc/zB4j8xVZ/Error.png")
                        .setColor("#ED1C24")
                        .setDescription("`!cset [count]`")

                    message.channel.send(embed).then(msg => {
                        message.delete({ timeout: 7000 })
                        msg.delete({ timeout: 7000 })
                    })
                    return
                }

                var count = parseInt(args[1])
                if (!count) {
                    var embed = new Discord.MessageEmbed()
                        .setTitle("Inserire un valore valido")
                        .setThumbnail("https://i.postimg.cc/zB4j8xVZ/Error.png")
                        .setColor("#ED1C24")
                        .setDescription("`!cset [count]`")

                    message.channel.send(embed).then(msg => {
                        message.delete({ timeout: 7000 })
                        msg.delete({ timeout: 7000 })
                    })
                    return
                }

                serverstats.numero = count;
                serverstats.ultimoUtente = "NessunUtente"
                updateServerstats(serverstats)

                var embed = new Discord.MessageEmbed()
                    .setTitle("Ultimo numero cambiato")
                    .setThumbnail("https://i.postimg.cc/SRpBjMg8/Giulio.png")
                    .setColor("#16A0F4")
                    .setDescription("L'ultimo numero è stato cambiato in " + count + ", ora potete continuare a contare")

                message.channel.send(embed)
            }
        })
    })
})

client.on("messageDelete", message => {
    con.query(`SELECT * FROM serverstats`, (err, result) => {
        if (err) {
            console.log(err);
            return
        }
        var serverstats = result[0];
        try {
            var numero = Parser.evaluate(message.content);

            if (message.channel == "793781899796938802") {
                if (numero < serverstats.numero) {
                    return
                }

                if (numero != serverstats.numero) { //Se giocato lo stesso utente piu volte
                    return
                }

                var titleRandom = ["PENSAVI DI FREGARMI EH!", "TE LO ELIMINI E IO LO RISCRIVO...", "PENSI DI ESSERE FURBO? BHE LO SEI", "TI SENTI SIMPATICO?"]
                var embed = new Discord.MessageEmbed()
                    .setTitle(titleRandom[Math.floor(Math.random() * titleRandom.length)])
                    .setDescription(message.author.toString() + " ha eliminato il numero `" + numero + "`")
                    .setColor("#148eff");

                message.channel.send(embed)

                message.channel.send(numero)
                    .then(msg => {
                        msg.react("🟢");
                    })

            }
        } catch {
            return
        }
    })
})

client.on("messageUpdate", oldMessage => {
    con.query(`SELECT * FROM serverstats`, (err, result) => {
        if (err) {
            console.log(err);
            return
        }
        var serverstats = result[0];
        try {
            if (oldMessage.content == "")
                return
            if (oldMessage.channel == "793781899796938802") {
                var numero = Parser.evaluate(oldMessage.content);

                if (numero < serverstats.numero) {
                    return
                }

                if (numero != serverstats.numero) { //Se giocato lo stesso utente piu volte
                    return
                }

                var titleRandom = ["PENSAVI DI FREGARMI EH!", "CREDI DI FREGARMI?", "TE LO MODIFICHI E IO LO RISCRIVO...", "PENSI DI ESSERE FURBO? BHE LO SEI", "TI SENTI SIMPATICO?"]
                var embed = new Discord.MessageEmbed()
                    .setTitle(titleRandom[Math.floor(Math.random() * titleRandom.length)])
                    .setDescription(oldMessage.author.toString() + " ha modificato il numero `" + numero + "`")
                    .setColor("#148eff");

                oldMessage.channel.send(embed)

                oldMessage.channel.send(numero)
                    .then(msg => {
                        msg.react("🟢");
                    })
            }
        } catch {
            return
        }
    })
})

function addUserToUserstats(utente) {
    con.query(`INSERT INTO userstats VALUES (${utente.user.id}, '${utente.user.tag}', 0, 0, 0, 0, 0, 0)`, (err) => {
        if (err) {
            console.log(err);
            return
        }
    })
}

function updateServerstats(serverstats) {
    con.query(`UPDATE serverstats SET numero = ${serverstats.numero}, ultimoUtente = '${serverstats.ultimoUtente}', bestScore = ${serverstats.bestScore}, timeBestScore = ${serverstats.timeBestScore}`, (err) => {
        if (err) {
            console.log(err)
            return
        }
    })
}

function updateUserstats(userstats, utente) {
    con.query(`UPDATE userstats SET username = '${utente.user.tag}', lastScore = ${userstats.lastScore}, bestScore = ${userstats.bestScore}, timeBestScore = ${userstats.timeBestScore}, correct = ${userstats.correct}, incorrect = ${userstats.incorrect}, timeLastScore = ${userstats.timeLastScore} WHERE id = ${utente.user.id}`, (err) => {
        if (err) {
            console.log(err)
            return
        }
    })
}
