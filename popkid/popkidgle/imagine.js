import config from '../../config.cjs';
// Assuming your environment provides these helper functions globally or they are imported elsewhere
// For this example to be runnable, you would need to define or import these:
// import { fetchJson, getBuffer, cmd, sendMessage, reply } from './utils.js';
// I'll assume 'cmd' is an environment function that registers the command.

// --- Utility Functions (Provided by User) ---

// Tiny caps converter, copied from another module for consistent styling
const toTinyCaps = (str) => {
    const tinyCapsMap = {
        a: 'ᴀ', b: 'ʙ', c: 'ᴄ', d: 'ᴅ', e: 'ᴇ', f: 'ғ', g: 'ɢ', h: 'ʜ', i: 'ɪ',
        j: 'ᴊ', k: 'ᴋ', l: 'ʟ', m: 'ᴍ', n: 'ɴ', o: 'ᴏ', p: 'ᴘ', q: 'q', r: 'ʀ',
        s: 's', t: 'ᴛ', u: 'ᴜ', v: 'ᴠ', w: 'ᴡ', x: 'x', y: 'ʏ', z: 'ᴢ'
    };
    return str
        .split('')
        .map((char) => tinyCapsMap[char.toLowerCase()] || char)
        .join('');
};

// Define all available text effects and their APIs (Provided by User)
const allEffects = {
    '3dcomic': { emoji: '🎨', desc: '3D Comic text effect', url: 'https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/create-online-3d-comic-style-text-effects-817.html&name=' },
    'dragonball': { emoji: '🐉', desc: 'Dragon Ball text effect', url: 'https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/create-dragon-ball-style-text-effects-online-809.html&name=' },
    'deadpool': { emoji: '🦁', desc: 'Deadpool text effect', url: 'https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/create-text-effects-in-the-style-of-the-deadpool-logo-818.html&name=' },
    'blackpink': { emoji: '🌸', desc: 'Blackpink text effect', url: 'https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/create-a-blackpink-style-logo-with-members-signatures-810.html&name=' },
    'neonlight': { emoji: '💡', desc: 'Neon Light text effect', url: 'https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/create-colorful-neon-light-text-effects-online-797.html&name=' },
    'cat': { emoji: '🐱', desc: 'Cat text effect', url: 'https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/handwritten-text-on-foggy-glass-online-680.html&name=' },
    'sadgirl': { emoji: '😢', desc: 'Sadgirl text effect', url: 'https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/write-text-on-wet-glass-online-589.html&name=' },
    'pornhub': { emoji: '🔞', desc: 'Pornhub text effect', url: 'https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/create-pornhub-style-logos-online-free-549.html&name=' },
    'naruto': { emoji: '🍥', desc: 'Naruto text effect', url: 'https://api-pink-venom.vercel.app/api/logo?url=' },
    'thor': { emoji: '⚡', desc: 'Thor text effect', url: 'https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/create-thor-logo-style-text-effects-online-for-free-796.html&name=' },
    'america': { emoji: '🇺🇸', desc: 'American text effect', url: 'https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/free-online-american-flag-3d-text-effect-generator-725.html&name=' },
    'eraser': { emoji: '🧽', desc: 'Eraser text effect', url: 'https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/create-eraser-deleting-text-effect-online-717.html&name=' },
    '3dpaper': { emoji: '📜', desc: '3D Paper text effect', url: 'https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/multicolor-3d-paper-cut-style-text-effect-658.html&name=' },
    'futuristic': { emoji: '🚀', desc: 'Futuristic text effect', url: 'https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/light-text-effect-futuristic-technology-style-648.html&name=' },
    'clouds': { emoji: '☁️', desc: 'Clouds text effect', url: 'https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/write-text-effect-clouds-in-the-sky-online-619.html&name=' },
    'sand': { emoji: '🏖️', desc: 'Sand text effect', url: 'https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/write-in-sand-summer-beach-online-free-595.html&name=' },
    'galaxy': { emoji: '🌌', desc: 'Galaxy text effect', url: 'https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/create-galaxy-wallpaper-mobile-online-528.html&name=' },
    'leaf': { emoji: '🍃', desc: 'Leaf text effect', url: 'https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/green-brush-text-effect-typography-maker-online-153.html&name=' },
    'sunset': { emoji: '🌅', desc: 'Sunset text effect', url: 'https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/create-sunset-light-text-effects-online-807.html&name=' },
    'nigeria': { emoji: '🇳🇬', desc: 'Nigeria text effect', url: 'https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/nigeria-3d-flag-text-effect-online-free-753.html&name=' },
    'devilwings': { emoji: '😈', desc: 'Devil Wings text effect', url: 'https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/neon-devil-wings-text-effect-online-683.html&name=' },
    'hacker': { emoji: '💻', desc: 'Hacker text effect', url: 'https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/create-anonymous-hacker-avatars-cyan-neon-677.html&name=' },
    'boom': { emoji: '💥', desc: 'Boom text effect', url: 'https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/boom-text-comic-style-text-effect-675.html&name=' },
    'luxury': { emoji: '💎', desc: 'Luxury text effect', url: 'https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/floral-luxury-logo-collection-for-branding-616.html&name=' },
    'zodiac': { emoji: '🌟', desc: 'Zodiac text effect', url: 'https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/create-star-zodiac-wallpaper-mobile-604.html&name=' },
    'angelwings': { emoji: '👼', desc: 'Angel Wings text effect', url: 'https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/angel-wing-effect-329.html&name=' },
    'bulb': { emoji: '💡', desc: 'Bulb text effect', url: 'https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/text-effects-incandescent-bulbs-219.html&name=' },
    'tatoo': { emoji: '🖤', desc: 'Tatoo text effect', url: 'https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/make-tattoos-online-by-empire-tech-309.html&name=' },
    'castle': { emoji: '🏰', desc: 'Castle text effect', url: 'https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/create-a-3d-castle-pop-out-mobile-photo-effect-786.html&name=' },
    'frozen': { emoji: '❄️', desc: 'Frozen text effect', url: 'https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/create-a-frozen-christmas-text-effect-online-792.html&name=' },
    'paint': { emoji: '🎨', desc: 'Paint text effect', url: 'https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/create-3d-colorful-paint-text-effect-online-801.html&name=' },
    'birthday': { emoji: '🎉', desc: 'Birthday text effect', url: 'https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/beautiful-3d-foil-balloon-effects-for-holidays-and-birthday-803.html&name=' },
    'typography': { emoji: '📝', desc: 'Typography text effect', url: 'https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/create-typography-status-online-with-impressive-leaves-357.html&name=' },
    'bear': { emoji: '🐻', desc: 'Bear text effect', url: 'https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/free-bear-logo-maker-online-673.html&name=' }
};

