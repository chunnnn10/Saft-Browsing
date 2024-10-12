// 定義 API 地址
const BLACKLIST_API_URL = 'http://localhost:3000/get-blacklist';
const LOG_API_URL = 'http://localhost:3000/log';
// 暫存Domains
let visitedDomains = new Set();
// 暫存黑名單
let currentBlacklist = [];

// 函數：從伺服器獲取最新黑名單
function fetchBlacklist() {
    fetch(BLACKLIST_API_URL)
        .then(response => response.json())
        .then(data => {
            currentBlacklist = data.blacklist || [];
            console.log("獲取到最新黑名單：", currentBlacklist);
            applyBlockingRules(); // 獲取到黑名單後應用規則
        })
        .catch(error => {
            console.error('獲取黑名單失敗:', error);
        });
}

// 函數：更新動態阻止規則（使用 declarativeNetRequest）
function applyBlockingRules() {
    const newRules = currentBlacklist.map((domain, index) => ({
        id: index + 1, // 規則的唯一ID
        priority: 1,   // 規則優先級
        action: { type: 'block' },
        condition: {
            urlFilter: `*://${domain}/*`,  // 使用通配符攔截
            resourceTypes: ["main_frame"]   // 僅統計主窗口回應
        }
    }));

    // 更新動態規則
    chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: Array.from({ length: currentBlacklist.length }, (_, i) => i + 1),  // 清除舊的規則
        addRules: newRules    // 添加新的規則
    }, () => {
        console.log("動態阻止規則已更新:", newRules);
    });
}

// 监听页面加载完成的事件
chrome.webNavigation.onCompleted.addListener((details) => {
    if (details.frameId === 0) {
        const currentUrl = new URL(details.url);

        // 如果 URL 是 exe 或 msi 文件，则立即记录
        if (currentUrl.pathname.endsWith('.exe') || currentUrl.pathname.endsWith('.msi')) {
            logVisit(details.url);
            return;
        }

        // 调试信息
        console.log(`尝试访问: ${details.url}`);

        // 只记录一次每个域名的访问，但允许在不同会话中重新记录
        if (!visitedDomains.has(currentUrl.hostname)) {
            visitedDomains.add(currentUrl.hostname);
            logVisit(details.url); // 记录此次访问
        }
    }
}, { url: [{ urlMatches: 'http://*/*' }, { urlMatches: 'https://*/*' }] });

// 每隔一定时间重置已访问的域名集合
setInterval(() => {
    visitedDomains.clear();
    console.log('已访问域名集合已清空');
}, 60000); // 每分钟清空一次访问记录

// 记录访问并发送到服务器
function logVisit(url) {
    const logData = {
        url: url,
        timestamp: new Date().toISOString(),
    };

    // 发送访问日志到服务器
    fetch(LOG_API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(logData),
    })
    .then(response => {
        if (response.ok) {
            console.log('访问记录已成功发送:', logData); // 记录日志
        } else {
            console.error('发送访问记录失败，状态码:', response.status); // 记录错误
        }
    })
    .catch(error => {
        console.error('无法发送访问记录:', error); // 捕获其他错误
    });
}

// 監聽在插件安裝或啟動時獲取黑名單
chrome.runtime.onInstalled.addListener(() => {
        console.log('擴展已安裝或更新，正在獲取黑名單...');
        fetchBlacklist();
    });

    chrome.runtime.onStartup.addListener(() => {
        console.log('擴展啟動，正在獲取黑名單...');
        fetchBlacklist();
    });

// 定期更新黑名單
    chrome.alarms.create('updateBlacklist', { periodInMinutes: 5 });
    chrome.alarms.onAlarm.addListener(fetchBlacklist);