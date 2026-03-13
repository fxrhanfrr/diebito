if (!self.define) {
  let s,
    e = {};
  const n = (n, a) => (
    (n = new URL(n + '.js', a).href),
    e[n] ||
      new Promise((e) => {
        if ('document' in self) {
          const s = document.createElement('script');
          ((s.src = n), (s.onload = e), document.head.appendChild(s));
        } else ((s = n), importScripts(n), e());
      }).then(() => {
        let s = e[n];
        if (!s) throw new Error(`Module ${n} didn’t register its module`);
        return s;
      })
  );
  self.define = (a, t) => {
    const i = s || ('document' in self ? document.currentScript.src : '') || location.href;
    if (e[i]) return;
    let c = {};
    const o = (s) => n(s, i),
      r = { module: { uri: i }, exports: c, require: o };
    e[i] = Promise.all(a.map((s) => r[s] || o(s))).then((s) => (t(...s), c));
  };
}
define(['./workbox-4754cb34'], function (s) {
  'use strict';
  (importScripts(),
    self.skipWaiting(),
    s.clientsClaim(),
    s.precacheAndRoute(
      [
        { url: '/_next/app-build-manifest.json', revision: '75c7526c97b7c3a649750698a36dd2ed' },
        {
          url: '/_next/static/3hFNhL1vs2zn2Qwo_N0wm/_buildManifest.js',
          revision: '0ea7e7088aabf697ba3d8aa8c7b54a89',
        },
        {
          url: '/_next/static/3hFNhL1vs2zn2Qwo_N0wm/_ssgManifest.js',
          revision: 'b6652df95db52feb4daf4eca35380933',
        },
        { url: '/_next/static/chunks/2117-582a1207e8addc26.js', revision: '3hFNhL1vs2zn2Qwo_N0wm' },
        { url: '/_next/static/chunks/2370-dcb8cc68a2a7531d.js', revision: '3hFNhL1vs2zn2Qwo_N0wm' },
        {
          url: '/_next/static/chunks/261b60bd-a1a10edac4be6758.js',
          revision: '3hFNhL1vs2zn2Qwo_N0wm',
        },
        { url: '/_next/static/chunks/2690-8c90fc4ff6964433.js', revision: '3hFNhL1vs2zn2Qwo_N0wm' },
        { url: '/_next/static/chunks/3376-22617a807f82e36c.js', revision: '3hFNhL1vs2zn2Qwo_N0wm' },
        { url: '/_next/static/chunks/4116-cc4d62032b2ab31d.js', revision: '3hFNhL1vs2zn2Qwo_N0wm' },
        { url: '/_next/static/chunks/4237-b229e310462b3ca2.js', revision: '3hFNhL1vs2zn2Qwo_N0wm' },
        { url: '/_next/static/chunks/4600-c0bb47042d88b400.js', revision: '3hFNhL1vs2zn2Qwo_N0wm' },
        { url: '/_next/static/chunks/4772-88b447f1167e9629.js', revision: '3hFNhL1vs2zn2Qwo_N0wm' },
        { url: '/_next/static/chunks/6242-7d64ab8191efefc1.js', revision: '3hFNhL1vs2zn2Qwo_N0wm' },
        { url: '/_next/static/chunks/7507-a703e8d42283d766.js', revision: '3hFNhL1vs2zn2Qwo_N0wm' },
        {
          url: '/_next/static/chunks/7508b87c-2865707a6cd18eb7.js',
          revision: '3hFNhL1vs2zn2Qwo_N0wm',
        },
        { url: '/_next/static/chunks/7648-136d59be1c445696.js', revision: '3hFNhL1vs2zn2Qwo_N0wm' },
        { url: '/_next/static/chunks/7757-c7207b3bb6f33735.js', revision: '3hFNhL1vs2zn2Qwo_N0wm' },
        { url: '/_next/static/chunks/8139-793a7b3db9f73022.js', revision: '3hFNhL1vs2zn2Qwo_N0wm' },
        { url: '/_next/static/chunks/8471-d7742e3ab3d65d40.js', revision: '3hFNhL1vs2zn2Qwo_N0wm' },
        { url: '/_next/static/chunks/8911-054e4043bdf2770d.js', revision: '3hFNhL1vs2zn2Qwo_N0wm' },
        { url: '/_next/static/chunks/930-9b5a38c9ab78fe9b.js', revision: '3hFNhL1vs2zn2Qwo_N0wm' },
        { url: '/_next/static/chunks/9396-365a74394acfa995.js', revision: '3hFNhL1vs2zn2Qwo_N0wm' },
        { url: '/_next/static/chunks/9436-b8a6d04510d79651.js', revision: '3hFNhL1vs2zn2Qwo_N0wm' },
        { url: '/_next/static/chunks/9543-a3b06a56f4ffb0de.js', revision: '3hFNhL1vs2zn2Qwo_N0wm' },
        { url: '/_next/static/chunks/9647-05cd0627f2f41803.js', revision: '3hFNhL1vs2zn2Qwo_N0wm' },
        {
          url: '/_next/static/chunks/app/_not-found/page-03a7092e5c93f1ac.js',
          revision: '3hFNhL1vs2zn2Qwo_N0wm',
        },
        {
          url: '/_next/static/chunks/app/admin/page-ca96d8885bcded1e.js',
          revision: '3hFNhL1vs2zn2Qwo_N0wm',
        },
        {
          url: '/_next/static/chunks/app/ai-assistant/page-69119044974d3ba7.js',
          revision: '3hFNhL1vs2zn2Qwo_N0wm',
        },
        {
          url: '/_next/static/chunks/app/auth/login/page-956f0ed815f510d1.js',
          revision: '3hFNhL1vs2zn2Qwo_N0wm',
        },
        {
          url: '/_next/static/chunks/app/auth/register/page-d47b86017ce521b1.js',
          revision: '3hFNhL1vs2zn2Qwo_N0wm',
        },
        {
          url: '/_next/static/chunks/app/auth/reset-password/page-dedab5008e44eac6.js',
          revision: '3hFNhL1vs2zn2Qwo_N0wm',
        },
        {
          url: '/_next/static/chunks/app/auth/select-role/page-b71ba594cb78a4ac.js',
          revision: '3hFNhL1vs2zn2Qwo_N0wm',
        },
        {
          url: '/_next/static/chunks/app/auth/verify-email/page-7173fd56fc7751bd.js',
          revision: '3hFNhL1vs2zn2Qwo_N0wm',
        },
        {
          url: '/_next/static/chunks/app/consultations/page-c53d0f80a608297a.js',
          revision: '3hFNhL1vs2zn2Qwo_N0wm',
        },
        {
          url: '/_next/static/chunks/app/dashboard/page-acd0153c01ac0c7c.js',
          revision: '3hFNhL1vs2zn2Qwo_N0wm',
        },
        {
          url: '/_next/static/chunks/app/diets/page-4da395bab80da16f.js',
          revision: '3hFNhL1vs2zn2Qwo_N0wm',
        },
        {
          url: '/_next/static/chunks/app/doctor-setup/page-1a78dd6854953adc.js',
          revision: '3hFNhL1vs2zn2Qwo_N0wm',
        },
        {
          url: '/_next/static/chunks/app/exercises/page-ae06fc66d38e0fa0.js',
          revision: '3hFNhL1vs2zn2Qwo_N0wm',
        },
        {
          url: '/_next/static/chunks/app/food-ordering/page-d066efa69ae65c39.js',
          revision: '3hFNhL1vs2zn2Qwo_N0wm',
        },
        {
          url: '/_next/static/chunks/app/layout-171749ae0e46f29d.js',
          revision: '3hFNhL1vs2zn2Qwo_N0wm',
        },
        {
          url: '/_next/static/chunks/app/my-orders/page-3936e135d52a0a8c.js',
          revision: '3hFNhL1vs2zn2Qwo_N0wm',
        },
        {
          url: '/_next/static/chunks/app/page-da35ef6bef67e33b.js',
          revision: '3hFNhL1vs2zn2Qwo_N0wm',
        },
        {
          url: '/_next/static/chunks/app/patients/page-de9ce1e248b67d4a.js',
          revision: '3hFNhL1vs2zn2Qwo_N0wm',
        },
        {
          url: '/_next/static/chunks/app/restaurant-setup/page-78f9af650d1a34b9.js',
          revision: '3hFNhL1vs2zn2Qwo_N0wm',
        },
        {
          url: '/_next/static/chunks/app/settings/accounts/page-ee1464e4b4ef0297.js',
          revision: '3hFNhL1vs2zn2Qwo_N0wm',
        },
        {
          url: '/_next/static/chunks/app/settings/page-990ec7ab4085f456.js',
          revision: '3hFNhL1vs2zn2Qwo_N0wm',
        },
        {
          url: '/_next/static/chunks/app/settings/sessions/page-c2a43be0b9bb07df.js',
          revision: '3hFNhL1vs2zn2Qwo_N0wm',
        },
        {
          url: '/_next/static/chunks/fd9d1056-234ff82cf9489939.js',
          revision: '3hFNhL1vs2zn2Qwo_N0wm',
        },
        {
          url: '/_next/static/chunks/framework-20adfd98f723306f.js',
          revision: '3hFNhL1vs2zn2Qwo_N0wm',
        },
        { url: '/_next/static/chunks/main-4c9dbdf9f59eb6e4.js', revision: '3hFNhL1vs2zn2Qwo_N0wm' },
        {
          url: '/_next/static/chunks/main-app-8717fea95149f69d.js',
          revision: '3hFNhL1vs2zn2Qwo_N0wm',
        },
        {
          url: '/_next/static/chunks/pages/_app-78ddf957b9a9b996.js',
          revision: '3hFNhL1vs2zn2Qwo_N0wm',
        },
        {
          url: '/_next/static/chunks/pages/_error-7ce03bcf1df914ce.js',
          revision: '3hFNhL1vs2zn2Qwo_N0wm',
        },
        {
          url: '/_next/static/chunks/polyfills-42372ed130431b0a.js',
          revision: '846118c33b2c0e922d7b3a7676f81f6f',
        },
        {
          url: '/_next/static/chunks/webpack-d35607d949763c96.js',
          revision: '3hFNhL1vs2zn2Qwo_N0wm',
        },
        { url: '/_next/static/css/8b294b1cd2efae16.css', revision: '8b294b1cd2efae16' },
        {
          url: '/_next/static/media/19cfc7226ec3afaa-s.woff2',
          revision: '9dda5cfc9a46f256d0e131bb535e46f8',
        },
        {
          url: '/_next/static/media/21350d82a1f187e9-s.woff2',
          revision: '4e2553027f1d60eff32898367dd4d541',
        },
        {
          url: '/_next/static/media/8e9860b6e62d6359-s.woff2',
          revision: '01ba6c2a184b8cba08b0d57167664d75',
        },
        {
          url: '/_next/static/media/ba9851c3c22cd980-s.woff2',
          revision: '9e494903d6b0ffec1a1e14d34427d44d',
        },
        {
          url: '/_next/static/media/c5fe6dc8356a8c31-s.woff2',
          revision: '027a89e9ab733a145db70f09b8a18b42',
        },
        {
          url: '/_next/static/media/df0a9ae256c0569c-s.woff2',
          revision: 'd54db44de5ccb18886ece2fda72bdfe0',
        },
        {
          url: '/_next/static/media/e4af272ccee01ff0-s.p.woff2',
          revision: '65850a373e258f1c897a2b3d75eb74de',
        },
        { url: '/manifest.json', revision: 'c4af226cbc3de316f2bc2393ca9c089f' },
      ],
      { ignoreURLParametersMatching: [] }
    ),
    s.cleanupOutdatedCaches(),
    s.registerRoute(
      '/',
      new s.NetworkFirst({
        cacheName: 'start-url',
        plugins: [
          {
            cacheWillUpdate: async ({ request: s, response: e, event: n, state: a }) =>
              e && 'opaqueredirect' === e.type
                ? new Response(e.body, { status: 200, statusText: 'OK', headers: e.headers })
                : e,
          },
        ],
      }),
      'GET'
    ),
    s.registerRoute(
      /^https:\/\/fonts\.(?:gstatic)\.com\/.*/i,
      new s.CacheFirst({
        cacheName: 'google-fonts-webfonts',
        plugins: [new s.ExpirationPlugin({ maxEntries: 4, maxAgeSeconds: 31536e3 })],
      }),
      'GET'
    ),
    s.registerRoute(
      /^https:\/\/fonts\.(?:googleapis)\.com\/.*/i,
      new s.StaleWhileRevalidate({
        cacheName: 'google-fonts-stylesheets',
        plugins: [new s.ExpirationPlugin({ maxEntries: 4, maxAgeSeconds: 604800 })],
      }),
      'GET'
    ),
    s.registerRoute(
      /\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,
      new s.StaleWhileRevalidate({
        cacheName: 'static-font-assets',
        plugins: [new s.ExpirationPlugin({ maxEntries: 4, maxAgeSeconds: 604800 })],
      }),
      'GET'
    ),
    s.registerRoute(
      /\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,
      new s.StaleWhileRevalidate({
        cacheName: 'static-image-assets',
        plugins: [new s.ExpirationPlugin({ maxEntries: 64, maxAgeSeconds: 86400 })],
      }),
      'GET'
    ),
    s.registerRoute(
      /\/_next\/image\?url=.+$/i,
      new s.StaleWhileRevalidate({
        cacheName: 'next-image',
        plugins: [new s.ExpirationPlugin({ maxEntries: 64, maxAgeSeconds: 86400 })],
      }),
      'GET'
    ),
    s.registerRoute(
      /\.(?:mp3|wav|ogg)$/i,
      new s.CacheFirst({
        cacheName: 'static-audio-assets',
        plugins: [
          new s.RangeRequestsPlugin(),
          new s.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      'GET'
    ),
    s.registerRoute(
      /\.(?:mp4)$/i,
      new s.CacheFirst({
        cacheName: 'static-video-assets',
        plugins: [
          new s.RangeRequestsPlugin(),
          new s.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      'GET'
    ),
    s.registerRoute(
      /\.(?:js)$/i,
      new s.StaleWhileRevalidate({
        cacheName: 'static-js-assets',
        plugins: [new s.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 })],
      }),
      'GET'
    ),
    s.registerRoute(
      /\.(?:css|less)$/i,
      new s.StaleWhileRevalidate({
        cacheName: 'static-style-assets',
        plugins: [new s.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 })],
      }),
      'GET'
    ),
    s.registerRoute(
      /\/_next\/data\/.+\/.+\.json$/i,
      new s.StaleWhileRevalidate({
        cacheName: 'next-data',
        plugins: [new s.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 })],
      }),
      'GET'
    ),
    s.registerRoute(
      /\.(?:json|xml|csv)$/i,
      new s.NetworkFirst({
        cacheName: 'static-data-assets',
        plugins: [new s.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 })],
      }),
      'GET'
    ),
    s.registerRoute(
      ({ url: s }) => {
        if (!(self.origin === s.origin)) return !1;
        const e = s.pathname;
        return !e.startsWith('/api/auth/') && !!e.startsWith('/api/');
      },
      new s.NetworkFirst({
        cacheName: 'apis',
        networkTimeoutSeconds: 10,
        plugins: [new s.ExpirationPlugin({ maxEntries: 16, maxAgeSeconds: 86400 })],
      }),
      'GET'
    ),
    s.registerRoute(
      ({ url: s }) => {
        if (!(self.origin === s.origin)) return !1;
        return !s.pathname.startsWith('/api/');
      },
      new s.NetworkFirst({
        cacheName: 'others',
        networkTimeoutSeconds: 10,
        plugins: [new s.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 })],
      }),
      'GET'
    ),
    s.registerRoute(
      ({ url: s }) => !(self.origin === s.origin),
      new s.NetworkFirst({
        cacheName: 'cross-origin',
        networkTimeoutSeconds: 10,
        plugins: [new s.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 3600 })],
      }),
      'GET'
    ));
});
