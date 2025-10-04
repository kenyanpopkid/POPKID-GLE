import config from '../../config.cjs';

// The TikTok API base URL
const TIKTOK_API = 'https://tikwm.com/api/?url=';

const tiktok = async (m, sock) => {
    const prefix = config.PREFIX;
    // 1. Command and URL parsing
    const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';
    const text = m.body.slice(prefix.length + cmd.length).trim(); 

    if (cmd === "tiktok2") {
        if (!text) {
            // Stylish usage prompt
            const usageText = `
*TikTok Downloader* 🎥
I need a link to fetch your video!
            
*USAGE:*
${prefix}tiktok2 <Your TikTok Video Link>
            `.trim();
            return sock.sendMessage(m.from, { text: usageText }, { quoted: m });
        }

        // 2. Initial Feedback: The modern 'processing' reaction
        await m.React('⏳'); 

        try {
            // 3. API Call Setup
            const apiUrl = `${TIKTOK_API}${encodeURIComponent(text)}`;
            
            // Fetch data
            const response = await fetch(apiUrl);
            const apiData = await response.json();

            // 4. API Response Check (More descriptive error)
            if (apiData.code !== 0 || !apiData.data || !apiData.data.play) {
                await m.React('✖️');
                const errorText = `
*Download Failed!* 💔
I couldn't grab that video. It might be private, deleted, or the link is bad. 
Try again with a fresh, public link.
                `.trim();
                return sock.sendMessage(m.from, { text: errorText }, { quoted: m });
            }

            // 5. Data Extraction
            const videoUrl = apiData.data.play; 
            const desc = apiData.data.title || 'TikTok Video'; 
            const author = apiData.data.author.nickname || 'Unknown Creator';

            // 6. Send the stylish video message
            
            // Build a modern, clean caption
            const caption = `
✨ *TikTok Download Complete* ✨
            
*Title:* ${desc}
*Creator:* @${author}
*Status:* Watermark-Free
            `.trim();

            await sock.sendMessage(m.from, { 
                video: { url: videoUrl },
                caption: caption
            }, { quoted: m });

            // 7. Final Feedback: Success reaction
            await m.React('✅');

        } catch (error) {
            console.error("TikTok command error:", error);
            await m.React('🚨');
            const errorText = '🚨 *System Alert:* Ran into an unexpected error. Please check the console or try again later.';
            sock.sendMessage(m.from, { text: errorText }, { quoted: m });
        }
    }
}

export default tiktok;
