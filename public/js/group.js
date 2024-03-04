// add member js
$(".addMember").click(function () {
    let id = $(this).attr("data-id");
    let limit = $(this).attr("data-limit");

    $("#group_id").val(id);
    $("#limit").val(limit);

    $.ajax({
        url: "/groups/get-members",
        type: "POST",
        data: {
            group_id: id,
        },
        success: function (response) {
            if (response.success) {
                let users = response.data;
                let html = "";
                users.forEach((user) => {
                    console.log(user);
                    let isMemberOfGroup = user["member"].length > 0;
                    html += `
                        <tr>
                            <td><input type="checkbox" ${isMemberOfGroup ? "checked" : ""
                        } name="members[]" value="${user._id}"></td>
                            <td>${user.name}</td>
                        </tr>
                        `;
                });
                $(".addMembersInTable").html(html);
            } else {
                alert(response.message);
            }
        },
    });
});

$("#add-member-form").submit(function (e) {
    e.preventDefault();
    var formData = $(this).serialize();
    console.log(formData);
    $.ajax({
        url: "/groups/add-members",
        type: "POST",
        data: formData,
        success: function (response) {
            if (response.success) {
                alert(response.message);
                $("#memberModal").modal("hide");
                $("#add-member-form")[0].reset();
            } else {
                $("#add-member-error").text(response.message);
                setTimeout(() => {
                    $("#add-member-error").text("");
                }, 3000);
                y;
            }
        },
    });
});

//update group
$(".updateGroup").click(function () {
    var obj = JSON.parse($(this).attr("data-obj"));
    $("#update_group_id").val(obj._id);
    $("#group_name").val(obj.name);
    $("#last_limit").val(obj.limit);
    $("#group_limit").val(obj.limit);
    $("#group_description").val(obj.description);
});

$("#updateChatGroupForm").submit(function (e) {
    e.preventDefault();

    $.ajax({
        url: "/groups/update-group",
        type: "POST",
        data: new FormData(this),
        contentType: false,
        cache: false,
        processData: false,
        success: function (response) {
            if (response.success) {
                alert(response.message);
                $('#updateGroupModal').modal('hide');
                location.reload();
            } else {
                $("#update-group-error").text(response.message);
                setTimeout(() => {
                    $("#update-group-error").text("");
                }, 3000);
            }
        },
    });
});

//delete group
$(".deleteGroup").click(function () {
    let id = $(this).attr("data-id");
    let name = $(this).attr("data-name");
    $("#delete_group_id").val(id);
    $("#delete_group_name").text(name);
});

$("#deleteGroupForm").submit(function (e) {
    e.preventDefault();
    let formData = $(this).serialize();

    $.ajax({
        url: "/groups/delete-group",
        type: "POST",
        data: formData,
        success: function (response) {
            if (response.success) {
                alert(response.message);
                $('#deleteGroupModal').modal('hide');
                location.reload();
            } else {
                $("#delete-group-error").text(response.message);
                setTimeout(() => {
                    $("#delete-group-error").text("");
                }, 3000);
            }
        },
    });
});

//Copy group
$(".copy").click(function () {
    $(this).append("<span class='copied_text'>Copied!</span>");
    let id = $(this).attr("data-id");
    let url = window.location.host + "/groups/share-group/" + id;

    var temp = $("<input>")
    $("body").append(temp);
    temp.val(url).select();
    document.execCommand("copy");

    temp.remove();
    setTimeout(() => {
        $(".copied_text").remove();
    }, 2000);
});

// join group
$(".join-now").click(function () {
    $(this).text("Wait....");
    $(this).attr("disabled", "disabled");

    var group_id = $(this).attr("data-id");

    $.ajax({
        url: "/groups/join-group",
        type: "POST",
        data: {
            group_id: group_id,
        },
        success: function (response) {
            alert(response.message);
            if (response.success) {
                location.reload();
            } else {
                $(this).text("Join Now");
                $(this).removeAttr("disabled");
            }
        },
    });
});

