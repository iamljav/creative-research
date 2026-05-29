/**
 * inspo-widget.js
 * Fetches posts from creativeresearchinspo.tumblr.com
 * using the Tumblr v2 API, parsing the body HTML directly.
 */

(function () {
  var BLOG_NAME = 'creativeresearchinspo';
  var API_KEY   = 'd8YXk2ySage2LJ6FZuepTi8DSKa5MHw3IUgK9aSPEaAMfP3Hh2';
  var API_URL   = 'https://api.tumblr.com/v2/blog/' + BLOG_NAME +
                  '.tumblr.com/posts?api_key=' + API_KEY + '&limit=20';

  /* ── Styles ───────────────────────────────────────────────── */
  var style = document.createElement('style');
  style.textContent = '\
    #inspo-section {\
      width: 92%;\
      max-width: 1200px;\
      margin: 0 auto 60px auto;\
      font-family: Helvetica, Arial, sans-serif;\
    }\
    #inspo-label {\
      font-size: 8px;\
      text-transform: uppercase;\
      letter-spacing: 0.08em;\
      color: #999;\
      margin-bottom: 14px;\
    }\
    #inspo-scroll {\
      display: flex;\
      gap: 20px;\
      overflow-x: auto;\
      padding-bottom: 10px;\
      scrollbar-width: none;\
      -ms-overflow-style: none;\
    }\
    #inspo-scroll::-webkit-scrollbar { display: none; }\
    .inspo-item {\
      flex: 0 0 260px;\
      display: flex;\
      flex-direction: column;\
    }\
    .inspo-media {\
      width: 260px;\
      height: 180px;\
      overflow: hidden;\
      background: #f2f2f2;\
      position: relative;\
    }\
    .inspo-media img {\
      width: 100%;\
      height: 100%;\
      object-fit: cover;\
      display: block;\
      cursor: default !important;\
    }\
    .inspo-video-wrap {\
      position: relative;\
      width: 100%;\
      height: 100%;\
    }\
    .inspo-media iframe {\
      position: absolute;\
      top: 0; left: 0;\
      width: 100%;\
      height: 100%;\
      border: none;\
    }\
    .inspo-title {\
      font-size: 8px;\
      text-transform: uppercase;\
      letter-spacing: 0.05em;\
      line-height: 1.4;\
      margin-top: 6px;\
      color: #000;\
    }\
    .inspo-title a {\
      color: #B81900 !important;\
      text-decoration: underline !important;\
    }\
    #inspo-error {\
      font-size: 8px;\
      text-transform: uppercase;\
      letter-spacing: 0.08em;\
      color: #999;\
    }\
    @media screen and (max-width: 768px) {\
      #inspo-section { width: 90%; }\
      .inspo-item  { flex: 0 0 200px; }\
      .inspo-media { width: 200px; height: 138px; }\
    }\
  ';
  document.head.appendChild(style);

  /* ── DOM shell ────────────────────────────────────────────── */
  var section       = document.createElement('div');
  section.id        = 'inspo-section';

  var label         = document.createElement('div');
  label.id          = 'inspo-label';
  label.textContent = 'Basement of the Brain';

  var strip         = document.createElement('div');
  strip.id          = 'inspo-scroll';

  section.appendChild(label);
  section.appendChild(strip);
  document.body.appendChild(section);

  /* ── Parse post: extract from body HTML ───────────────────── */
  function parsePost(post) {
    var title   = post.summary || '';
    var link    = post.post_url || '#';
    var body    = post.body || '';

    /* Parse body as HTML fragment */
    var frag    = document.createElement('div');
    frag.innerHTML = body;

    /* YouTube iframe in body */
    var iframe  = frag.querySelector('iframe[src*="youtube.com/embed"]');
    if (iframe) {
      var src = iframe.getAttribute('src') || '';
      var m   = src.match(/youtube\.com\/embed\/([^?&"]+)/);
      if (m) return { title: title, link: link, type: 'video', content: m[1] };
    }

    /* Image in body — pick best srcset size */
    var img = frag.querySelector('img');
    if (img) {
      var best   = img.getAttribute('src') || '';
      var srcset = img.getAttribute('srcset') || '';
      if (srcset) {
        var parts = srcset.split(',').map(function(s) {
          return s.trim().split(/\s+/);
        });
        var top = parts.reduce(function(a, b) {
          return (parseInt(b[1]) || 0) > (parseInt(a[1]) || 0) ? b : a;
        }, parts[0]);
        if (top && top[0] &&
            top[0].indexOf('inline_placeholder') === -1) {
          best = top[0];
        }
      }
      /* Skip Tumblr's inline placeholder image */
      if (best && best.indexOf('inline_placeholder') === -1) {
        return { title: title, link: link, type: 'image', content: best };
      }
    }

    return null;
  }

  /* ── Build card ───────────────────────────────────────────── */
  function buildCard(post) {
    var item        = document.createElement('div');
    item.className  = 'inspo-item';

    var media       = document.createElement('div');
    media.className = 'inspo-media';

    if (post.type === 'video') {
      var wrap       = document.createElement('div');
      wrap.className = 'inspo-video-wrap';
      var iframe     = document.createElement('iframe');
      iframe.src     = 'https://www.youtube.com/embed/' + post.content +
                       '?modestbranding=1&rel=0';
      iframe.setAttribute('allowfullscreen', '');
      iframe.setAttribute('loading', 'lazy');
      iframe.setAttribute('allow',
        'accelerometer; autoplay; clipboard-write; ' +
        'encrypted-media; gyroscope; picture-in-picture');
      wrap.appendChild(iframe);
      media.appendChild(wrap);
    } else {
      var img            = document.createElement('img');
      img.src            = post.content;
      img.alt            = post.title;
      img.loading        = 'lazy';
      img.dataset.noLightbox = '1';
      media.appendChild(img);
    }

    var titleEl       = document.createElement('div');
    titleEl.className = 'inspo-title';
    var a             = document.createElement('a');
    a.href            = post.link;
    a.target          = '_blank';
    a.rel             = 'noopener noreferrer';
    a.textContent     = post.title;
    titleEl.appendChild(a);

    item.appendChild(media);
    item.appendChild(titleEl);
    return item;
  }

  /* ── Fetch ────────────────────────────────────────────────── */
  fetch(API_URL)
    .then(function(r) { return r.json(); })
    .then(function(data) {
      var posts = (data.response && data.response.posts)
                  ? data.response.posts : [];
      strip.textContent = '';

      var rendered = 0;
      posts.forEach(function(post) {
        var parsed = parsePost(post);
        if (!parsed) return;
        strip.appendChild(buildCard(parsed));
        rendered++;
      });

      if (rendered === 0) {
        strip.innerHTML = '<div id="inspo-error">No posts found.</div>';
      }

      /* Prevent lightbox firing on inspo images */
      document.addEventListener('click', function(e) {
        if (e.target.closest('#inspo-section')) e.stopPropagation();
      }, true);
    })
    .catch(function(err) {
      console.warn('inspo-widget:', err);
      strip.innerHTML =
        '<div id="inspo-error">Could not load inspiration feed.</div>';
    });

})();
