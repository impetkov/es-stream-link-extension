chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if( request.message === "go_to_correlation_stream" ) {
            var correlationElement = document.getElementsByTagName('pre')[1];
            var text = correlationElement.innerText;
            var correlationId = text.substring(text.search('correlationId')+17, text.search('correlationId')+17+36);

            correlationElement.innerHTML = correlationElement.innerHTML.replace(correlationId, '<a target="_blank" href="index.html#/streams/correlation-' + correlationId +'">' + correlationId +'</a>');
            chrome.runtime.sendMessage({"message": "stop"});
        }
        if( request.message === "go_to_policy_stream" ) {
            var customerCoverElement = document.getElementsByTagName('pre')[0];
            var text = customerCoverElement.innerText;
            var customerCoverId = text.substring(text.search('customerCoverId')+19, text.search('customerCoverId')+19+36);

            customerCoverElement.innerHTML = customerCoverElement.innerHTML.replace(customerCoverId, '<a target="_blank" href="index.html#/streams/policy-' + customerCoverId +'">' + customerCoverId +'</a>');
            chrome.runtime.sendMessage({"message": "stop"});
        }
    }
);