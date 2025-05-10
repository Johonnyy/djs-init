module.exports.features = [
	{
		title: "Commands",
		value: "commands",
		dependencies: ["events"],
		npmDependencies: [],
		additionalPrompts: [],
	},
	{
		title: "Events",
		value: "events",
		dependencies: [],
		npmDependencies: [],
		additionalPrompts: [],
	},
	{
		title: "MongoDB",
		value: "mongoDB",
		dependencies: [],
		npmDependencies: ["mongodb"],
		additionalPrompts: [
			{
				type: "text",
				name: "MONGO_URI",
				message: "Enter your MongoDB connection string:",
				validate: (value) => (value ? true : "MongoDB URI is required"),
			},
		],
	},
	{
		title: "JSON Database",
		value: "jsonDB",
		dependencies: [],
		npmDependencies: [],
		additionalPrompts: [],
	},
];
