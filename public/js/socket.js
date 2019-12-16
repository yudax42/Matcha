
var socket = io.connect("http://localhost:3000");



socket.on('notification', notification => {
    $(".notifications").css('color', 'red');
    $(".notifList").append(`<a class="dropdown-item" href="#">${notification.not}</a>`);
})