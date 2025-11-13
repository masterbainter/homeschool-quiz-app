// Google Books API Configuration - Secure Version
// Uses Firebase Remote Config to store API key

const GOOGLE_BOOKS_CONFIG = {
    apiKey: null, // Will be loaded from Firebase
    baseUrl: 'https://www.googleapis.com/books/v1',

    // Load API key from Firebase Remote Config
    async loadApiKey() {
        if (this.apiKey) return this.apiKey;

        try {
            const database = firebase.database();
            const snapshot = await database.ref('config/googleBooksApiKey').once('value');
            this.apiKey = snapshot.val();

            if (!this.apiKey) {
                console.warn('Google Books API key not found in Firebase config');
            }

            return this.apiKey;
        } catch (error) {
            console.error('Error loading Google Books API key:', error);
            return null;
        }
    },

    isConfigured() {
        return this.apiKey && this.apiKey !== 'YOUR_GOOGLE_BOOKS_API_KEY_HERE';
    }
};

const GoogleBooksAPI = {
    async searchBooks(query, maxResults = 20) {
        // Ensure API key is loaded
        await GOOGLE_BOOKS_CONFIG.loadApiKey();

        if (!GOOGLE_BOOKS_CONFIG.isConfigured()) {
            throw new Error('Google Books API key not configured');
        }

        const url = `${GOOGLE_BOOKS_CONFIG.baseUrl}/volumes?q=${encodeURIComponent(query)}&maxResults=${maxResults}&key=${GOOGLE_BOOKS_CONFIG.apiKey}`;

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Google Books API error: ${response.statusText}`);
        }

        const data = await response.json();
        return this.formatSearchResults(data);
    },

    async searchByISBN(isbn) {
        return this.searchBooks(`isbn:${isbn}`, 1);
    },

    async getBookDetails(bookId) {
        await GOOGLE_BOOKS_CONFIG.loadApiKey();

        const url = `${GOOGLE_BOOKS_CONFIG.baseUrl}/volumes/${bookId}?key=${GOOGLE_BOOKS_CONFIG.apiKey}`;
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Google Books API error: ${response.statusText}`);
        }

        const data = await response.json();
        return this.formatBookDetails(data);
    },

    formatSearchResults(data) {
        if (!data.items) {
            return [];
        }

        return data.items.map(item => this.formatBookDetails(item));
    },

    formatBookDetails(item) {
        const volumeInfo = item.volumeInfo || {};
        const imageLinks = volumeInfo.imageLinks || {};

        // Extract ISBN
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
            authorName: volumeInfo.authors ? volumeInfo.authors.join(', ') : 'Unknown Author',
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
            infoLink: volumeInfo.infoLink || null,
            previewLink: volumeInfo.previewLink || null
        };
    },

    isConfigured() {
        return GOOGLE_BOOKS_CONFIG.isConfigured();
    }
};
