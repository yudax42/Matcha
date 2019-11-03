$("input[type=hidden]").bind("change");

window.onload = function fetchUsers() {
    axios.get('/user/homeData')
    .then(function(response) {
        var users = response.data;
        if(users.length == 0)
            $(".users").append("<b>No result found</b>");
        users.forEach(user => {
            var content = `
            <div class="col-sm-5 mx-4 mb-4">
                <div class="card text-center">
                    <img class="card-img-top" src="${user.profileImg}" alt="Card image cap">
                    <div class="card-body">
                        <h4 class="card-title">${user.userName} <span class="badge badge-light">${user.age}</span></h4>
                        <span class="mb-2">${user.fameRating}</span><br>
                        <span class="badge mr-3 badge-squared badge-outline-info">${user.gender}</span>
                        <p class="card-text">${user.bio}</p>
                        <a href="#" class="btn btn-outline-success btn-pill">❤️</a>
                        <a href="#" class="btn btn-outline-danger btn-pill">❌</a>
                    </div>
                </div>
            </div>
            `;
            $(".users").append(content);
        });
             
    })
    .catch(err => console.log(err))
}
var fetchCustomData = () => {
    console.log("i got called");
    var fameRating = Math.ceil($("#fameRating").val());
    var distance = Math.ceil($("#distance").val());
    console.log(fameRating,distance);

};

$("#fameRating").customSlider.on('change', fetchCustomData());
$("#shards-custom-slider").customSlider.on('change', fetchCustomData());