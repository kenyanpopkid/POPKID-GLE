import dotenv from 'dotenv';
dotenv.config();
import {
  makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  DisconnectReason
} from '@whiskeysockets/baileys';
import { Handler, Callupdate, GroupUpdate } from './popkid/popkidd/popkiddd.js';
import express from 'express';
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import chalk from 'chalk';
import pino from 'pino';
import moment from 'moment-timezone';
import { File } from 'megajs';
import 'node-cache';
import { fileURLToPath } from 'url';
import config from './config.cjs';
import autoReact from './lib/autoreact.cjs';
const { emojis, doReact } = autoReact;
const app = express();
const PORT = process.env.PORT || 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const sessionDir = path.join(__dirname, 'session');
const credsPath = path.join(sessionDir, 'creds.json');
const MAIN_LOGGER = pino({
  timestamp: () => `,"time":"${new Date().toJSON()}"`
});
const logger = MAIN_LOGGER.child({});
logger.level = "trace";
let useQR = false;
let initialConnection = true;
// Ensure session directory exists
if (!fs.existsSync(sessionDir)) {
  fs.mkdirSync(sessionDir, { recursive: true });
}
const lifeQuotes = [
  "The only way to do great work is to love what you do.",
  "Strive not to be a success, but rather to be of value.",
  "The mind is everything. What you think you become.",
  "Life is what happens when you're busy making other plans.",
  "Be the change that you wish to see in the world.",
  "It is never too late to be what you might have been.",
  "The journey of a thousand miles begins with a single step."
];
// Update WhatsApp bio with a random quote
async function updateBio(sock) {
  try {
    const time = moment().tz("Africa/Nairobi");
    const quote = lifeQuotes[Math.floor(Math.random() * lifeQuotes.length)];
    const bio = `🧛‍♋️POPKID GLE | ACTIVE AT ${time.format("HH:mm:ss")} | ${quote}`;
    await sock.updateProfileStatus(bio);
    console.log(chalk.yellow(`ℹ️ Bio updated: ${bio}`));
  } catch (err) {
    console.log(chalk.red(`❌ Bio update failed: ${err.message}`));
  }
}
async function updateLiveBio(sock) {
  try {
    const time = moment().tz('Africa/Nairobi');
    await sock.updateProfileStatus(`🧛‍♋️POPKID GLE | ACTIVE AT ${time.format("HH:mm:ss")}`);
  } catch (err) {
    console.log(chalk.red(`❌ Live bio update failed: ${err.message}`));
  }
}
// Download session from MEGA
async function downloadSessionData() {
  try {
    const sessionId = config.SESSION_ID;
    if (!sessionId || !sessionId.startsWith("POPKID;;;")) {
      console.log(chalk.red("❌ SESSION_ID missing or invalid format."));
      return false;
    }
    const filePart = sessionId.split("POPKID;;;")[1];
    if (!filePart || !filePart.includes('#')) {
      console.log(chalk.red("❌ SESSION_ID format must be: POPKID;;;fileid#key"));
      return false;
    }
    const [fileId, fileKey] = filePart.split('#');
    const megaFile = File.fromURL(`https://mega.nz/file/${fileId}#${fileKey}`);
    console.log("🔄 Downloading session from MEGA...");
    const fileData = await new Promise((resolve, reject) => {
      megaFile.download((err, data) => err ? reject(err) : resolve(data));
    });
    await fs.promises.writeFile(credsPath, fileData);
    console.log(chalk.green("✅ Session restored from MEGA."));
    return true;
  } catch (err) {
    console.error(chalk.red(`❌ Session download error: ${err.message}`));
    return false;
  }
}
// Start the bot
async function start() {
  try {
    const { state, saveCreds } = await useMultiFileAuthState(sessionDir);
    const { version } = await fetchLatestBaileysVersion();
    console.log(`📆 WhatsApp version: ${version.join('.')}`);
    const sock = makeWASocket({
      version,
      logger: pino({ level: "silent" }),
      printQRInTerminal: useQR,
      browser: ['Popkid', "Safari", "10.0"],
      auth: state,
      getMessage: async () => null
    });
    sock.ev.on('connection.update', async ({ connection, lastDisconnect }) => {
      if (connection === 'close') {
        const reasonCode = lastDisconnect?.error?.output?.statusCode;
        console.log(chalk.red(`❌ Disconnected [Reason: ${reasonCode}]`));
        if (reasonCode !== DisconnectReason.loggedOut) start();
      } else if (connection === "open") {
        console.log(chalk.green("✅ BOT ONLINE"));
        // Join group
        try {
          await sock.groupAcceptInvite("FHDEPkBBf281sUcdj17eU9");
          console.log(chalk.green("✅ Joined group."));
        } catch (err) {
          console.error(chalk.red(`❌ Group join failed: ${err.message}`));
        }
        // Follow newsletter
        try {
          await sock.newsletterFollow("120363403864179440@newsletter");
          console.log(chalk.cyan("📨 Followed newsletter."));
        } catch (err) {
          console.error(chalk.red(`❌ Newsletter follow failed: ${err.message}`));
        }
        // Update bio
        await updateBio(sock);
        // Send startup message
        await sock.sendMessage(sock.user.id, {
          image: { url: "https://i.ibb.co/zhWGyVZL/file-00000000c6b0624388a556a5aa392449.png" },
          caption:
            `╔═════ ∘◦ ✧ ✦ ✧ ◦∘ ═════╗
🅟🅞🅟🅚🅘🅓 • 🅧🅜🅓 • 🅢🅨🅢
╚═════ ∘◦ ✧ ✦ ✧ ◦∘ ═════╝
💻 BOT:       𝙿𝙾𝙿𝙺𝙸𝙳 𝚇𝙼𝙳  
🧑‍💼 OWNER:     👑 ᴘᴏᴘᴋɪᴅ  
🛠️ MODE:      ${config.MODE.toUpperCase()}  
🎮 PREFIX:    ${config.PREFIX}  
📡 STATUS:    ✅ 𝗢𝗡𝗟𝗜𝗡𝗘 • 𝗥𝗘𝗔𝗗𝗬 • 𝗙𝗜𝗥𝗘
🕶️ ᴘᴏᴘᴋɪᴅ ᴅᴏᴇꜱɴ'ᴛ ᴄʀᴀꜱʜ, ʜᴇ ʀᴇʙᴏᴏᴛꜱ.
═══════════════════════════`,
          contextInfo: {
            isForwarded: true,
            forwardingScore: 999,
            forwardedNewsletterMessageInfo: {
              newsletterJid: "120363403864179440@newsletter",
              newsletterName: "popkid xmd ʙᴏᴛ",
              serverMessageId: -1
            },
            externalAdReply: {
              title: "ᴘᴏᴘᴋɪᴅ xᴍᴅ ʙᴏᴛ",
              body: "ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴘᴏᴘᴋɪᴅ",
              thumbnailUrl: "https://i.ibb.co/zhWGyVZL/file-00000000c6b0624388a556a5aa392449.png",
              sourceUrl: "https://whatsapp.com/channel/0029VbAqgNn5fM5SXe1ufH0f",
              mediaType: 1,
              renderLargerThumbnail: false
            }
          }
        });
        // Live bio updater
        if (!global.isLiveBioRunning) {
          global.isLiveBioRunning = true;
          setInterval(() => updateLiveBio(sock), 60000);
        }
        initialConnection = false;
      }
    });
    sock.ev.on("creds.update", saveCreds);
    sock.ev.on("messages.upsert", async msg => {
      if (!msg.messages?.length) return;
      await Handler(msg, sock, logger);
      try {
        const firstMsg = msg.messages[0];
        if (!firstMsg.key.fromMe && config.AUTO_REACT && firstMsg.message) {
          const emoji = emojis[Math.floor(Math.random() * emojis.length)];
          await doReact(emoji, firstMsg, sock);
        }
      } catch (err) {
        console.error("❌ Auto-react failed:", err.message);
      }
    });
    sock.ev.on("call", call => Callupdate(call, sock));
    sock.ev.on("group-participants.update", update => GroupUpdate(sock, update));
    sock.public = config.MODE === 'public';
  } catch (err) {
    console.error("❌ Startup Error:", err.stack || err.message);
    process.exit(1);
  }
}
// Initialize bot
async function init() {
  global.isLiveBioRunning = false;
  if (fs.existsSync(credsPath)) {
    console.log(chalk.green("🔐 Local session found. Starting..."));
    await start();
  } else {
    const restored = await downloadSessionData();
    if (restored) {
      await start();
    } else {
      console.log(chalk.yellow("📸 Starting in QR mode..."));
      useQR = true;
      await start();
    }
  }
}
init();
// Express server setup
app.use(express.static(path.join(__dirname, "mydata")));
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'mydata', "index.html")));
const SELF_URL = process.env.SELF_URL || `http://localhost:${PORT}`;
setInterval(() => {
  axios.get(SELF_URL).catch(() => {});
}, 240000);
app.listen(PORT, () => {
  console.log(`🌐 Server running on port ${PORT}`);
});
