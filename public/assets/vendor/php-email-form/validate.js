/**
* PHP Email Form Validation - v3.1
* URL: https://bootstrapmade.com/php-email-form/
* Author: BootstrapMade.com
*/

(function () {
  "use strict";
  let forms = document.querySelectorAll('.php-email-form');

  forms.forEach(function (e) {
    e.addEventListener('submit', function (event) {
      event.preventDefault();

      let thisForm = this;

      let action = thisForm.getAttribute('action');
      let recaptcha = thisForm.getAttribute('data-recaptcha-site-key');

      if (!action) {
        displayError(thisForm, 'The form action property is not set!')
        return;
      }

      try {
        thisForm.querySelector('.loading').classList.add('d-flex');
      } catch (error) {
        //Error has been manejated
      }
      try {
        thisForm.querySelector('.error-message').classList.remove('d-flex');
      } catch (error) {
        //Error has been manejated
      }
      try {
        thisForm.querySelector('.sent-message').classList.remove('d-flex');
      } catch (error) {
        //Error has been manejated
      }

      
      

      let formData = new FormData(thisForm);

      if (recaptcha) {
        if (typeof grecaptcha !== "undefined") {
          grecaptcha.ready(function () {
            try {
              grecaptcha.execute(recaptcha, { action: 'php_email_form_submit' })
                .then(token => {
                  formData.set('recaptcha-response', token);
                  php_email_form_submit(thisForm, action, formData);
                })
            } catch (error) {
              displayError(thisForm, error)
            }
          });
        } else {
          displayError(thisForm, 'The reCaptcha javascript API url is not loaded!')
        }
      } else {
        php_email_form_submit(thisForm, action, formData);
      }
    });
  });

  function php_email_form_submit(thisForm, action, formData) {
    fetch(action, {
      method: 'POST',
      body: formData,
      headers: { 'X-Requested-With': 'XMLHttpRequest' }
    })
      .then(response => {
        /*if (response.ok) {
          response.json()
        } else {
          throw new Error(`${response.status} ${response.statusText} ${response.url}`);
        }*/
        return response.json()
      })
      .then(data => {
          //console.log(data)
          if(data.status=='200'){
            thisForm.querySelector('.loading').classList.remove('d-flex');
            thisForm.querySelector('.sent-message').classList.add('d-flex');
            thisForm.reset();
          }else{
            displayError(thisForm, data.msg);    
          }
      })
      .catch((error) => {
        displayError(thisForm, error);
      });
  }

  function displayError(thisForm, error) {
    thisForm.querySelector('.loading').classList.remove('d-flex');
    thisForm.querySelector('.error-message').innerHTML = error;
    thisForm.querySelector('.error-message').classList.add('d-flex');
  }

})();
