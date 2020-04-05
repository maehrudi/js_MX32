

function logSucces(str=""){
    console.log("%c -> SUCCESS: " + str, "color: #080; background-color: #8f8;");
}


function logFailed(str=""){
    console.log("%c -> FAILED: " + str, "color: #800; background-color: #f88; font-weight: bold;");
}


function checkCondition(bool=false, successStr="", failedStr=""){
    if (bool) {
        logSucces(successStr);
    } else {
        logFailed(failedStr);
    }
}

// logSucces("Test for SUCCESS");
// logFailed("Test for FAILED");

