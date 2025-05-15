import fs from "node:fs";
import path from "node:path";
import { Collection } from "discord.js";
import { ExpandedClient } from "../types";

export default (client: ExpandedClient) => {
	client.commands = new Collection();
	client.cooldowns = new Collection();

	const foldersPath = path.join(__dirname, "../commands");
	const commandFolders = fs.readdirSync(foldersPath);

	for (const folder of commandFolders) {
		const commandsPath = path.join(foldersPath, folder);
		const commandFiles = fs
			.readdirSync(commandsPath)
			.filter((file: string) => file.endsWith(".ts") || file.endsWith(".js"));
		for (const file of commandFiles) {
			const filePath = path.join(commandsPath, file);
			const command = require(filePath);
			if ("data" in command && "execute" in command) {
				client.commands.set(command.data.name, command);
			} else {
				console.log(
					`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
				);
			}
		}
	}
};
