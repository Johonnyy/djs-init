const fs = require("fs");
const path = require("path");
const fse = require("fs-extra");
const prompts = require("prompts");
const { features } = require("../util");

const language = "javascript";
let projectPath = process.cwd();
let selectedFeaturesArray;

module.exports.runJSSetup = async (p) => {
	projectPath = p;
	console.log("Copying base files...");

	const baseFiles = ["index.js", ".gitignore", "deploy-commands.js"];

	baseFiles.forEach((file) => {
		fs.copyFileSync(
			path.join(__dirname, "..", "features", language, "base", file),
			path.join(projectPath, file)
		);
	});

	await promptFeatures();
	await promptConfig();
	await editPackageJson();
	await installDependencies();
};

const promptFeatures = async () => {
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

	selectedFeaturesArray = Array.from(selectedFeaturesSet);

	if (!fs.existsSync(path.join(projectPath, "managers"))) {
		fs.mkdirSync(path.join(projectPath, "managers"), {
			recursive: true,
		});
	}

	for (const feature of selectedFeaturesArray) {
		const featurePath = path.join(
			__dirname,
			"..",
			"features",
			language,
			feature
		);
		fs.copyFileSync(
			path.join(featurePath, "manager.js"),
			path.join(projectPath, "managers", `${feature}.js`)
		);

		const dataPath = path.join(featurePath, "data");
		if (fs.existsSync(dataPath)) {
			fse.copySync(dataPath, projectPath, { overwrite: false });
		}
	}

	// Creates a djsi.config.js file in the root directory of the project
	const configContent = `module.exports = {\n\tuseEvents: ${selectedFeaturesSet.has(
		"events"
	)},\n\tuseCommands: ${selectedFeaturesSet.has(
		"commands"
	)},\n\tuseMongoDB: ${selectedFeaturesSet.has(
		"mongoDB"
	)},\n\tuseJSONDB: ${selectedFeaturesSet.has("jsonDB")},\n};`;
	fs.writeFileSync(path.join(projectPath, "djsi.config.js"), configContent);

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

	let envContent = `TOKEN=${token}\nCLIENT_ID=${clientId}\nGUILD_ID=${guildId}`;

	for (const feature of selectedFeaturesArray) {
		for (const additionalPrompt of features.find((f) => f.value === feature)
			.additionalPrompts) {
			const response = await prompts(additionalPrompt);
			envContent += `\n${additionalPrompt.name}=${
				response[additionalPrompt.name]
			}`;
		}
	}

	fs.writeFileSync(path.join(projectPath, ".env"), envContent);
	console.log("Environment variables saved to .env file.");
};

const editPackageJson = async () => {
	// create npm run dev script
	const packageJsonPath = path.join(projectPath, "package.json");
	const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
	packageJson.scripts = {
		dev: "nodemon index.js",
		deploy: "node deploy-commands.js",
	};
	JSON.stringify(packageJson, null, 2);
	fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
	console.log("Created start and deploy scripts.");
};

const installDependencies = async () => {
	const { execa } = await import("execa"); // Use dynamic import for execa

	let dependencies = "discord.js dotenv ";

	for (const feature of selectedFeaturesArray) {
		dependencies +=
			features[
				features.findIndex((f) => f.value === feature)
			].npmDependencies.join(" ");
	}

	console.log("Installing dependencies...");
	await execa("npm install " + dependencies);
	await execa("npm install nodemon --save-dev");
	console.log("Dependencies installed.");
};
