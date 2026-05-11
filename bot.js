import http from 'http';

const BOT_TOKEN = "8674826347:AAHLN8nGRz7pVN1Vh9AdjnAbCoQ5R5n8dCk";
const OWNER_ID = "8558052873";

let offset = 0;

async function tg(method, data) {
    try {
        const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/${method}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return await res.json();
    } catch(e) { return {}; }
}

async function poll() {
    while (true) {
        try {
            const data = await tg('getUpdates', { offset, timeout: 30 });
            if (data.ok && data.result) {
                for (const update of data.result) {
                    offset = update.update_id + 1;
                    if (update.message && update.message.text === '/start') {
                        const chatId = update.message.chat.id;
                        const userId = update.message.from.id;
                        const code = `USER_${userId}_${Date.now()}`;
                        
                        await tg('sendMessage', {
                            chat_id: chatId,
                            text: `✅ YOUR CODE: ${code}\n\nTap to copy, then paste on website.`
                        });
                        
                        await tg('sendMessage', {
                            chat_id: OWNER_ID,
                            text: `🆕 New user!\nCode: ${code}\nUser ID: ${userId}`
                        });
                    }
                    
                    if (update.message && update.message.text && update.message.text.startsWith('/sendgc') && update.message.chat.id.toString() === OWNER_ID) {
                        const parts = update.message.text.split(' ');
                        if (parts.length >= 3) {
                            const targetCode = parts[1];
                            const giftCode = parts.slice(2).join(' ');
                            const match = targetCode.match(/USER_(\d+)_/);
                            if (match) {
                                await tg('sendMessage', {
                                    chat_id: match[1],
                                    text: `🎉 GIFT CARD!\n\nCode: ${giftCode}\n\nRedeem on the platform.`
                                });
                                await tg('sendMessage', { chat_id: OWNER_ID, text: `✅ Sent to ${match[1]}` });
                            }
                        }
                    }
                }
            }
        } catch(e) { console.log(e); }
        await new Promise(r => setTimeout(r, 2000));
    }
}

const server = http.createServer((req, res) => {
    res.writeHead(200);
    res.end("Bot running");
});
server.listen(3001, () => console.log("Bot running"));
poll();