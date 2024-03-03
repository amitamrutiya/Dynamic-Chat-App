// add member js

$('.addMember').click(function () {
    let id = $(this).attr('data-id');
    let limit = $(this).attr('data-limit');

    $('#group_id').val(id);
    $('#limit').val(limit);

    $.ajax({
        url: '/groups/get-members',
        type: 'POST',
        data: {
            group_id: id
        },
        success: function (response) {
            if (response.success) {
                let users = response.data;
                let html = '';
                users.forEach(user => {
                    html += `
                        <tr>
                            <td><input type="checkbox" name="members[]" value="${user._id}"></td>
                            <td>${user.name}</td>
                        </tr>
                        `
                });
                $('.addMembersInTable').html(html);
            } else {
                alert(response.message);
            }
        }
    })
});