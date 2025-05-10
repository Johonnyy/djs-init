require("dotenv").config();
import { useEvents, useCommands, useMongoDB, useJSONDB } from "./djsi.config";
import { Client, GatewayIntentBits } from "discord.js";
import path from "path";
import { ExpandedClient } from "./types";

const token = process.env.TOKEN;

// Create a new client instance
const client = new Client({
	intents: [GatewayIntentBits.Guilds],
}) as ExpandedClient;

const managers = [
	{ enabled: useEvents, path: "./managers/events" },
	{ enabled: useCommands, path: "./managers/commands" },
	{ enabled: useMongoDB, path: "./managers/database" },
	{ enabled: useJSONDB, path: "./managers/jsonDB" },
];

managers.forEach(({ enabled, path: managerPath }) => {
	if (enabled) {
		const managerModule = require(path.resolve(__dirname, managerPath));
		const manager = managerModule.default || managerModule;
		if (typeof manager === "function") {
			manager(client);
		}
	}
});

// Log in to Discord with your client's token
client.login(token);

module.exports = client;
