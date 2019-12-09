// axios.defaults.headers.common['X-CSRF-TOKEN'] = document.querySelector('[name="_csrf"]').value;
var socket = io.connect("http://10.11.9.1:3000");

// sender Info
var senderId;
var senderUserName;

// receiver Info
var activeUserId;
var activeUserName;
var activeUserImg;



window.onload = async()=>{
    $("#message").val('');
    $(".chatInputs").remove()
    var matchedUsers = (await axios.get('/user/chatUsers'));
    var users = matchedUsers.data.users;
    users.forEach(user => {
        if(user.sessionId)
        {
            senderId = user.sessionId;
            senderUserName = user.sessionUserName;
        }
        else
        {
            var online_state;
            if(user.is_online)
                online_state = "active";
            else
                online_state = "notActive";

            $("#user").append(`<li onclick = setChat(${user.id},'${user.userName}','${user.imgPath}') class="list-group-item"><img class="rounded-circle"  src="${user.imgPath}">${user.userName}<span class="${online_state}"></span></li>`)
        }
            
            
    });
    // setChat(users[1].id,users[1].userName);
}
var receiver;


var setChat = async(id,userName,path) => {
    activeUserId = id;
    activeUserName = userName;
    activeUserImg = path;
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
    $(".chatInputs").remove()
    var msgsArr = messages.data.messages;
    msgsArr.forEach(message => {
        if(message.userIdF == senderId)
        {
            $("#messages").append(`
                <div class="msg-r">
                    <div class="message">
                    <span class="user"><b>${senderUserName}</b>, ${message.msgDate}</span>
                    <span class="msgContent">${message.message}</span>
                    </div>
                    <div class="fix"></div>
                </div>
            `);
        }
        else
        {
            $("#messages").append(`
                <div class="msg-l">
                    <img class="rounded-circle" src="${activeUserImg}">
                    <div class="message">
                        <span class="user">${activeUserName}, ${message.msgDate}</span>
                        <span class="msgContent">${message.message}</span>
                    </div>
                    <div class="fix"></div>
                </div>
            `);
        }
        
        
    });
    $("#messages").scrollTop($('#messages')[0].scrollHeight);
    $(".chat").append(`
    <div class="chatInputs">
    <textarea id="message" class="ml-5 mt-4 rounded form-control"></textarea>
    <button id="send" onclick="send()" class="btn sendMsg"><i class="material-icons">send</i></button>
  </div>
    `);        
};


var send = () => {
    var msg = {
        ownerUserName:senderUserName,
        ownerId: senderId,
        receiverId: activeUserId,
        msg: $("#message").val()
    }
    socket.emit('message',msg);
    var msgEnc = (msg.msg).replace(/[\u00A0-\u9999<>\&]/gim, function(i) {
        return '&#'+i.charCodeAt(0)+';';
     });
     if(/^[A-Za-z,-;.'"\s]+$/.test(msg.msg))
     {
        $("#messages").append(`
            <div class="msg-r">
                <div class="message">
                <span class="user"><b>${senderUserName}</b></span>
                <span class="msgContent">${msgEnc}</span>
                </div>
                <div class="fix"></div>
            </div>
        `);
     }

    
    $("#messages").scrollTop($('#messages')[0].scrollHeight);
    $("#message").val('');
};

socket.on('message', msg => {

    if(msg.ownerId == activeUserId && /^[A-Za-z,-;.'"\s]+$/.test(msg.msg))
    {
        $("#messages").append(`
        <div class="msg-l">
            <img class="rounded-circle" src="${activeUserImg}">
            <div class="message">
                <span class="user">${activeUserName}</span>
                <span class="msgContent">${msg.msg}</span>
            </div>
            <div class="fix"></div>
        </div>
    `);
    $("#messages").scrollTop($('#messages')[0].scrollHeight);
    }   
})