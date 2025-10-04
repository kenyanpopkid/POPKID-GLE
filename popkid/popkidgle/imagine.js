import config from '../../config.cjs';

const TEXT_TO_IMAGE_API = 'https://text-to-img.apis-bj-devs.workers.dev/?prompt=';
const BOT_FOOTER = '╭━━ *POWERED BY POPKID GLE* ━━╮';

const imagine = async (m, sock) => {
    const prefix = config.PREFIX;
    const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';
    const prompt = m.body.slice(prefix.length + cmd.length).trim(); 

    if (cmd === "imagine" || cmd === "img") {
        if (!prompt) {
            // Minimalist Usage Prompt with Footer
            const usageText = `
*╭━* *IMAGINE* 🎨 *━╮*
*┃* ${prefix}imagine *<Your Prompt>*
*╰━* *━* *━* *━* *━╯*
Example: a chrome cat in a disco, 8k
${BOT_FOOTER}
`.trim();
            return sock.sendMessage(m.from, { text: usageText }, { quoted: m });
        }

        await m.React('⏳'); 

        try {
            const apiUrl = `${TEXT_TO_IMAGE_API}${encodeURIComponent(prompt)}`;
            
            // Minimalist Success Caption with Footer
            const caption = `
*⌬ GENERATED ⌬*
*PROMPT:* _${prompt}_
${BOT_FOOTER}
`.trim();

            await sock.sendMessage(m.from, { 
                image: { url: apiUrl },
                caption: caption
            }, { quoted: m });

            await m.React('✅');

        } catch (error) {
            console.error("Imagine command error:", error);
            await m.React('❌');
            // Minimalist Error Alert with Footer
            const errorText = `
*╭━━* *ERROR* 💔 *━━╮*
*┃* Generation Failed. 
*┃* Try simplifying your prompt.
*╰━━* *━━* *━━* *━━╯*
${BOT_FOOTER}
`.trim();
            sock.sendMessage(m.from, { text: errorText }, { quoted: m });
        }
    }
}

export default imagine;

