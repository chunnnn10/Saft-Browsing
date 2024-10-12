const express = require('express');
const cors = require('cors'); // 導入 CORS
const app = express();
const PORT = 3000;

// 使用 CORS 中介軟體
app.use(cors()); // 允許所有來自的請求

// 確保 body-parser 被設置來解析 JSON 請求
app.use(express.json());

// 黑名單 API 示例
app.get('/get-blacklist', (req, res) => {
    const blacklist = [
        "chunnnn10.com",
        "malicious-site.com"
    ];
    res.json({ blacklist: blacklist });
});

// 記錄訪問的 URL 的端點
app.post('/log', (req, res) => {
    const { url, timestamp } = req.body;
    console.log(`URL 被訪問: ${url}, 時間: ${timestamp}`);
    // 這裡可以將數據保存到數據庫中
    res.status(200).send('訪問記錄已接收');
  });

// 通知管理員的端點
app.post('/notify', (req, res) => {
    const { message } = req.body;
    console.log(`通知: ${message}`);
    res.status(200).send('通知已接收');
});

// 啟動伺服器
app.listen(PORT, () => {
    console.log(`伺服器正在 http://localhost:${PORT} 運行`);
});