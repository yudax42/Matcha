
window.onload = function fetchUsers() {
    axios.get('/user/homeData')
    .then(function(response) {
        var users = response.data;
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