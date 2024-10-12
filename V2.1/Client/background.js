// 定義 API 地址
const BLACKLIST_API_URL = 'http://localhost:3000/get-blacklist';

// 暫存黑名單
let currentBlacklist = [];

// 從伺服器獲取最新黑名單
function fetchBlacklist() {
    fetch(BLACKLIST_API_URL)
        .then(response => response.json())
        .then(data => {
            currentBlacklist = data.blacklist || [];
            console.log("獲取到最新黑名單：", currentBlacklist);
            applyBlockingRules();  // 獲取後立即更新規則
        })
        .catch(error => {
            console.error('獲取黑名單失敗:', error);
        });
}

// 更新動態阻止規則
function applyBlockingRules() {
    const newRules = currentBlacklist.map((domain, index) => ({
        id: index + 1,  // 確保 id 為整數
        priority: 1,
        action: { type: 'block' },
        condition: {
            urlFilter: `*://${domain}/*`,
            resourceTypes: ["main_frame"]
        }
    }));

    // 添加新規則
    chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: Array.from({ length: currentBlacklist.length }, (_, i) => i + 1),  // 清除舊的規則
        addRules: newRules  // 添加新的規則
    }, () => {
        console.log("動態規則已更新:", newRules);
    });
}

// 插件安裝或啟動時更新黑名單
chrome.runtime.onInstalled.addListener(() => {
    console.log('插件已安裝或更新，正在獲取黑名單...');
    fetchBlacklist();
});

chrome.runtime.onStartup.addListener(() => {
    console.log('插件啟動，正在獲取黑名單...');
    fetchBlacklist();
});

// 定期更新黑名單
chrome.alarms.create('updateBlacklist', { periodInMinutes: 5 });
chrome.alarms.onAlarm.addListener(fetchBlacklist);