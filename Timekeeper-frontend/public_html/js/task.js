var defaultTaskStatus="Ready to start";
var defaultTaskPriority="Medium";

$(document).ready(function(){
    //gets projects wrapped in options tags and appends them to our projects selectbox
    getProjectsAsOptions($("#taskProjectId"));
    
    getStatusesAsOptions($("#taskStatus"));
    getPrioritiesAsOptions($("#taskPriority"));

    //handling events, as is the tradition
    $("#saveTask").on("click", function(){
        saveTask();
    });
    
    $("#cancelTask").on("click", function(){
        clearFormAddTask();
    });
    
    $("#addTaskModalTrigger").on("click", function () {
        $("#addTaskModal").modal();
        
        //add-mode: only defaultTaskStatus can be selected, rest of the options disabled
        $("#taskStatus option[value!='Ready to start']").attr("disabled","disabled");
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
    
    $("#taskProjectId").on("change", function(){
        //save current projectId
        timekeeperStorage.setItem("taskProjectId",$("#taskProjectId").val());
        
        getTasksForProject($("#taskProjectId").val(), displayTasks);
        updateTaskProject();
    });
});

function getProjectsAsOptions(selectelement){
    $.get(backendBaseUrl + httpRequestParamaters.backendUrlProjects, function (data) {
        $.each(data, function (id, project) {
            $(selectelement).append(new Option(project.name, project.id));
        });

        //if projects found, enable add button and else select first option default
        if($(selectelement.selector + " option").length > 0){
            $("#addTaskModalTrigger").removeClass("disabled");
            $(selectelement).val($(selectelement.selector + " option:first").val());
        }
        
        //change selected project if there is an item in local storage & if this project still exists in the list!
        if(timekeeperStorage.getItem("taskProjectId")){
            var selectedTaskProjectId = timekeeperStorage.getItem("taskProjectId");
            if($(selectelement.selector + " option[value='" + selectedTaskProjectId + "']").length != 0){
                $(selectelement).val(selectedTaskProjectId);
            }
        }
        
        updateTaskProject();
        
        $(selectelement).formSelect();//must be done after dynamically adding option elements/changing the selected value or lay-out will suck
        
        //initialize list of tasks for the currently selected (first) project of the list
        getTasksForProject($(selectelement).val(), displayTasks);
    }).fail(function(){
        //getting projects failed: disable add button
        $("#addTaskModalTrigger").addClass("disabled");
        //NOTE: in case projects have been loaded and the service dies then, 
        //      clicking on the Save button will still catch the error
    });
}

function updateTaskProject(){
    //fill in project name in taskProject input field in modal form
    $("#taskProject").val($("#taskProjectId option:selected").text());
}

function getTasksForProject(projectId, cb) {
    $.get(backendBaseUrl + httpRequestParamaters.backendUrlTasksFromProject + "/" + projectId, function (data) {
        cb(data);
    });
}
function displayTasks(data) {
    clearTaskList();//before displaying new tasklist, we clear the old tasklist
    $.each(data, function (id, task) {
        $("#tblTasks tbody").append("<tr><td>" + task.name + "</td><td>" + task.description + 
                "</td><td>" + task.status + "</td><td>" + task.priority + "</td></tr>");
    });
    //add message to show when there are no projects
    if($("#tblTasks tbody tr").length == 0){
        $("#tblTasks tbody").append("<tr><td>No tasks found for this project</td><td></td><td></td><td></td></tr>");
    }
}
function clearTaskList(){
    $("#tblTasks tbody tr").remove();
}

function getStatusesAsOptions(selectelement){
    $.get(backendBaseUrl + httpRequestParamaters.backendUrlStatuses, function (data) {
        $.each(data.taskStatuses, function (id, taskstatus) {
            $(selectelement).append(new Option(taskstatus.name, taskstatus.name));
        });

        //if statuses found, enable add button and else select default status
        if($(selectelement.selector + " option").length > 0){
            $("#addTaskModalTrigger").removeClass("disabled");
            $(selectelement).val(defaultTaskStatus);
        }
        
        $(selectelement).formSelect();
    }).fail(function(){
        //getting projects failed: disable add button
        $("#addTaskModalTrigger").addClass("disabled");
        //NOTE: in case projects have been loaded and the service dies then, 
        //      clicking on the Save button will still catch the error
    });
}

function getPrioritiesAsOptions(selectelement){
    $.get(backendBaseUrl + httpRequestParamaters.backendUrlPriorities, function (data) {
        $.each(data.projectStatuses, function (id, priority) {
            $(selectelement).append(new Option(priority.name, priority.name));
        });

        //if priorities found, enable add button and else select default priority
        if($(selectelement.selector + " option").length > 0){
            $("#addTaskModalTrigger").removeClass("disabled");
            $(selectelement).val(defaultTaskPriority);
        }
        
        $(selectelement).formSelect();
    }).fail(function(){
        //getting projects failed: disable add button
        $("#addTaskModalTrigger").addClass("disabled");
        //NOTE: in case projects have been loaded and the service dies then, 
        //      clicking on the Save button will still catch the error
    });
}

function clearFormAddTask(){
    //clear fields (don't clear taskProject input field, we need that if they want to add a next task)
    $("#taskId").val("");
    $("#taskName").val("");
    $("#taskDescription").val("");
    $("#taskStatus").val(defaultTaskStatus);
    $("#taskPriority").val(defaultTaskPriority);
    
    //clear any possible errors
    $("#taskAddFailedMessage").text("");
}

function saveTask(){
    if($.trim($("#taskName").val()) != ""){
        if($.trim($("#taskId").val()) != ""){//TODO: prepare GUI for editing records
            //edit existing task
            var formData = {
                "id": $("#taskId").val(),
                "name": $("#taskName").val(),
                "description": $("#taskDescription").val(),
                "projectId": $("#taskProjectId").val(),
                "status": $("#taskStatus").val(),
                "priority": $("#taskPriority").val()
            };
            formData = JSON.stringify(formData);
            $.ajax({
                type: "PUT",
                url: backendBaseUrl + httpRequestParamaters.backendUrlTasks,
                data: formData,
                contentType: "application/json; charset=utf-8",
                success: taskEditSuccess,
                error: taskEditError
            });
        }else{
            //add new
            var formData = {
                "name": $("#taskName").val(),
                "description": $("#taskDescription").val(),
                "projectId": $("#taskProjectId").val(),
                "status": $("#taskStatus").val(),
                "priority": $("#taskPriority").val()
            };
            formData = JSON.stringify(formData);
            $.ajax({
                type: "POST",
                url: backendBaseUrl + httpRequestParamaters.backendUrlTasks,
                data: formData,
                contentType: "application/json; charset=utf-8",
                success: taskAddSuccess,
                error: taskAddError
            });
        }
    }
}

function taskAddSuccess(data, textStatus, jqXHR) {
    clearFormAddTask();
    
    $("#addTaskModal").modal("close");

    //show a snackbar to let the user know that the task is created successfully
    snackbar("Task created!");

    //reload table
    setTimeout(() => {
        getTasksForProject($("#taskProjectId").val(),displayTasks);
    }, 100);
}

function taskAddError(jqXHR, textStatus, errorThrown) {
    //if we have an error: show it, otherwise: default error
    if(jqXHR.responseJSON && jqXHR.responseJSON.message){
        $("#taskAddFailedMessage").text(jqXHR.responseJSON.message).show();
    }else{
        $("#taskAddFailedMessage").text("Task could not be added, please try again later!").show();
    }
}

function snackbar(text){
    $("#snackbar").text(text).addClass("show");
    setTimeout(() => {
        $("#snackbar").removeClass("show");
    }, 3000);
}