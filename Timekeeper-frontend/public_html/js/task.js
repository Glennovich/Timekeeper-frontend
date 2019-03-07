var defaultTaskStatus = "Ready to start";
var defaultTaskPriority = "Medium";
var statusses;
var priorities;

$(document).ready(function () {
    initializeContent();
    initializeEventHandlers();
});

function initializeContent() {
    initializeProjectsInSelect();
    getListOfStatusses();
    getListOfPriorities();
    initializeModal();
}

function initializeProjectsInSelect() {
    var url = backendBaseUrl + httpRequestParamaters.backendUrlProjects;
    get(url, setProjectsInSelect, getProjectsError);
}

function setProjectsInSelect(response) {
    var selectelement = $("#selectProjects");
    $.each(JSON.parse(response), function (id, project) {
        $(selectelement).append(new Option(project.name, project.id));
    });

    if ($(selectelement.selector + " option").length > 0) {
        $("#btnAddTask").removeAttr("disabled");
        $(selectelement).val($(selectelement.selector + " option:first").val());
    }

    if (timekeeperStorage.getItem("selectedProject")) {
        var selectedTaskProjectId = timekeeperStorage.getItem("selectedProject");
        if ($(selectelement.selector + " option[value='" + selectedTaskProjectId + "']").length != 0) {
            $(selectelement).val(selectedTaskProjectId);
        }
    }

    $(selectelement).trigger("change");
    updateTaskProject();
}

function getProjectsError() {
    $("#btnAddTask").attr("disabled", "disabled");
    snackbar("Project could not be loaded, try again!", true);
}

function getListOfStatusses() {
    var url = backendBaseUrl + httpRequestParamaters.backendUrlStatuses;
    get(url, storeStatusses, getStatussesError);
}

function storeStatusses(response) {
    statusses = JSON.parse(response).taskStatuses;
}

function getListOfPriorities() {
    var url = backendBaseUrl + httpRequestParamaters.backendUrlPriorities;
    get(url, storePriorities, getPrioritiesError);
}

function storePriorities(response) {
    priorities = JSON.parse(response).priorities;
}

function initializeEventHandlers() {
    $("#btnSaveTask").on("click", function () {
        if (checkRequiredInputFields()) {
            saveTask();
            closeAddTaskModal();
        }
    });

    $("#btnCancelTask").on("click", function () {
        clearFormAddTask();
        closeAddTaskModal();
    });

    $("#btnAddTask").on("click", function () {
        openModal($("#addTaskModal"));
        $("#selectTaskStatus option[value!='Ready to start']").attr("disabled", "disabled");
        $("#inputTaskName").val("").removeClass("invalid");
        setTimeout(() => $("#inputTaskName").focus(), 3);
    });

    $("#formAddTask input,#formAddTask textarea").keydown(function (e) {
        if (e.keyCode == 13) {
            e.preventDefault();//intercept the enter
            saveTask();
        }
    });

    $("#selectProjects").on("change", function () {
        if ($("#selectProjects").val()) {
            timekeeperStorage.setItem("selectedProject", $("#selectProjects").val());
            getTasksForProject($("#selectProjects").val(), 7);
            updateTaskProject();
        }
    });
}

function closeAddTaskModal() {
    clearFieldHighLights();
    closeModal($("#addTaskModal"));
}

function initializeModal() {
    setTimeout(() => {
        addArrayToSelectAsOptions(statusses, $("#selectTaskStatus"));
        addArrayToSelectAsOptions(priorities, $("#selectTaskPriority"));
    }, 1000);
}

function clearFormAddTask() {
    $("#inputTaskId").val("");
    $("#inputTaskName").val("");
    $("#textareaTaskDescription").val("");
    $("#selectTaskStatus").val(defaultTaskStatus);
    $("#selectTaskPriority").val(defaultTaskPriority);
    $("#taskAddFailedMessage").text("");
}

function updateTaskProject() {
    $("#inputTaskProject").val($("#selectProjects option:selected").text());
}

function getTasksForProject(projectId, flag) {
    if (projectId) {
        clearTable(() => {
            var url = backendBaseUrl + httpRequestParamaters.backendUrlTasksFromProject + "/" + projectId;
            get(url, function (result) {
                $("#btnAddTask").removeAttr("disabled");
                displayTasks(JSON.parse(result));
            });
        });
    }
}

function displayTasks(data) {
    if (data.length === 0) {
        $(".table-body").append("<span class='message'>No tasks found for this project</span>");
    } else {
        $.each(data, function (id, task) {
            $(".table-body")
                    .append("<span>" + task.name + "</span>")
                    .append("<span class='medium-screen-hidden'>" + task.description + "</span>")
                    .append("<select class='small-screen-hidden' id='selectStatus_" + task.id + "'></select>")
                    .append("<select class='small-screen-hidden' id='selectPriority_" + task.id + "'></select>")
                    .append("<span id='play_" + task.id + "' class='clickable'><img src='./assets/img/icon/play.svg'/></span>")
                    .append("<span id='pencil_" + task.id + "' class='clickable'><img src='./assets/img/icon/edit.svg'/></span>")
                    .append("<span id='trash_" + task.id + "' class='clickable'><img src='./assets/img/icon/delete.svg'/></span>")
                    .append("<div class='separationLine'></div>");

            setStatussesSelectEvent(task);
            setPrioritiesSelectEvent(task);

            $("#pencil_" + task.id).on("click", function () {
                showDetailModal(task);
            });

            $("#trash_" + task.id).on("click", function () {
                confirmDeleteTask(task);
            });
        });
    }
    showTableRows();
}

