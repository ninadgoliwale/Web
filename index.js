import http from 'http';

const BOT_TOKEN = "8674826347:AAHLN8nGRz7pVN1Vh9AdjnAbCoQ5R5n8dCk";
const PORT = process.env.PORT || 3000;

const HTML = `<!DOCTYPE html>
<html>
<head><title>Gift Card Shop</title><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="font-family:Arial;background:#0a0a2a;color:white;padding:20px;text-align:center">
<div style="max-width:400px;margin:auto;background:rgba(255,255,255,0.1);padding:25px;border-radius:20px">
<h2 style="color:#00ff88">GIFT CARD SHOP</h2>
<input id="phone" placeholder="Phone" style="width:100%;padding:10px;margin:5px 0;background:#1a1a3a;border:1px solid #00ff88;color:white"><br>
<input id="pass" type="password" placeholder="Password" style="width:100%;padding:10px;margin:5px 0;background:#1a1a3a;border:1px solid #00ff88;color:white"><br>
<button onclick="login()" style="background:#00ff88;padding:10px;width:100%;border:none;border-radius:10px">Login</button>
<button onclick="register()" style="background:#333;padding:10px;width:100%;margin-top:5px;border:none;border-radius:10px;color:white">Register</button>
<div id="msg" style="margin-top:10px;color:#ffaa00"></div>
</div>
<script>
function showMsg(t){document.getElementById('msg').innerHTML=t;setTimeout(()=>{document.getElementById('msg').innerHTML='';},3000);}
function login(){
    let phone=document.getElementById('phone').value;
    let pass=document.getElementById('pass').value;
    if(!phone||!pass){showMsg('Fill all fields');return;}
    let users=JSON.parse(localStorage.getItem('users')||'{}');
    if(users[phone]&&users[phone].pass===pass){
        localStorage.setItem('currentUser',phone);
        showMsg('Login successful!');
        setTimeout(()=>{location.reload();},1000);
    }else{showMsg('Invalid phone or password');}
}
function register(){
    let phone=document.getElementById('phone').value;
    let pass=document.getElementById('pass').value;
    if(!phone||!pass){showMsg('Fill all fields');return;}
    let users=JSON.parse(localStorage.getItem('users')||'{}');
    if(users[phone]){showMsg('Phone already registered');return;}
    users[phone]={phone,pass};
    localStorage.setItem('users',JSON.stringify(users));
    showMsg('Registered! Now login');
}
let current=localStorage.getItem('currentUser');
if(current){
    document.body.innerHTML='<div style="max-width:400px;margin:auto;background:rgba(255,255,255,0.1);padding:25px;border-radius:20px;text-align:center">'+
        '<h2 style="color:#00ff88">Welcome '+current+'</h2>'+
        '<p>Send /start to <strong>@Giftclerkbot</strong> on Telegram</p>'+
        '<button onclick="logout()" style="background:#ff4444;padding:10px;width:100%;border:none;border-radius:10px;color:white">Logout</button>'+
        '</div>'+
        '<script>function logout(){localStorage.removeItem("currentUser");location.reload();}<\/script>';
}
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
        const r = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/${method}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return await r.json();
    } catch(e) { return {}; }
}

async function poll() {
    while (true) {
        const data = await tg('getUpdates', { offset, timeout: 30 });
        if (data.ok && data.result) {
            for (const update of data.result) {
                offset = update.update_id + 1;
                if (update.message && update.message.text === '/start') {
                    const id = update.message.chat.id;
                    const code = `CODE_${id}_${Date.now()}`;
                    await tg('sendMessage', { chat_id: id, text: `✅ Your code: ${code}\n\nSend this code to the shop owner to complete your order.` });
                    console.log(`Code sent to ${id}`);
                }
            }
        }
        await new Promise(r => setTimeout(r, 2000));
    }
}

server.listen(PORT, () => {
    console.log(`Server on port ${PORT}`);
    console.log(`Bot running! Send /start to @Giftclerkbot`);
});
poll();