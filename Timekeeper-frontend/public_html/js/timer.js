var t;
var seconds = 0, minutes = 0, hours = 0;
var isRunning = false;

$(document).ready(function () {
    $("#btnStartTimer").on("click", function () {
        if (!isRunning) {
            disableMenu();
            disableElement($("#btnStartTimer"), true);
            disableElement($("#btnStopTimer"), false);
            disableElement($("#btnResetTimer"), true);
            isRunning = true;
            t = setTimeout(updateTimer, 1000);
        }
    });

    $("#btnStopTimer").on("click", function () {
        if (isRunning) {
            enableMenu();
            disableElement($("#btnStartTimer"), false);
            disableElement($("#btnStopTimer"), true);
            disableElement($("#btnResetTimer"), false);
            isRunning = false;
            clearTimeout(t);
        }
    });

    $("#btnResetTimer").on("click", function () {
        enableMenu();
        disableElement($("#btnResetTimer"), true);
        isRunning = false;
        clearTimeout(t);
        seconds = 0;
        minutes = 0;
        hours = 0;
        $("#timer").text("00:00:00");
    });
});

function updateTimer() {
    seconds++;
    if (seconds >= 60) {
        seconds = 0;
        minutes++;
        if (minutes >= 60) {
            minutes = 0;
            hours++;
        }
    }

    $("#timer").text(formatTimer(hours, minutes, seconds));

    t = setTimeout(updateTimer, 1000);
}

function disableMenu() {
    $.each($(".menu-bar *"), function (i, el) {
        disableElement(el, true);
    });
}

function enableMenu() {
    $.each($(".menu-bar *"), function (i, el) {
        disableElement(el, false);
    });
}

function formatTimer(hours, minutes, seconds) {
    return (hours ? (hours > 9 ? hours : "0" + hours) : "00") +
            ":" + (minutes ? (minutes > 9 ? minutes : "0" + minutes) : "00") +
            ":" + (seconds > 9 ? seconds : "0" + seconds);
}
