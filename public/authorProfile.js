async function getAuthorDetails() {

    // Get author ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const authorId = urlParams.get('author_id');
    if (!authorId) {
        window.location.href = './authors.html';
        return;
    }

    // DOM elements
    const authorInfoContainer = document.createElement('div');
    const booksContainer = document.querySelector('.browse-section');
    const contentContainer = document.querySelector('.content-container');

    // Add back button
    const backButton = document.createElement('button');
    backButton.innerHTML = '← Back to Authors';
    backButton.className = 'back-button';
    backButton.onclick = () => window.history.back();
    contentContainer.insertBefore(backButton, contentContainer.firstChild);

    try {
        // Fetch author details
        const authorResponse = await fetch(`/api/authors/${authorId}`);
        if (!authorResponse.ok) {
            throw new Error(`Failed to fetch author: ${authorResponse.status} ${authorResponse.statusText}`);
        }
        const author = await authorResponse.json();

        // Create author info section
        authorInfoContainer.className = 'author-info';
        authorInfoContainer.innerHTML = `
            <div class="author-header">
                <img src="${author.image_url || 'https://i.pravatar.cc/150'}"
                    alt="${author.name}"
                    class="author-image">
                    <div class="author-details">
                        <h1>${author.name}</h1>
                        <p class="author-bio">${author.bio || 'Explore works by ' + author.name}</p>
                    </div>
            </div>
            `;
        contentContainer.insertBefore(authorInfoContainer, backButton.nextSibling);

        // Fetch books by author
        const booksResponse = await fetch(`/api/books?author_id=${authorId}`);
        if (!booksResponse.ok) {
            throw new Error(`Failed to fetch books: ${booksResponse.status} ${booksResponse.statusText}`);
        }
        const books = await booksResponse.json();

        // Clear existing demo content in html
        booksContainer.innerHTML = '';

        if (books.length === 0) {
            booksContainer.innerHTML = '<p class="no-books">No books found for this author.</p>';
            return;
        }

        // Function to create a book card
        const createSmallBookCard = (book) => {
            return `
            <div class="book-card small" onclick="window.location.href='/single-book.html?id=${book.id}'">
                <div class="book-cover small">
                    <img src="${book.cover_url || 'https://via.placeholder.com/150x200'}"
                        alt="${book.title}">
                </div>
                <div class="book-info small">
                    <h3>${book.title}</h3>
                    <p>${book.category || 'Uncategorized'}</p>
                    <div class="rating small">
                        <div class="stars small">
                            <span class="star filled"></span>
                            <span class="star"></span>
                            <span class="star"></span>
                            <span class="star"></span>
                            <span class="star"></span>
                        </div>
                    </div>
                </div>
            </div>
            `;
        };

        // Split books into chunks of 3 for rows
        const chunkSize = 3;
        for (let i = 0; i < books.length; i += chunkSize) {
            const bookChunk = books.slice(i, i + chunkSize);

            // Create a new row container
            const row = document.createElement('div');
            row.className = 'book-row small';

            // Add book cards to the row
            row.innerHTML = bookChunk.map(createSmallBookCard).join('');

            // Append the row to the books container
            booksContainer.appendChild(row);
        }

    } catch (error) {
        console.error('Error loading author profile:', error);
        booksContainer.innerHTML = `<p class="error">${error.message}</p>`;
    }
}

document.addEventListener('DOMContentLoaded', getAuthorDetails);


// JavaScript to handle the mobile menu
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
