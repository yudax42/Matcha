
axios.defaults.headers.common['X-CSRF-TOKEN'] = document.querySelector('[name="_csrf"]').value;

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
    var fameRating = Math.ceil($("#fameRatingInput").val());
    var distance = Math.ceil($("#distanceInput").val());
    var ageRangeMin = Math.ceil($("#ageR1").val());
    var ageRangeMax = Math.ceil($("#ageR2").val());
    var genderPref = $('input[name=gender]:checked').val();
    var interest = $("#tagsInput").tagsinput('items');
    axios({
        method: 'get',
        url: '/user/homeData',
        params: {
            fameRating,
            distance,
            ageRangeMin,
            ageRangeMax,
            genderPref,
            interest
        }
      })
      .then((response) => {
        var users = response.data;
        $(".users").html('');
        if(users.length == 0)
            $(".users").append("<b>No result found</b>");
        users.forEach(user => {
            var content = `
            <div class="col-xl-3  col-lg-4 col-md-4 col-sm-6 float-left userCard mb-4">
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
      .catch((error) => {
  
      })

    console.log(fameRating,distance,ageRangeMin,ageRangeMax,genderPref,interest);
};

$("#search").click(fetchCustomData);

