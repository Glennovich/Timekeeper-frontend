var defaultTaskStatus = "Ready to start";
var defaultTaskPriority = "Medium";
var statusses;
var priorities;

$(document).ready(function () {
    //gets projects wrapped in options tags and appends them to our projects selectbox
    getProjectsAsOptions();
    getStatusesAsOptions();
    getPrioritiesAsOptions();

    //init all modals
    $(".modal").modal();

    initializeEventHandlers();

    setTimeout(() => {
        $("#taskProjectId").trigger("change");
    }, 300);
});

function initializeEventHandlers() {
    //handling events, as is the tradition
    $("#saveTask").on("click", function () {
        saveTask();
    });

    $("#cancelTask").on("click", function () {
        clearFormAddTask();
    });

    $("#addTaskModalTrigger").on("click", function () {
        $("#addTaskModal").modal();

        //add-mode: only defaultTaskStatus can be selected, rest of the options disabled
        $("#taskStatus option[value!='Ready to start']").attr("disabled", "disabled");
        $("#taskStatus").formSelect();

        //call Materialize updateTextFields() after modal is shown to solve bug
        //where the label of disabled fields is shown through the contents of the disabled field
        M.updateTextFields();

        //remove invalid class if needed and set focus on taskName
        $("#taskName").val("").removeClass("invalid");
        setTimeout(() => {
            $("#taskName").focus();
        }, 3);
    });

    $("#formAddTask input,#formAddTask textarea").keydown(function (e) {
        if (e.keyCode == 13) {
            e.preventDefault();//intercept the enter
            saveTask();
        }
    });

    $("#taskProjectId").on("change", function () {
        if ($("#taskProjectId")[0].selectedIndex === -1) {
            //This bug appears when the server shuts down and restarts, and then we refresh the page. 
            //The select of the projects seems to loose all it's data. This is a temporary fix until the real problem is found.
            setTimeout(() => {
                getProjectsAsOptions();
                $("#taskProjectId")[0].selectedIndex = 0;
                //save current projectId
                timekeeperStorage.setItem("taskProjectId", $("#taskProjectId").val());

                getTasksForProject($("#taskProjectId").val(), displayTasks);
                updateTaskProject();
            }, 1000);
        } else {
            //save current projectId
            timekeeperStorage.setItem("taskProjectId", $("#taskProjectId").val());

            getTasksForProject($("#taskProjectId").val(), displayTasks);
            updateTaskProject();
        }
    });
}

function getProjectsAsOptions() {
    var url = backendBaseUrl + httpRequestParamaters.backendUrlProjects;
    get(url, setProjectsInSelect, getProjectsError);
}

function setProjectsInSelect(response) {
    var selectelement = $("#taskProjectId");
    $.each(JSON.parse(response), function (id, project) {
        $(selectelement).append(new Option(project.name, project.id));
    });

    //if projects found, enable add button and else select first option default
    if ($(selectelement.selector + " option").length > 0) {
        $("#addTaskModalTrigger").removeClass("disabled");
        $(selectelement).val($(selectelement.selector + " option:first").val());
    }

    //change selected project if there is an item in local storage & if this project still exists in the list!
    if (timekeeperStorage.getItem("taskProjectId")) {
        var selectedTaskProjectId = timekeeperStorage.getItem("taskProjectId");
        if ($(selectelement.selector + " option[value='" + selectedTaskProjectId + "']").length != 0) {
            $(selectelement).val(selectedTaskProjectId);
        }
    }

    updateTaskProject();

    $(selectelement).formSelect();//must be done after dynamically adding option elements/changing the selected value or lay-out will suck

    //initialize list of tasks for the currently selected (first) project of the list
    getTasksForProject($(selectelement).val());

}

function getProjectsError() {
    //getting projects failed: disable add button
    $("#addTaskModalTrigger").addClass("disabled");
    //NOTE: in case projects have been loaded and the service dies then, 
    //      clicking on the Save button will still catch the error
}



function updateTaskProject() {
    //fill in project name in taskProject input field in modal form
    $("#taskProject").val($("#taskProjectId option:selected").text());
}

function getTasksForProject(projectId, cb) {
    var url = backendBaseUrl + httpRequestParamaters.backendUrlTasksFromProject + "/" + projectId;
    get(url, function (result) {
        $("#addProjectModalTrigger").removeClass("disabled");
        cb(JSON.parse(result));
    });
}

function displayTasks(data) {
    clearTaskList();//before displaying new tasklist, we clear the old tasklist
    $.each(data, function (id, task) {
        $("#tblTasks tbody")
                .append("<tr id='task_" + task.id + "' class=\"taskRow\"></tr>");
        $("#tblTasks tbody tr:last-child")
                .append("<td>" + task.name + "</td>")
                .append("<td>" + task.description + "</td>")
                .append("<td><select class='statussesSelect'></select></td>")
                .append("<td><select class='prioritiesSelect'></select></td>")
                .append("<td class='pencil'><img src='./assets/img/icon/edit.svg'/></td>")
                .append("<td class='trashcan'><img src='./assets/img/icon/delete.svg'/></td>");

        setStatussesSelectEvent(task, "statussesSelect")
        setPrioritiesSelectEvent(task, "prioritiesSelect");

        $("#task_" + task.id + " .pencil").on("click", function () {
            showDetailModal(task);
        });
        $("#task_" + task.id + " .trashcan").on("click", function () {
            confirmDeleteTask(task.id);
        });
    });

    //add message to show when there are no projects
    if ($("#tblTasks tbody tr").length == 0) {
        $("#tblTasks tbody").append("<tr><td colspan=\"6\">No tasks found for this project</td></tr>");
    }
}

