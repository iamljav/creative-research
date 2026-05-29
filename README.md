# creativeresearch

Personal creative research portfolio by Luca Vergano.  
Live at: `iamljav.github.io/creativeresearch`

---

## Structure

```
creativeresearch/
├── index.html          ← all posts live here
├── inspo-widget.js     ← pulls from creativeresearchinspo.tumblr.com RSS
├── assets/
│   └── img/
│       └── avatar.jpg  ← your profile photo (64×64px minimum, square)
└── README.md
```

---

## Setup

1. Create repo `iamljav/creativeresearch` on GitHub
2. Push these files
3. Go to **Settings → Pages → Source: main branch / root**
4. Site is live at `https://iamljav.github.io/creativeresearch`

### Avatar

Drop your profile photo at `assets/img/avatar.jpg`.  
Square crop, minimum 64×64px.

---

## Adding a new post

Open `index.html` and paste a new `<article>` block **above** the `ADD NEW POSTS` comment inside `<main id="posts">`.

### Video post (Vimeo)

```html
<article id="post-your-slug">
    <div class="video-wrap">
        <iframe
            src="https://player.vimeo.com/video/VIDEO_ID?title=0&byline=0&portrait=0&badge=0&autopause=0&player_id=0&app_id=58479"
            allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share"
            referrerpolicy="strict-origin-when-cross-origin"
            allowfullscreen
            title="your title here">
        </iframe>
    </div>
    <p class="post-caption"><strong>title</strong> | <em>medium</em>, year</p>
</article>
```

### Single image post

```html
<article id="post-your-slug">
    <img src="assets/img/your-image.jpg" alt="description">
    <p class="post-caption"><strong>title</strong> | <em>medium</em>, year</p>
</article>
```

### Multi-image post (carousel)

```html
<article id="post-your-slug">
    <div class="carousel-wrap">
        <div class="carousel-track">
            <div class="carousel-slide"><img src="assets/img/image-1.jpg" alt=""></div>
            <div class="carousel-slide"><img src="assets/img/image-2.jpg" alt=""></div>
            <div class="carousel-slide"><img src="assets/img/image-3.jpg" alt=""></div>
        </div>
    </div>
    <p class="post-caption"><strong>title</strong> | <em>medium</em>, year</p>
</article>
```

---

## Inspiration widget

The widget at the bottom pulls automatically from `creativeresearchinspo.tumblr.com` RSS via a CORS proxy (`allorigins.win`). No config needed — it updates whenever you post to that Tumblr.

If the widget stops loading, check that `allorigins.win` is still live. If it goes down, replace the `PROXY` variable in `inspo-widget.js` with an alternative.
