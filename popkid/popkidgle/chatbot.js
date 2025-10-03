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
      return await sock.sendMessage(m.from, {
        text: "❌ *Access Denied*\n_Only bot owner can toggle this feature._",
        contextInfo: {
          forwardingScore: 10,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: "120363420342566562@newsletter",
            newsletterName: "Popkid-Xmd"
          }
        }
      }, { quoted: m });
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

    return await sock.sendMessage(m.from, {
      text: replyMsg,
      contextInfo: {
        forwardingScore: 10,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: "120363420342566562@newsletter",
          newsletterName: "Popkid-Xmd"
        }
      }
    }, { quoted: m });
  }

  // AI active?
  if (config.CHATBOT) {
    if (!m.message || m.key.fromMe || m.body.startsWith(config.PREFIX)) return; // ignore commands & own messages

    const chatId = m.key.remoteJid;
    const sender = m.key.participant || chatId;
    const isGroup = chatId.endsWith("@g.us");
    const userMessage = m.body || '';

    // Only reply in groups if bot is mentioned or replied
    if (isGroup) {
      const mentioned = m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.includes(sock.user.id);
      const repliedToBot = m.message?.extendedTextMessage?.contextInfo?.participant === sock.user.id;
      if (!mentioned && !repliedToBot) return; // ignore group messages if not addressed
    }

    // Handle simple time/date queries directly
    const lowerMsg = userMessage.toLowerCase();
    if (lowerMsg.includes("time") || lowerMsg.includes("date")) {
      const now = new Date();
      const options = { 
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
        hour: '2-digit', minute: '2-digit', second: '2-digit', timeZoneName: 'short'
      };
      const currentDateTime = now.toLocaleDateString('en-US', options);

      return await sock.sendMessage(chatId, {
        text: `⏰ Current Date & Time:\n${currentDateTime}\n\n> ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴘᴏᴘᴋɪᴅ-ᴡᴀ ⚡`,
        contextInfo: {
          forwardingScore: 5,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: "120363420342566562@newsletter",
            newsletterName: "Popkid-Xmd"
          }
        }
      }, { quoted: m });
    }

    // Initialize chat history
    global.userChats = global.userChats || {};
    global.userChats[sender] = global.userChats[sender] || [];
    global.userChats[sender].push("👤 User: " + userMessage);
    if (global.userChats[sender].length > 15) global.userChats[sender].shift();
    const history = global.userChats[sender].join("\n");

    try {
      const prompt = `You are Popkid AI, a WhatsApp assistant created by Popkid from Kenya.
Respond naturally and smartly.

🧠 Chat history:
${history}

💬 Current: ${userMessage}`;

      const apiUrl = `https://api.dreaded.site/api/chatgpt?text=${encodeURIComponent(prompt)}`;
      const { data } = await axios.get(apiUrl);

      const botReply = (data?.status === 200 && data?.success && data?.result?.prompt) 
        ? data.result.prompt 
        : null;

      if (!botReply) return; // stop silently if API fails

      global.userChats[sender].push("🤖 Bot: " + botReply);

      await sock.sendMessage(chatId, {
        text: botReply,
        contextInfo: {
          forwardingScore: 5,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: "120363420342566562@newsletter",
            newsletterName: "Popkid-Xmd"
          }
        }
      }, { quoted: m });

    } catch (err) {
      console.log("Chatbot API error (ignored):", err.message);
      // Do NOT send error to chat — prevents extra messages
    }
  }
};

export default chatbotcommand;
