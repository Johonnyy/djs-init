const fs = require("node:fs");
const path = require("node:path");

class JsonDatabase {
	constructor(fileName = "database.json") {
		this.filePath = path.join(__dirname, "..", fileName);

		// If file doesn't exist, create it
		if (!fs.existsSync(this.filePath)) {
			fs.writeFileSync(this.filePath, JSON.stringify({}));
		}

		this.data = JSON.parse(fs.readFileSync(this.filePath, "utf8"));
	}

	save() {
		fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2));
	}

	get(key) {
		return this.data[key];
	}

	set(key, value) {
		this.data[key] = value;
		this.save();
	}

	delete(key) {
		delete this.data[key];
		this.save();
	}
}

module.exports = (client) => {
	client.db = new JsonDatabase();
};
