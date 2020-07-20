const GUID_LENGTH = 36;
const CUSTOMER_COVER_ID = 'customercoverid';
const RISK_VARIATION_ID = 'riskvariationid';
const QUOTE_ID = 'quoteid';
const CORRELATION_ID = 'correlationid';
const RISK = '"risk"';
const COMPRESSED_RISK_STARTING_SEQUENCE = '^@v1^';

function hasAlreadyBeenLinked(parent, child){
    const innerHTML = parent.innerHTML.toLocaleLowerCase();
    const childPosition = innerHTML.search(child);
    
    return innerHTML.substring(childPosition, childPosition + 20).indexOf('<') > 0;
}

function hasAlreadyBeenDecompressed(risk, child){
    
    return risk.substring(0, risk.length).indexOf(COMPRESSED_RISK_STARTING_SEQUENCE) < 0;
}

async function getContainingElement(index, attempts = 3){
    let containingElement = document.getElementsByTagName('pre')[index];
    let attemptCounter = 0;
    while(!containingElement && attemptCounter < attempts){
        await new Promise(r => setTimeout(r, 1000));
        containingElement = document.getElementsByTagName('pre')[index];
        attemptCounter++;
    }

    return containingElement;
}

const getText = element => element.innerText;
const getLowerCaseText = element => element.innerText.toLocaleLowerCase();
const getHTML = element => element.innerHTML.toLocaleLowerCase();

const findId = (text, startingIndex, characterOffset) =>
    text.substring(startingIndex + characterOffset, startingIndex + characterOffset + GUID_LENGTH);

const linkify = (containingElement, idToLinkify, position, offset, stream) => {
    const htmlPrior = containingElement.innerHTML.substring(0, position + offset);
    const htmlAfter = containingElement.innerHTML.substring(position + offset + GUID_LENGTH);

    containingElement.innerHTML = `${htmlPrior}<a target="_blank" href="index.html#/streams/${stream}${idToLinkify}">${idToLinkify}</a>${htmlAfter}`
}

async function linkCustomerCover(){
    const customerCoverElement = await getContainingElement(0);
    
    if(!customerCoverElement){
        return;
    }
    
    const containingElementText = getLowerCaseText(customerCoverElement);
    const customerCoverIdPositionInText = containingElementText.search(CUSTOMER_COVER_ID);

    if(customerCoverIdPositionInText < 0){
        return;
    }

    if(hasAlreadyBeenLinked(customerCoverElement, CUSTOMER_COVER_ID)){
        return;
    }

    const customerCoverId = findId(containingElementText, customerCoverIdPositionInText, 19);
    const customerCoverIdPositionInHTML = getHTML(customerCoverElement).search(CUSTOMER_COVER_ID);
    linkify(customerCoverElement, customerCoverId, customerCoverIdPositionInHTML, 19, 'policy-');
}

async function linkQuoteRating(){
    const riskVariationElement = await getContainingElement(0);
    
    if(!riskVariationElement){
        return;
    }

    const containingElementText = getLowerCaseText(riskVariationElement);
    const riskVariationIdPositionInText = containingElementText.search(RISK_VARIATION_ID);

    if(riskVariationIdPositionInText < 0){
        return;
    }

    if(hasAlreadyBeenLinked(riskVariationElement, RISK_VARIATION_ID)){
        return;
    }

    const riskVariationId = findId(containingElementText, riskVariationIdPositionInText, 19);
    const riskVariationIdPositionInHTML = getHTML(riskVariationElement).search(RISK_VARIATION_ID);
    linkify(riskVariationElement, riskVariationId, riskVariationIdPositionInHTML, 19, 'policy-quoterating');
}

async function linkRiskVariations(){
    const quoteElement = await getContainingElement(0);
    
    if(!quoteElement){
        return;
    }

    const containingElementText = getLowerCaseText(quoteElement);
    const quoteIdPositionInText = containingElementText.search(QUOTE_ID);

    if(quoteIdPositionInText < 0){
        return;
    }

    if(hasAlreadyBeenLinked(quoteElement, QUOTE_ID)){
        return;
    }

    const quoteId = findId(containingElementText, quoteIdPositionInText, 11);
    const quoteIdPositionInHTML = getHTML(quoteElement).search(QUOTE_ID);
    linkify(quoteElement, quoteId, quoteIdPositionInHTML, 11, 'policy-riskvariations');
}

async function linkCorrelation(){
    const correlationElement = await getContainingElement(1);
    
    if(!correlationElement){
        return;
    }
    
    const containingElementText = getLowerCaseText(correlationElement);
    const correlationIdPositionInText = containingElementText.search(CORRELATION_ID);

    if(correlationIdPositionInText < 0){
        return;
    }

    if(hasAlreadyBeenLinked(correlationElement, CORRELATION_ID)){
        return;
    }

    const correlationId = findId(containingElementText, correlationIdPositionInText, 17);
    const correlationIdPositionInHTML = getHTML(correlationElement).search(CORRELATION_ID);
    linkify(correlationElement, correlationId, correlationIdPositionInHTML, 17, 'correlation-');
}

function uncompressRisk(risk){
    risk = risk.substring(5);
    const compressedRisk = atob(risk);

    const charData = compressedRisk.split('').map(function(x){return x.charCodeAt(0);});

    const binData = new Uint8Array(charData);

    const data = pako.inflate(binData);

    const uncompressedRisk = String.fromCharCode.apply(null, new Uint16Array(data));

    return uncompressedRisk;
}

async function decompressRisk() {
    const riskElement = await getContainingElement(0);
    
    if(!riskElement){
        return;
    }
    
    const containingElementText = getText(riskElement);
    const riskStartPositionInText = containingElementText.search(RISK);

    if(riskStartPositionInText < 0 || riskElement.innerHTML.search('btnDecompressRisk') > 0){
        return;
    }

    var json = JSON.parse(containingElementText);
    

    if(hasAlreadyBeenDecompressed(json.risk, RISK)){
        return;
    }

    const uncompressedRisk = uncompressRisk(json.risk);

    const eventData = JSON.stringify(json, null, 4);
    const formattedRisk = JSON.stringify(uncompressedRisk, null, 4).replace("'", "");
    riskElement.innerHTML = `${eventData}<br/><button id='btnDecompressRisk' onclick='const riskTextArea = getElementById("decompressedRiskTextArea"); if(riskTextArea.style.display === "block") {riskTextArea.style.display = "none";} else {riskTextArea.style.display = "block";}'>Decompress risk</button><br/><div id="decompressedRiskTextArea" style="display: none;"><textarea id="decompressedRisk">${formattedRisk}</textarea><button id="btnCopyRisk" onclick='const riskArea = getElementById("decompressedRisk"); console.log(riskArea); riskArea.select(); document.execCommand("copy");'>Copy risk to clipboard</button></div>`;
}

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if(request.message === "go_to_policy_stream") {
            linkCustomerCover();
        }
        if(request.message === "go_to_quote_rating_stream") {
            linkQuoteRating();
        }
        if(request.message === "go_to_risk_variations_stream") {
            linkRiskVariations();
        }
        if(request.message === "decompress_risk") {
            decompressRisk();
        }
        if(request.message === "go_to_correlation_stream" ) {
            linkCorrelation();
        }

        chrome.runtime.sendMessage({"message": "stop"});
    }
);