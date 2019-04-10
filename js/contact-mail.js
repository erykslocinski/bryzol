{
  const form = document.querySelector('#contactForm');
  const inputs = form.querySelectorAll('input[required], textarea[required], select[required]');

  form.setAttribute('novalidate', true);

  const displayFieldError = function (elem) {
    const fieldRow = elem.closest('.form-row');
    const fieldError = fieldRow.querySelector('.field-error');

    //jeżeli komunikat z błędem pod polem nie istnieje...
    if (fieldError === null) {
      //pobieramy z pola tekst błędu
      //i tworzymy pole
      const errorText = elem.dataset.error;
      const divError = document.createElement('div');
      divError.classList.add('field-error');
      divError.innerText = errorText;
      fieldRow.appendChild(divError);
    }
  };

  const hideFieldError = function (elem) {
    const fieldRow = elem.closest('.form-row');
    const fieldError = fieldRow.querySelector('.field-error');
    //jeżeli pobrane pole istnieje - usuń je
    if (fieldError !== null) {
      fieldError.remove();
    }
  };

  [...inputs].forEach(elem => {
    elem.addEventListener('input', function () {
      if (!this.checkValidity()) {
        this.classList.add('error');
      } else {
        this.classList.remove('error');
        hideFieldError(this);
      }
    });

    if (elem.type === "checkbox") {
      elem.addEventListener('click', function () {
        const formRow = this.closest('.form-row');
        if (this.checked) {
          this.classList.remove('error');
          hideFieldError(this);
        } else {
          this.classList.add('error');
        }
      });
    }
  });

  const checkFieldsErrors = function (elements) {
    //ustawiamy zmienną na true. Następnie robimy pętlę po wszystkich polach
    //jeżeli któreś z pól jest błędne, przełączamy zmienną na false.
    let fieldsAreValid = true;

    [...elements].forEach(elem => {
      if (elem.checkValidity()) {
        hideFieldError(elem);
        elem.classList.remove('error');
      } else {
        displayFieldError(elem);
        elem.classList.add('error');
        fieldsAreValid = false;
      }
    });

    return fieldsAreValid;
  };

  form.addEventListener('submit', e => {
    e.preventDefault();

    //jeżeli wszystkie pola są poprawne...
    if (checkFieldsErrors(inputs)) {
      const elements = form.querySelectorAll('input:not(:disabled), textarea:not(:disabled), select:not(:disabled)');

      const dataToSend = new FormData();
      [...elements].forEach(el => dataToSend.append(el.name, el.value));

      const submit = form.querySelector('[type="submit"]');
      submit.disabled = true;
      submit.classList.add('element-is-busy');

      const url = form.getAttribute('action');
      const method = form.getAttribute('method');

      fetch(url, {
          method: method.toUpperCase(),
          body: dataToSend
        })
        .then(ret => ret.json())
        .then(ret => {
          submit.disabled = false;
          submit.classList.remove('element-is-busy');

          if (ret.errors) {
            ret.errors.map(function (el) {
              return '[name="' + el + '"]'
            });

            const badFields = form.querySelectorAll(ret.errors.join(','));
            checkFieldsErrors(badFields);
          } else {
            if (ret.status === 'ok') {
              const div = document.createElement('div');
              div.classList.add('form-send-success');

              form.parentElement.insertBefore(div, form);
              div.innerHTML = '<strong>Wiadomość została wysłana</strong><span>Dziękujemy za kontakt. Postaramy się odpowiedzieć jak najszybciej</span>';
              form.remove();
            }

            if (ret.status === 'error') {
              //jeżeli istnieje komunikat o błędzie wysyłki
              //np. generowany przy poprzednim wysyłaniu formularza
              //usuwamy go, by nie duplikować tych komunikatów
              if (document.querySelector('.send-error')) {
                document.querySelector('.send-error').remove();
              }
              const div = document.createElement('div');
              div.classList.add('send-error');
              div.innerHTML = 'Wysłanie wiadomości się nie powiodło';
              submit.parentElement.appendChild(div);
            }
          }
        }).catch(_ => {
          submit.disabled = false;
          submit.classList.remove('element-is-busy');
        });
    }
  });
}