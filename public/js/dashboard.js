var receiver_id = "";
var socket = io("/user-namespace", {
    auth: {
        token,
        name,
    },
});

$(document).ready(function () {
    $(".user-list").click(function () {
        var userId = $(this).attr("data-id");
        receiver_id = userId;
        $(".start-head").hide();
        $(".chat-section").show();

        socket.emit("existsChat", {
            sender_id: sender_id,
            receiver_id: receiver_id,
        })
    });
});

//update user status
socket.on("getOnlineUser", function (data) {
    $(`#${data.user_id}-status`)
        .removeClass("badge-danger")
        .addClass("badge-success")
        .text("Online");
});

socket.on("getOfflineUser", function (data) {
    $(`#${data.user_id}-status`)
        .removeClass("badge-success")
        .addClass("badge-danger")
        .text("Offline");
});

//chat save of user
$("#chat-form").submit(function (e) {
    e.preventDefault();
    var message = $("#message").val();
    if (message) {
        $.ajax({
            url: "/save-chat",
            type: "POST",
            data: {
                sender_id: sender_id,
                receiver_id: receiver_id,
                message: message,
            },

            success: function (response) {
                if (response.success) {
                    $("#message").val("");
                    let chat = response.data.message;
                    let html = `
                        <div class="current-user-chat" id=${response.data._id}>
                            <h5>
                                <span>${chat}</span>
                                <i class="fa fa-trash" aria-hidden="true" data-id=${response.data._id} data-toggle="modal" data-target="#deleteChatModel"></i>
                                <i class="fa fa-edit" aria-hidden="true" data-msg=${chat} data-id=${response.data._id} data-toggle="modal" data-target="#editChatModel"></i>
                            </h5>
                        </div>
                    `;
                    $("#chat-container").append(html);
                    scrollChat();
                    socket.emit("newChat", response.data);
                } else {
                    alert(response.message);
                }
            },
        });
    }
});

socket.on("loadNewChat", function (data) {
    if (sender_id === data.receiver_id || receiver_id === data.sender_id) {
        let chat = data.message;
        let html = `
            <div class="distance-user-chat" id="${data._id}" >
                <h5><span>${chat}</span></h5>
            </div>
        `;
        $("#chat-container").append(html);
        scrollChat();
    }
});

// load old chats
socket.on("loadOldChat", function (data) {
    $("#chat-container").html("");
    data.forEach((chat) => {
        let html = "";
        if (chat.sender_id === receiver_id) {
            html = `
                <div class="distance-user-chat" id="${chat._id}">
                    <h5><span>${chat.message}</span></h5>
                </div>
            `;
        } else {
            html = `
                <div class="current-user-chat" id=${chat._id}>
                    <h5>
                        <span>${chat.message}</span>
                        <i class="fa fa-trash" aria-hidden="true" data-id=${chat._id} data-toggle="modal" data-target="#deleteChatModel"></i>
                        <i class="fa fa-edit" aria-hidden="true" data-msg=${chat.message} data-id=${chat._id} data-toggle="modal" data-target="#editChatModel"></i>
                    </h5>
                </div>
            `;
        }

        $("#chat-container").append(html);
        scrollChat();
    });
});

function scrollChat() {
    $("#chat-container").animate({ scrollTop: $('#chat-container').prop("scrollHeight") }, 500);
}

// Delete Chat
$(document).on("click", ".fa-trash", function () {
    let msg = $(this).parent().text();
    $("#delete-message").text(msg)
    $("#delete-message-id").val($(this).attr("data-id"));
});

$("#delete-chat-form").submit(function (e) {
    e.preventDefault();
    let id = $("#delete-message-id").val();
    $.ajax({
        url: "/delete-chat",
        type: "POST",
        data: {
            id,
        },
        success: function (response) {
            if (response.success) {
                $(`#${id}`).remove();
                $("#deleteChatModel").modal("hide");
                socket.emit("chatDeleted", id);
            } else {
                alert(response.message);
            }
        },
    });
})

socket.on("chatMessageDeleted", function (id) {
    $(`#${id}`).remove();
});


// Edit Chat
$(document).on("click", ".fa-edit", function () {
    let msg = $(this).attr("data-msg");
    let id = $(this).attr("data-id");
    $("#edit-message-id").val(id);
    $("#edit-message").val(msg);
});

$("#edit-chat-form").submit(function (e) {
    e.preventDefault();
    let id = $("#edit-message-id").val();
    let message = $("#edit-message").val();
    $.ajax({
        url: "/update-chat",
        type: "POST",
        data: {
            id,
            message,
        },
        success: function (response) {
            if (response.success) {
                $("#editChatModel").modal("hide");
                $(`#${id}`).find("span").text(message);
                $(`#${id}`).find(".fa-edit").attr("data-msg", message);
                socket.emit("chatUpdated", { id, message });
            } else {
                alert(response.message);
            }
        },
    });
})

socket.on("chatMessageUpdated", function (data) {
    let messageElement = $(`#${data.id}`).find("span");
    messageElement.text(data.message);
});