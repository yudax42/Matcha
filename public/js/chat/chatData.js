// axios.defaults.headers.common['X-CSRF-TOKEN'] = document.querySelector('[name="_csrf"]').value;

window.onload = async()=>{
    var matchedUsers = (await axios.get('/user/chatUsers'));
    var users = matchedUsers.data.users;
    users.forEach(user => {
        $("#users").append(`<li id="user">${user.userName}</li>`)
    });
}