// group chat
$(".group-list").click(function () {
    $(".group-start-head").hide();
    $(".group-chat-section").show();

    global_group_id = $(this).attr("data-id");

    // load old groups chat
    $.ajax({
        url: "/groups/load-group-chat",
        type: "POST",
        data: {
            group_id: global_group_id,
        },
        success: function (response) {
            if (response.success) {
                let chats = response.data;
                let html = "";
                chats.forEach((chat) => {
                    if (chat.sender_id == sender_id) {
                        html += `
                            <div class="current-user-chat" id=${chat._id}>
                                <h5>
                                    <span>${chat.message}</span>
                                      <i class="fa fa-trash deleteGroupChat" aria-hidden="true" data-id=${chat._id} data-toggle="modal" data-target="#deleteGroupChatModel"></i>
                                      <i class="fa fa-edit updateGroupChat" aria-hidden="true" data-msg=${chat.message} data-id=${chat._id} data-toggle="modal" data-target="#editGroupChatModel"></i>
                                </h5>
                            </div>
                        `;
                    } else {
                        html += `
                            <div class="distance-user-chat" id=${chat._id}>
                                <h5>
                                    <span>${chat.message}</span>
                                </h5>
                            </div>
                        `;
                    }
                });
                $("#group-chat-container").html(html);
                scrollGroupChat();
            } else {
                alert(response.message);
            }
        },
    });
});

$("#group-chat-form").submit(function (e) {
    e.preventDefault();
    const message = $("#group-message").val();
    if (message) {
        $.ajax({
            url: "/groups/group-chat-save",
            type: "POST",
            data: {
                sender_id: sender_id,
                group_id: global_group_id,
                message: message,
            },

            success: function (response) {
                if (response.success) {
                    $("#group-message").val("");
                    let chat = response.chat.message;
                    let html = `
                        <div class="current-user-chat" id=${response.chat._id}>
                            <h5>
                                <span>${chat}</span>
                                 <i class="fa fa-trash deleteGroupChat" aria-hidden="true" data-id=${response.chat._id} data-toggle="modal" data-target="#deleteGroupChatModel"></i>
                                 <i class="fa fa-edit updateGroupChat" aria-hidden="true" data-msg=${chat} data-id=${response.chat._id} data-toggle="modal" data-target="#editGroupChatModel"></i>
                            </h5>
                        </div>
                    `;
                    $("#group-chat-container").append(html);
                    scrollGroupChat();
                    socket.emit("newGroupChat", response.chat);
                } else {
                    alert(response.message);
                }
            },
        });
    }
});

socket.on("loadNewGroupChat", function (data) {

    if (global_group_id == data.group_id) {
        let chat = data.message;
        let html = `
            <div class="distance-user-chat" id=${data._id}>
                <h5>
                    <span>${chat}</span>
                </h5>
            </div>
        `;
        $("#group-chat-container").append(html);
        scrollGroupChat();
    }
});

function scrollGroupChat() {
    $("#group-chat-container").animate({ scrollTop: $('#group-chat-container').prop("scrollHeight") }, 500);
}

$(document).on("click", ".deleteGroupChat", function () {
    let msg = $(this).parent().find('span').text();
    $("#delete-group-message").text(msg)
    $("#delete-group-message-id").val($(this).attr("data-id"));
}
);

$("#delete-group-chat-form").submit(function (e) {
    e.preventDefault();
    let id = $("#delete-group-message-id").val();
    $.ajax({
        url: "/groups/delete-group-chat",
        type: "POST",
        data: {
            id,
        },
        success: function (response) {
            if (response.success) {
                $(`#${id}`).remove();
                $("#deleteGroupChatModel").modal("hide");
                socket.emit("groupChatDeleted", id);
            } else {
                alert(response.message);
            }
        },
    });
});

socket.on("groupChatMessageDeleted", function (id) {
    $(`#${id}`).remove();
});

// edit group chat
$(document).on("click", ".updateGroupChat", function () {
    let msg = $(this).attr("data-msg");
    let id = $(this).attr("data-id");
    $("#edit-group-message").val(msg);
    $("#edit-group-message-id").val(id);
}
);

$("#edit-group-chat-form").submit(function (e) {
    e.preventDefault();
    let id = $("#edit-group-message-id").val();
    let message = $("#edit-group-message").val();
    $.ajax({
        url: "/groups/update-group-chat",
        type: "POST",
        data: {
            id,
            message,
        },
        success: function (response) {
            if (response.success) {
                $(`#${id}`).find('span').text(message);
                $("#editGroupChatModel").modal("hide");
                socket.emit("chatUpdated", { id, message });
            } else {
                alert(response.message);
            }
        },
    });
});

socket.on("chatMessageUpdated", function (data) {
    $(`#${data.id}`).find('span').text(data.message);
});