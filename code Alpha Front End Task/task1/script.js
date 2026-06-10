const galleryItems = document.querySelectorAll('.gallery-item');
const filterBtns = document.querySelectorAll('.filter-btn');
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const closeBtn = document.querySelector('.close-btn');

let currentIndex = 0;

// Filtering Logic
filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelector('.filter-btn.active').classList.remove('active');
        btn.classList.add('active');
        const filter = btn.getAttribute('data-filter');

        galleryItems.forEach(item => {
            if (filter === 'all' || item.getAttribute('data-category') === filter) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });
    });
});

// Lightbox Open
galleryItems.forEach((item, index) => {
    item.addEventListener('click', () => {
        currentIndex = index;
        showImage(item.querySelector('img').src);
    });
});

function showImage(src) {
    lightboxImg.src = src;
    lightbox.style.display = 'flex';
}

// Navigation
document.getElementById('nextBtn').addEventListener('click', () => {
    currentIndex = (currentIndex + 1) % galleryItems.length;
    showImage(galleryItems[currentIndex].querySelector('img').src);
});

document.getElementById('prevBtn').addEventListener('click', () => {
    currentIndex = (currentIndex - 1 + galleryItems.length) % galleryItems.length;
    showImage(galleryItems[currentIndex].querySelector('img').src);
});

// Close
closeBtn.onclick = () => lightbox.style.display = 'none';