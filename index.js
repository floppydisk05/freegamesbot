const RedditScraper = require("reddit-scraper");
const log = require('npmlog');
const fs = require('fs');
const config = require('./config.json');

let postedRAW = fs.readFileSync('posted.json');
let posted = JSON.parse(postedRAW);

const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const { token } = require('./config.json');
const { title } = require("process");
const { url } = require("inspector");

// Create a new client instance
const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildMembers,
	],
});
// When the client is ready, run this code (only once)
client.once('ready', () => {
	log.info(`Logged in as ${client.user.username}`);
});

client.on("messageCreate", async (message) => {
    if (message.author.bot) return false; 

    if (message.content.startsWith(config.discord.prefix)) {
        if (message.content === "+test") {
            gaming(message);
        }
    }
});

client.login(config.discord.token);


async function gaming(msg) {
 
    const redditScraperOptions = {
        AppId: config.reddit.appID,
        AppSecret: config.reddit.appSecret
    };
 
    const requestOptions = {
        Pages: 20,
        Records: 100,
        SubReddit: "gamedeals",
        SortType: "hot",
    };
    let titles = "";
 
    try {
        log.info("Scraping r/gamedeals");
        const redditScraper = new RedditScraper.RedditScraper(redditScraperOptions);
        const scrapedData = await redditScraper.scrapeData(requestOptions);
        //console.log(scrapedData);
        let title, url;
        let count = 0;
        let cunt = 0;
        log.info(`${requestOptions.Pages} pages / ${requestOptions.Records} records`);
        /*scrapedData.forEach(post => {
            cunt++;
            title = post.data.title;
            url = post.data.url_overridden_by_dest;
            if (url === undefined) url = post.data.url;
            if (title.includes("100%") && url !== undefined) {
                if (!posted.includes(post.data.id)) {
                    //console.log(`ID: ${post.data.id}\nTitle: ${title}\nURL: ${post.data.url_overridden_by_dest}`);
                    titles += `${title}\n`;
                    //posted.push(post.data.id);
                    count++;
                }
            }
            if (count === 1) return;
        });*/
        log.info(`Results: ${count}`);
        //log.info(`FUCKING SHIT (${cunt})`);

        let gamepost = scrapedData[0].data;
        //return titles;
        url = gamepost.url_overridden_by_dest;
        if (url === undefined) url = gamepost.url;
        if (url === undefined) url = "no";
        const cringe = new EmbedBuilder()
        	.setTitle(gamepost.title)
        	.setURL(url)
        	.setDescription("h")
        	.setTimestamp();
                        
        msg.reply({embeds:[cringe]});
    } catch (error) {
        console.error(error);
    }

    postedRAW = JSON.stringify(posted);
    //fs.writeFileSync('posted.json', postedRAW);
};