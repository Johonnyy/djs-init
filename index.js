const prompts = require("prompts");
const fs = require("fs");
const path = require("path");
const fse = require("fs-extra");

let projectPath = process.cwd();

const main = async () => {
	await initDirectory();
	await promptFeatures();
	await promptConfig();
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

	console.log(`Creating project in ${projectPath}`);
	console.log("Installing dependencies...");

	await execa("npm init -y");
	await execa("npm install discord.js dotenv");

	console.log("Dependencies installed successfully.");
	console.log("Copying base files...");

	const baseFiles = ["index.js", ".gitignore", "deploy-commands.js"];

	baseFiles.forEach((file) => {
		fs.copyFileSync(
			path.join(__dirname, "features", "base", file),
			path.join(projectPath, file)
		);
	});
};

const promptFeatures = async () => {
	const features = [
		{ title: "Commands", value: "commands", dependencies: ["events"] },
		{ title: "Events", value: "events", dependencies: [] },
	];

	const { selectedFeatures } = await prompts({
		type: "multiselect",
		name: "selectedFeatures",
		message: "Select features to include:",
		choices: features,
		instructions: false,
	});

	const selectedFeaturesSet = new Set(selectedFeatures);

	for (const feature of features) {
		if (selectedFeaturesSet.has(feature.value)) {
			for (const dependency of feature.dependencies) {
				if (!selectedFeaturesSet.has(dependency)) {
					selectedFeaturesSet.add(dependency);
				}
			}
		}
	}

	const selectedFeaturesArray = Array.from(selectedFeaturesSet);

	if (!fs.existsSync(path.join(projectPath, "managers"))) {
		fs.mkdirSync(path.join(projectPath, "managers"), { recursive: true });
	}

	for (const feature of selectedFeaturesArray) {
		const featurePath = path.join(__dirname, "features", feature);
		fs.copyFileSync(
			path.join(featurePath, "manager.js"),
			path.join(projectPath, "managers", `${feature}.js`)
		);

		const dataPath = path.join(featurePath, "data");
		if (fs.existsSync(dataPath)) {
			fse.copySync(dataPath, projectPath, { overwrite: false });
		}
	}

	// Creates a djss.config.js file in the root directory of the project
	const configContent = `module.exports = {\n\tuseEvents: ${selectedFeaturesSet.has(
		"events"
	)},\n\tuseCommands: ${selectedFeaturesSet.has("commands")},\n};`;
	fs.writeFileSync(path.join(projectPath, "djss.config.js"), configContent);

	console.log("Project setup complete.");
};

const promptConfig = async () => {
	const { token } = await prompts({
		type: "text",
		name: "token",
		message: "Enter your Discord bot token:",
		validate: (value) => (value ? true : "Token is required"),
	});

	const { clientId } = await prompts({
		type: "text",
		name: "clientId",
		message: "Enter your Discord bot client ID:",
		validate: (value) => (value ? true : "Client ID is required"),
	});

	const { guildId } = await prompts({
		type: "text",
		name: "guildId",
		message: "Enter your Discord server (guild) ID:",
		validate: (value) => (value ? true : "Guild ID is required"),
	});

	const envContent = `TOKEN=${token}\nCLIENT_ID=${clientId}\nGUILD_ID=${guildId}`;
	fs.writeFileSync(path.join(projectPath, ".env"), envContent);
	console.log("Environment variables saved to .env file.");
};

main();
