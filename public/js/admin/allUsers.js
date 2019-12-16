axios.defaults.headers.common['X-CSRF-TOKEN'] = document.querySelector('[name="_csrf"]').value;

var listUsers;

window.onload = async function fetchUsers() {
    var users = await axios.get('/admin/backDoor/getUsers');
    this.listUsers = [...users.data.users];
    (users.data.users).forEach(user => {
        var icon;
        var status;
        if(user.is_blocked == '1')
        {
            icon = `<i class="material-icons">done_outline</i>`;
            status = "blocked";
        }
        else
        {
            icon = `<i class="material-icons">block</i>`;
            status = "not blocked";
        }
        $('#usersTable tr:last').after(`
            <tr id="${user.userName}">
                <td>${user.userName}</td>
                <td>${user.firstName}</td>
                <td>${user.lastName}</td>
                <td>${user.email}</td>
                <td>${user.gender}</td>
                <td>${user.age}</td>
                <td class="state">${status}</td>
                <td>
                    <button type="button" class="btn danger" onclick="deleteUser('${user.userName}')"><i class="material-icons">delete</i></button>
                    <button type="button" class="btn warning btnState" onclick="hold('${user.userName}','${user.is_blocked}')">${icon}</button>
                    <a href="/admin/backDoor/sendEmail/${user.userName}"><button type="button" class="btn info"><i class="material-icons">email</i></button></a>
                </td>
            </tr>
        `);

    });
}

var hold = async(userName,state) => {
    var icon;
    var newState;
    var status;
    if(state == "1")
    {
        icon = `<i class="material-icons">block</i>`;
        newState = "0";
        status = "not blocked";
    }
    else
    {
        icon = `<i class="material-icons">done_outline</i>`;
        newState = "1";
        status = "blocked";
    }

    const res = await axios({method:'post',url:'/admin/backDoor/updateUserState',params:{userName,newState}});

    $(`#${userName} .state`).html(status);
    $(`#${userName} .btnState`).html(icon);
    $(`#${userName} .btnState`).prop("onclick", null).off("click");
    $(`#${userName} .btnState`).attr("onclick",`hold('${userName}','${newState}')`);
};

var deleteUser = async(userName) => {
    $(`#${userName}`).remove();
    const res = await axios({
        method: 'post',
        url: '/admin/backDoor/deleteUser/',
        params: {
            userName : userName
        } });
};

function convertToCSV(objArray) {
    var array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
    var str = '';

    for (var i = 0; i < array.length; i++) {
        var line = '';
        for (var index in array[i]) {
            if (line != '') line += ','

            line += array[i][index];
        }

        str += line + '\r\n';
    }

    return str;
}

function exportCSVFile() {
    var items = listUsers;
    var fileTitle = "users";
    // Convert Object to JSON
    var jsonObject = JSON.stringify(items);

    var csv = this.convertToCSV(jsonObject);

    var exportedFilenmae = fileTitle + '.csv' || 'export.csv';

    var blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    if (navigator.msSaveBlob) { // IE 10+
        navigator.msSaveBlob(blob, exportedFilenmae);
    } else {
        var link = document.createElement("a");
        if (link.download !== undefined) { // feature detection
            // Browsers that support HTML5 download attribute
            var url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", exportedFilenmae);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }
}