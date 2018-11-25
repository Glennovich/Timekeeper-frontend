$(document).ready(function () {
    if ($("#tblProjects").length > 0) {
        //init data
        getProjects(displayProjects);
    }

    //event listeners
    $("#saveProject").on("click", function () {
        var formData = {
            "name": $("#projectName").val(),
            "description": $("#projectDescription").val()
        };

        formData = JSON.stringify(formData);

        $.ajax({
            type: "POST",
            url: backendBaseUrl + httpRequestParamaters.backendUrlProjects,
            data: formData,
            contentType: "application/json; charset=utf-8",
            success: projectSaveSuccess,
            error: projectSaveError
        });
    });

    $("#addProjectModalTrigger").on("click", function(){
        $("#addProjectModal").modal();
    })
});

function getProjects(cb) {
    $.get(backendBaseUrl + httpRequestParamaters.backendUrlProjects, function (data) {
        cb(data);
    });
}

function displayProjects(data) {
    $.each(data, function (id, project) {
        $("#tblProjects tbody").append("<tr><td>" + project.name + "</td><td>" + project.description + "</td></tr>");
    });
}

function projectSaveSuccess(data, textStatus, jqXHR){
    $('#addProjectModal').modal('close');
    $("#snackbar").addClass("show");

    setTimeout(() => {
        $("#snackbar").removeClass("show");
    }, 3000);
}

function projectSaveError(jqXHR, textStatus, errorThrown){
    $("#projectAddFailedMessage").show();
}