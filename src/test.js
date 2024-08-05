const fetch = require('node-fetch');

const botToken = '7026482834:AAFKVFoLhVeumc46qsVbYbuWAkQ5glucdbM';
const chatName = 'tapswap_bot';

async function getChatId(chatName) {
    const response = await fetch(`https://api.telegram.org/bot${botToken}/getUpdates`);
    const data = await response.json();

    if (data.ok) {
        const chat = data.result.find(update => 
            update.message && update.message.chat && update.message.chat.username === chatName
        );

        if (chat) {
            return chat.message.chat.id;
        } else {
            throw new Error(`Không tìm thấy hội thoại có tên là ${chatName}`);
        }
    } else {
        throw new Error('Lỗi khi lấy danh sách hội thoại');
    }
}

async function openChat() {
    try {
        const chatId = await getChatId(chatName);
        console.log(`ID của hội thoại ${chatName} là ${chatId}`);
        // Mở Telegram với đường dẫn đến chat, điều này không trực tiếp mở được chat nhưng có thể đưa ra lệnh bot
        exec(`start https://t.me/${chatName}`, (err, stdout, stderr) => {
            if (err) {
                console.error(`Lỗi khi mở Telegram: ${err.message}`);
                return;
            }

            if (stderr) {
                console.error(`stderr: ${stderr}`);
                return;
            }

            console.log(`stdout: ${stdout}`);
        });
    } catch (error) {
        console.error(error.message);
    }
}

openChat();
