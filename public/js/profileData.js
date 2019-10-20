
axios.defaults.headers.common['X-CSRF-TOKEN'] = document.querySelector('[name="_csrf"]').value;

// to Fetch user data and add the data inside the input forms

window.onload = function fetchData() {
  // Get user Data
  axios.get('/user/profileData')
    .then(function (response) {
      var data = response.data;
      console.log(data);
      $('#profileName').html(data.firstName + " " + data.lastName);
      $('#username').val(data.userName);
      $('#firstName').val(data.firstName);
      $('#lastName').val(data.lastName);
      $('#email').val(data.email);
      $("#gender").val(data.gender);
      $('#'+data.sexPref).prop('checked', true);
      $("#ageInput").val(data.birthDate.split("T")[0]);
      $("#bio").val(data.bio);
    })
    .catch(function (error) {
      console.log("there was and error please try again later");
  });
};

// Send data 
const send = () => {
  var userName = $('#username').val();
  var firstName = $('#firstName').val();
  var lastName = $('#lastName').val();
  var email    = $('#email').val();
  var password = $('#password').val();
  var gender = $("#gender option:selected").val();
  var secPredTotal = [];
  $.each($("input[name='secPref']:checked"), function(){
        secPredTotal.push($(this).attr("id"));
  });
  var dateOfBirth = $("#ageInput").val();
  var bio = $.trim($("#bio").val());


  axios({
    method:'post',
    url:'/user/profileData',
    params:{
      userName: userName,
      firstName : firstName,
      lastName : lastName,
      email: email,
      password: password,
      gender: gender,
      secPredTotal: secPredTotal,
      dateOfBirth:dateOfBirth,
      bio:bio
    }
  })
  .then((response) => {
    // console.log(response.data);
    var data = response.data;
    console.log(data[0]);
    // if response is done will show green box with sucess msg
    if(data[0].msg == "done")
    {
      $('#errors').append("<div id='err' class='alert alert-success fade show' role='alert'>Data updated succefully</div>");
      setTimeout(function(){
       $('#err').remove();
      }, 3000);
    }
    else  // else will show all error message in danger div msg
    {
     response.data.forEach(error => {
      $('#errors').append("<div id='err' class='alert alert-danger fade show' role='alert'>"+error.msg+"</div>");
        // delete error div after 3 sec
        setTimeout(function(){
         $('#err').remove();
        }, 3000);
        
      }) 
    }

    fetchData();
  })
  .catch((error) => {

  })
}


