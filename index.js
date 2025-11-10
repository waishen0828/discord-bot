const express = require("express");
const { Client, GatewayIntentBits, Partials, Collection } = require("discord.js");
require("dotenv").config();
const fs = require("fs");

const app = express();
app.get("/", (req, res) => res.send("✅ Bot is alive!"));
app.listen(process.env.PORT || 3000, () => console.log("🌐 Server running!"));

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
  partials: [Partials.Channel],
});

client.commands = new Collection();

if (fs.existsSync("./commands")) {
  const commandFiles = fs.readdirSync("./commands").filter(f => f.endsWith(".js"));
  for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    if (command.data && command.execute) client.commands.set(command.data.name, command);
  }
}

client.once("ready", () => console.log(`🤖 Logged in as ${client.user.tag}`));

client.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand()) return;
  const command = client.commands.get(interaction.commandName);
  if (!command) return interaction.reply({ content: "❌ Command not found!", ephemeral: true });
  try {
    await command.execute(interaction);
  } catch (err) {
    console.error(err);
    await interaction.reply({ content: "⚠️ Error executing command!", ephemeral: true });
  }
});

client.login(process.env.TOKEN);
