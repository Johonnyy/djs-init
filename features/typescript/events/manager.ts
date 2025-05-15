import fs from "node:fs";
import path from "node:path";
import { ExpandedClient } from "../types";

export default (client: ExpandedClient) => {
	const eventsPath = path.join(__dirname, "../events");
	const eventFiles = fs
		.readdirSync(eventsPath)
		.filter((file) => file.endsWith(".ts") || file.endsWith(".js"));

	for (const file of eventFiles) {
		const filePath = path.join(eventsPath, file);
		const event = require(filePath);
		if (event.once) {
			client.once(event.name, (...args) => event.execute(...args));
		} else {
			client.on(event.name, (...args) => event.execute(...args));
		}
	}
};
