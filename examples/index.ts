/**
 * Note: this is a basic example of how you can create an economy system using my module!
 */

import { Client, MessageEmbed } from "discord.js";
import { Economy } from "../src/index"; // replace with "@djs-modules/economy"

const client = new Client({
  intents: ["GUILDS", "GUILD_MESSAGES", "GUILD_MEMBERS"],
});

const eco = new Economy({
  DBName: "economy",
  DBPath: "./",
  rewards: {
    daily: 150,
    weekly: 1050,
    work: [150, 250],
  },
});

client.on("ready", () => {
  console.log("Logged into the Client!");

  client.user.setActivity({
    name: "@djs-modules/economy",
    type: "PLAYING",
  });
});

client.on("messageCreate", async (message) => {
  if (!message.guild || message.author.bot) return;

  var args = message.content.slice("!".length).trim().split(" ");
  var cmd = args.shift().toLowerCase();

  if (cmd === "lb" || cmd === "leaderboard") {
    const data = await eco.leaderboard(message.guild.id);
    if (!data) {
      message.reply("Leaderboard is not ready right now!");
      return;
    }

    const embed = new MessageEmbed()
      .setColor("BLURPLE")
      .setAuthor({
        name: message.author.username,
        iconURL: message.author.displayAvatarURL(),
      })
      .setTitle("Server Economy Leaderboard")
      .setTimestamp();

    var description = "";
    for (let i = 0; i < data.length; i++) {
      const userData = data[i];
      const balance = userData["balance"].toLocaleString("be");
      const member = message.guild.members.cache.get(userData["userID"]);

      description += `[**${i + 1}**] ${member.toString()} | \`${balance}$\`\n`;
    }
    embed.setDescription(description);

    message.channel.send({
      embeds: [embed],
    });

    return;
  } else if (cmd === "add-balance") {
    const user = message.mentions.members.first();
    const amount = args[1];

    if (!user) {
      message.reply("Mention User for You want to Add Balance!");
      return;
    }

    if (!Number(amount)) {
      message.reply("Amount should be a Number!");
      return;
    }

    if (amount.includes("-")) {
      message.reply("Amount should not be an Negative Number!");
      return;
    }

    const data = await eco.balance.add(
      message.guild.id,
      user.id,
      Number(amount)
    );

    const embed = new MessageEmbed()
      .setColor("BLURPLE")
      .setAuthor({
        name: message.author.username,
        iconURL: message.author.displayAvatarURL(),
      })
      .setDescription(
        `✅ | **Successfully added ${data.amount.toLocaleString(
          "be"
        )} coins to ${user.toString()}!**`
      )
      .addField(
        "Balance Before:",
        `${data.balance.before.toLocaleString("be")} coins`,
        true
      )
      .addField(
        "Balance After:",
        `${data.balance.after.toLocaleString("be")} coins`,
        true
      )
      .setTimestamp();

    message.channel.send({
      embeds: [embed],
    });

    return;
  } else if (cmd === "sub-balance") {
    const user = message.mentions.members.first();
    const amount = args[1];

    if (!user) {
      message.reply("Mention User for You want to Subtract Balance!");
      return;
    }

    if (!Number(amount)) {
      message.reply("Amount should be a Number!");
      return;
    }

    if (amount.includes("-")) {
      message.reply("Amount should not be an Negative Number!");
      return;
    }

    const data = await eco.balance.subtract(
      message.guild.id,
      user.id,
      Number(amount)
    );
    const embed = new MessageEmbed()
      .setColor("BLURPLE")
      .setAuthor({
        name: message.author.username,
        iconURL: message.author.displayAvatarURL(),
      })
      .setDescription(
        `✅ | **Successfully subtracted ${data.amount.toLocaleString(
          "be"
        )} coins to ${user.toString()}!**`
      )
      .addField(
        "Balance Before:",
        `${data.balance.before.toLocaleString("be")} coins`,
        true
      )
      .addField(
        "Balance After:",
        `${data.balance.after.toLocaleString("be")}$`,
        true
      )
      .setTimestamp();

    message.channel.send({
      embeds: [embed],
    });

    return;
  } else if (cmd === "balance") {
    const user = message.mentions.members.first() || message.member;
    const balanceData = await eco.balance.get(message.guild.id, user.id);
    const bankData = await eco.bank.get(message.guild.id, user.id);

    const embed = new MessageEmbed()
      .setColor("BLURPLE")
      .setAuthor({
        name: message.author.username,
        iconURL: message.author.displayAvatarURL(),
      })
      .setDescription(`**${user.toString()}'s Balance**`)
      .addField("Balance:", `${balanceData.toLocaleString("be")} coins`, true)
      .addField("Bank:", `${bankData.toLocaleString("be")} coins`, true)
      .setTimestamp();

    message.channel.send({
      embeds: [embed],
    });

    return;
  } else if (cmd === "daily") {
    const data = await eco.rewards.daily(message.guild.id, message.author.id);
    if ("status" in data) {
      message.reply(data.message);
      return;
    }

    if ("amount" in data) {
      const embed = new MessageEmbed()
        .setColor("BLURPLE")
        .setAuthor({
          name: message.author.username,
          iconURL: message.author.displayAvatarURL(),
        })
        .setDescription(`**Successfully Collected Daily Reward**`)
        .addField(
          "Balance Before:",
          `${data.balance.before.toLocaleString("be")} coins`,
          true
        )
        .addField(
          "Balance After:",
          `${data.balance.after.toLocaleString("be")} coins`,
          true
        )
        .setTimestamp();

      message.channel.send({
        embeds: [embed],
      });

      return;
    } else {
      message.reply("There's some problems, please try later...");
    }
  }
});

// Logging into the Client
client.login("token"); // Get Token from Discord Developers Portal
