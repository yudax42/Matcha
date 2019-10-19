
// to Fetch user data and add the data inside the input forms
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