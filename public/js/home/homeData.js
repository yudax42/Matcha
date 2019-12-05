axios.defaults.headers.common['X-CSRF-TOKEN'] = document.querySelector('[name="_csrf"]').value;
var listUsers;
var locSortedUsers;

var showUsers = (users) => {
    $(".suggestedUsers").html('');
    if(users.length == 0)
        $(".suggestedUsers").append("<b>No result found</b>");
    else
    {
        users.forEach(user => {
            var content = `
            <div class="col-xl-3  animated zoomInUp col-lg-4 col-md-4 col-sm-6 float-left userCard mt-4">
                <div class="card text-center">
                    <img class="card-img-top" src="${user.profileImg}" alt="Card image cap">
                    <div class="card-body">
                        <h4 class="card-title">${user.userName}</h4>
                        <a href="/user/public/${user.userName}" class="btn btn-outline-success btn-pill">View Profile</a>
                    </div>
                </div>
            </div>
            `;
            $(".suggestedUsers").append(content);
        });   
    }
};

window.onload = async function fetchUsers() {
    // Get Search Data
    var searchData = await axios.get('/user/searchData');

    // Configure Sliders
    $('#fameRating').customSlider({ // fame Rating
        start: [searchData.data.fameRating],
        connect: true,
        tooltips: [true],
        range: {
            'min': 0,
            'max': searchData.data.fameRating == 0 ? 0.01 : searchData.data.fameRating
        }
    });
    $('#shards-custom-slider').customSlider({ // Distance
        start: [searchData.data.maxDistance],
        connect: true,
        tooltips: [true],
        range: {
            'min': 0,
            'max': searchData.data.maxDistance
        }
    });

    $('#shards-custom-slider2').customSlider({ // age Range
        start: [searchData.data.min, searchData.data.max],
        tooltips: [true, true],
        connect: true,
        range: {
            'min': searchData.data.min,
            'max': searchData.data.max
        }
    });
    // sexual preferences
    $('#' + searchData.data.sexPref).prop('checked', true);
    // interest
    var listInterest = searchData.data.myInterests;
    listInterest.forEach((interest) => {
        console.log(interest);
        $("#listInterest").tagsinput("add", interest.topic);
    });
    // get users
    var response = await axios.get('/user/homeData');
    var users = response.data;
    listUsers = [...response.data];
    locSortedUsers = [...response.data];
    showUsers(users);
}
var fetchCustomData = () => {
    var fameRating = Math.ceil($("#fameRatingInput").val());
    var distance = Math.ceil($("#distanceInput").val());
    var ageRangeMin = Math.ceil($("#ageR1").val());
    var ageRangeMax = Math.ceil($("#ageR2").val());
    var genderPref = $('input[name=gender]:checked').val();
    var interest = $("#listInterest").tagsinput('items');
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
        if (response.data.errors)
        {
            $(".errors").html('');
            var errors = response.data.errors;
            console.log(errors);
            errors.forEach(error => {
                var content = `
                <div class="alert alert-danger animated fadeInUp alert-dismissible fade show" role="alert">
                    ${error.error}
                    <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                `;
                $(".errors").append(content);
                setTimeout(function() {
                    $(".errors").html('');
                }, 2000);
            })
        }
        else
        {
            var users = response.data;
            listUsers = [...response.data];
            locSortedUsers = [...response.data];
            showUsers(users);
        }
        
          

      })
      .catch((error) => {
  
      })

    console.log(fameRating,distance,ageRangeMin,ageRangeMax,genderPref,interest);
};

var sortBy = (by) => {
    console.log(by);
    if (by == 'loc')
        showUsers(locSortedUsers);
    else
    {
        let ret = listUsers.sort((a, b) => {
            var e1 = a[by];
            var e2 = b[by];
            if (e1 > e2) 
                return -1;
            if (e2 > e1) 
                return 1;
            return 0;
        });
        showUsers(ret);
    }

};

$("#search").click(fetchCustomData);
$("#sAge").click(()=>{ sortBy('age')});
$("#sLoc").click(()=>{ sortBy('loc')});
$("#sFame").click(()=>{ sortBy('fameRating')});
$("#sTags").click(()=>{ sortBy('commonTagsCount')});

