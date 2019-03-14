/**
 * Collection of functions for HttpRequests to the backend
 * There are 5 types of requests possible: GET, POST, PUT, PATCH and DELETE
 * Each request is represented by the type of request in lower case with the following parameters
 * 
 * @param {String} url : The complete url for the request
 * @param {JSON} payload : only for POST, PUT and PATCH requests. This is the body of the request that will be sent
 * @param {function} functionOnSucces : Optional, The function that will be executed upon successful request. 
 * It will pass the response (in text) as a parameter to the function. If not used in the function, it doesn't have to be declared.
 * 
 * @param {function} functionOnError : Optional, but if passed, the functionOnSuccess becomes mandatory. 
 * The same rules apply as for the functionOnSuccess.
 */
var connectionAlive = true;

function get(url, functionOnSucces, functionOnError, inBackground) {
    createRequestWithoutPayload('GET', url, functionOnSucces, functionOnError, inBackground);
}

function remove(url, functionOnSucces, functionOnError) {
    createRequestWithoutPayload('DELETE', url, functionOnSucces, functionOnError);
}

function put(url, payload, functionOnSucces, functionOnError) {
    createRequestWithPayload('PUT', url, payload, functionOnSucces, functionOnError);
}

function post(url, payload, functionOnSucces, functionOnError) {
    createRequestWithPayload('POST', url, payload, functionOnSucces, functionOnError);
}

function patch(url, payload, functionOnSucces, functionOnError) {
    createRequestWithPayload('PATCH', url, payload, functionOnSucces, functionOnError);
}

function createRequestWithoutPayload(typeOfRequest, url, functionOnSucces, functionOnError, inBackground) {
    if (!inBackground)
        turnBusyIndicatorOn();
    var xhr = createCORSRequest(typeOfRequest, url);
    if (!xhr) {
        console.log('CORS not supported');
        return;
    }
    setErrorAndSuccessFunctions(xhr, functionOnSucces, functionOnError);
    xhr.setRequestHeader("token", localStorage.getItem("token"));
    xhr.send();
}

function createRequestWithPayload(typeOfRequest, url, payload, functionOnSucces, functionOnError) {
    turnBusyIndicatorOn();
    var xhr = createCORSRequest(typeOfRequest, url);
    if (!xhr) {
        console.log('CORS not supported');
        return;
    }
    setErrorAndSuccessFunctions(xhr, functionOnSucces, functionOnError);
    xhr.setRequestHeader("token", localStorage.getItem("token"));
    xhr.send(JSON.stringify(payload));
}

function createCORSRequest(method, url) {
    var xhr = new XMLHttpRequest();
    xhr.open(method, url, true);
    xhr.setRequestHeader("Content-Type", "application/json; charset=UTF-8");
    xhr.setRequestHeader("Authorization", "Basic " + btoa(httpRequestParamaters.credentials));
    return xhr;
}

function setErrorAndSuccessFunctions(xhr, functionOnSucces, functionOnError) {
    xhr.onload = function () {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status == 401) {
                window.location.href = '401.html';
                return;
            }
            if(xhr.status == 403){
                turnBusyIndicatorOff();
                if(functionOnError)
                    functionOnError(xhr.response);
                return;
            }
            if(xhr.status == 404){
                turnBusyIndicatorOff();
                if(functionOnError)
                    functionOnError(xhr.response);
                return;
            }
            if(xhr.status == 409){
                turnBusyIndicatorOff();
                if(functionOnError)
                    functionOnError(xhr.response);
                return;
            }
            try {
                turnBusyIndicatorOff();
                functionOnSucces(xhr.response);
            } catch (e) {
            }
        }
    }

    xhr.onerror = function () {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status == 401) {
                window.location.href = '401.html';
                return;
            }
            if(xhr.status == 403){
                turnBusyIndicatorOff();
                if(functionOnError)
                    functionOnError(xhr.response);
                return;
            }
            if(xhr.status == 404){
                turnBusyIndicatorOff();
                if(functionOnError)
                    functionOnError(xhr.response);
                return;
            }
            if(xhr.status == 409){
                turnBusyIndicatorOff();
                if(functionOnError)
                    functionOnError(xhr.response);
                return;
            }
            try {
                turnBusyIndicatorOff();
                if (xhr.status == 0) {
                    connectionLostProcedure();
                } else {
                    if (functionOnError)
                        functionOnError(xhr.response);
                }
            } catch (e) {
            }
        }

    }
}

function connectionLostProcedure() {
    if (connectionAlive) {
        $.each($(".title-container *"), (i, el) => {
            disableElement(el, true);
        });
        snackbar("A connection error occured, please try again later!", true);
    }
    connectionAlive = false;
    setTimeout(reconnect, 10000);
}

function reconnect() {
    get((backendBaseUrl + "live"),
            function () {
                connectionAlive = true;
                $.each($(".title-container *"), (i, el) => {
                    disableElement(el, false);
                });

                snackbar("Connection restored");
                initializeContent();
            }, null, true);

}
