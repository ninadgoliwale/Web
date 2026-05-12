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
                        
                        // Send code with Markdown formatting for tap-to-copy
                        await tg('sendMessage', {
                            chat_id: chatId,
                            text: `✅ *YOUR VERIFICATION CODE*\n\n\`${code}\`\n\n📋 **Tap on the code above** to copy it.\n\nThen paste it on the website to complete verification.`,
                            parse_mode: 'Markdown'
                        });
                        
                        // Also send to owner
                        await tg('sendMessage', {
                            chat_id: OWNER_ID,
                            text: `🆕 *New User Started Bot*\n\nCode: \`${code}\`\nUser ID: ${userId}\nUsername: @${update.message.from.username || 'none'}`,
                            parse_mode: 'Markdown'
                        });
                        
                        console.log(`Code sent to user ${userId}`);
                    }
                    
                    // Handle /sendgc command for owner
                    if (update.message && update.message.text && update.message.text.startsWith('/sendgc') && update.message.chat.id.toString() === OWNER_ID) {
                        const parts = update.message.text.split(' ');
                        if (parts.length >= 3) {
                            const targetCode = parts[1];
                            const giftCode = parts.slice(2).join(' ');
                            const match = targetCode.match(/USER_(\d+)_/);
                            if (match) {
                                await tg('sendMessage', {
                                    chat_id: match[1],
                                    text: `🎉 *YOUR GIFT CARD IS HERE!* 🎉\n\n📱 *Code:* \`${giftCode}\`\n\nTap to copy and redeem.\n\nThank you for shopping! ❤️`,
                                    parse_mode: 'Markdown'
                                });
                                await tg('sendMessage', {
                                    chat_id: OWNER_ID,
                                    text: `✅ Gift card sent to user ${match[1]}`
                                });
                            } else {
                                await tg('sendMessage', {
                                    chat_id: OWNER_ID,
                                    text: `❌ Invalid format. Use: /sendgc USER_123456789_1234567890 GC_CODE`
                                });
                            }
                        } else {
                            await tg('sendMessage', {
                                chat_id: OWNER_ID,
                                text: `❌ Usage: /sendgc USER_CODE GIFT_CODE`
                            });
                        }
                    }
                }
            }
        } catch(e) { console.log('Bot error:', e.message); }
        await new Promise(r => setTimeout(r, 2000));
    }
}

const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end("Bot is running");
});
server.listen(3001, () => {
    console.log("🤖 Bot running on port 3001");
    console.log("✅ Send /start to @giftclerkbot");
});
poll();