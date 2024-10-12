let visitedDomains = new Set();

chrome.webNavigation.onCompleted.addListener((details) => {
  if (details.frameId === 0) {
    const currentUrl = new URL(details.url);

    // 如果 URL 是 exe 或 msi 文件，則立即記錄
    if (currentUrl.pathname.endsWith('.exe') || currentUrl.pathname.endsWith('.msi')) {
      logVisit(details.url);
      return;
    }

    // 調試信息
    console.log(`嘗試訪問: ${details.url}`);

    // 只記錄一次每個域名的訪問，但允許在不同會話中重新記錄
    if (!visitedDomains.has(currentUrl.hostname)) {
      visitedDomains.add(currentUrl.hostname);
      logVisit(details.url);
    }
  }
}, { url: [{ urlMatches: 'http://*/*' }, { urlMatches: 'https://*/*' }] });

// 每隔一定時間重置已訪問的域名集合
setInterval(() => {
  visitedDomains.clear();
  console.log('已訪問域名集合已清空');
}, 60000); // 每分鐘清空一次訪問記錄

// 記錄訪問並發送到伺服器
function logVisit(url) {
  const logData = {
    url: url,
    timestamp: new Date().toISOString(),
  };

  fetch('http://127.0.0.1:3000/log', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(logData),
  })
  .then(response => {
    if (response.ok) {
      console.log('訪問記錄已成功發送');
    } else {
      console.error('發送訪問記錄失敗');
    }
  })
  .catch(error => {
    console.error('無法發送訪問記錄:', error);
  });
}


// 黑名單功能
chrome.webNavigation.onBeforeNavigate.addListener((details) => {
    chrome.storage.sync.get(["blacklist"], (data) => {
        if (data.blacklist && data.blacklist.includes(details.url)) {
            alert("該網站已被公司管理員屏蔽！");
            chrome.tabs.remove(details.tabId);
        }
    });
});

// 插件安裝或啟動時的通知
chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === "install" || details.reason === "update") {
        notifyAdmin("擴展已重新安裝或啟動");
    }
});

// 通知管理員
function notifyAdmin(message) {
    fetch('http://127.0.0.1:3000/notify', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: message }),
    });
}
