/* Prépare un courriel dans la messagerie du visiteur. */
(function () {
  'use strict';

  if (!window.HTMLDialogElement || !HTMLDialogElement.prototype.showModal) return;

  var trigger = document.querySelector('.contact-trigger');
  if (!trigger) return;

  var dialog = document.createElement('dialog');
  dialog.className = 'contact-dialog';
  dialog.setAttribute('aria-labelledby', 'contact-title');
  dialog.innerHTML = `
    <button type="button" class="contact-dialog__close" aria-label="Fermer" autofocus>×</button>
    <h2 class="t-display" id="contact-title">Contact</h2>
    <p>Écris-moi à <a data-contact-address></a>.</p>
    <form class="contact-dialog__form">
      <label for="contact-subject">Objet</label>
      <input id="contact-subject" name="subject" type="text" maxlength="120" required>
      <label for="contact-message">Message</label>
      <textarea id="contact-message" name="message" rows="5" maxlength="2000" required></textarea>
      <p>Tu pourras relire et envoyer le message dans ta messagerie.</p>
      <button class="fin__cta" type="submit">Ouvrir ma messagerie</button>
    </form>
  `;
  var mailto = trigger.getAttribute('href');
  var address = dialog.querySelector('[data-contact-address]');
  address.href = mailto;
  address.textContent = mailto.slice('mailto:'.length);
  document.body.append(dialog);
  trigger.setAttribute('aria-haspopup', 'dialog');

  trigger.addEventListener('click', function (event) {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    dialog.showModal();
  });

  dialog.querySelector('.contact-dialog__close').addEventListener('click', function () {
    dialog.close();
  });

  dialog.querySelector('form').addEventListener('submit', function (event) {
    event.preventDefault();
    var fields = new FormData(event.currentTarget);
    var subject = encodeURIComponent(fields.get('subject').trim());
    var body = encodeURIComponent(fields.get('message').trim().replace(/\r?\n/g, '\r\n'));
    window.location.href = mailto + '?subject=' + subject + '&body=' + body;
  });
})();
