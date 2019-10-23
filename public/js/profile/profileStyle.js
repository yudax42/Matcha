function readURL(input,id) {
    if (input.files && input.files[0]) {
        var reader = new FileReader();
        reader.onload = function(e) {
            $('#'+id).css('background-image', 'url('+e.target.result +')');
            $('#'+id).hide();
            $('#'+id).fadeIn(650);
        }
        reader.readAsDataURL(input.files[0]);
    }
}
$("#imageUpload").change(function() {
    readURL(this,"avatarPreview");
});



function preview(inputId,spanId,previewId){
    document.getElementById(spanId).onclick = function(){
    document.getElementById(inputId).click();
    }

    document.getElementById(inputId).onchange = function () {
    var reader = new FileReader();
    reader.onload = function (e) {
      document.getElementById(previewId).src = e.target.result;
    };
    reader.readAsDataURL(this.files[0]);
    };
};



