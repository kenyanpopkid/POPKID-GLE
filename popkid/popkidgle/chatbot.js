// 🛰️ Popkid AI Chatbot (Dreaded API)
// 🔹 Tech-Styled | Contextual | Smart Replies

import axios from "axios";
import config from "../../config.cjs";

const messageMemory = new Map(); // 🧠 Store chat history

export default async function chatbot(m, sock) {
  try {
    const { PREFIX, CHATBOT } = config;
    if (!CHATBOT) return;

    const text = m.body || "";
    const sender = m.sender;
    const isCmd = text.startsWith(PREFIX);

    // ⚙️ Toggle Chatbot
    if (isCmd) {
      const cmd = text.slice(PREFIX.length).trim().toLowerCase();
      if (cmd === "chatbot on") {
        config.CHATBOT = true;
        return sock.sendMessage(m.chat, { text: "🤖 *Chatbot enabled* ✅" });
      }
      if (cmd === "chatbot off") {
        config.CHATBOT = false;
        return sock.sendMessage(m.chat, { text: "🤖 *Chatbot disabled* ❌" });
      }
    }

    // ❓ Creator questions
    const creatorQ = /(who made you|who created you|who is your (creator|developer|owner)|who are you)/i;
    if (creatorQ.test(text)) {
      return sock.sendMessage(m.chat, {
        text: "⚡ I am *Popkid AI*, created by *Popkid* — a brilliant mind from Kenya with vision & coding mastery.",
        contextInfo: {
          forwardedNewsletterMessageInfo: {
            newsletterJid: "120363420342566562@newsletter",
            newsletterName: "Popkid-Xmd",
          },
        },
      });
    }

    // 🧠 Context memory
    const history = messageMemory.has(sender)
      ? messageMemory.get(sender).map(e => `${e.role}: ${e.content}`).join("\n")
      : `user: ${text}`;

    const prompt = `
You are *Popkid AI*, a futuristic WhatsApp bot developed by *Popkid*.
- Respond smartly, in a tech-styled way.
- Format replies with **bold**, *italic*, and clean line breaks.
- Keep loyal to your creator but with mystery.
- If abused, reply: "⚠️ Let's begin afresh."

Conversation so far:
${history}

Current message:
${text}

Reply as *Popkid Xtr*:
    `;

    // 🌐 Call Dreaded API
    const apiURL = `https://api.dreaded.site/api/chatgpt?text=${encodeURIComponent(prompt)}`;
    const { data } = await axios.get(apiURL);

    let reply = data?.result?.prompt || data?.message || "⚠️ No response.";

    // 🖋️ Auto-formatting
    reply = reply
      .replace(/\*\*(.*?)\*\*/g, "*$1*")
      .replace(/([.!?])\s+/g, "$1\n")
      .trim();

    // 📝 Save memory
    if (!messageMemory.has(sender)) messageMemory.set(sender, []);
    messageMemory.get(sender).push({ role: "user", content: text });
    messageMemory.get(sender).push({ role: "assistant", content: reply });
    if (messageMemory.get(sender).length > 15) messageMemory.get(sender).shift();

    // 🚀 Send styled reply
    await sock.sendMessage(m.chat, {
      text: reply + "\n\n> ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴘᴏᴘᴋɪᴅ ⚡",
      contextInfo: {
        forwardedNewsletterMessageInfo: {
          newsletterJid: "120363420342566562@newsletter",
          newsletterName: "Popkid-Xmd",
        },
      },
    });

  } catch (err) {
    console.error("❌ Chatbot Error:", err.message);
  }
}
