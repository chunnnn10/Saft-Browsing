// 定義 API 地址
const BLACKLIST_API_URL = 'http://localhost:3000/get-blacklist';
const LOG_API_URL = 'http://localhost:3000/log';
const NOTIFY_ADMIN_API_URL = 'http://localhost:3000/notify';

// 暫存黑名單
let currentBlacklist = [];

// 函數：從伺服器獲取黑名單
function fetchBlacklist() {
  return fetch(BLACKLIST_API_URL)
      .then(response => response.json())
      .then(data => {
          currentBlacklist = data.blacklist || [];
          console.log("獲取到最新黑名單：", currentBlacklist);
      })
      .catch(error => {
          console.error('無法獲取黑名單:', error);
      });
}

// 檢查請求並重定向到本地伺服器
chrome.webRequest.onBeforeRequest.addListener(
  (details) => {
      const requestedUrl = new URL(details.url);
      const hostname = requestedUrl.hostname;

      // 檢查該URL是否在黑名單中
      if (currentBlacklist.some(domain => hostname.includes(domain))) {
          console.log(`阻止訪問: ${details.url}，將重定向到本地伺服器`);
          return { redirectUrl: 'http://localhost:3000/' };  // 重定向到本地伺服器的頁面
      }
      return { cancel: false };  // 允許請求
  },
  { urls: ["<all_urls>"] },  // 攔截所有的URL請求
  ["blocking"]  // 需要 blocking 權限來進行重定向
);

// 在插件運行時重獲取黑名單
chrome.runtime.onInstalled.addListener(() => {
  console.log('插件安裝，正在執行黑名單提取...');
  fetchBlacklist();
});

// 定期更新黑名單
chrome.alarms.create('updateBlacklist', { periodInMinutes: 0.1 });
chrome.alarms.onAlarm.addListener(fetchBlacklist);

// 記錄訪問並發送到伺服器
function logVisit(url) {
    const logData = {
        url: url,
        timestamp: new Date().toISOString()
    };

    fetch(LOG_API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(logData)
    })
    .then(response => {
        if (response.ok) {
            console.log('訪問記錄已成功發送:', logData);
        } else {
            console.error('訪問記錄發送失敗');
        }
    })
    .catch(error => {
        console.error('無法發送訪問記錄:', error);
    });
}

// 使用通知功能通知管理員
function notifyAdmin(message) {
    fetch(NOTIFY_ADMIN_API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: message }),
    })
    .then(response => console.log('管理員已被通知:', message))
    .catch(error => console.error('無法通知管理員:', error));
}


// 檢查目前系統的動態規則
chrome.declarativeNetRequest.getDynamicRules((rules) => {
    console.log("目前系統中的動態規則:", rules);
});

