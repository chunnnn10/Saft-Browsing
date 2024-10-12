const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const PORT = 3000;

// 使用 bodyParser 來解析 JSON 請求
app.use(bodyParser.json());

// 記錄 URL 訪問數據的端點
app.post('/log', (req, res) => {
  const { url, timestamp } = req.body;
  console.log(`URL 被訪問: ${url}, 時間: ${timestamp}`);
  // 這裡可以將數據保存到數據庫中
  res.status(200).send('訪問記錄已接收');
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
