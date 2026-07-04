/* Populates the DOM from window.PROFILE and the fetched
   publications JSON. Every optional field/section is omitted
   (not shown as a broken link) when its value is empty. */
(function () {
  function el(tag, attrs, text) {
    var node = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (key) {
        node.setAttribute(key, attrs[key]);
      });
    }
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function renderHero(profile) {
    document.getElementById('p-name').textContent = profile.name || '';
    document.getElementById('p-qualification').textContent = profile.qualification || '';
    document.getElementById('p-institution').textContent = profile.institution_address || '';

    var linksContainer = document.getElementById('p-hero-links');
    linksContainer.innerHTML = '';
    if (profile.university_profile_url) {
      linksContainer.appendChild(el('a', { href: profile.university_profile_url }, 'University Profile'));
    }
    if (profile.linkedin_url) {
      linksContainer.appendChild(el('a', { href: profile.linkedin_url }, 'LinkedIn'));
    }
    if (profile.email) {
      linksContainer.appendChild(el('a', { href: 'mailto:' + profile.email }, 'Email'));
    }
  }

  function renderTagList(containerId, values) {
    var container = document.getElementById(containerId);
    container.innerHTML = '';
    (values || []).forEach(function (value) {
      container.appendChild(el('span', { class: 'tag tag--interest' }, value));
    });
  }

  function renderMetrics(pubData) {
    var container = document.getElementById('p-metrics');
    container.innerHTML = '';

    if (pubData && pubData.orcid && typeof pubData.orcid.publication_count === 'number') {
      var card = el('div', { class: 'metric-card' });
      card.appendChild(el('div', { class: 'metric-value' }, String(pubData.orcid.publication_count)));
      card.appendChild(el('div', { class: 'metric-label' }, 'Publications (ORCID)'));
      container.appendChild(card);
    }

    if (pubData && pubData.scopus) {
      if (typeof pubData.scopus.h_index === 'number') {
        var hCard = el('div', { class: 'metric-card' });
        hCard.appendChild(el('div', { class: 'metric-value' }, String(pubData.scopus.h_index)));
        hCard.appendChild(el('div', { class: 'metric-label' }, 'h-index (Scopus)'));
        container.appendChild(hCard);
      }
      if (typeof pubData.scopus.document_count === 'number') {
        var dCard = el('div', { class: 'metric-card' });
        dCard.appendChild(el('div', { class: 'metric-value' }, String(pubData.scopus.document_count)));
        dCard.appendChild(el('div', { class: 'metric-label' }, 'Documents (Scopus)'));
        container.appendChild(dCard);
      }
    }
  }

  function renderPublicationsList(pubData) {
    var list = document.getElementById('p-publications');
    list.innerHTML = '';
    var works = (pubData && pubData.orcid && pubData.orcid.recent_works) || [];
    if (works.length === 0) {
      list.appendChild(el('li', { class: 'pub-item' }, 'No publication data available yet.'));
      return;
    }
    works.slice(0, 10).forEach(function (work) {
      var item = el('li', { class: 'pub-item' });
      var titleNode = work.url ? el('a', { href: work.url, class: 'pub-title' }, work.title) : el('div', { class: 'pub-title' }, work.title);
      item.appendChild(titleNode);
      var metaParts = [work.venue, work.year].filter(Boolean).join(' · ');
      item.appendChild(el('div', { class: 'pub-meta' }, metaParts));
      list.appendChild(item);
    });
  }

  function renderProfileLinks(profile, pubData) {
    var container = document.getElementById('p-profile-links');
    container.innerHTML = '';
    var links = [];
    if (profile.orcid_id) links.push({ label: 'Full ORCID Record', href: 'https://orcid.org/' + profile.orcid_id });
    if (profile.scopus_author_id) links.push({ label: 'Full Scopus Profile', href: 'https://www.scopus.com/authid/detail.uri?authorId=' + profile.scopus_author_id });
    if (profile.publons_id) links.push({ label: 'Publons Profile', href: 'https://publons.com/researcher/' + profile.publons_id });
    if (profile.google_scholar_url) links.push({ label: 'Google Scholar Profile', href: profile.google_scholar_url });

    links.forEach(function (link) {
      container.appendChild(el('a', { href: link.href }, link.label));
    });
  }

  function renderBadges(profile) {
    var container = document.getElementById('p-badges');
    container.innerHTML = '';
    var badges = [
      { key: 'orcid_id', icon: 'orcid.svg', label: 'ORCID', href: profile.orcid_id ? 'https://orcid.org/' + profile.orcid_id : null },
      { key: 'scopus_author_id', icon: 'scopus.svg', label: 'Scopus', href: profile.scopus_author_id ? 'https://www.scopus.com/authid/detail.uri?authorId=' + profile.scopus_author_id : null },
      { key: 'linkedin_url', icon: 'linkedin.svg', label: 'LinkedIn', href: profile.linkedin_url || null },
      { key: 'google_scholar_url', icon: 'google-scholar.svg', label: 'Google Scholar', href: profile.google_scholar_url || null },
      { key: 'publons_id', icon: 'publons.svg', label: 'Publons', href: profile.publons_id ? 'https://publons.com/researcher/' + profile.publons_id : null },
      { key: 'email', icon: 'email.svg', label: 'Email', href: profile.email ? 'mailto:' + profile.email : null }
    ];

    badges.filter(function (b) { return b.href; }).forEach(function (badge) {
      var a = el('a', { class: 'badge', href: badge.href });
      var img = el('img', { src: './assets/img/icons/' + badge.icon, alt: '' });
      a.appendChild(img);
      a.appendChild(document.createTextNode(badge.label));
      container.appendChild(a);
    });
  }

  function renderContact(profile) {
    var section = document.getElementById('section-contact');
    var form = document.getElementById('p-contact-form');
    var meeting = document.getElementById('p-meeting');

    var hasForm = !!profile.contact_form_endpoint;
    var hasMeeting = !!profile.calendly_url;

    if (!hasForm && !hasMeeting) {
      section.hidden = true;
      return;
    }
    section.hidden = false;

    if (hasForm) {
      form.setAttribute('action', profile.contact_form_endpoint);
      form.hidden = false;
    } else {
      form.hidden = true;
    }

    meeting.innerHTML = '';
    if (hasMeeting) {
      meeting.appendChild(el('a', { class: 'btn-secondary', href: profile.calendly_url }, 'Schedule a Meeting'));
    }
  }

  function renderFooter(profile) {
    var footer = document.getElementById('p-footer');
    footer.textContent = '© ' + new Date().getFullYear() + ' ' + (profile.name || '');
  }

  window.renderSite = function renderSite(profile, pubData) {
    renderHero(profile);
    renderTagList('p-research-interests', profile.research_interests);
    renderTagList('p-expertise', profile.expertise);
    renderMetrics(pubData);
    renderPublicationsList(pubData);
    renderProfileLinks(profile, pubData);
    renderBadges(profile);
    renderContact(profile);
    renderFooter(profile);
  };
})();
