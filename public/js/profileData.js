
// to Fetch user data and add the data inside the input forms

var userName = $('#username').val();
var firstName = $('#firstName').val();
var lastName = $('#lastName').val();
var email    = $('#email').val();
var password = $('#password').val();
var gender = $("#gender option:selected").val();
let secPredTotal = [];
$.each($("input[name='secPref']:checked"), function(){
      secPredTotal.push($(this).val());
});
var dateOfBirth = $("#ageInput").val();
var bio = $.trim($("#bio").val());
console.log(userName);
// console.log(userName,firstName,lastName,email,password,gender,secPredTotal,dateOfBirth,bio);


axios.get('/user/profileData')
  .then(function (response) {
    var data = response.data;
    $('#profileName').html(data.firstName + " " + data.lastName);
    $('#username').val(data.userName);
    $('#firstName').val(data.firstName);
    $('#lastName').val(data.lastName);
    $('#email').val(data.email);
  })
  .catch(function (error) {
    console.log("there was and error please try again later");
});

// axios.post('/user/profileData',{

// })
// .then((response) => {

// })
// .catch((error) => {

// })
