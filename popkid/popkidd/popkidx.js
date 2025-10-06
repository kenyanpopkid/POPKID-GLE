import { serialize, decodeJid } from '../../lib/Serializer.js';
import path from 'path';
import fs from 'fs/promises';
import config from '../../config.cjs';
import { smsg } from '../../lib/myfunc.cjs';
import { handleAntilink } from './antilink.js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Get group admins safely
export const getGroupAdmins = (participants = []) => {
  const admins = [];
  for (const i of participants) {
    if (i.admin === 'superadmin' || i.admin === 'admin') {
      admins.push(i.id);
    }
  }
  return admins;
};

const Handler = async (chatUpdate, sock, logger) => {
  try {
    if (chatUpdate.type !== 'notify') return;

    const rawMsg = chatUpdate.messages?.[0];
    if (!rawMsg || !rawMsg.message) return;

    const m = serialize(JSON.parse(JSON.stringify(rawMsg)), sock, logger);
    const isGroup = m.isGroup;

    // ✅ Fetch metadata and normalize IDs
    const participants = isGroup
      ? await sock.groupMetadata(m.from).then(meta => meta.participants)
      : [];
    const groupAdmins = isGroup ? getGroupAdmins(participants) : [];

    // ✅ Normalize bot ID to avoid mismatch bugs
    const botId = (await decodeJid(sock.user.id)).split(':')[0] + '@s.whatsapp.net';
    const isBotAdmins = isGroup ? groupAdmins.some(id => id.split(':')[0] + '@s.whatsapp.net' === botId) : false;
    const isAdmins = isGroup ? groupAdmins.includes(m.sender) : false;

    // ✅ Prefix system
    const PREFIX = /^[\\/!#.]/;
    const isCOMMAND = (body) => PREFIX.test(body);
    const prefixMatch = isCOMMAND(m.body) ? m.body.match(PREFIX) : null;
    const prefix = prefixMatch ? prefixMatch[0] : '/';
    const cmd = m.body.startsWith(prefix)
      ? m.body.slice(prefix.length).split(' ')[0].toLowerCase()
      : '';
    const text = m.body.slice(prefix.length + cmd.length).trim();

    // ✅ Auto view status if enabled
    if (m.key?.remoteJid === 'status@broadcast' && config.AUTO_STATUS_SEEN) {
      await sock.readMessages([m.key]);
    }

    const botNumber = (await sock.decodeJid(sock.user.id)).split(':')[0] + '@s.whatsapp.net';
    const ownerNumber = config.OWNER_NUMBER + '@s.whatsapp.net';
    const isCreator = m.sender === ownerNumber || m.sender === botNumber;

    // ✅ Respect public/private mode
    if (!sock.public && !isCreator) return;

    // ✅ Handle AntiLink
    await handleAntilink(m, sock, logger, isBotAdmins, isAdmins, isCreator);

    // ✅ Debug log (optional)
    // console.log(m);

    // ✅ Dynamically load and execute plugins
    const pluginDir = path.join(__dirname, '..', 'popkidgle');
    const pluginFiles = await fs.readdir(pluginDir);

    for (const file of pluginFiles) {
      if (file.endsWith('.js')) {
        const pluginPath = path.join(pluginDir, file);

        try {
          const pluginModule = await import(`file://${pluginPath}`);
          const loadPlugins = pluginModule.default;

          if (typeof loadPlugins === 'function') {
            await loadPlugins(m, sock);
          }
        } catch (err) {
          console.error(`❌ Failed to load plugin: ${file}`, err);
        }
      }
    }

  } catch (e) {
    console.error('💥 Handler Error:', e);
  }
};

export default Handler;
