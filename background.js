chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        var activeTab = tabs[0];
        if(!activeTab){
            return;
        }
        chrome.tabs.sendMessage(activeTab.id, {"message": "go_to_policy_stream"});
        chrome.tabs.sendMessage(activeTab.id, {"message": "go_to_quote_rating_stream"});
        chrome.tabs.sendMessage(activeTab.id, {"message": "go_to_risk_variations_stream"});
        chrome.tabs.sendMessage(activeTab.id, {"message": "decompress_risk"});
        chrome.tabs.sendMessage(activeTab.id, {"message": "go_to_correlation_stream"});
    });
})

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if( request.message === "stop" ) {
            chrome.tabs.onUpdated.removeListener();
        }
    }
);