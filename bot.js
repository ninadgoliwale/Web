import http from 'http';

const BOT_TOKEN = "8674826347:AAHLN8nGRz7pVN1Vh9AdjnAbCoQ5R5n8dCk";
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

let offset = 0;

async function telegram(method, payload) {
    const res = await fetch(`${TELEGRAM_API}/${method}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!data.ok) throw new Error(`${method} failed: ${JSON.stringify(data)}`);
    return data.result;
}

async function sendMessage(chatId, text) {
    return telegram("sendMessage", { 
        chat_id: chatId, 
        text,
        parse_mode: "HTML"
    });
}

async function handleMessage(msg) {
    if (!msg || !msg.text) return;
    
    const text = msg.text.trim();
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const name = msg.from.first_name;
    
    if (text === '/start') {
        const code = `USER_${userId}_${Date.now()}`;
        
        await sendMessage(chatId, `🎫 <b>Welcome ${name}!</b>\n\nYour UNIQUE VERIFICATION CODE:\n\n<code>${code}</code>\n\n📋 Instructions:\n1. Copy this code\n2. Go back to the website\n3. Paste the code in verification box\n4. Complete your payment\n\n⚠️ This code is valid for 10 minutes only.`);
        
        setTimeout(async () => {
            await sendMessage(chatId, "⏰ Your verification code has expired. Please send /start again to get a new code.");
        }, 600000);
        return;
    }
    
    await sendMessage(chatId, "❓ Unknown command. Send /start to get your verification code.");
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
            console.error("Polling error:", err.message);
            await new Promise(r => setTimeout(r, 3000));
        }
    }
}

const server = http.createServer((req, res) => {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("Gift Card Bot is running");
});

const PORT = process.env.BOT_PORT || 3001;
server.listen(PORT, () => {
    console.log(`🤖 Bot running on port ${PORT}`);
    console.log(`Bot username: @Giftclerkbot`);
});

poll();