function confirmDeleteTask(taskId) {
    $("#deleteTaskModal").modal("open");

    $("#btnDeleteTask").on("click", function () {
        deleteTask(taskId);
        closeDeleteTaskModal();
    });
}

function taskDeleteSucces() {
    snackbar("Task deleted!");
    getTasksForProject($("#taskProjectId").val(), displayTasks);
}

function taskDeleteError() {
    closeDeleteTaskModal();
    snackbar("Task could not be deleted, try again!");
}

function deleteTask(taskId) {
    var url = backendBaseUrl + httpRequestParamaters.backendUrlTasks + "/" + taskId;
    remove(url, taskDeleteSucces, taskDeleteError);
}

function closeDeleteTaskModal() {
    $("#deleteTaskModal").modal("close");
    $("#btnDeleteTask").off();
}

function setPrioritiesSelectEvent(task, className) {
    var selectElement = $("#task_" + task.id + " ." + className);
    addArrayToSelectAsOptions(priorities, selectElement);
    $(selectElement).val(task.priority);
    $(selectElement).formSelect();
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

function setStatussesSelectEvent(task, className){
        var selectElement = $("#task_" + task.id + " ." + className);
        addArrayToSelectAsOptions(statusses, selectElement);
        $(selectElement).val(task.status);
        $(selectElement).formSelect();
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

function showDetailModal(task) {
    $("#taskId").val(task.id);
    $("#taskName").val(task.name);
    $("#taskDescription").val(task.description);
    $("#taskStatus").val(task.status);
    $("#taskPriority").val(task.priority);

    $("#addTaskModal").modal("open");

    //edit-mode: all statuses can be selected
    $("#taskStatus option").removeAttr("disabled");
    $("#taskStatus").formSelect();

    //call Materialize updateTextFields() after modal is shown to solve bug
    //where the label of disabled fields is shown through the contents of the disabled field
    M.updateTextFields();

    $("#taskName").removeClass("invalid").focus();
}

function clearTaskList() {
    $("#tblTasks tbody tr").remove();
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

function getStatusesAsOptions() {
    var url = backendBaseUrl + httpRequestParamaters.backendUrlStatuses;
    get(url, setStatussesInSelect, getStatussesError);
}

function setStatussesInSelect(response) {
    var selectelement = $("#taskStatus");
    statusses = JSON.parse(response).taskStatuses;
    addArrayToSelectAsOptions(statusses, selectelement);

    //if statuses found, enable add button and else select default status
    if ($(selectelement.selector + " option").length > 0) {
        $("#addTaskModalTrigger").removeClass("disabled");
        $(selectelement).val(defaultTaskStatus);
    }

    $(selectelement).formSelect();
}

function addArrayToSelectAsOptions(array, selectelement) {
    $.each(array, function (id, element) {
        $(selectelement).append(new Option(element.name, element.name));
    });
}

function getStatussesError() {
    //getting projects failed: disable add button
    $("#addTaskModalTrigger").addClass("disabled");
    //NOTE: in case projects have been loaded and the service dies then, 
    //      clicking on the Save button will still catch the error
}

function getPrioritiesAsOptions() {
    var url = backendBaseUrl + httpRequestParamaters.backendUrlPriorities;
    get(url, setPrioritiesInSelect, getPrioritiesError);
}

function setPrioritiesInSelect(response) {
    var selectelement = $("#taskPriority");
    priorities = JSON.parse(response).priorities;
    addArrayToSelectAsOptions(priorities, selectelement);

    //if priorities found, enable add button and else select default priority
    if ($(selectelement.selector + " option").length > 0) {
        $("#addTaskModalTrigger").removeClass("disabled");
        $(selectelement).val(defaultTaskPriority); //TODO
    }

    $(selectelement).formSelect();
}

function getPrioritiesError() {
    //getting projects failed: disable add button
    $("#addTaskModalTrigger").addClass("disabled");
    //NOTE: in case projects have been loaded and the service dies then, 
    //      clicking on the Save button will still catch the error
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
                "projectId": $("#taskProjectId").val(),
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
                "projectId": $("#taskProjectId").val(),
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

    $("#addTaskModal").modal("close");

    //show a snackbar to let the user know that the task is created successfully
    snackbar("Task created!");

    //reload table
    setTimeout(() => {
        getTasksForProject($("#taskProjectId").val(), displayTasks);
    }, 100);
}

function taskAddError(response) {
    //if we have an error: show it, otherwise: default error
    if (response) {
        $("#taskAddFailedMessage").text(response.responseText).show();
    } else {
        $("#taskAddFailedMessage").text("Task could not be added, please try again later!").show();
    }
}

function taskEditSuccess() {
    clearFormAddTask();
    $("#addTaskModal").modal("close");

    //show a snackbar to let the user know that the task is created successfully
    snackbar("Task changed!");

    //reload row for changed task
    setTimeout(() => {
        getTasksForProject($("#taskProjectId").val(), displayTasks);
    }, 100);
}

function taskEditError(response) {
    //if we have an error: show it, otherwise: default error
    if (response) {
        $("#taskAddFailedMessage").text(response.responseText).show();
    } else {
        $("#taskAddFailedMessage").text("Task could not be changed, please try again later!").show();
    }
}

function snackbar(text) {
    $("#snackbar").text(text).addClass("show");
    setTimeout(() => {
        $("#snackbar").removeClass("show");
    }, 3000);
}
