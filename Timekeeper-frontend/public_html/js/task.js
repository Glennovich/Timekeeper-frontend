$(document).ready(function(){
    //if selectbox taskProjectId exists, fill it with projects
    if($("#taskProjectId").length > 0){
        //gets projects wrapped in options tags and appends them to our projects selectbox
        getProjectsAsOptions($("#taskProjectId"));
    }

    //handling events, as is the tradition
    $("#saveTask").on("click", function(){
        saveTask();
    });
    
    $("#cancelTask").on("click", function(){
        clearFormAddTask();
    });
    
    $("#addTaskModalTrigger").on("click", function () {
        $("#addTaskModal").modal();
        
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
        //fill in project name in taskProject input field in modal form
        $("#taskProject").val($("#taskProjectId option:selected").text());
    });
});

function getProjectsAsOptions(selectelement){
    $.get(backendBaseUrl + httpRequestParamaters.backendUrlProjects, function (data) {
        $.each(data, function (id, project) {
            $(selectelement).append(new Option(project.name, project.id));
        });

        //if no projects found, disable add button, else select first option default
        if($(selectelement.selector + " option").length == 0){
            $("#addTaskModalTrigger").addClass("disabled");
        }else{
            $(selectelement).val($(selectelement.selector + " option:first").val());
        }
        
        //change selected project if there is an item in local storage & if this project still exists in the list!
        if(timekeeperStorage.getItem("taskProjectId")){
            var selectedTaskProjectId = timekeeperStorage.getItem("taskProjectId");
            if($(selectelement.selector + " option[value='" + selectedTaskProjectId + "']").length != 0){
                $(selectelement).val(selectedTaskProjectId);
            }
        }
        
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

function getTasksForProject(projectId, cb) {
    $.get(backendBaseUrl + httpRequestParamaters.backendUrlTasksFromProject + "/" + projectId, function (data) {
        cb(data);
    });
}
function displayTasks(data) {
    clearTaskList();//before displaying new tasklist, we clear the old tasklist
    $.each(data, function (id, task) {
        $("#tblTasks tbody").append("<tr><td>" + task.name + "</td><td>" + task.description + "</td></tr>");
    });
    //add message to show when there are no projects
    if($("#tblTasks tbody tr").length == 0){
        $("#tblTasks tbody").append("<tr><td>No tasks found for this project</td><td></td></tr>");
    }
}
function clearTaskList(){
    $("#tblTasks tbody tr").remove();
}
function clearFormAddTask(){
    //clear fields (don't clear taskProject input field, we need that if they want to add a next task)
    $("#taskName").val("");
    $("#taskDescription").val("");
    
    //clear any possible errors
    $("#taskAddFailedMessage").text("");
}

function saveTask(){
    if($.trim($("#taskName").val()) != ""){
        var formData = {
            "name": $("#taskName").val(),
            "description": $("#taskDescription").val(),
            "projectId": $("#taskProjectId").val(),
            "priority": "LOW"//TODO: pass real priority*/
        };
        formData = JSON.stringify(formData);
        $.ajax({
            type: "POST",
            url: backendBaseUrl + httpRequestParamaters.backendUrlTasks,
            data: formData,
            contentType: "application/json; charset=utf-8",
            success: taskSaveSuccess,
            error: taskSaveError
        });
    }
}

function taskSaveSuccess(data, textStatus, jqXHR) {
    clearFormAddTask();
    
    $("#addTaskModal").modal("close");

    //show a snackbar to let the user know that the project is created successfully
    $("#snackbar").addClass("show");
    setTimeout(() => {
        $("#snackbar").removeClass("show");
    }, 3000);

    //reload table
    setTimeout(() => {
        getTasksForProject($("#taskProjectId").val(),displayTasks);
    }, 100);
}

function taskSaveError(jqXHR, textStatus, errorThrown) {
    //if we have an error: show it, otherwise: default error
    if(jqXHR.responseJSON && jqXHR.responseJSON.message){
        $("#taskAddFailedMessage").text(jqXHR.responseJSON.message).show();
    }else{
        $("#taskAddFailedMessage").text("Task could not be added, please try again later!").show();
    }
}