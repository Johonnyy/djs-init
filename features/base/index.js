require("dotenv").config();
const { useEvents, useCommands } = require("./djss.config.js");

const { Client, Collection, GatewayIntentBits } = require("discord.js");
const token = process.env.TOKEN;

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

if (useEvents) require("./managers/events.js")(client);
if (useCommands) require("./managers/commands.js")(client);

// Log in to Discord with your client's token
client.login(token);

module.exports = client;
