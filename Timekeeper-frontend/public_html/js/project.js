$(document).ready(function () {
    getProjects();

    initializeEventHandlers();
});

function initializeEventHandlers() {
    $("#btnSaveProject").on("click", function () {
        saveProject();
        closeAddModal();
    });

    $("#btnCancelProject").on("click", function () {
        closeAddModal();
    });

    $("#btnAddProject").on("click", function () {
        $("#addOrUpdate").val("ADD");
        openAddModal();
        clearForm();
        setTimeout(() => {
            $("#inputProjectName").focus();
        }, 3);
    });

    $("input").keyup(function (e) {
        if (e.keyCode === 13) {
            saveProject();
            closeAddModal();
        }
    });

    $("#inputProjectDueDate").on("focus", function () {
        $("#inputProjectDueDate").click();
    });

    $("#inputProjectDueDate").datepicker({firstDay: 1});
    $("#inputProjectDueDate").datepicker("option", "dateFormat", "yy-mm-dd");


}

function clearForm() {
    $("#inputProjectName").val("").removeClass("invalid");
    $("#textAreaProjectDescription").val("");
    $("#inputProjectDueDate").val("").removeClass("invalid");
}

function getProjects() {
    var url = backendBaseUrl + httpRequestParamaters.backendUrlProjects;
    get(url, displayProjects, getProjectsError);
}

function getProjectsError() {
    disableAddButton(true);
    snackbar("Projects could not be loaded, please try again later!", true);
}

function disableAddButton(disable) {
    disableElement($("#btnAddProject"), disable)
}

function displayProjects(response) {
    disableAddButton(false);
    $.each(JSON.parse(response), function (id, project) {
        initializeFieldsForDisplay(project);

        $(".table-body")
                .append("<span>" + project.name + "</span>")
                .append("<span class='medium-screen-hidden'>" + project.description + "</span>")
                .append("<span class='small-screen-hidden'>" + project.status + "</span>")
                .append("<span class='small-screen-hidden'>" + project.deadLine + "</span>")
                .append("<span class='small-screen-hidden'>" + project.numberOfTasks + "</span>")
                .append("<span id='pencil_" + project.id + "' class='clickable'><img src='./assets/img/icon/edit.svg'/></span>")
                .append("<span id='goto_" + project.id + "' class='clickable'><img title='" + project.numberOfTasks + " task(s)' src='./assets/img/icon/" + determineIcon(project.numberOfTasks) + ".svg'/></span>")
                .append("<span id='trash_" + project.id + "' class='clickable'><img src='./assets/img/icon/delete.svg'/></span>")
                .append("<div class='separationLine'></div>");

        $("#pencil_" + project.id).on("click", function () {
            showDetailModal(project);
        });
        $("#goto_" + project.id).on("click", function () {
            goToProjectDetail(project.id);
        });
        $("#trash_" + project.id).on("click", function () {
            confirmDelete(project);
        });
    });
    showTableRows();

}

function initializeFieldsForDisplay(project) {
    if (project.deadLine == undefined) {
        project.deadLine = "";
    }
    if (project.status == undefined) {
        project.status = "";
    }
}

function determineIcon(numberOfTasks) {
    var icon = "empty-folder";
    if (numberOfTasks != "0") {
        icon = "search-in-folder";
    }

    return icon;
}

function refreshProjects() {
    setTimeout(() => {
        clearTable();
        getProjects(displayProjects);
    }, 300);
}

function saveProject() {
    if ($("#inputProjectName").val().replace(/ /g, '') === "") {
        $("#inputProjectName").val("");
    }
    if ($("#inputProjectName").val() !== "") {
        var url = backendBaseUrl + httpRequestParamaters.backendUrlProject;
        if ($("#addOrUpdate").val() === "ADD") {
            addProject();
        } else {
            editProject();
        }
    }
}

function editProject() {
    var formData = {
        "id": $("#projectId").val(),
        "name": $("#inputProjectName").val(),
        "description": $("#textAreaProjectDescription").val(),
        "deadLine": $("#inputProjectDueDate").val(),
        "status": $("#projectStatus").val()
    }
    put(url, formData, projectUpdateSuccess, projectEditError);
}

function addProject() {
    var formData = {
        "name": $("#inputProjectName").val(),
        "description": $("#textAreaProjectDescription").val(),
        "deadLine": $("#inputProjectDueDate").val()
    };
    post(url, formData, projectSaveSuccess, projectAddError);
}

function projectSaveSuccess() {
    disableAddButton(false);
    $("input[type=text]").val("");
    closeAddModal();
    snackbar("Project created!");
    refreshProjects();
}

function openAddModal() {
    openModal($("#addProjectModal"));
}

function closeAddModal() {
    closeModal($("#addProjectModal"));
}

function projectUpdateSuccess() {
    disableAddButton(false);
    clearInputFields();
    closeAddModal();
    snackbar("Project updated!");
    refreshProjects();
}

function clearInputFields() {
    $("input[type=text]").val("");
}

function projectAddError() {
    disableAddButton(true);
    snackbar("Project could not be added, please try again later!", true);
}

function projectEditError() {
    snackbar("Project could not be changed, please try again later!", true);
}

function deleteProject(projectId) {
    var url = backendBaseUrl + httpRequestParamaters.backendUrlProject + "/" + projectId;
    remove(url, projectDeleteSucces, projectDeleteError);
}

function projectDeleteSucces() {
    snackbar("Project deleted!");
    refreshProjects();
}

function projectDeleteError() {
    closeDeleteModal();
    snackbar("Project could not be deleted, please try again later!", true);
}

function confirmDelete(project) {
    openConfirmDeleteModal(() => {
        if (project.status === "Done") {
            openSecondConfirmationDelete(() => deleteProject(project.id));
        } else {
            deleteProject(project.id);
        }
    });
}

function closeDeleteModal() {
    closeModal($("#confirmDeleteModal"));

}

function showDetailModal(project) {
    clearForm();
    fillInModalFields(project);

    openModal($("#addProjectModal"));
}

function initDatePicker(add) {
    if (add) {
        var now = new Date();
        now.setDate(now.getDate() + 31);
        $(".datepicker").datepicker({
            format: 'yyyy-mm-dd',
            firstDay: 1,
            setDefaultDate: true,
            defaultDate: now
        });
    } else {
        $(".datepicker").datepicker({
            format: 'yyyy-mm-dd',
            firstDay: 1
        });
    }
}

function fillInModalFields(project) {
    $("#addOrUpdate").val("UPDATE");
    $("#projectId").val(project.id);
    $("#inputProjectName").val(project.name);
    $("#textAreaProjectDescription").val(project.description);
    $("#inputProjectDueDate").val(project.deadLine);
    $("#projectStatus").val(project.status);
}

function goToProjectDetail(projectId) {
    localStorage.setItem("selectedProject", projectId);
    window.location.href = "./tasks.html";
}