/**
 * Generates a help menu for the logo command.
 * @param {string} prefix The command prefix
 * @returns {string} The formatted menu string
 */
const generateLogoMenu = (prefix) => {
    let menu = `
┏━━━━━━━━━━━━━━━━━━━━━━┓
┃ ✨ *${toTinyCaps('Logo Maker Menu')}* ✨ ┃
┗━━━━━━━━━━━━━━━━━━━━━━┛

✍️ *${toTinyCaps('Usage')}:* ${prefix}${toTinyCaps('logo')} <effect> <text>
*${toTinyCaps('Example')}*: ${prefix}logo dragonball popkid

┏━━━━━━━━━━━━━━━━━━━━━━┓
┃ 🎨 *${toTinyCaps('Available Effects')}* 🎨 ┃
┗━━━━━━━━━━━━━━━━━━━━━━┛
`.trim() + '\n';

    // Group effects into columns for a cleaner look
    const effects = Object.keys(allEffects);
    const columns = 2;
    const itemsPerColumn = Math.ceil(effects.length / columns);
    
    // Create rows with two columns
    for (let i = 0; i < itemsPerColumn; i++) {
        const key1 = effects[i];
        const effect1 = allEffects[key1];
        
        // First Column
        const item1 = key1 ? `${effect1.emoji} ${toTinyCaps(key1)}` : '';

        // Second Column (if exists)
        const key2 = effects[i + itemsPerColumn];
        const effect2 = key2 ? allEffects[key2] : null;
        const item2 = key2 ? `${effect2.emoji} ${toTinyCaps(key2)}` : '';

        // Add to menu (padding for alignment is hard in plain text, so we'll use a simple separator)
        if (key1) {
            menu += `*${item1}*`
            if (key2) {
                menu += ` | *${item2}*\n`;
            } else {
                menu += '\n';
            }
        }
    }

    menu += `\n${toTinyCaps('Note')}: If no effect is specified, *dragonball* is used by default.`;
    return menu;
};


