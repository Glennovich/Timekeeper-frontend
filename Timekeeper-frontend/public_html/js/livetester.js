$(document).ready(function () {
    checkServiceLive();
});

function checkServiceLive(){
    var today = new Date();
    var datetime = today.getFullYear() + "/" + (today.getMonth()+1) + "/" + today.getDate() + " " + 
            (today.getHours()<10?"0"+today.getHours():today.getHours()) + ":" + 
            (today.getMinutes()<10?"0"+today.getMinutes():today.getMinutes()) + ":" + 
            (today.getSeconds()<10?"0"+today.getSeconds():today.getSeconds());
    var liveStatus = "";
    $.get(backendBaseUrl + "live", function (data) {
       liveStatus = data.status;
    }).fail(function(){
       liveStatus = "failed"; 
    }).always(function(){
       $("#tblLivetester tbody").append("<tr><td>" + datetime + "</td><td>" + liveStatus + "</td></tr>"); 
    });
    setTimeout(checkServiceLive,60000);
}

