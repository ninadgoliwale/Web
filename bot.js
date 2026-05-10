import http from 'http';

const BOT_TOKEN = "8674826347:AAHLN8nGRz7pVN1Vh9AdjnAbCoQ5R5n8dCk";
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

let offset = 0;
let userCodes = {};

function generateCode(userId) {
    return `CODE_${userId}_${Date.now()}`;
}

async function telegram(method, payload) {
    const res = await fetch(`${TELEGRAM_API}/${method}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!data.ok) throw new Error(`${method} failed`);
    return data.result;
}

async function sendMessage(chatId, text) {
    return telegram("sendMessage", { chat_id: chatId, text });
}

async function handleMessage(msg) {
    if (!msg || !msg.text) return;
    
    const text = msg.text.trim();
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    
    if (text === '/start') {
        const code = generateCode(userId);
        userCodes[userId] = code;
        await sendMessage(chatId, `🎫 YOUR UNIQUE CODE:\n\n<code>${code}</code>\n\nCopy this code and paste it on the website to complete your verification.\n\n⚠️ This code is valid for 10 minutes only.`, "HTML");
        
        setTimeout(() => {
            delete userCodes[userId];
        }, 600000);
        return;
    }
}

async function poll() {
    while (true) {
        try {
            const updates = await telegram("getUpdates", { offset, timeout: 50 });
            for (const update of updates) {
                offset = update.update_id + 1;
                if (update.message) await handleMessage(update.message);
            }
        } catch (err) {
            console.error(err);
            await new Promise(r => setTimeout(r, 3000));
        }
    }
}

const server = http.createServer((req, res) => {
    res.writeHead(200);
    res.end("Bot is running");
});
server.listen(3001, () => console.log("Bot running on port 3001"));

poll();