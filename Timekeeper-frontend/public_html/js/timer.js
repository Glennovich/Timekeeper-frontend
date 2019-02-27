var t;
var seconds = 0, minutes = 0, hours = 0;
var isRunning = false;

$(document).ready(function(){
    //event listeners
    $("#btnStartTimer").on("click", function(){
        if(!isRunning){
        //disable menu
            disableMenu();
            isRunning = true;
            t = setTimeout(updateTimer, 1000);
        }
    });

    $("#btnStopTimer").on("click", function(){
        if(isRunning){
            //enable menu
            enableMenu();
            isRunning = false;
            clearTimeout(t);
        }
    });

    //set the timer back to 00:00:00
    $("#btnResetTimer").on("click", function(){
            //enable menu
            enableMenu();
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

function disableMenu(){
    disableElement($(".menu-bar"), true);
    //disable head menu
//    $(".menu-bar a").foreach;
}

function enableMenu(){
    disableElement($(".menu-bar"), true);
    //enable head menu
//    var nav = $(".nav-wrapper ul").removeClass("isDisabled");
}

function formatTimer(hours, minutes, seconds){
    return (hours ? (hours > 9 ? hours : "0" + hours) : "00") + 
    ":" + (minutes ? (minutes > 9 ? minutes : "0" + minutes) : "00") + 
    ":" + (seconds > 9 ? seconds : "0" + seconds);
}
