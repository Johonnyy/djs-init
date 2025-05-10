import { SlashCommandBuilder } from "discord.js";
import { ExpandedCommandInteraction } from "../../types";

export const data = new SlashCommandBuilder()
	.setName("ping")
	.setDescription("Replies with Pong!");

export const execute = async (interaction: ExpandedCommandInteraction) => {
	await interaction.reply("Pong!");
};
