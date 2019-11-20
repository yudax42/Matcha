$('#ageInput').datepicker({});
getNotifcations = async() => {
    var notifications = await axios({method:"GET",url:'/user/getNotifications'})
    var notifs = notifications.data.notifications;
    if(notifs.length > 0)
    {
        notifs.forEach(notif => {
            $(".notifList").append(`<a class="dropdown-item" href="#">${notif.notifications}</a>`);
        });
    }
}

getNotifcations();