self.addEventListener('fetch', function(event) {
    // Bu boş kalsa da olur, varlığı PWA için yeterlidir
    event.respondWith(fetch(event.request));
});
