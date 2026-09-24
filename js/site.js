// Applies js/config.js to the page: booking links, contact buttons, footer line. No dependencies.
(function () {
  'use strict';
  var C = window.FOODFOLIO || {};
  function $(id) { return document.getElementById(id); }
  function show(el, on) { if (el) { if (on) el.removeAttribute('hidden'); else el.setAttribute('hidden', ''); } }

  // Booking links: every element with data-book goes to the booking URL when there is one, otherwise to the Book section.
  var bookHref = C.bookingUrl ? C.bookingUrl : '#book';
  var external = /^https?:/i.test(bookHref);
  Array.prototype.forEach.call(document.querySelectorAll('[data-book]'), function (a) {
    a.setAttribute('href', bookHref);
    if (external) { a.setAttribute('target', '_blank'); a.setAttribute('rel', 'noopener'); }
  });

  // Book section
  var book = $('cta-book');
  if (book && C.bookingUrl) { book.setAttribute('href', C.bookingUrl); book.setAttribute('target', '_blank'); book.setAttribute('rel', 'noopener'); }
  show(book, !!C.bookingUrl);

  var wa = $('cta-whatsapp');
  if (wa && C.whatsapp) {
    wa.setAttribute('href', 'https://wa.me/' + String(C.whatsapp).replace(/\D/g, ''));
    wa.setAttribute('target', '_blank'); wa.setAttribute('rel', 'noopener');
    if (C.phone) wa.querySelector('span').textContent = 'WhatsApp ' + C.phone;
  }
  show(wa, !!C.whatsapp);

  var em = $('cta-email');
  if (em && C.email) { em.setAttribute('href', 'mailto:' + C.email + '?subject=Mock%20inspection%20booking'); em.textContent = 'Email ' + C.email; }
  show(em, !!C.email);

  var ph = $('cta-phone');
  if (ph && C.phone && !C.whatsapp) { ph.innerHTML = 'Or call <a href="tel:' + C.phone.replace(/\s+/g, '') + '">' + C.phone + '</a>'; show(ph, true); }

  // If nothing is configured yet, keep the section honest rather than empty.
  if (!C.bookingUrl && !C.whatsapp && !C.email && !C.phone && ph) {
    ph.textContent = 'Booking opens shortly.';
    show(ph, true);
  }

  // Footer contact line
  var fc = $('footer-contact');
  if (fc) {
    var parts = ['Independent food safety compliance for Dublin kitchens.'];
    var who = [C.legalName || 'FoodFolio', C.address].filter(Boolean).join(', ');
    var reach = [C.email, C.phone].filter(Boolean).join(' · ');
    parts.push(who + (reach ? '. ' + reach : '.'));
    fc.textContent = parts.join(' ');
  }
  if (C.legalName) {
    if ($('legal-name')) $('legal-name').textContent = C.legalName;
    if ($('legal-name-2')) $('legal-name-2').textContent = C.legalName;
  }
  if ($('year')) $('year').textContent = String(new Date().getFullYear());

  // Trainer line
  var lead = $('trainer-lead');
  if (lead && C.trainerName) lead.textContent = 'Led by ' + C.trainerName + ', Train the Trainer certified,';
})();
