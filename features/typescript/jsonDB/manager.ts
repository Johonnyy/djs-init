import fs from "node:fs";
import path from "node:path";
import { ExpandedClient } from "../types";

interface JsonData {
	[key: string]: any;
}

export interface JSONDatabase {
	get<T>(key: string): T | undefined;
	set<T>(key: string, value: T): void;
	delete(key: string): void;
}

class JsonDatabase implements JSONDatabase {
	private filePath: string;
	private data: JsonData;

	constructor(fileName: string = "database.json") {
		this.filePath = path.join(process.cwd(), fileName);

		if (!fs.existsSync(this.filePath)) {
			fs.writeFileSync(this.filePath, JSON.stringify({}));
		}

		this.data = JSON.parse(fs.readFileSync(this.filePath, "utf8")) as JsonData;
	}

	private save(): void {
		fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2));
	}

	private resolvePath(obj: any, path: string): [any, string] | undefined {
		const keys = path.split(".");
		const lastKey = keys.pop();
		if (!lastKey) return undefined;

		let current = obj;
		for (const key of keys) {
			if (!(key in current)) current[key] = {};
			current = current[key];
		}
		return [current, lastKey];
	}

	public get<T>(key: string): T | undefined {
		const keys = key.split(".");
		let current: any = this.data;

		for (const k of keys) {
			if (!(k in current)) return undefined;
			current = current[k];
		}

		return current as T;
	}

	public set<T>(key: string, value: T): void {
		const resolved = this.resolvePath(this.data, key);
		if (!resolved) return;

		const [parent, lastKey] = resolved;
		parent[lastKey] = value;
		this.save();
	}

	public delete(key: string): void {
		const resolved = this.resolvePath(this.data, key);
		if (!resolved) return;

		const [parent, lastKey] = resolved;
		delete parent[lastKey];
		this.save();
	}
}

export default (client: ExpandedClient) => {
	client.json = new JsonDatabase();
};
