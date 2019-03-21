$(document).ready(function(){
   initializeEventHandlers();
   
   activateAccount();
});

function initializeEventHandlers(){
    $("#btnLogin").on("click", function(){
        login();
    });
    
    $("#btnRegister").on("click", function(){
        register();
    });
}

function activateAccount(){
    var urlParams = new URLSearchParams(window.location.search);
    var userName = urlParams.get("name");
    var activationToken = urlParams.get("activationtoken");
    
    if(userName !== null && activationToken !== null){
        var url = backendBaseUrl + httpRequestParamaters.backendUrlUser + "/activate";
        var formData = {
            "name": userName,
            "activationToken": activationToken
        };
        
        post(url, formData, activationSuccess, activationError);
    }
}

function activationSuccess(){
    var urlParams = new URLSearchParams(window.location.search);
    var userName = urlParams.get("name");
    $("#txtLoginUserName").val(userName);
    snackbar("Account activated, you can login");
}

function activationError(response){
    snackbar(JSON.parse(response).message, true);
}

function login(){
    if($("#txtLoginUserName").val() !== "" && $("#txtLoginPassword").val() !== ""){
        var url = backendBaseUrl + httpRequestParamaters.backendUrlUser + "/login";
        var formData = {
            "name": $("#txtLoginUserName").val(),
            "password": $("#txtLoginPassword").val()
        };
        
        post(url, formData, loginSuccess, loginError);
    }
}

function register(){
    if($("#txtRegisterUserName").val() !== "" && $("#txtRegisterPassword").val() !== "" && $("#txtRegisterPasswordConfirm").val() !== "" && $("#txtRegisterEmail").val() !== ""){
        if($("#txtRegisterPassword").val() === $("#txtRegisterPasswordConfirm").val()){
            if(testEmailAddress($("#txtRegisterEmail").val())){
                var url = backendBaseUrl + httpRequestParamaters.backendUrlUser + "/register";
                var formData = {
                    "name": $("#txtRegisterUserName").val(),
                    "password": $("#txtRegisterPassword").val(),
                    "email": $("#txtRegisterEmail").val()
                };
                post(url, formData, registerSucces, registerError);
            } else {
                snackbar("Invalid email", true);
            }
        }
    }
}

function testEmailAddress(mail){
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail);
}

function registerSucces(){
    snackbar("Registration successfull, please activate your account!");
    window.location.href = 'login.html';
}

function registerError(response){
    snackbar(JSON.parse(response).message, true);
}

function loginSuccess(response){
    localStorage.setItem("token", JSON.parse(response).token);
    window.location.href = 'index.html';
}

function loginError(response){
    snackbar(JSON.parse(response).message, true);
}


