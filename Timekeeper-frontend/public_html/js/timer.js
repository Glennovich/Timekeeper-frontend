var t;
var seconds = 0, minutes = 0, hours = 0;

$(document).ready(function(){
    //event listeners
    $("#startTimer").on("click", function(){
        //disable menu
        disableMenu();
        t = setTimeout(timer, 1000);
    });

    $("#stopTimer").on("click", function(){
        //enable menu
        enableMenu();
        clearTimeout(t);
    });

    //set the timer back to 00:00:00
    $("#resetTimer").on("click", function(){
        //enable menu
        enableMenu();
        clearTimeout(t);
        seconds = 0;
        minutes = 0;
        hours = 0;
        $("#timer").text("00:00:00");
    });
});

function timer() {
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

    t = setTimeout(timer, 1000);
}

function disableMenu(){
    //disable head menu
    $(".nav-wrapper ul").addClass("isDisabled");
    //disable sidenav for mobile
    $(".sidenav").addClass("isDisabled");
}

function enableMenu(){
    //enable head menu
    var nav = $(".nav-wrapper ul").removeClass("isDisabled");
    //enable sidenav for mobile
    var sideNav = $(".sidenav").removeClass("isDisabled");
}

function formatTimer(hours, minutes, seconds){
    return (hours ? (hours > 9 ? hours : "0" + hours) : "00") + 
    ":" + (minutes ? (minutes > 9 ? minutes : "0" + minutes) : "00") + 
    ":" + (seconds > 9 ? seconds : "0" + seconds);
}
