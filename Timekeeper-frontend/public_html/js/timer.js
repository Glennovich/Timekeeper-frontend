var seconds = 0, minutes = 0, hours = 0;

$(document).ready(function(){
    setTimeout(timer, 1000);
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

    setTimeout(timer, 1000);
}

function formatTimer(hours, minutes, seconds){
    return (hours ? (hours > 9 ? hours : "0" + hours) : "00") + 
    ":" + (minutes ? (minutes > 9 ? minutes : "0" + minutes) : "00") + 
    ":" + (seconds > 9 ? seconds : "0" + seconds);
}