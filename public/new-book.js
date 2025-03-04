
// Fetch authors and populate dropdown
async function fetchAuthors() {
    try {
        const response = await fetch('/authors');
        const authors = await response.json();
        const authorSelect = document.getElementById('author');

        authorSelect.innerHTML = `
    <option value="" disabled selected>Select an author</option>
    ${authors.map(author => `
                        <option value="${author.name}">${author.name}</option>
                    `).join('')}
    <option value="new">Create new author</option>
    `;
    } catch (error) {
        console.error('Error fetching authors:', error);
    }
}
// Initialize on page load
window.addEventListener('DOMContentLoaded', fetchAuthors);

// Handle form submission
async function submitFormData(e) {
    e.preventDefault();
    const formData = new FormData(e.target);

    if (formData.get('author') === 'new') {
        formData.set('author', formData.get('newAuthorName'));
    }

    try {
        const response = await fetch('/add-book', {
            method: 'POST',
            body: formData
        });

        const result = await response.json();

        if (result.message === "Book added successfully") {
            alert('Book added!');
            window.location.href = '/';
        } else {
            throw new Error(result.error || 'Failed to add book');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error adding book: ' + error.message);
    }
}

document.getElementById('bookForm').addEventListener('submit', submitFormData);

// Handle author selection change
function handleAuthorChange(event) {
    const isNewAuthor = event.target.value === 'new';
    document.getElementById('newAuthorNameSection').style.display = isNewAuthor ? 'block' : 'none';
    document.getElementById('authorImageSection').style.display = isNewAuthor ? 'block' : 'none';

    document.getElementById('newAuthorName').toggleAttribute('required', isNewAuthor);
    document.querySelector('input[name="authorImage"]').toggleAttribute('required', isNewAuthor);
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

// File upload visual feedback
document.querySelectorAll('.upload-area input[type="file"]').forEach(input => {
    input.addEventListener('change', function (e) {
        const file = e.target.files[0];
        const uploadArea = this.closest('.upload-area');
        const fileNameDisplay = uploadArea.querySelector('.file-name') || document.createElement('span');

        // Clear existing file name
        uploadArea.querySelectorAll('.file-name').forEach(el => el.remove());

        if (file) {
            // Create and append new file name element
            fileNameDisplay.className = 'file-name';
            fileNameDisplay.textContent = file.name;
            uploadArea.appendChild(fileNameDisplay);

            uploadArea.style.borderColor = '#48bb78';
            uploadArea.querySelector('i').style.color = '#48bb78';
        } else {
            uploadArea.style.borderColor = '#cbd5e0';
            uploadArea.querySelector('i').style.color = '#cbd5e0';
        }
    });
});

// Drag and drop visual feedback
document.querySelectorAll('.upload-area').forEach(area => {
    area.addEventListener('dragover', (e) => {
        e.preventDefault();
        area.classList.add('dragover');
    });

    area.addEventListener('dragleave', () => {
        area.classList.remove('dragover');
    });

    area.addEventListener('drop', (e) => {
        e.preventDefault();
        area.classList.remove('dragover');
    });
});


// JS to handle the mobile menu
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
