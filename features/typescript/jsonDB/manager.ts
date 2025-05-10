import fs from "node:fs";
import path from "node:path";
import { ExpandedClient } from "../types";

interface JsonData {
	[key: string]: any;
}

class JsonDatabase {
	private filePath: string;
	private data: JsonData;

	constructor(fileName: string = "database.json") {
		this.filePath = path.join(__dirname, "..", fileName);

		if (!fs.existsSync(this.filePath)) {
			fs.writeFileSync(this.filePath, JSON.stringify({}));
		}

		this.data = JSON.parse(fs.readFileSync(this.filePath, "utf8")) as JsonData;
	}

	private save(): void {
		fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2));
	}

	public get<T>(key: string): T | undefined {
		return this.data[key] as T;
	}

	public set<T>(key: string, value: T): void {
		this.data[key] = value;
		this.save();
	}

	public delete(key: string): void {
		delete this.data[key];
		this.save();
	}
}

export default (client: ExpandedClient) => {
	client.json = new JsonDatabase();
};
