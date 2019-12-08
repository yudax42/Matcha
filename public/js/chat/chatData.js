// axios.defaults.headers.common['X-CSRF-TOKEN'] = document.querySelector('[name="_csrf"]').value;
var socket = io.connect("http://localhost:3000");

// sender Info
var senderId;
var senderUserName;

// receiver Info
var activeUserId;
var activeUserName;



window.onload = async()=>{
    var matchedUsers = (await axios.get('/user/chatUsers'));
    var users = matchedUsers.data.users;
    console.log(matchedUsers);
    users.forEach(user => {
        if(user.sessionId)
        {
            senderId = user.sessionId;
            senderUserName = user.sessionUserName;
        }
        else
            $("#users").append(`<li id="user" onclick = setChat(${user.id},'${user.userName}')>${user.userName}</li>`)
    });
    setChat(users[1].id,users[1].userName);
}
var receiver;


var setChat = async(id,userName) => {
    activeUserId = id;
    activeUserName = userName;
    // get the list of messages 
    var messages = (await axios({
        method:'get', 
        url: '/user/getMessages',
        params : {
            sender: senderId,
            receiver: activeUserId,
        }
    }));
    $('#messages').empty();

    var msgsArr = messages.data.messages;
    msgsArr.forEach(message => {

        if(message.userIdF == senderId)
            $("#messages").append(`<div id="user" class="float-right"><b>${senderUserName} </b><span>${message.message}</span> <span class="badge badge-secondary">${message.msgDate}</span> </div>`);
        else
            $("#messages").append(`<div id="user" class="float-left"><b>${activeUserName} </b><span>${message.message}</span> <span class="badge badge-secondary">${message.msgDate}</span> </div>`);
        
    });
    
};


var send = () => {

    var msg = {
        ownerUserName:senderUserName,
        ownerId: senderId,
        receiverId: activeUserId,
        msg: $("#message").val()
    }
    socket.emit('message',msg);
    $("#messages").append(`<div id="user" class="float-right"><b>${senderUserName} </b><span>${msg.msg}</span></div>`);
    $("#message").val('');
};

socket.on('message', msg => {

    if(msg.ownerId == activeUserId)
        $("#messages").append(`<div id="user" class="float-left"><b>${activeUserName} </b><span>${msg.msg}</span></div>`);
   
})

$("#send").click(send);
$(document).ready(function () {
    if (!$.browser.webkit) {
        $('.wrapper').html('<p>Sorry! Non webkit users. :(</p>');
    }
});