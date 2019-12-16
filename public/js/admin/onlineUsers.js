window.onload = async function fetchUsers() {
    var users = await axios.get('/admin/backDoor/getOnlineUsers');

    (users.data.users).forEach(user => {
        $('#usersTable tr:last').after(`
            <tr id="${user.userName}">
                <td>${user.userName}</td>
                <td>${user.firstName}</td>
                <td>${user.lastName}</td>
                <td>${user.email}</td>
                <td>${user.gender}</td>
                <td>${user.age}</td>
                <td>
                    <a href="/admin/backDoor/sendEmail/${user.userName}"><button type="button" class="btn info"><i class="material-icons">email</i></button></a>
                </td>
            </tr>
        `);

    });
}