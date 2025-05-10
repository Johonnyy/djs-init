import { MongoClient, MongoClientOptions, Db } from "mongodb";
import { ExpandedClient } from "../types";

const { MongoDB_URI } = process.env;

export default (client: ExpandedClient): void => {
	if (!MongoDB_URI) {
		console.error("MongoDB URI is not defined in the environment variables.");
		return;
	}

	const mongoClientOptions: MongoClientOptions = {};
	const mongoClient = new MongoClient(MongoDB_URI, mongoClientOptions);

	mongoClient
		.connect()
		.then(() => {
			console.log("MongoDB connected successfully!");
			client.mongoClient = mongoClient;
			client.db = mongoClient.db("djss");
		})
		.catch((err: Error) => {
			console.error("MongoDB connection error:", err);
		});
};
