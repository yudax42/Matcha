axios.defaults.headers.common['X-CSRF-TOKEN'] = document.querySelector('[name="_csrf"]').value;




const actions = async (action, id) => {
    console.log(id);
    console.log(action);
    try {
        var res = await axios({
            method: 'post',
            url: '/user/actions',
            params: {
                action: action,
                userId: id
            }
        });
        console.log(res);
    }
    catch (err)
    {
        console.log(err);
    }
}