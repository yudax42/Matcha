// axios.defaults.headers.common['X-CSRF-TOKEN'] = document.querySelector('[name="_csrf"]').value;

window.onload = async()=>{
    var matchedUsers = await axios.get('/user/chatUsers');
    console.log(matchedUsers);
}