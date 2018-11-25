$(document).ready(function () {
    if ($("#tblProjects").length > 0) {
        //init data
        getProjects(displayProjects);
    }

    //event listeners
    $("#saveProject").on("click", function () {
        var formData = {
            "name": $("#projectName").val(),
            "description": $("#description").val()
        };

        formData = JSON.stringify(formData);

        $.ajax({
            type: "POST",
            url: backendBaseUrl + httpRequestParamaters.backendUrlProjects,
            data: formData,
            contentType: "application/json; charset=utf-8",
        });
    });
});

function getProjects(cb) {
    console.log("get");
    $.get(backendBaseUrl + httpRequestParamaters.backendUrlProjects, function (data) {
        cb(data);
    });
}

function displayProjects(data) {
    console.log(data);
    $.each(data, function (id, project) {
        $("#tblProjects tbody").append("<tr><td>" + project.name + "</td><td>" + project.description + "</td></tr>");
    });
}