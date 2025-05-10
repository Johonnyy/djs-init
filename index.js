#!/usr/bin/env node

const prompts = require("prompts");
const fs = require("fs");
const path = require("path");
const { runJSSetup } = require("./setups/javascript");
const { runTSSetup } = require("./setups/typescript");

let projectPath = process.cwd();
let language = "js";

const main = async () => {
	await initDirectory();

	if (language === "ts") {
		await runTSSetup(projectPath);
	} else {
		await runJSSetup(projectPath);
	}

	console.log(
		"Project setup complete! You can now start your bot by running 'npm run dev'."
	);
};

const initDirectory = async () => {
	const { execa } = await import("execa"); // Use dynamic import for execa

	const response = await prompts({
		type: "text",
		name: "projectName",
		message: "Enter project name (leave blank for current directory)",
	});

	if (response.projectName) {
		// create directory and enter it
		projectPath = path.join(process.cwd(), response.projectName);
		fs.mkdirSync(projectPath, { recursive: true });
		process.chdir(projectPath);
	}

	const _language = await prompts({
		type: "select",
		name: "language",
		message: "Select a language:",
		choices: [
			{ title: "JavaScript", value: "js" },
			{ title: "TypeScript", value: "ts" },
		],
	});

	console.log(`Creating project in ${projectPath}`);

	await execa("npm init -y");

	language = _language.language;
};

main();