function clearTaskList() {
    $(".table").empty();
}

function setPrioritiesSelectEvent(task) {
    var selectElement = $("#selectPriority_" + task.id);
    addArrayToSelectAsOptions(priorities, selectElement);
    $(selectElement).val(task.priority);
    $(selectElement).on("change", function () {
        var formData = {
            "op": "replace",
            "path": "/priority",
            "value": $(selectElement).val()
        };
        var url = backendBaseUrl + httpRequestParamaters.backendUrlTasks + "/" + task.id;
        patch(url, formData, taskEditSuccess, taskEditError);
    });
}

function setStatussesSelectEvent(task) {
    var selectElement = $("#selectStatus_" + task.id);
    addArrayToSelectAsOptions(statusses, selectElement);
    $(selectElement).val(task.status);
    $(selectElement).on("change", function () {
        var formData = {
            "op": "replace",
            "path": "/status",
            "value": $(selectElement).val()
        };
        var url = backendBaseUrl + httpRequestParamaters.backendUrlTasks + "/" + task.id;
        patch(url, formData, taskEditSuccess, taskEditError);
    });
}

function addArrayToSelectAsOptions(array, selectelement) {
    $.each(array, function (id, element) {
        $(selectelement).append(new Option(element.name, element.name));
    });
}

function getStatussesError() {
    $("#btnAddTask").addClass("disabled");
}

function getPrioritiesError() {
    $("#btnAddTask").addClass("disabled");
    snackbar("A connection error occured, please try again later!", true);
}

function saveTask() {
    if ($.trim($("#inputTaskName").val()) != "") {
        if ($.trim($("#inputTaskId").val()) != "") {
            editExistingTask();
        } else {
            addNewTask();
        }
    }
}

function addNewTask() {
    var formData = {
        "name": $("#inputTaskName").val(),
        "description": $("#textareaTaskDescription").val(),
        "projectId": $("#selectProjects").val(),
        "status": $("#selectTaskStatus").val(),
        "priority": $("#selectTaskPriority").val()
    };
    var url = backendBaseUrl + httpRequestParamaters.backendUrlTasks
    post(url, formData, taskAddSuccess, taskAddError);
}

function editExistingTask() {
    var d = new Date();
    var currentTime = d.getFullYear() + "-" + prependZeroes((d.getMonth() + 1), 2) + "-" + prependZeroes(d.getDate(), 2)
            + "T" + prependZeroes(d.getHours(), 2) + ":" + prependZeroes(d.getMinutes(), 2) + ":00";
    var formData = {
        "id": $("#inputTaskId").val(),
        "name": $("#inputTaskName").val(),
        "description": $("#textareaTaskDescription").val(),
        "projectId": $("#selectProjects").val(),
        "status": $("#selectTaskStatus").val(),
        "priority": $("#selectTaskPriority").val(),
        "currentTime": currentTime
    };
    var url = backendBaseUrl + httpRequestParamaters.backendUrlTasks
    put(url, formData, taskEditSuccess, taskEditError);
}

function prependZeroes(number, maxlength) {
    return number.toString().length < maxlength ? times("0", maxlength - number.toString().length) + number : number;
}

function times(dink, numberOfTimes) {
    var strTimes = "";
    for (var i = 0; i < numberOfTimes; i++) {
        strTimes += dink;
    }
    return strTimes;
}

function taskAddSuccess() {
    clearFormAddTask();
    snackbar("Task created!");
    reloadTable();
}

function reloadTable() {
    setTimeout(() => getTasksForProject($("#selectProjects").val(), 8), 100);
}

function taskAddError(response) {
    //if we have an error: show it, otherwise: default error
    if (response) {
        $("#taskAddFailedMessage").text(response.responseText).show();
    } else {
        snackbar("Task could not be added, please try again later!", true);
    }
}

function taskEditSuccess() {
    clearFormAddTask();
    snackbar("Task changed!");
    reloadTable();
}

function taskEditError(response) {
    if (response) {
        snackbar(response.responseText);
    } else {
        snackbar("Task could not be changed, please try again later!", true);
    }
}

function showDetailModal(task) {
    openModal($("#addTaskModal"));
    $("#inputTaskId").val(task.id);
    $("#inputTaskName").val(task.name);
    $("#textareaTaskDescription").val(task.description);
    $("#selectTaskStatus").val(task.status);
    $("#selectTaskPriority").val(task.priority);

    //edit-mode: all statuses can be selected
    $("#selectTaskStatus option").removeAttr("disabled");
    $("#inputTaskName").removeClass("invalid").focus();
}

function confirmDeleteTask(task) {
    openConfirmDeleteModal(() => deleteTask(task.id));
}

function taskDeleteSucces() {
    getTasksForProject($("#selectProjects").val(), 6);
    snackbar("Task deleted!");
}

function taskDeleteError() {
    setTimeout(() => getTasksForProject($("#selectProjects").val(), 3), 100);
    snackbar("Task could not be deleted, please try again later!", true);
}

function deleteTask(taskId) {
    var url = backendBaseUrl + httpRequestParamaters.backendUrlTasks + "/" + taskId;
    remove(url, taskDeleteSucces, taskDeleteError);
}

