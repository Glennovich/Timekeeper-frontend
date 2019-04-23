$(document).ready(function () {
    initializeEventHandlers();
    //disable reset password button
    disableResetPasswordButton(true);
    activateAccount();
});

function initializeEventHandlers() {
    $("#btnLogin").on("click", function () {
        login();
    });

    $("#btnRegister").on("click", function () {
        register();
    });

    $("#btnSendResetPasswordMail").on("click", function () {
        sendPasswordResetMail();
    });

    $("#btnResetPassword").on("click", function () {
        resetPassword();
    });

    $("#txtResetPasswordPasswordConfirm").on("keyup", function () {
        if ($("#txtResetPasswordPasswordConfirm").val() === $("#txtResetPasswordPassword").val()) {
            disableResetPasswordButton(false);
            $("#txtResetPasswordPasswordConfirm").removeClass("errorHighLight");
        } else {
            disableResetPasswordButton(true);
            $("#txtResetPasswordPasswordConfirm").addClass("errorHighLight");
        }
    });
}

function disableResetPasswordButton(disable) {
    disableElement($("#btnResetPassword"), disable);
}

function activateAccount() {
    var urlParams = new URLSearchParams(window.location.search);
    var userName = urlParams.get("name");
    var activationToken = urlParams.get("activationtoken");

    if (userName !== null && activationToken !== null) {
        var url = backendBaseUrl + httpRequestParamaters.backendUrlUser + "/activate";
        var formData = {
            "name": userName,
            "activationToken": activationToken
        };

        post(url, formData, activationSuccess, activationError);
    }
}

function activationSuccess() {
    var urlParams = new URLSearchParams(window.location.search);
    var userName = urlParams.get("name");
    $("#txtLoginUserName").val(userName);
    snackbar("Account activated, you can login");
}

function activationError(response) {
    snackbar(JSON.parse(response).message, true);
}

function login() {
    if ($("#txtLoginUserName").val() !== "" && $("#txtLoginPassword").val() !== "") {
        var url = backendBaseUrl + httpRequestParamaters.backendUrlUser + "/login";
        var formData = {
            "name": $("#txtLoginUserName").val(),
            "password": $("#txtLoginPassword").val()
        };

        post(url, formData, loginSuccess, loginError);
    }
}

function register() {
    if ($("#txtRegisterUserName").val() !== ""
            && $("#txtRegisterPassword").val() !== ""
            && $("#txtRegisterPasswordConfirm").val() !== ""
            && $("#txtRegisterEmail").val() !== "") {
        if ($("#txtRegisterPassword").val() === $("#txtRegisterPasswordConfirm").val()) {
            if (testEmailAddress($("#txtRegisterEmail").val())) {
                checkRecaptcha(() => {
                    var url = backendBaseUrl + httpRequestParamaters.backendUrlUser + "/register";
                    var formData = {
                        "name": $("#txtRegisterUserName").val(),
                        "password": $("#txtRegisterPassword").val(),
                        "email": $("#txtRegisterEmail").val()
                    };
                    post(url, formData, registerSucces, registerError);
                },
                        () => {
                    snackbar("Incorrect reCaptcha!", true);
                });
            } else {
                snackbar("Invalid email", true);
            }
        }

    }
}

function sendPasswordResetMail() {
    if (!$("#txtSendResetPasswordMailAddress").val().trim()) {
        if (testEmailAddress($("#txtSendResetPasswordMailAddress").val())) {
            var url = backendBaseUrl + httpRequestParamaters.backendUrlUser + "/passwordforgotten";
            var formData = {
                email: $("#txtSendResetPasswordMailAddress").val()
            };
            post(url, formData, sendResetPasswordMailSuccess, sendResetPasswordMailError);
        } else {
            snackbar("Invalid email", true);
        }
    }
}

function sendResetPasswordMailSuccess() {
    snackbar("Reset password mail has been sent, please check your mail");
    window.location.href = "login.html";
}

function sendResetPasswordMailError(response) {
    snackbar(JSON.parse(response).message, true);
}

function resetPassword() {
    if ($("#txtResetPasswordPassword").val().trim() && $("#txtResetPasswordPasswordConfirm").val().trim()) {
        if ($("#txtResetPasswordPassword").val() === $("#txtResetPasswordPasswordConfirm").val()) {
            checkRecaptcha(() => {
                var urlParams = new URLSearchParams(window.location.search);
                var name = urlParams.get("name");
                var forgotPasswordToken = urlParams.get("forgotpasswordtoken");
                var url = backendBaseUrl + httpRequestParamaters.backendUrlUser + "/resetpassword";
                var formData = {
                    name: name,
                    forgotPasswordToken: forgotPasswordToken,
                    password: $("#txtResetPasswordPassword").val()
                };
                post(url, formData, resetPasswordSuccess, resetPasswordError);
            }, () => {
                snackbar("Incorrect reCaptcha!", true);
            });
        } else {
            snackbar("Passwords must be the same", true);
        }
    }
}

function resetPasswordSuccess() {
    snackbar("Password has been reset, please login!");
    window.location.href = "login.html";
}

function resetPasswordError(response) {
    snackbar(JSON.parse(response).message, true);
}

function testEmailAddress(mail) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail);
}

function registerSucces() {
    snackbar("Registration successfull, please activate your account!");
    window.location.href = 'login.html';
}

function registerError(response) {
    snackbar(JSON.parse(response).message, true);
}

function loginSuccess(response) {
    localStorage.setItem("token", JSON.parse(response).token);
    window.location.href = 'index.html';
}

function loginError(response) {
    snackbar(JSON.parse(response).message, true);
}


