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

// add member form submit code

$('#add-member-form').submit(function (e) {
    e.preventDefault();
    var formData = $(this).serialize();
    // let group_id = $('#group_id').val();
    // let limit = $('#limit').val();
    // let members = [];
    // $('input[name="members[]"]:checked').each(function () {
    //     members.push($(this).val());
    // });

    $.ajax({
        url: '/groups/add-members',
        type: 'POST',
        data: formData,
        success: function (response) {
            if (response.success) {
                alert(response.message);
                $('#memberModal').modal('hide');
                $('#add-member-form')[0].reset();
            } else {
                $('#add-member-error').text(response.message);
                setTimeout(() => {
                    $('#add-member-error').text('');
                }, 3000); y
            }
        }
    })
}
);