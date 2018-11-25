$(document).ready(function(){
    //if selectbox taskProjectId exists, fill it with projects
    if($("#taskProjectId").length > 0){
        //gets projects wrapped in options tags and appends them to our projects selectbox
        getProjectsAsOptions($("#taskProjectId"));
    }

    $("#saveTask").on("click", function(){
        //hide any previous errors that might still be showing
        hideTaskFeedback();
        
        var formData = {
            "name": $("#taskName").val(),
            "description": $("#taskDescription").val(),
            "projectId": $("#taskProjectId").val()
        };

        formData = JSON.stringify(formData);

        $.ajax({
            type: "POST",
            url: backendBaseUrl + httpRequestParamaters.backendUrlTask,
            data: formData,
            contentType: "application/json; charset=utf-8",
            success: taskSaveSuccess,
            error: taskSaveError
          });
    })
});

function getProjectsAsOptions(selectelement){
    $.get(backendBaseUrl + httpRequestParamaters.backendUrlProjects, function (data) {
        $.each(data, function (id, project) {
            $(selectelement).append("<option value=\"" + project.id + "\">" + project.description + "</option>");
        });
        $(selectelement).formSelect();//must be done after dynamically adding option elements or lay-out will suck
    });
}

function taskSaveSuccess(data, textStatus, jqXHR){
    /*
    console.log("taskSaveSuccess, following 3 lines are data - textStatus - jqXHR");
    console.log(data);
    console.log(textStatus);
    console.log(jqXHR);
    */
    $("#taskFeedback").text("status: " + textStatus + " " + jqXHR.status);
    $("#taskFeedback").addClass("scale-in");
    //binnen 3 seconden weer weg doen
    setTimeout(hideTaskFeedback,3000);
}
function taskSaveError(jqXHR, textStatus, errorThrown){
    /*
    console.log("taskSaveError, following 3 lines are jqXHR - textStatus - errorThrown");
    console.log(jqXHR);
    console.log(textStatus);
    console.log(errorThrown);
    */
    $("#taskFeedback").text("status: " + textStatus + " " + jqXHR.status);
    $("#taskFeedback").addClass("scale-in");
    //we don't hide errors, we wait until next submit to do that
}
function hideTaskFeedback(){
    $("#taskFeedback").removeClass("scale-in");
    $("#taskFeedback").text("");
}