// --- Command Registration ---
cmd({
    pattern: 'logo',
    alias: ['logomaker', 'textlogo'],
    desc: 'Generates a stylish logo from a text phrase.',
    category: 'main',
    react: '🎨',
    use: `.${toTinyCaps('logo')} <effect> <text>\n\n${toTinyCaps('Example')}: .logo dragonball popkid`,
    filename: __filename
}, async (cmd, mek, m, { from, args, reply, sender }) => {
    try {
        const prefix = config.PREFIX;
        // Send a "processing" reaction
        await cmd.sendMessage(from, { react: { text: '⏳', key: mek.key } }).catch(() => {});
        
        let effectName = 'dragonball'; // Default effect
        let text = args.join(' ');
        
        // --- Input Validation and Menu Display ---
        if (!args || args.length === 0) {
            const menu = generateLogoMenu(prefix);
            await reply(menu);
            await cmd.sendMessage(from, { react: { text: 'ℹ️', key: mek.key } }); // Info reaction for menu
            return;
        }

        // Check if the first argument is a valid effect name
        if (allEffects[args[0].toLowerCase()]) {
            effectName = args[0].toLowerCase();
            text = args.slice(1).join(' '); // Remaining text is the logo text
        }
        
        // If no text is provided after processing the effect, show the error
        if (!text) {
            const usage = `❌ ${toTinyCaps('Please provide a name for the logo')}.\n*${toTinyCaps('Usage')}*: ${prefix}${toTinyCaps('logo')} ${effectName} <text>\n*${toTinyCaps('Example')}*: ${prefix}logo ${effectName} Empire`;
            await reply(usage);
            await cmd.sendMessage(from, { react: { text: '❌', key: mek.key } });
            return;
        }
        
        // --- Logo Generation Logic ---
        const effect = allEffects[effectName];
        const encodedText = encodeURIComponent(text);
        const requestUrl = `${effect.url}${encodedText}`;

        // Assuming fetchJson and getBuffer are available helper functions
        const apiResponse = await fetchJson(requestUrl);

        if (!apiResponse || !apiResponse.result || !apiResponse.result.download_url) {
            await reply(`❌ ${toTinyCaps('API did not return a valid image. Please try again later.')}`);
            await cmd.sendMessage(from, { react: { text: '❌', key: mek.key } });
            return;
        }

        const imageBuffer = await getBuffer(apiResponse.result.download_url);
        
        // --- Output Formatting (Matching Ping Style) ---
        
        const status = imageBuffer ? `✅ ${toTinyCaps('Processed Successfully')}` : `❌ ${toTinyCaps('Failed to process')}`;

        // Get bot and owner info from config
        const ownerName = config.OWNER_NAME || 'popkid';
        const botName = config.BOT_NAME || 'POPKID BOT';
        const repoLink = config.REPO || 'https://github.com/kenyanpopkid/POPKID-XTR';

        // Create the stylish output panel
        const output = `
┏━━━━━━━━━━━━━━━━━━━━━━┓
┃ ✨ *${toTinyCaps(botName)} Logo Panel* ✨ ┃
┗━━━━━━━━━━━━━━━━━━━━━━┛

🎨 *Effect* : ${toTinyCaps(effect.desc)}
✍️ *Text* : ${toTinyCaps(text)}
📡 *Status* : ${status}
🤖 *Bot Name* : ${botName}
👨‍💻 *Developer* : ${ownerName}

┏━━━━━━━━━━━━━━━━━━━━━━┓
┃ 🌟 ${toTinyCaps('Support & Contribute')} 🌟 ┃
┗━━━━━━━━━━━━━━━━━━━━━━┛
🔗 ${repoLink}
        `.trim();

        // Send the stylish message with the logo image
        await cmd.sendMessage(from, {
            image: imageBuffer,
            caption: output,
            contextInfo: {
                mentionedJid: [sender],
                forwardingScore: 999,
                isForwarded: true
            }
        }, { quoted: mek });

        // Send a final success reaction
        await cmd.sendMessage(from, { react: { text: '✅', key: mek.key } });

    } catch (err) {
        console.error('❌ Logo Command Error:', err);
        await reply(`❌ ${toTinyCaps('Error')}: ${err.message || 'Logo command failed'}`);
        await cmd.sendMessage(from, { react: { text: '❌', key: mek.key } });
    }
});
