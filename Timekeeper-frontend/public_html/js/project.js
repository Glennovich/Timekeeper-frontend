$(document).ready(function () {
    if ($("#tblProjects").length > 0) {
        //init data
        getProjects(displayProjects);
    }

    //init all modal
    $(".modal").modal();

    //event listeners
    $("#saveProject").on("click", function () {
        saveProjectToServer();
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
        if (e.keyCode == 13) {
            saveProjectToServer();
        }
    });

    $("#projectDueDate").on("focus", function () {
        $("#projectDueDate").click();
    });
});

function clearForm() {
    //focus on input field name and remove invalid class if neede
    $("#projectName").val("").removeClass("invalid");
    $("#projectDescription").val("");
    $("#projectDueDate").val("").removeClass("invalid");
}

function saveProjectToServer() {
    if ($("#projectName").val().replace(/ /g, '') == "") {
        $("#projectName").val("");
    }
    if ($("#projectName").val() != "") {
        if ($("#addOrUpdate").val() === "ADD") {
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
                success: projectSaveSuccess,
                error: projectSaveError
            });
        } else {
            var formData = {
                "id": $("#projectId").val(),
                "name": $("#projectName").val(),
                "description": $("#projectDescription").val(),
                "deadLine": $("#projectDueDate").val(),
                "status": $("#projectStatus").val()
            }

            formData = JSON.stringify(formData);

            $.ajax({
                type: "PUT",
                data: formData,
                contentType: "application/json; charset=utf-8",
                url: backendBaseUrl + httpRequestParamaters.backendUrlProjects,
                success: projectUpdateSuccess,
                error: projectSaveError,
            });
        }
    }
}

function getProjects(cb) {
    $.get(backendBaseUrl + httpRequestParamaters.backendUrlProjects, function (data) {
        $("#addProjectModalTrigger").removeClass("disabled");
        cb(data);
    });
}

function displayProjects(data) {
    $.each(data, function (id, project) {
        if (project.deadLine == undefined) {
            project.deadLine = "";
        }
        if (project.status == undefined) {
            project.status = "";
        }

        $("#tblProjects tbody").append("<tr style='cursor:pointer;' class='clickable-row'><td style='display:none;'>" + project.id + "</td><td class='project_" + project.id + "'>" + project.name + "</td><td class='project_" + project.id + "'>" + project.description + "</td>" + "<td class='project_" + project.id + "'>" + project.status + "</td>" + "<td class='project_" + project.id + "'>" + project.deadLine + "</td><td>" + project.numberOfTasks + "</td><td><a href='#' onclick='confirmDelete(\"" + project.id + "\",\"" + project.status + "\")'><img src='./assets/img/icon/delete.svg'/></a></td></tr>");

        $(".project_" + project.id).on("click", function () {
            showDetailModal(project);
        })
    });
}

function projectSaveSuccess(data, textStatus, jqXHR) {
    clearInputFields();
    closeAddModal();
    showSnackbar("Project created!");
    refreshProjects();
}

function projectUpdateSuccess(data, textStatus, jqXHR){
    clearInputFields();
    closeAddModal();
    showSnackbar("Project updated!");
    refreshProjects();
}

function closeAddModal(){
    $('#addProjectModal').modal('close');
}

function clearInputFields(){
    $("input").val("");
}

function refreshProjects() {
    setTimeout(() => {
        //clear table
        $("#tblProjects tbody tr").remove();
        getProjects(displayProjects);
    }, 300);
}

function projectSaveError(jqXHR, textStatus, errorThrown) {
    $("#projectAddFailedMessage").show();
}

function deleteProject(projectId) {
    $.ajax({
        type: "DELETE",
        url: backendBaseUrl + httpRequestParamaters.backendUrlProjects + "/" + projectId,
        success: projectDeleteSucces,
        error: projectDeleteError,
    });
}

function projectDeleteSucces() {
    showSnackbar("Project deleted!");
    refreshProjects();
}

function projectDeleteError() {
    showSnackbar("Project could not be deleted, try again!");
}

function closeDeleteModal() {
    $("#deleteProjectModal").modal("close");
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

function initDatePicker(){
    $(".datepicker").datepicker({
        format: 'yyyy-mm-dd',
        firstDay: 1
    });
}

function fillInModalFields(project){
    $("#addOrUpdate").val("UPDATE");
    $("#projectId").val(project.id);
    $("#projectName").val(project.name);
    $("#projectDescription").val(project.description);
    $("#projectDueDate").val(project.deadLine);
    $("#projectStatus").val(project.status);
}
