// Google Books API Configuration
// Get your API key from: https://console.cloud.google.com/apis/credentials

const GOOGLE_BOOKS_CONFIG = {
    // TODO: Replace with your actual Google Books API key
    // Get one from: https://console.cloud.google.com/apis/credentials
    // Enable the "Books API" in Google Cloud Console
    apiKey: 'YOUR_GOOGLE_BOOKS_API_KEY_HERE',
    baseUrl: 'https://www.googleapis.com/books/v1'
};

// Google Books API Helper Functions
const GoogleBooksAPI = {
    // Search for books by query (title, author, ISBN, etc.)
    async searchBooks(query, maxResults = 20) {
        try {
            const url = `${GOOGLE_BOOKS_CONFIG.baseUrl}/volumes?q=${encodeURIComponent(query)}&maxResults=${maxResults}&key=${GOOGLE_BOOKS_CONFIG.apiKey}`;
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`Google Books API error: ${response.status}`);
            }

            const data = await response.json();
            return this.formatSearchResults(data);
        } catch (error) {
            console.error('Error searching books:', error);
            throw error;
        }
    },

    // Search by ISBN specifically
    async searchByISBN(isbn) {
        return this.searchBooks(`isbn:${isbn}`, 1);
    },

    // Get book details by Google Books ID
    async getBookDetails(volumeId) {
        try {
            const url = `${GOOGLE_BOOKS_CONFIG.baseUrl}/volumes/${volumeId}?key=${GOOGLE_BOOKS_CONFIG.apiKey}`;
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`Google Books API error: ${response.status}`);
            }

            const data = await response.json();
            return this.formatBookDetails(data);
        } catch (error) {
            console.error('Error fetching book details:', error);
            throw error;
        }
    },

    // Format search results into a cleaner structure
    formatSearchResults(data) {
        if (!data.items || data.items.length === 0) {
            return [];
        }

        return data.items.map(item => this.formatBookDetails(item));
    },

    // Format a single book's data
    formatBookDetails(item) {
        const volumeInfo = item.volumeInfo || {};
        const imageLinks = volumeInfo.imageLinks || {};

        // Get ISBN (prefer ISBN-13, fallback to ISBN-10)
        let isbn = null;
        if (volumeInfo.industryIdentifiers) {
            const isbn13 = volumeInfo.industryIdentifiers.find(id => id.type === 'ISBN_13');
            const isbn10 = volumeInfo.industryIdentifiers.find(id => id.type === 'ISBN_10');
            isbn = isbn13?.identifier || isbn10?.identifier || null;
        }

        return {
            id: item.id,
            title: volumeInfo.title || 'Unknown Title',
            subtitle: volumeInfo.subtitle || null,
            authors: volumeInfo.authors || [],
            authorName: (volumeInfo.authors || []).join(', ') || 'Unknown Author',
            publisher: volumeInfo.publisher || null,
            publishedDate: volumeInfo.publishedDate || null,
            description: volumeInfo.description || null,
            isbn: isbn,
            pageCount: volumeInfo.pageCount || null,
            categories: volumeInfo.categories || [],
            averageRating: volumeInfo.averageRating || null,
            ratingsCount: volumeInfo.ratingsCount || null,
            language: volumeInfo.language || 'en',
            coverImage: imageLinks.thumbnail || imageLinks.smallThumbnail || null,
            coverImageLarge: imageLinks.large || imageLinks.medium || imageLinks.thumbnail || null,
            previewLink: volumeInfo.previewLink || null,
            infoLink: volumeInfo.infoLink || null
        };
    },

    // Helper to clean and validate API key
    isConfigured() {
        return GOOGLE_BOOKS_CONFIG.apiKey &&
               GOOGLE_BOOKS_CONFIG.apiKey !== 'YOUR_GOOGLE_BOOKS_API_KEY_HERE' &&
               GOOGLE_BOOKS_CONFIG.apiKey.length > 10;
    }
};
