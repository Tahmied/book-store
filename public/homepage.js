// Fetch books from backend
async function fetchBooks() {
    try {
        const response = await fetch('/books');
        return await response.json();
    } catch (error) {
        console.error('Error fetching books:', error);
        return [];
    }
}

// Create popular book cards
function createPopularBookCard(book, index) {

    const colorClass = index % 3 === 1 ? 'purple' : index % 3 === 2 ? 'pink' : '';

    return `
    <div class="book-card ${colorClass}" onclick="window.location.href='/single-book.html?id=${book.id}'">
        <div class="book-cover">
            <img src="${book.cover_url || 'placeholder-image.jpg'}" alt="${book.title}">
        </div>
        <div class="book-info">
            <h3>${book.title}</h3>
            <p>By ${book.author}</p>

        </div>
    </div>
    `;
}

// Create book cards for browse section
function createSmallBookCard(book) {
    return `
    <div class="book-card small" onclick="window.location.href='/single-book.html?id=${book.id}'">
        <div class="book-cover small">
            <img src="${book.cover_url || 'placeholder-image.jpg'}" alt="${book.title}">
        </div>
        <div class="book-info small">
            <h3>${book.title}</h3>
            <p>${book.author}</p>
            <div class="rating small">
                <div class="stars small">
                    ${'<span class="star filled"></span>'.repeat(3)}
                    ${'<span class="star"></span>'.repeat(2)}
                </div>
            </div>
        </div>
    </div>
    `;
}


// main function populate content
async function initializePage() {
    const books = await fetchBooks();

    // Filter popular books and populate popular section
    const popularBooks = books.filter(book => book.category === 'popular');
    const popularSection = document.querySelector('.book-row.large');
    popularSection.innerHTML = popularBooks.map((book, index) => createPopularBookCard(book, index)).join('');

    // Populate Browse section
    const browseSection = document.querySelector('.browse-section');
    const existingRows = browseSection.querySelectorAll('.book-row.small');
    existingRows.forEach(row => row.remove());

    // Split books into chunks of 3 for rows
    const chunkSize = 3;
    for (let i = 0; i < books.length; i += chunkSize) {
        const bookChunk = books.slice(i, i + chunkSize);

        const row = document.createElement('div');
        row.className = 'book-row small';

        row.innerHTML = bookChunk.map(createSmallBookCard).join('');
        browseSection.appendChild(row);
    }
}

// Initialize when page loads
window.addEventListener('DOMContentLoaded', initializePage);

// Add search functionality
document.querySelector('.search-box input').addEventListener('input', async (e) => {
    const query = e.target.value;
    const response = await fetch(`/search?query=${encodeURIComponent(query)}`);
    const results = await response.json();
});

document.querySelector('.search-box input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const query = e.target.value.trim();
        if (query) {
            window.location.href = `/search.html?query=${encodeURIComponent(query)}`;
        }
    }
});

// Mobile menu handling
document.addEventListener('DOMContentLoaded', function () {
    const hamburgerBtn = document.querySelector('.hamburger-btn');
    const mobileNav = document.querySelector('.mobile-nav');
    const searchInputMobile = document.querySelector('.search-input-mobile');
    const searchButtonMobile = document.querySelector('.search-button-mobile');

    hamburgerBtn.addEventListener('click', function () {
        this.classList.toggle('active');
        mobileNav.classList.toggle('active');
    });

    // Handle search functionality when the search button is clicked in mobile menu
    searchButtonMobile.addEventListener('click', function () {
        const query = searchInputMobile.value.trim();
        if (query) {
            performSearch(query);
        }
    });

    // Handle search functionality when Enter key is pressed
    searchInputMobile.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            const query = e.target.value.trim();
            if (query) {
                performSearch(query);
            }
        }
    });

    // Perform search
    function performSearch(query) {
        window.location.href = `/search.html?query=${encodeURIComponent(query)}`;
    }
});
