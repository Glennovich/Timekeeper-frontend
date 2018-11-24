const backendBaseUrl = httpRequestParamaters.backendUrlDev;

$(document).ready(function () {
    //init data
    getProjects(displayProjects);


    //event listeners
    $("#saveProject").on("click", function(){
        var formData = {
            "name": $("#projectName").val(),
            "description": $("#description").val()
        };

        formData = JSON.stringify(formData);
        console.log(formData);

        $.ajax({
            type: "POST",
            url: backendBaseUrl + httpRequestParamaters.backendUrlProjects,
            data: formData,
            contentType: "application/json; charset=utf-8",
          });
    })
});


function getProjects(cb) {
    $.get(backendBaseUrl + httpRequestParamaters.backendUrlProjects, function (data) {
        cb(data);
    });
}

function displayProjects(data) {
    $.each(data, function (id, project) {
        $("#projects tbody").append("<tr><td>" + project.name + "</td><td>" + project.description + "</td></tr>");
    });
}