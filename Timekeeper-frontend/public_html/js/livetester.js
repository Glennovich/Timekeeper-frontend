$(document).ready(function () {
    checkServiceLive();
    setInterval(checkServiceLive, 10000);
});

function checkServiceLive() {
    var today = new Date();
    var datetime = today.getFullYear() + "/" + (today.getMonth() + 1) + "/" + today.getDate() + " " +
            (today.getHours() < 10 ? "0" + today.getHours() : today.getHours()) + ":" +
            (today.getMinutes() < 10 ? "0" + today.getMinutes() : today.getMinutes()) + ":" +
            (today.getSeconds() < 10 ? "0" + today.getSeconds() : today.getSeconds());
    var liveStatus = "";
    get(backendBaseUrl + "live",
            function (result) {
                $(".table-body")
                        .append("<span class='load'>" + datetime + "</span>")
                        .append("<span class='load'>" + JSON.parse(result).status + "</span>")
                        .append("<div class='separationLine load'></div>");
            },
            function (result) {
                $(".table-body")
                        .append("<span class='load error-span'>" + datetime + "</span>")
                        .append("<span class='load error-span'>connection error</span>")
                        .append("<div class='separationLine load'></div>");
            });
    showTableRows();
}

