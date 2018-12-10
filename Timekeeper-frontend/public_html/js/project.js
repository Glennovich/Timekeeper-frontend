$(document).ready(function () {
    if ($("#tblProjects").length > 0) {
        //init data
        getProjects(displayProjects);
    }

    //event listeners
    $("#saveProject").on("click", function () {
        saveProjectToServer();
    });

    $("#addProjectModalTrigger").on("click", function () {
        $("#addProjectModal").modal();
        $(".datepicker").datepicker({
            format: 'yyyy-mm-dd'
        });

        //clear the form fields
        clearForm();

        setTimeout(() => {
            $("#projectName").focus();
        }, 3);
    });

    $("input").keyup(function (e) {
        if (e.keyCode == 13) {
            saveProjectToServer();
        }
    });

    $("#projectDueDate").on("focus", function(){
        $("#projectDueDate").click();
    });
});

function clearForm() {
    //focus on input field name and remove invalid class if neede
    $("#projectName").val("").removeClass("invalid");
    $("#projectDescription").val("");
    $("#projectDueDate").val("");
}

function saveProjectToServer() {
    if ($("#projectName").val().replace(/ /g, '') == "") {
        $("#projectName").val("");
    }
    if ($("#projectName").val() != "") {
        var formData = {
            "name": $("#projectName").val(),
            "description": $("#projectDescription").val(),
            "deadLine": $("#projectDueDate").val()
        };

        formData = JSON.stringify(formData);

        $.ajax({
            type: "POST",
            url: backendBaseUrl + httpRequestParamaters.backendUrlProjects,
            data: formData,
            contentType: "application/json; charset=utf-8",
            success: projectSaveSuccess(formData),
            error: projectSaveError
        });
    }
}

function getProjects(cb) {
    $.get(backendBaseUrl + httpRequestParamaters.backendUrlProjects, function (data) {
        cb(data);
    });
}

function displayProjects(data) {
    $.each(data, function (id, project) {
        if(project.deadLine == undefined){
            project.deadLine = "";
        }
        if(project.status == undefined){
            project.status = "";
        }
        
        $("#tblProjects tbody").append("<tr><td>" + project.name + "</td><td>" + project.description + "</td>" + "<td>" + project.status + "</td>" + "<td>" + project.deadLine + "</td></tr>");
    });
}

function projectSaveSuccess(data, textStatus, jqXHR) {
    $("input").val("");
    $('#addProjectModal').modal('close');

    //show a snackbar to let the user know that the project is created successfully
    $("#snackbar").addClass("show");
    setTimeout(() => {
        $("#snackbar").removeClass("show");
    }, 3000);

    //clear table
    setTimeout(() => {
        //clear table
        $("#tblProjects tbody tr").remove();
        getProjects(displayProjects);
    }, 100);
}

function projectSaveError(jqXHR, textStatus, errorThrown) {
    $("#projectAddFailedMessage").show();
}