
async function loadBookDetails() {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const bookId = urlParams.get('id');

        if (!bookId) {
            throw new Error('Missing book ID in URL');
        }

        // Load main book details
        const response = await fetch(`/book/${bookId}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const book = await response.json();

        // Update book metadata
        document.querySelector('.book-cover-large img').src = book.cover_url || 'placeholder.jpg';
        document.querySelector('h1').textContent = book.title;
        document.querySelector('.author').textContent = `By ${book.author}`;
        document.querySelector('.book-description p').textContent = book.description;

        // Update detailed information
        document.querySelector('[data-field="category"]').textContent = book.category;
        document.querySelector('[data-field="pages"]').textContent = book.pages;
        document.querySelector('[data-field="publication_date"]').textContent = new Date(book.publication_date).getFullYear() || 'Unknown';
        document.querySelector('[data-field="author"]').textContent = book.author;

        // Setup download button
        const downloadBtn = document.getElementById('downloadButton');
        if (book.pdf_url) {
            downloadBtn.onclick = () => {
                window.open(book.pdf_url, '_blank');
            };
        } else {
            downloadBtn.disabled = true;
            downloadBtn.textContent = 'PDF unavailable';
        }

        // Load related books
        const relatedResponse = await fetch(`/books/category/${encodeURIComponent(book.category)}`);
        if (!relatedResponse.ok) {
            throw new Error('Failed to load related books');
        }
        const relatedBooks = await relatedResponse.json();
        populateRelatedBooks(relatedBooks.filter(b => b.id !== book.id));

    } catch (error) {
        console.error('Error:', error);
        alert('Failed to load book details. Please try again later.');
    }
}

// Initialize when page loads
window.addEventListener('DOMContentLoaded', loadBookDetails);

function populateRelatedBooks(books) {
    const container = document.querySelector('.scroll-container');
    container.innerHTML = '';

    if (!books || books.length === 0) {
        container.innerHTML = '<p>No related books found</p>';
        return;
    }

    const chunkSize = 3;
    for (let i = 0; i < books.length; i += chunkSize) {
        const bookChunk = books.slice(i, i + chunkSize);

        // Create new row container
        const row = document.createElement('div');
        row.className = 'book-row small';

        // Add book cards to the row
        row.innerHTML = bookChunk.map(book => `
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
    `).join('');

        container.appendChild(row);
    }
}



//search 
document.querySelector('.search-box input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const query = e.target.value.trim();
        if (query) {
            window.location.href = `/search.html?query=${encodeURIComponent(query)}`;
        }
    }
});


// Handles mobile menu
document.addEventListener('DOMContentLoaded', function () {
    const hamburgerBtn = document.querySelector('.hamburger-btn');
    const mobileNav = document.querySelector('.mobile-nav');
    const searchInputMobile = document.querySelector('.search-input-mobile');
    const searchButtonMobile = document.querySelector('.search-button-mobile');

    // Toggle mobile menu
    hamburgerBtn.addEventListener('click', function () {
        this.classList.toggle('active');
        mobileNav.classList.toggle('active');
    });

    // Handle search functionality when the search button is clicked
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
