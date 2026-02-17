document.addEventListener('DOMContentLoaded', function () {
    const images = document.querySelectorAll('.post-content img');

    if (images.length > 0) {
        mediumZoom(images, {
            margin: 24,
            background: '#fff',
            scrollOffset: 0,
            zIndex: 10000,
        });
    }
});
