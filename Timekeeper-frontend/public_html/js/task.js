var defaultTaskStatus = "Ready to start";
var defaultTaskPriority = "Medium";
var statusses;
var priorities;

$(document).ready(function () {
    initializeProjectsInSelect();
    getListOfStatusses();
    getListOfPriorities();
    initializeModal();
    initializeEventHandlers();
});

function initializeProjectsInSelect() {
    var url = backendBaseUrl + httpRequestParamaters.backendUrlProjects;
    get(url, setProjectsInSelect, getProjectsError);
}

function setProjectsInSelect(response) {
    var selectelement = $("#selectProjects");
    $.each(JSON.parse(response), function (id, project) {
        $(selectelement).append(new Option(project.name, project.id));
    });

    //if projects found, enable add button and else select first option default
    if ($(selectelement.selector + " option").length > 0) {
        $("#btnAddTask").removeAttr("disabled");
        $(selectelement).val($(selectelement.selector + " option:first").val());
    }

    //change selected project if there is an item in local storage & if this project still exists in the list!
    if (timekeeperStorage.getItem("selectedProject")) {
        var selectedTaskProjectId = timekeeperStorage.getItem("selectedProject");
        if ($(selectelement.selector + " option[value='" + selectedTaskProjectId + "']").length != 0) {
            $(selectelement).val(selectedTaskProjectId);
        }
    }

    //this will trigger the getTasksForProject to execute, thus removing the need for a call to getTasksForProject here
    $(selectelement).trigger("change");

    updateTaskProject();
}

function getProjectsError() {
    //getting projects failed: disable add button
    $("#btnAddTask").attr("disabled", "disabled");
    snackbar("Project could not be loaded, try again!", true);
    //NOTE: in case projects have been loaded and the service dies then, 
    //      clicking on the Save button will still catch the error
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
    //handling events, as is the tradition
    $("#btnSaveTask").on("click", function () {
        saveTask();
        closeModal($("#addTaskModal"));
    });

    $("#btnCancelTask").on("click", function () {
        clearFormAddTask();
        closeModal($("#addTaskModal"));
    });

    $("#btnAddTask").on("click", function () {
        openModal($("#addTaskModal"));
        $("#taskStatus option[value!='Ready to start']").attr("disabled", "disabled");
        $("#taskName").val("").removeClass("invalid");
        setTimeout(() => $("#taskName").focus(), 3);
    });

    $("#formAddTask input,#formAddTask textarea").keydown(function (e) {
        if (e.keyCode == 13) {
            e.preventDefault();//intercept the enter
            saveTask();
        }
    });

    $("#selectProjects").on("change", function () {
        //this event may sometimes fire even if no project is selected, causing null to be passed to getTasksForProject
        //only execute the following code if we have a selected project
        if ($("#selectProjects").val()) {
            //save current projectId
            timekeeperStorage.setItem("selectedProject", $("#selectProjects").val());
            getTasksForProject($("#selectProjects").val(), 7);
            updateTaskProject();
        }
    });
}

function initializeModal() {
    setTimeout(() => {
        addArrayToSelectAsOptions(statusses, $("#taskStatus"));
        addArrayToSelectAsOptions(priorities, $("#taskPriority"));
    }, 1000);
}

function clearFormAddTask() {
    //clear fields (don't clear taskProject input field, we need that if they want to add a next task)
    $("#taskId").val("");
    $("#taskName").val("");
    $("#taskDescription").val("");
    $("#taskStatus").val(defaultTaskStatus);
    $("#taskPriority").val(defaultTaskPriority);

    //clear any possible errors
    $("#taskAddFailedMessage").text("");
}

function updateTaskProject() {
    //fill in project name in taskProject input field in modal form
    $("#taskProject").val($("#selectProjects option:selected").text());
}

function getTasksForProject(projectId, flag) {

    //Only execute request if projectId is not null. Sometimes, when the db has just been restarted the system
    //will try to do getTasksForProject(null,cb) which causes a list of undefined tasks to appear
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
    if ($.trim($("#taskName").val()) != "") {
        if ($.trim($("#taskId").val()) != "") {
            //edit existing task
            var d = new Date();
            var currentTime = d.getFullYear() + "-" + prependZeroes((d.getMonth() + 1), 2) + "-" + prependZeroes(d.getDate(), 2)
                    + "T" + prependZeroes(d.getHours(), 2) + ":" + prependZeroes(d.getMinutes(), 2) + ":00";
            var formData = {
                "id": $("#taskId").val(),
                "name": $("#taskName").val(),
                "description": $("#taskDescription").val(),
                "projectId": $("#selectProjects").val(),
                "status": $("#taskStatus").val(),
                "priority": $("#taskPriority").val(),
                "currentTime": currentTime
            };
            var url = backendBaseUrl + httpRequestParamaters.backendUrlTasks
            put(url, formData, taskEditSuccess, taskEditError);

        } else {
            //add new
            var formData = {
                "name": $("#taskName").val(),
                "description": $("#taskDescription").val(),
                "projectId": $("#selectProjects").val(),
                "status": $("#taskStatus").val(),
                "priority": $("#taskPriority").val()
            };
            var url = backendBaseUrl + httpRequestParamaters.backendUrlTasks
            post(url, formData, taskAddSuccess, taskAddError);
        }
    }
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

    //show a snackbar to let the user know that the task is created successfully
    snackbar("Task created!");

    //reload table
    setTimeout(() => getTasksForProject($("#selectProjects").val(), 1), 100);
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

    //show a snackbar to let the user know that the task is created successfully
    snackbar("Task changed!");

    //reload row for changed task
    setTimeout(() => getTasksForProject($("#selectProjects").val(), 8), 100);
}

function taskEditError(response) {
    //if we have an error: show it, otherwise: default error
    if (response) {
        snackbar(response.responseText);
    } else {
        snackbar("Task could not be changed, please try again later!", true);
   }
}

function showDetailModal(task) {
    openModal($("#addTaskModal"));
    $("#taskId").val(task.id);
    $("#taskName").val(task.name);
    $("#taskDescription").val(task.description);
    $("#taskStatus").val(task.status);
    $("#taskPriority").val(task.priority);

    //edit-mode: all statuses can be selected
    $("#taskStatus option").removeAttr("disabled");
    $("#taskName").removeClass("invalid").focus();
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
    
