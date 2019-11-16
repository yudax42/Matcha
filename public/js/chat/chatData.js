// axios.defaults.headers.common['X-CSRF-TOKEN'] = document.querySelector('[name="_csrf"]').value;

window.onload = async()=>{
    var matchedUsers = (await axios.get('/user/chatUsers'));
    var users = matchedUsers.data.users;
    console.log(matchedUsers);
    users.forEach(user => {
        if(user.sessionId)
            $("#users").append(`<input type="hidden" id="myId" value="${user.sessionId}">`);
        else
            $("#users").append(`<li id="user" onclick = setChat({${user.id,user.userName}})>${user.userName}</li>`)
    });
    var socket = io.connect("http://localhost:3000");
}
var receiver;



// var send = () => {
//     var msg = $("#message").val();
//     var from = $("#myId").val();
//     var
// };


// $("#user").onclick(setChat);
// $("#send").onclick(send);