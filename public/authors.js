
// Fetch authors from the backend
async function fetchAuthors() {
    try {
        const response = await fetch('/authors');
        return await response.json();
    } catch (error) {
        console.error('Error fetching authors:', error);
        return [];
    }
}

// Create an author card dynamically
function createAuthorCard(author) {
    return `
    <div class="author-card">
        <div class="author-content" onclick="window.location.href='author-profile.html?author_id=${author.id}'">
            <div class="author-avatar">
                <img src="${author.image_url || 'https://i.pravatar.cc/150'}" alt="${author.name}">
            </div>
            <h2>${author.name}</h2>
            <p class="text-muted">${author.bio || ''}</p>
            <div class="author-meta">
                <div class="author-books">
                    ${author.books ? author.books.slice(0, 3).map(book => `
                                <img src="${book.cover_url || 'https://via.placeholder.com/50x70'}" class="author-book-cover"
                                    alt="Book cover">
                                `).join('') : ''}
                </div>
            </div>
        </div>
    </div>
    `;
}

// Initialize the authors page
async function initializeAuthorsPage() {
    //fetch authors from backend
    const authors = await fetchAuthors();
    const container = document.getElementById('authorsContainer');

    if (authors.length > 0) {
        // Populate the authors grid
        container.innerHTML = authors.map(createAuthorCard).join('');
    } else {
        container.innerHTML = `
                <div class="no-authors">
                    <p>No authors found. Check back later!</p>
                </div>
                `;
    }
}

// Initialize the page when it loads
window.addEventListener('DOMContentLoaded', initializeAuthorsPage);


//search 
document.querySelector('.search-box input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const query = e.target.value.trim();
        if (query) {
            window.location.href = `/search.html?query=${encodeURIComponent(query)}`;
        }
    }
});

// handles the mobile menu
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
