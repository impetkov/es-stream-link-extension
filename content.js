async function linkCustomerCover(){
    let customerCoverElement = document.getElementsByTagName('pre')[0];
    let attemptCounter = 0;
    while(!customerCoverElement && attemptCounter < 5){
        await new Promise(r => setTimeout(r, 1000));
        customerCoverElement = document.getElementsByTagName('pre')[0];
        attemptCounter++;
    }
    
    if(!customerCoverElement){
        return;
    }
    
    var text = customerCoverElement.innerText.toLocaleLowerCase();
    var customerCoverIdPositionInText = text.search('customercoverid');

    if(customerCoverIdPositionInText < 0){
        return;
    }

    var innerHTML = customerCoverElement.innerHTML.toLocaleLowerCase();
    var customerCoverIdPositionInHTML = innerHTML.search('customercoverid');
    if(innerHTML.substring(customerCoverIdPositionInHTML, customerCoverIdPositionInHTML+20).indexOf('<') > 0){
        return;
    }

    var customerCoverId = text.substring(customerCoverIdPositionInText+19, customerCoverIdPositionInText+19+36);

    customerCoverElement.innerHTML = customerCoverElement.innerHTML.replace(customerCoverId, '<a target="_blank" href="index.html#/streams/policy-' + customerCoverId +'">' + customerCoverId +'</a>');
}

async function linkCorrelation(){
    let correlationElement = document.getElementsByTagName('pre')[1];
    let attemptCounter = 0;
    while(!correlationElement && attemptCounter < 5){
        await new Promise(r => setTimeout(r, 1000));
        correlationElement = document.getElementsByTagName('pre')[1];
        attemptCounter++;
    }
    
    if(!correlationElement){
        return;
    }
    
    var text = correlationElement.innerText.toLocaleLowerCase();
    var correlationIdPositionInText = text.search('correlationid');

    if(correlationIdPositionInText < 0){
        return;
    }

    var innerHTML = correlationElement.innerHTML.toLocaleLowerCase();
    var correlationIdPositionInHTML = innerHTML.search('correlationid');
    if(innerHTML.substring(correlationIdPositionInHTML, correlationIdPositionInHTML+20).indexOf('<') > 0){
        return;
    }

    var correlationId = text.substring(correlationIdPositionInText+17, correlationIdPositionInText+17+36);

    correlationElement.innerHTML = correlationElement.innerHTML.replace(correlationId, '<a target="_blank" href="index.html#/streams/correlation-' + correlationId +'">' + correlationId +'</a>');
}

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if( request.message === "go_to_correlation_stream" ) {
            linkCorrelation();
            chrome.runtime.sendMessage({"message": "stop"});
        }
        if( request.message === "go_to_policy_stream") {
            linkCustomerCover();
            chrome.runtime.sendMessage({"message": "stop"});
        }
    }
);