var defaultTaskStatus = "Ready to start";
var defaultTaskPriority = "Medium";

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
        $("#taskName").removeClass("invalid");
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
        //save current projectId
        updateTaskProject();
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

        timekeeperStorage.setItem("taskProjectId", $("#taskProjectId").val());

        getTasksForProject($("#taskProjectId").val(), displayTasks);
    });
}

function displayTasks(data) {
    clearTaskList();//before displaying new tasklist, we clear the old tasklist
    $.each(data, function (id, task) {
        $("#tblTasks tbody").append("<tr id=\"" + task.id + "\" class=\"taskRow\"></tr>");
        $("#tblTasks tbody tr:last-child")
                .append("<td>" + task.name + "</td>")
                .append("<td>" + task.description + "</td>")
                .append("<td>" + task.status + "</td>")
                .append("<td>" + task.priority + "</td>");
    });
    //add message to show when there are no projects
function getTasksForProject(projectId, cb) {
    var url = backendBaseUrl + httpRequestParamaters.backendUrlTasksFromProject + "/" + projectId;
    get(url, function (result) {
        $("#addProjectModalTrigger").removeClass("disabled");
        cb(JSON.parse(result));
        $("#tblTasks tbody").append("<tr><td>No tasks found for this project</td><td></td><td></td><td></td></tr>");
    }
}

function clearTaskList() {
    $("#tblTasks tbody tr").remove();
}

    //clear fields (don't clear taskProject input field, we need that if they want to add a next task)
    $("#taskId").val("");
    $("#taskName").val("");
    $("#taskDescription").val("");
    $("#taskStatus").val(defaultTaskStatus);
    $("#taskPriority").val(defaultTaskPriority);

    //add event for taskrow.click
    $(".taskRow").on("click", function () {
        $("#taskId").val(this.id);
        $("#taskName").val(this.childNodes[0].innerText);
        $("#taskDescription").val(this.childNodes[1].innerText);
        $("#taskStatus").val(this.childNodes[2].innerText);
        $("#taskPriority").val(this.childNodes[3].innerText);

        $("#addTaskModal").modal("open");

        //edit-mode: all statuses can be selected
        $("#taskStatus option").removeAttr("disabled");
        $("#taskStatus").formSelect();

        //call Materialize updateTextFields() after modal is shown to solve bug
        //where the label of disabled fields is shown through the contents of the disabled field
        M.updateTextFields();

        $("#taskName").removeClass("invalid").focus();
    });

    //clear any possible errors
    $("#taskAddFailedMessage").text("");
}

        }
    }
}

    clearFormAddTask();

    $("#addTaskModal").modal("close");

    //show a snackbar to let the user know that the task is created successfully
    snackbar("Task created!");

    //reload table
    setTimeout(() => {
        getTasksForProject($("#taskProjectId").val(), displayTasks);
    }, 100);
}

    if ($("#tblTasks tbody tr").length == 0) {
    //if we have an error: show it, otherwise: default error
    if (response) {
        $("#taskAddFailedMessage").text(response.responseText).show();
    } else {
        $("#taskAddFailedMessage").text("Task could not be added, please try again later!").show();
    }
}

function clearFormAddTask() {
