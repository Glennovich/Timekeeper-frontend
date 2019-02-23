
var latestRequest = 0;
var loaderActive = false;

$(document).ready(function () {
    showStaticContent();
});

function turnBusyIndicatorOn() {
    latestRequest = Math.floor((Math.random() * 100) + 1);
    if (!loaderActive) {
        loaderActive = true;
        $(".loader").show();
        setTimeout(function () {
            $(".loader").addClass("open").removeClass("close");
        }, 1000);
    }
}

function turnBusyIndicatorOff() {
    var requestNumber = latestRequest;
    $(".loader").addClass("close").removeClass("open");
    setTimeout(function () {
        if (requestNumber == latestRequest) {
            $(".loader").hide();
            loaderActive = false;
        }
    }, 500);
}

function openModal(modal) {
    $(modal).show();
    setTimeout(function () {
        $(modal).addClass("open").removeClass("close");
    }, 10);
}

function closeModal(modal) {
    $(modal).addClass("close").removeClass("open");
    setTimeout(function () {
        $(modal).hide();
    }, 500);

}

function snackbar(text, error) {
    //TODO remove class error
    var snackbar = $("#snackbar");
    $(snackbar).html(text);
    $(snackbar).addClass("show");
    if (error)
        $(snackbar).addClass("error");
    setTimeout(() => $(snackbar).removeClass("show"), 3000);
}

function showStaticContent() {
    buildUp($(".static"), 100);
}

function showTableRows() {
    buildUp($(".table-body > *"), 5);
}

function clearTable(callback) {
    var timeNeededToComplete = buildDown($(".table *"), 1);
    setTimeout(() => {
        $(".table-body *").remove();
        callback && callback();
    }, timeNeededToComplete);
}

function buildUp(arrayOfElements, delay) {
    if (arrayOfElements && arrayOfElements.length > 0) {
        var startDelay = delay;
        arrayOfElements.each((id, element) => {
            setTimeout(() => $(element).addClass("load"), startDelay);
            startDelay += delay;
        });
    }
}

/**
 * @param {type} arrayOfElements
 * @param {type} delay
 * @returns total time needed to complete the last animation
 */
function buildDown(arrayOfElements, delay) {
    if (arrayOfElements && arrayOfElements.length > 0) {
        var startDelay = delay;
        $($(arrayOfElements).get().reverse()).each((id, element) => {
            setTimeout(() => $(element).removeClass("load"), startDelay);
            startDelay += delay;
        });
        return startDelay + delay;
    } else {
        return 0;
    }
}

function openConfirmDeleteModal(functionToExecute) {
    openModal($("#confirmDeleteModal"));
    $("#btnConfirmDelete").on("click", function () {
        functionToExecute();
        closeModal($("#confirmDeleteModal"));
        unbindDeleteModalButtons();
    });
    $("#btnCancelDelete").on("click", function () {
        closeModal($("#confirmDeleteModal"));
        unbindDeleteModalButtons();
    });
}

function unbindDeleteModalButtons() {
    $("#btnConfirmDelete").unbind("click");
    $("#btnCancelDelete").unbind("click");
}

function openSecondConfirmationDelete(functionToExecute) {
    closeModal($("#confirmDeleteModal"));
    openModal($("#deleteDoneProjectModal"));
    $("#btnDeleteDoneProject").on("click", function () {
        functionToExecute();
        closeModal($("#deleteDoneProjectModal"));
        unbindSecondDeleteModalButtons();
    });
    $("#btnCancelDeleteDoneProject").on("click", function () {
        closeModal($("#deleteDoneProjectModal"));
        unbindSecondDeleteModalButtons();
    });
}

function unbindSecondDeleteModalButtons() {
    $("#btnConfirmDelete").unbind("click");
    $("#btnCancelDelete").unbind("click");
}

function disableElement(node, disable) {
    if (disable)
        $(node)
            .attr("disabled", "disabled")
            .addClass("disabled");
    else
        $(node)
            .removeClass("disabled")
            .removeAttr("disabled");
}