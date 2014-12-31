$(document).ready(function(){
  $('#submit').click(function(e){
    // Grab the email
    var email = $('#email').val();

    var $this = $(this);

    $this.addClass('loading');

    $.ajax({
      dataType: 'jsonp',
      url: "http://getsimpleform.com/messages/ajax?form_api_token=58bee7e62dc603c76f10fe97da423701",
      data: {
        email: email
      }
    }).done(function() {
      $this.removeClass('loading');

      $('#email').val('');

      $('#splash').dimmer('show');

    });
  })



});