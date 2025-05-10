import {
	Client,
	Collection,
	CommandInteraction,
	Interaction,
} from "discord.js";
import { MongoClient, Db } from "mongodb";

export interface ExpandedClient extends Client {
	commands: Collection<
		string,
		{
			execute: (interaction: ExpandedInteraction) => Promise<void>;
			data: any;
			cooldown?: number;
		}
	>;
	cooldowns: Collection<string, any>;
	mongoClient: MongoClient;
	json: any;
	db: Db;
}

export type ExpandedInteraction = Interaction & {
	client: ExpandedClient;
};

export type ExpandedCommandInteraction = CommandInteraction & {
	client: ExpandedClient;
};
