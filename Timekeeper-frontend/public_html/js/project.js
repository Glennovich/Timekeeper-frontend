$(document).ready(function () {
    if ($("#tblProjects").length > 0) {
        //init data
        getProjects(displayProjects);
    }

    //init all modal
    $(".modal").modal();

    initializeEventHandlers();
});

function initializeEventHandlers() {
    $("#saveProject").on("click", function () {
        saveProject();
    });

    $("#addProjectModalTrigger").on("click", function () {
        $("#addOrUpdate").val("ADD");
        $("#addProjectModal").modal();
        initDatePicker();

        //clear the form fields
        clearForm();

        setTimeout(() => {
            $("#projectName").focus();
        }, 3);
    });

    $("input").keyup(function (e) {
        if (e.keyCode === 13) {
            saveProject();
        }
    });

    $("#projectDueDate").on("focus", function () {
        $("#projectDueDate").click();
    });

}


function clearForm() {
    //focus on input field name and remove invalid class if neede
    $("#projectName").val("").removeClass("invalid");
    $("#projectDescription").val("");
    $("#projectDueDate").val("").removeClass("invalid");
}

function getProjects(cb) {
    var url = backendBaseUrl + httpRequestParamaters.backendUrlProjects;
    get(url, cb, getProjectsError);
}

function getProjectsError(){
    $("#addProjectModalTrigger").addClass("disabled");
}

function displayProjects(response) {
    $("#addProjectModalTrigger").removeClass("disabled");
    $.each(JSON.parse(response), function (id, project) {
        initializeFieldsForDisplay(project);
        $("#tblProjects tbody")
                .append("<tr class='clickable-row projectRow project_" + project.id + "'></tr>");
        $("#tblProjects tbody tr:last-child")
                .append("<td>" + project.id + "</td>")
                .append("<td>" + project.name + "</td>")
                .append("<td>" + project.description + "</td>")
                .append("<td>" + project.status + "</td>")
                .append("<td>" + project.deadLine + "</td>")
                .append("<td>" + project.numberOfTasks  + "</td>")
                .append("<td class='trashcan'><a href='#'><img src='./assets/img/icon/delete.svg'/></a></td>");

        $(".project_" + project.id + " td").on("click", function () {
            showDetailModal(project);
        })
    });

    $(".projectRow .trashcan").off();
    $(".projectRow .trashcan a").on("click", function () {
        var id = $(this).closest("tr").find("td:first-child").html();
        confirmDelete(id);
    });

}

function initializeFieldsForDisplay(project) {
    if (project.deadLine == undefined) {
        project.deadLine = "";
    }
    if (project.status == undefined) {
        project.status = "";
    }
}

function refreshProjects() {
    setTimeout(() => {
        //clear table
        $("#tblProjects tbody tr").remove();
        getProjects(displayProjects);
    }, 300);
}


function saveProject() {
    if ($("#projectName").val().replace(/ /g, '') === "") {
        $("#projectName").val("");
    }
    if ($("#projectName").val() !== "") {
        var url = backendBaseUrl + httpRequestParamaters.backendUrlProjects;
        if ($("#addOrUpdate").val() === "ADD") {
            var formData = {
                "name": $("#projectName").val(),
                "description": $("#projectDescription").val(),
                "deadLine": $("#projectDueDate").val()
            };
            post(url, formData, projectSaveSuccess, projectSaveError);
        } else {
            var formData = {
                "id": $("#projectId").val(),
                "name": $("#projectName").val(),
                "description": $("#projectDescription").val(),
                "deadLine": $("#projectDueDate").val(),
                "status": $("#projectStatus").val()
            }
            put(url, formData, projectUpdateSuccess, projectSaveError);
        }
    }
}

function projectSaveSuccess() {
    $("input").val("");
    closeAddModal();
    showSnackbar("Project created!");
    refreshProjects();
}

function closeAddModal() {
    $('#addProjectModal').modal('close');
}

function projectUpdateSuccess() {
    clearInputFields();
    closeAddModal();
    showSnackbar("Project updated!");
    refreshProjects();
}

function clearInputFields() {
    $("input").val("");
}

function projectSaveError() {
    $("#projectAddFailedMessage").show();
}

function deleteProject(projectId) {
    var url = backendBaseUrl + httpRequestParamaters.backendUrlProjects + "/" + projectId;
    remove(url, projectDeleteSucces, projectDeleteError);
}

function projectDeleteSucces() {
    showSnackbar("Project deleted!");
    refreshProjects();
}

function projectDeleteError() {
    closeDeleteModal();
    showSnackbar("Project could not be deleted, try again!");
}

function closeDeleteModal() {
    $("#deleteProjectModal").modal("close");
    $("#deleteProject").off();
}

function confirmDelete(projectId, projectStatus) {
    $("#deleteProjectModal").modal("open");

    $("#deleteProject").on("click", function () {
        if (projectStatus == "Done") {
            secondConfirmationDelete(projectId);
        } else {
            deleteProject(projectId);
            closeDeleteModal();
        }
    })
}

function secondConfirmationDelete(projectId) {
    closeDeleteModal();
    $("#deleteDoneProjectModal").modal("open");

    $("#deleteDoneProject").on("click", function () {
        deleteProject(projectId);
        $("#deleteDoneProjectModal").modal("close");
    })
}

function showSnackbar(message) {
    //show a snackbar to let the user know that the project is created successfully
    $("#snackbar").text(message);
    $("#snackbar").addClass("show");
    setTimeout(() => {
        $("#snackbar").removeClass("show");
    }, 3000);
}

function showDetailModal(project) {
    //fill in fields of modal but first clear to delete error messages
    clearForm();
    fillInModalFields(project);
    initDatePicker();

    //set the placeholders right and open the modal
    M.updateTextFields();
    $("#addProjectModal").modal("open");
}

function initDatePicker() {
    $(".datepicker").datepicker({
        format: 'yyyy-mm-dd',
        firstDay: 1
    });
}

function fillInModalFields(project) {
    $("#addOrUpdate").val("UPDATE");
    $("#projectId").val(project.id);
    $("#projectName").val(project.name);
    $("#projectDescription").val(project.description);
    $("#projectDueDate").val(project.deadLine);
    $("#projectStatus").val(project.status);
}
