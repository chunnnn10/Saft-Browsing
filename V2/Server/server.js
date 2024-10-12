const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const PORT = 3000;

// 黑名單數據
let blacklist = [
  "chunnnn10.com",
  "malicious-site.com"
];

// 解析 JSON 請求數據
app.use(bodyParser.json());

// 記錄 URL 訪問數據的 API
app.post('/log', (req, res) => {
    const { url, timestamp } = req.body;
    if (url && timestamp) {
        console.log(`URL 已被訪問: ${url}, 在時間: ${timestamp}`);
        console.log(`${blacklist}`);
        res.status(200).send('訪問記錄已接收');
    } else {
        res.status(400).send('缺少數據');
    }
});

// 返回黑名單給客户端
app.get('/get-blacklist', (req, res) => {
  res.json({ blacklist: blacklist });
});

// 通知管理員插件被重新安裝的端點
app.post('/notify', (req, res) => {
  const { message } = req.body;
  console.log(`通知: ${message}`);
  // 可以加入通知管理員的邏輯
  res.status(200).send('通知已接收');
});

// 啟動伺服器
app.listen(PORT, () => {
  console.log(`伺服器正在 http://localhost:${PORT} 運行`);
});
