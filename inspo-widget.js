/**
 * inspo-widget.js
 * Fetches posts from creativeresearchinspo.tumblr.com RSS
 * and renders them as a horizontal scrolling strip at the
 * bottom of the page.
 *
 * Usage: add ONE line before </body>:
 *   <script src="inspo-widget.js"></script>
 *
 * No dependencies. No API key needed.
 */

(function () {
  const RSS_URL = 'https://creativeresearchinspo.tumblr.com/rss';
  const PROXY   = 'https://api.allorigins.win/get?url=';

  /* ── Inject styles ─────────────────────────────────────────── */
  const style = document.createElement('style');
  style.textContent = `
    #inspo-section {
      width: 92%;
      max-width: 1200px;
      margin: 0 auto 60px auto;
      font-family: Helvetica, Arial, sans-serif;
    }

    #inspo-label {
      font-size: 8px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #999;
      margin-bottom: 14px;
    }

    #inspo-scroll {
      display: flex;
      gap: 20px;
      overflow-x: auto;
      padding-bottom: 10px;
      scrollbar-width: none;        /* Firefox */
      -ms-overflow-style: none;     /* IE/Edge */
    }

    #inspo-scroll::-webkit-scrollbar {
      display: none;                /* Chrome/Safari */
    }

    .inspo-item {
      flex: 0 0 260px;
      display: flex;
      flex-direction: column;
    }

    .inspo-media {
      width: 260px;
      height: 180px;
      overflow: hidden;
      background: #f2f2f2;
      position: relative;
    }

    .inspo-media img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
      cursor: default !important;   /* override lightbox cursor */
    }

    /* 16:9 iframe wrapper squeezed into 260×180 box */
    .inspo-media .inspo-video-wrap {
      position: relative;
      width: 100%;
      height: 100%;
    }

    .inspo-media iframe {
      position: absolute;
      top: 0; left: 0;
      width: 100%;
      height: 100%;
      border: none;
    }

    .inspo-title {
      font-size: 8px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      line-height: 1.4;
      margin-top: 6px;
      color: #000;
    }

    .inspo-title a {
      color: #B81900 !important;
      text-decoration: underline !important;
    }

    #inspo-error {
      font-size: 8px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #999;
    }

    @media screen and (max-width: 768px) {
      #inspo-section {
        width: 90%;
      }
      .inspo-item  { flex: 0 0 200px; }
      .inspo-media { width: 200px; height: 138px; }
    }
  `;
  document.head.appendChild(style);

  /* ── Build DOM shell ────────────────────────────────────────── */
  const section  = document.createElement('div');
  section.id     = 'inspo-section';

  const label    = document.createElement('div');
  label.id       = 'inspo-label';
  label.textContent = 'Basement of the Brain';

  const strip    = document.createElement('div');
  strip.id       = 'inspo-scroll';
  strip.textContent = '';           /* cleared once loaded */

  section.appendChild(label);
  section.appendChild(strip);
  document.body.appendChild(section);

  /* ── Helpers ────────────────────────────────────────────────── */

  /**
   * Extract YouTube video ID from an embed src URL.
   * e.g. "https://www.youtube.com/embed/eRvfxWRi6qQ?..."  →  "eRvfxWRi6qQ"
   */
  function ytId(src) {
    var m = src.match(/youtube\.com\/embed\/([^?&"]+)/);
    return m ? m[1] : null;
  }

  /**
   * Parse one <item> node. Returns { title, link, type, content }
   * type: 'image' | 'video'
   * content: img src string  OR  YouTube video ID
   */
  function parseItem(item) {
    var title = (item.querySelector('title') || {}).textContent || '';
    var link  = (item.querySelector('link')  || {}).textContent ||
                (item.querySelector('guid')  || {}).textContent || '#';

    /* description is CDATA — parse as HTML fragment */
    var rawDesc = (item.querySelector('description') || {}).textContent || '';
    var frag = document.createElement('div');
    frag.innerHTML = rawDesc;

    /* --- YouTube iframe? --- */
    var iframe = frag.querySelector('iframe[src*="youtube.com/embed"]');
    if (iframe) {
      var id = ytId(iframe.getAttribute('src') || '');
      if (id) return { title: title, link: link, type: 'video', content: id };
    }

    /* --- Image? --- */
    var img = frag.querySelector('img');
    if (img) {
      /* prefer highest-res from srcset */
      var best = img.getAttribute('src');
      var srcset = img.getAttribute('srcset');
      if (srcset) {
        var parts = srcset.split(',').map(function(s){ return s.trim().split(/\s+/); });
        var top = parts.reduce(function(a,b){
          return (parseInt(b[1])||0) > (parseInt(a[1])||0) ? b : a;
        }, parts[0]);
        if (top && top[0]) best = top[0];
      }
      return { title: title, link: link, type: 'image', content: best };
    }

    return null;
  }

  /**
   * Build one card DOM element from a parsed post object.
   */
  function buildCard(post) {
    var item  = document.createElement('div');
    item.className = 'inspo-item';

    var media = document.createElement('div');
    media.className = 'inspo-media';

    if (post.type === 'video') {
      var wrap   = document.createElement('div');
      wrap.className = 'inspo-video-wrap';
      var iframe = document.createElement('iframe');
      iframe.src = 'https://www.youtube.com/embed/' + post.content +
                   '?modestbranding=1&rel=0';
      iframe.setAttribute('allowfullscreen', '');
      iframe.setAttribute('loading', 'lazy');
      iframe.setAttribute('allow',
        'accelerometer; autoplay; clipboard-write; encrypted-media; ' +
        'gyroscope; picture-in-picture');
      wrap.appendChild(iframe);
      media.appendChild(wrap);
    } else {
      var img    = document.createElement('img');
      img.src    = post.content;
      img.alt    = post.title;
      img.setAttribute('loading', 'lazy');
      /* stop lightbox from intercepting these images */
      img.setAttribute('data-no-lightbox', '1');
      media.appendChild(img);
    }

    var titleEl = document.createElement('div');
    titleEl.className = 'inspo-title';

    var a = document.createElement('a');
    a.href   = post.link;
    a.target = '_blank';
    a.rel    = 'noopener noreferrer';
    a.textContent = post.title;
    titleEl.appendChild(a);

    item.appendChild(media);
    item.appendChild(titleEl);
    return item;
  }

  /* ── Fetch & render ─────────────────────────────────────────── */
  fetch(PROXY + encodeURIComponent(RSS_URL))
    .then(function(r){ return r.json(); })
    .then(function(data) {
      var parser  = new DOMParser();
      var xmlDoc  = parser.parseFromString(data.contents, 'text/xml');
      var items   = xmlDoc.querySelectorAll('item');

      strip.textContent = '';   /* clear any loading placeholder */

      var rendered = 0;
      items.forEach(function(item) {
        var post = parseItem(item);
        if (!post) return;
        strip.appendChild(buildCard(post));
        rendered++;
      });

      if (rendered === 0) {
        strip.innerHTML = '<div id="inspo-error">No posts found.</div>';
      }

      /*
       * Patch the existing lightbox so it ignores inspo images.
       * The main theme's lightbox fires on click of any #posts img —
       * our images are outside #posts so they're already safe, but
       * this guard is here in case the selector is ever broadened.
       */
      document.addEventListener('click', function(e) {
        if (e.target.closest('#inspo-section')) e.stopPropagation();
      }, true);
    })
    .catch(function(err) {
      console.warn('inspo-widget: fetch failed', err);
      strip.innerHTML =
        '<div id="inspo-error">Could not load inspiration feed.</div>';
    });

})();
