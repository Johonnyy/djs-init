const { MongoClient } = require("mongodb");
const { MongoDB_URI } = process.env;

module.exports = (client) => {
	// mongodb
	const mongoClient = new MongoClient(MongoDB_URI, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
	});
	mongoClient.connect((err) => {
		if (err) {
			console.error("MongoDB connection error:", err);
			return;
		}
		console.log("MongoDB connected successfully!");
	});
	client.mongoClient = mongoClient;
	client.db = mongoClient.db();
};
