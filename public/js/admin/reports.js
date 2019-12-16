window.onload = async function fetchUsers() {
    var reports = await axios.get('/admin/backDoor/getReports');
    var i = 0;
    (reports.data.from).forEach(from => {
        $('#usersTable tr:last').after(`
            <tr class="${i++}">
                <td>${from.userName}</td>
            </tr>
        `);
    });
    i = 0;
    (reports.data.to).forEach(to => {
        $(`#usersTable .${i++}`).append(`<td>${to.userName}</td>`);
    });
}