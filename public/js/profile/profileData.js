
axios.defaults.headers.common['X-CSRF-TOKEN'] = document.querySelector('[name="_csrf"]').value;

// to Fetch user data and add the data inside the input forms

window.onload = function fetchData() {
  // Get user Data
  axios.get('/user/profileData')
    .then(function (response) {
      var data = response.data.formData;
      var listInterest = response.data.listInterest;
      //Profile Name
      $('#profileName').html(data.firstName + " " + data.lastName);
      // username
      $('#username').val(data.userName);
      // firstName
      $('#firstName').val(data.firstName);
      // lastName
      $('#lastName').val(data.lastName);
      // email
      $('#email').val(data.email);
      // gender
      $("#gender").val(data.gender);
      if(data.sexPref == "both")
      {
        $('#male').prop('checked', true);
        $('#female').prop('checked', true);
      }
      else
        $('#'+data.sexPref).prop('checked', true);
      //Change formate of date
      var oldFormate = data.birthDate.split('T')[0];
      var newArrFormat = oldFormate.split("-");

      $("#ageInput").val(newArrFormat[1]+ "/" +newArrFormat[2]+ "/" +newArrFormat[0]);
      $("#bio").val(data.bio);
      // Interest
      listInterest.forEach((interest) => {
        $("#listInterest").tagsinput("add",interest);
      });

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
  // interest
  var interest = [];
  var i = 0;
  while(i < $(".badge").length)
  {
    interest.push($(".badge")[i].innerText);
    i++;
  }


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
      bio:bio,
      interest:interest
    }
  })
  .then((response) => {
    // console.log(response.data);
    var data = response.data;
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


