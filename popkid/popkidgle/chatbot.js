import axios from 'axios';
import config from '../../config.cjs';

const chatbotcommand = async (m, sock) => {
  const botJid = await sock.decodeJid(sock.user.id);
  const isOwner = [botJid, config.OWNER_NUMBER + "@s.whatsapp.net"].includes(m.sender);
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(" ")[0].toLowerCase() : '';
  const args = m.body.slice(prefix.length + cmd.length).trim();

  // Toggle chatbot
  if (cmd === 'chatbot') {
    if (!isOwner) {
      return m.reply("❌ *Access Denied*\n_Only bot owner can toggle this feature._");
    }
    let replyMsg;
    if (args === 'on') {
      config.CHATBOT = true;
      replyMsg = "🤖 Chatbot has been *enabled*. I'm now live!";
    } else if (args === 'off') {
      config.CHATBOT = false;
      replyMsg = "🔕 Chatbot has been *disabled*. I'll stay silent.";
    } else {
      replyMsg = `💡 *Chatbot Usage:*\n\n• ${prefix}chatbot on\n• ${prefix}chatbot off`;
    }
    return sock.sendMessage(m.from, { text: replyMsg }, { quoted: m });
  }

  // Only run if chatbot is active
  if (!config.CHATBOT) return;
  if (!m.message || m.key.fromMe) return;

  const chatId = m.key.remoteJid;
  const sender = m.key.participant || chatId;
  const isGroup = chatId.endsWith("@g.us");
  const userMessage = m.body?.trim() || '';

  // Only reply in groups if bot is mentioned or replied
  if (isGroup) {
    const mentioned = m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.includes(sock.user.id);
    const repliedToBot = m.message?.extendedTextMessage?.contextInfo?.participant === sock.user.id;
    if (!mentioned && !repliedToBot) return;
  }

  // Direct time/date questions
  const lowerMsg = userMessage.toLowerCase();
  if (lowerMsg.includes("time") || lowerMsg.includes("date")) {
    const now = new Date();
    const options = { 
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit', timeZoneName: 'short'
    };
    const currentDateTime = now.toLocaleDateString('en-US', options);
    return sock.sendMessage(chatId, {
      text: `⏰ Current Date & Time:\n${currentDateTime}\n\n> ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴘᴏᴘᴋɪᴅ-ᴡᴀ ⚡`
    }, { quoted: m });
  }

  try {
    // Query prompt
    const prompt = `You are Popkid AI, a WhatsApp assistant created by Popkid from Kenya.
Reply smartly, friendly, and only once per user message.

💬 User: ${userMessage}`;

    // Call dreaded API
    const apiUrl = `https://api.dreaded.site/api/chatgpt?text=${encodeURIComponent(prompt)}`;
    const { data } = await axios.get(apiUrl);

    // Extract bot reply
    let botReply = "🤖 Sorry, I didn’t get that.";
    if (data?.status === 200 && data?.success && data?.result?.prompt) {
      botReply = data.result.prompt;
    }

    // Always send a single reply
    return sock.sendMessage(chatId, { text: botReply }, { quoted: m });

  } catch (err) {
    console.error("Chatbot API error:", err.message);
    return sock.sendMessage(chatId, {
      text: "⚠️ Error getting response from chatbot."
    }, { quoted: m });
  }
};

export default chatbotcommand;
