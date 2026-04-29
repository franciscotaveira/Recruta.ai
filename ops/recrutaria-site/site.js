(function () {
  var analyticsConfig = window.__RECRUTARIA_ANALYTICS || {};
  var params = new URLSearchParams(window.location.search);
  var keys = [
    'utm_source',
    'utm_medium',
    'utm_campaign',
    'utm_term',
    'utm_content',
    'gclid',
    'fbclid',
  ];
  var stored = {};

  try {
    var previous = localStorage.getItem('recrutaria_utm');
    if (previous) stored = JSON.parse(previous);
  } catch {
    // ignore storage errors (private mode / blocked storage)
  }

  var changed = false;
  keys.forEach(function (k) {
    var v = params.get(k);
    if (v) {
      stored[k] = v;
      changed = true;
    }
  });

  if (changed) {
    try {
      localStorage.setItem('recrutaria_utm', JSON.stringify(stored));
    } catch {
      // ignore storage errors (private mode / blocked storage)
    }
  }

  function getContext() {
    return {
      page: window.location.pathname,
      title: document.title,
      referrer: document.referrer || '',
      utm_source: stored.utm_source || '',
      utm_medium: stored.utm_medium || '',
      utm_campaign: stored.utm_campaign || '',
      utm_term: stored.utm_term || '',
      utm_content: stored.utm_content || '',
      gclid: stored.gclid || '',
      fbclid: stored.fbclid || '',
    };
  }

  function sendGA(eventName, payload) {
    if (typeof window.gtag !== 'function') return;
    window.gtag('event', eventName, payload);
  }

  function sendMeta(eventName, payload) {
    if (typeof window.fbq !== 'function') return;
    window.fbq('trackCustom', eventName, payload);
  }

  function sendLinkedIn() {
    if (typeof window.lintrk !== 'function') return;
    window.lintrk('track');
  }

  function track(eventName, payload) {
    var merged = Object.assign({}, getContext(), payload || {});
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(Object.assign({ event: eventName }, merged));
    if (!analyticsConfig.preferGtm) {
      sendGA(eventName, merged);
      sendMeta(eventName, merged);
      sendLinkedIn();
    }
  }

  function setupGTM() {
    var id = analyticsConfig.gtmContainerId;
    if (!id) return;
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
    var script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtm.js?id=' + encodeURIComponent(id);
    document.head.appendChild(script);
  }

  function setupGA() {
    var id = analyticsConfig.ga4MeasurementId;
    if (!id) return;
    var script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(id);
    document.head.appendChild(script);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () {
      window.dataLayer.push(arguments);
    };
    window.gtag('js', new Date());
    window.gtag('config', id, { send_page_view: false });
  }

  function setupMeta() {
    var id = analyticsConfig.metaPixelId;
    if (!id) return;
    (function (f, b, e, v, n, t, s) {
      if (f.fbq) return;
      n = f.fbq = function () {
        if (n.callMethod) {
          n.callMethod.apply(n, arguments);
        } else {
          n.queue.push(arguments);
        }
      };
      if (!f._fbq) f._fbq = n;
      n.push = n;
      n.loaded = true;
      n.version = '2.0';
      n.queue = [];
      t = b.createElement(e);
      t.async = true;
      t.src = v;
      s = b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t, s);
    })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
    window.fbq('init', id);
    window.fbq('track', 'PageView');
  }

  function setupLinkedIn() {
    var id = analyticsConfig.linkedinPartnerId;
    if (!id) return;
    window._linkedin_data_partner_ids = window._linkedin_data_partner_ids || [];
    window._linkedin_data_partner_ids.push(id);
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://snap.licdn.com/li.lms-analytics/insight.min.js';
    document.head.appendChild(s);
  }

  if (analyticsConfig.enabled !== false) {
    setupGTM();
    if (!analyticsConfig.preferGtm) {
      setupGA();
      setupMeta();
      setupLinkedIn();
    }
  }

  track('page_view', {});

  document.querySelectorAll('a[data-app-link=true]').forEach(function (anchor) {
    try {
      var u = new URL(anchor.href);
      Object.keys(stored).forEach(function (k) {
        if (!u.searchParams.get(k)) u.searchParams.set(k, stored[k]);
      });
      anchor.href = u.toString();
    } catch {
      // ignore malformed href values
    }

    anchor.addEventListener('click', function () {
      track('cta_click', {
        cta_text: (anchor.textContent || '').trim(),
        cta_href: anchor.getAttribute('href') || '',
        cta_area: anchor.getAttribute('data-track-area') || 'unknown',
      });
    });
  });

  document.querySelectorAll('a[data-track-nav=true]').forEach(function (anchor) {
    anchor.addEventListener('click', function () {
      track('nav_click', {
        nav_text: (anchor.textContent || '').trim(),
        nav_href: anchor.getAttribute('href') || '',
      });
    });
  });
})();
