// NPM Modules
const log = require("npmlog");
const fs = require("fs");
let Watcher = require("feed-watcher");
const { Client, GatewayIntentBits, EmbedBuilder } = require("discord.js");

// Data files
let posted = require("./posted.json");
const config = require("./config.json");
const { post } = require("request");

let watcher = new Watcher(`https://www.reddit.com/r/${config.reddit.subreddit}.rss`, 10);
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});

let post_channel;
client.once("ready", () => {
  log.info(`Logged in as ${client.user.username}#${client.user.discriminator}`);
  post_channel = client.channels.cache.get("445824553604743178");
});

client.login(config.discord.token);

// if not interval is passed, 60s would be set as default interval.

let current;
// Check for new entries every n seconds.
watcher.on("new entries", function (entries) {
  entries.forEach(function (entry) {
    gaming(entry, post_channel);
  });
});
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
// Start watching the feed.
watcher
  .start()
  .then(function (entries) {
    entries.forEach((entry) => {
      gaming(entry, post_channel);
    });
  })
  .catch(function (error) {
    log.error(error);
  });

function gaming(entry, channel) {
  if (
    !posted.includes(entry.guid) &&
    (entry.title.includes("FREE") || entry.title.includes("100%"))
  ) {
    log.info("Uncring: " + truncate(entry.title, 100));
    posted.push(entry.guid);
    fs.writeFileSync("posted.json", JSON.stringify(posted));

    const gameEmbed = new EmbedBuilder()
      .setTitle(entry.title)
      .setURL(entry.link)
      .setTimestamp(entry.date);
    if (entry.image.url !== undefined) gameEmbed.setImage(entry.image.url);
    channel.send({
      content: config.discord.messagePrefix,
      embeds: [gameEmbed],
    });
  } else {
    log.info("Cringe: " + truncate(entry.title, 100));
    return undefined;
  }
}

function truncate(text, length) {
  if (text.length > length) return text.substring(0, length) + "...";
  else return text;
}

// Stop watching the feed.
watcher.stop();
