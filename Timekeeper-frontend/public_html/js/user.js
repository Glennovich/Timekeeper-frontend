$(document).ready(function(){
   initializeEventHandlers();
});

function initializeEventHandlers(){
    $("#btnLogin").on("click", function(){
        login();
    });
    
    $("#btnRegister").on("click", function(){
        register();
    });
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
    console.log("test");
    if($("#txtRegisterUserName").val() !== "" && $("#txtRegisterPassword").val() !== "" && $("#txtRegisterPasswordConfirm").val() !== "" && $("#txtRegisterEmail").val() !== ""){
        if($("#txtRegisterPassword").val() === $("#txtRegisterPasswordConfirm").val()){
            var url = backendBaseUrl + httpRequestParamaters.backendUrlUser + "/register";
            var formData = {
                "name": $("#txtRegisterUserName").val(),
                "password": $("#txtRegisterPassword").val(),
                "email": $("#txtRegisterEmail").val()
            };
            post(url, formData, registerSucces, registerError);
        }
    }
}

function registerSucces(){
    snackbar("Registration successfull, please activate your account!");
    window.location.href = 'login.html';
}

function registerError(response){
    snackbar("Registration failed, please try again!")
}

function loginSuccess(response){
    localStorage.setItem("token", JSON.parse(response).token);
    window.location.href = 'index.html';
}

function loginError(response){
    snackbar("Login failed, please try again!", true);
}


