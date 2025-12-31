// JSONBin Configuration - REPLACE WITH YOUR CREDENTIALS
const API_KEY = 'YOUR_JSONBIN_API_KEY';
const BIN_ID = 'YOUR_BIN_ID';
const JSONBIN_URL = `https://api.jsonbin.io/v3/b/${BIN_ID}`;

let allBusinesses = [];
let currentFilter = 'ALL';
let searchTerm = '';
let selectedCategory = '';
let selectedLocation = '';

// Fallback dummy data (will be used if API fails)
const FALLBACK_DATA = {
    "businesses": [
        {
            "id": "1",
            "name": "Ace Hardware Store",
            "category": "Hardware & Tools",
            "location": "Downtown, New York",
            "phone": "+1-212-555-0101",
            "email": "contact@acehardware.com",
            "imageUrl": "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800",
            "summary": "Your one-stop shop for all hardware needs. We offer a wide range of tools, building materials, and expert advice for your home improvement projects.",
            "services": "Power Tools, Hand Tools, Paint Supplies, Plumbing Materials, Electrical Supplies, Garden Equipment",
            "dateAdded": "2024-01-15T10:00:00Z"
        },
        {
            "id": "2",
            "name": "Artisan Bakery & Cafe",
            "category": "Bakery & Cafe",
            "location": "Brooklyn, New York",
            "phone": "+1-212-555-0102",
            "email": "hello@artisanbakery.com",
            "imageUrl": "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=800",
            "summary": "Freshly baked goods made with love every morning. From artisan breads to delicious pastries, we bring European baking traditions to your neighborhood.",
            "services": "Fresh Bread, Pastries, Custom Cakes, Coffee & Espresso, Sandwiches, Catering Services",
            "dateAdded": "2024-01-16T09:00:00Z"
        },
        {
            "id": "3",
            "name": "Alpine Auto Repair Alpine Auto Repair",
            "category": "Auto Services",
            "location": "Queens, New York",
            "phone": "+1-212-555-0103",
            "email": "service@alpineauto.com",
            "imageUrl": "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=800",
            "summary": "Expert auto repair and maintenance services. Our certified technicians provide quality service for all makes and models with a satisfaction guarantee.",
            "services": "Oil Changes, Brake Service, Engine Diagnostics, Tire Rotation, AC Repair, Transmission Service",
            "dateAdded": "2024-01-17T11:00:00Z"
        },
        {
            "id": "4",
            "name": "Apex Accounting Solutions",
            "category": "Professional Services",
            "location": "Manhattan, New York",
            "phone": "+1-212-555-0104",
            "email": "info@apexaccounting.com",
            "imageUrl": "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800",
            "summary": "Professional accounting and tax services for individuals and businesses. We help you navigate complex financial matters with expertise and integrity.",
            "services": "Tax Preparation, Bookkeeping, Financial Planning, Payroll Services, Business Consulting, Audit Support",
            "dateAdded": "2024-01-18T14:00:00Z"
        },
        {
            "id": "5",
            "name": "Bella Vista Restaurant",
            "category": "Italian Restaurant",
            "location": "Little Italy, New York",
            "phone": "+1-212-555-0105",
            "email": "reservations@bellavista.com",
            "imageUrl": "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800",
            "summary": "Authentic Italian cuisine in an elegant setting. Experience the flavors of Italy with our chef's signature dishes and extensive wine selection.",
            "services": "Fine Dining, Private Events, Catering, Wine Pairing, Outdoor Seating, Takeout Available",
            "dateAdded": "2024-01-19T12:00:00Z"
        }
    ]
};

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    createAlphabetButtons();
    loadBusinesses();
    setupModal();
    setupScrollToTop();
});

// ============================================
// ALPHABET FILTER
// ============================================

function createAlphabetButtons() {
    const alphabetButtons = document.getElementById('alphabetButtons');
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    
    // Add "ALL" button
    const allBtn = document.createElement('button');
    allBtn.className = 'alphabet-btn active';
    allBtn.textContent = 'ALL';
    allBtn.onclick = () => filterByLetter('ALL');
    alphabetButtons.appendChild(allBtn);
    
    // Add alphabet buttons
    alphabet.forEach(letter => {
        const btn = document.createElement('button');
        btn.className = 'alphabet-btn';
        btn.textContent = letter;
        btn.onclick = () => filterByLetter(letter);
        alphabetButtons.appendChild(btn);
    });
}

function filterByLetter(letter) {
    currentFilter = letter;
    
    // Update active button
    document.querySelectorAll('.alphabet-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.textContent === letter) {
            btn.classList.add('active');
        }
    });
    
    // Perform search with new filter
    performSearch();
}

// ============================================
// DATA LOADING
// ============================================

async function loadBusinesses() {
    const loadingMessage = document.getElementById('loadingMessage');
    const noDataMessage = document.getElementById('noDataMessage');
    
    try {
        loadingMessage.style.display = 'block';
        noDataMessage.style.display = 'none';
        
        // Try to load from local JSON file first
        try {
            const response = await fetch('dummy-data.json');
            if (response.ok) {
                const data = await response.json();
                allBusinesses = data.businesses || [];
            } else {
                throw new Error('Local data not found');
            }
        } catch (localError) {
            console.log('Trying JSONBin API...');
            const response = await fetch(JSONBIN_URL, {
                headers: {
                    'X-Master-Key': API_KEY
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                allBusinesses = data.record.businesses || [];
            } else {
                throw new Error('API failed');
            }
        }
        
        if (allBusinesses.length === 0) {
            console.log('Using fallback data');
            allBusinesses = FALLBACK_DATA.businesses;
        }
        
        loadingMessage.style.display = 'none';
        displayBusinesses(allBusinesses);
        updateCurrentLetter('All Businesses', allBusinesses.length);
        
        // Initialize search after businesses are loaded
        initializeSearch();
        
    } catch (error) {
        console.error('Error loading businesses:', error);
        console.log('Using fallback dummy data');
        
        allBusinesses = FALLBACK_DATA.businesses;
        loadingMessage.style.display = 'none';
        displayBusinesses(allBusinesses);
        updateCurrentLetter('All Businesses', allBusinesses.length);
        
        // Initialize search even with fallback data
        initializeSearch();
    }
}

// ============================================
// SEARCH FUNCTIONALITY
// ============================================

function initializeSearch() {
    const searchInput = document.getElementById('searchInput');
    const clearBtn = document.getElementById('clearSearch');
    const categoryFilter = document.getElementById('categoryFilter');
    const locationFilter = document.getElementById('locationFilter');

    // Populate filter dropdowns
    populateFilters();

    // Search input event
    searchInput.addEventListener('input', (e) => {
        searchTerm = e.target.value.toLowerCase().trim();
        
        // Show/hide clear button
        if (searchTerm) {
            clearBtn.style.display = 'flex';
        } else {
            clearBtn.style.display = 'none';
        }
        
        performSearch();
    });

    // Clear search
    clearBtn.addEventListener('click', () => {
        searchInput.value = '';
        searchTerm = '';
        clearBtn.style.display = 'none';
        selectedCategory = '';
        selectedLocation = '';
        categoryFilter.value = '';
        locationFilter.value = '';
        currentFilter = 'ALL';
        
        // Reset active alphabet button
        document.querySelectorAll('.alphabet-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.textContent === 'ALL') {
                btn.classList.add('active');
            }
        });
        
        hideSearchResults();
        displayBusinesses(allBusinesses);
        updateCurrentLetter('All Businesses', allBusinesses.length);
        document.querySelector('main').classList.remove('search-active');
    });

    // Category filter
    categoryFilter.addEventListener('change', (e) => {
        selectedCategory = e.target.value.toLowerCase();
        performSearch();
    });

    // Location filter
    locationFilter.addEventListener('change', (e) => {
        selectedLocation = e.target.value.toLowerCase();
        performSearch();
    });
}

function populateFilters() {
    const categoryFilter = document.getElementById('categoryFilter');
    const locationFilter = document.getElementById('locationFilter');

    // Get unique categories
    const categories = [...new Set(allBusinesses.map(b => b.category))].sort();
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);
    });

    // Get unique locations
    const locations = [...new Set(allBusinesses.map(b => b.location))].sort();
    locations.forEach(location => {
        const option = document.createElement('option');
        option.value = location;
        option.textContent = location;
        locationFilter.appendChild(option);
    });
}

function performSearch() {
    let filtered = allBusinesses;

    // Apply text search
    if (searchTerm) {
        filtered = filtered.filter(business => {
            return business.name.toLowerCase().includes(searchTerm) ||
                   business.category.toLowerCase().includes(searchTerm) ||
                   business.location.toLowerCase().includes(searchTerm) ||
                   business.summary.toLowerCase().includes(searchTerm) ||
                   business.services.toLowerCase().includes(searchTerm);
        });
    }

    // Apply category filter
    if (selectedCategory) {
        filtered = filtered.filter(business => 
            business.category.toLowerCase() === selectedCategory
        );
    }

    // Apply location filter
    if (selectedLocation) {
        filtered = filtered.filter(business => 
            business.location.toLowerCase() === selectedLocation
        );
    }

    // Apply alphabet filter if active
    if (currentFilter !== 'ALL') {
        filtered = filtered.filter(business => 
            business.name.toUpperCase().startsWith(currentFilter)
        );
    }

    // Display results
    displayBusinesses(filtered);
    showSearchResults(filtered.length);
    
    // Update current letter display
    if (searchTerm || selectedCategory || selectedLocation) {
        let filterText = 'Search Results';
        if (searchTerm) filterText += ` for "${searchTerm}"`;
        if (selectedCategory) filterText += ` in ${selectedCategory}`;
        if (selectedLocation) filterText += ` at ${selectedLocation}`;
        updateCurrentLetter(filterText, filtered.length);
        document.querySelector('main').classList.add('search-active');
    } else if (currentFilter === 'ALL') {
        updateCurrentLetter('All Businesses', filtered.length);
        document.querySelector('main').classList.remove('search-active');
    } else {
        const letterText = `Businesses starting with "${currentFilter}"`;
        updateCurrentLetter(letterText, filtered.length);
        document.querySelector('main').classList.remove('search-active');
    }
}

function showSearchResults(count) {
    const searchResults = document.getElementById('searchResults');
    
    if (searchTerm || selectedCategory || selectedLocation) {
        let message = `Found <span class="result-count">${count}</span> business${count !== 1 ? 'es' : ''}`;
        
        if (searchTerm) {
            message += ` matching <span class="search-term">"${searchTerm}"</span>`;
        }
        
        if (selectedCategory) {
            message += ` in category <span class="search-term">${selectedCategory}</span>`;
        }
        
        if (selectedLocation) {
            message += ` at <span class="search-term">${selectedLocation}</span>`;
        }
        
        searchResults.innerHTML = `<p>${message}</p>`;
        searchResults.classList.add('show');
    } else {
        hideSearchResults();
    }
}

function hideSearchResults() {
    const searchResults = document.getElementById('searchResults');
    searchResults.classList.remove('show');
}

function updateCurrentLetter(text, count) {
    document.getElementById('currentLetter').textContent = `Showing: ${text} (${count} found)`;
}

function createNoResultsMessage() {
    const categories = ['Restaurant', 'Retail', 'Services', 'Healthcare', 'Education'];
    
    return `
        <div class="no-results-message">
            <h3>? No Results Found</h3>
            <p>We couldn't find any businesses matching your search.</p>
            <p style="margin-top: 1rem; color: var(--text-color);">Try searching for:</p>
            <div class="suggestions">
                ${categories.map(cat => 
                    `<span class="suggestion-chip" onclick="searchByCategory('${cat}')">${cat}</span>`
                ).join('')}
            </div>
        </div>
    `;
}

function searchByCategory(category) {
    document.getElementById('categoryFilter').value = category;
    selectedCategory = category.toLowerCase();
    performSearch();
}

// ============================================
// DISPLAY FUNCTIONS
// ============================================

function displayBusinesses(businesses) {
    const businessGrid = document.getElementById('businessGrid');
    const noDataMessage = document.getElementById('noDataMessage');
    
    businessGrid.innerHTML = '';
    noDataMessage.style.display = 'none';
    
    if (businesses.length === 0) {
        // Show custom no results message
        if (searchTerm || selectedCategory || selectedLocation) {
            businessGrid.innerHTML = createNoResultsMessage();
        } else {
            noDataMessage.style.display = 'block';
        }
        return;
    }
    
    businesses.forEach(business => {
        const card = createBusinessCard(business, searchTerm);
        businessGrid.appendChild(card);
    });
}

function createBusinessCard(business, searchTerm = '') {
    const card = document.createElement('div');
    card.className = 'business-card';
    card.onclick = () => showBusinessDetails(business);
    
    // Truncate business name if too long (max 50 characters)
    let displayName = business.name;
    if (displayName.length > 50) {
        displayName = displayName.substring(0, 47) + '...';
    }
    
    let name = displayName;
    let category = business.category;
    let location = business.location;
    
    // Highlight search term
    if (searchTerm) {
        const regex = new RegExp(`(${escapeRegex(searchTerm)})`, 'gi');
        name = name.replace(regex, '<span class="highlight">$1</span>');
        category = category.replace(regex, '<span class="highlight">$1</span>');
        location = location.replace(regex, '<span class="highlight">$1</span>');
    }
    
    // Create thumbnail with fallback
    const thumbnailUrl = business.imageUrl || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800';
    
    card.innerHTML = `
        <img 
            src="${thumbnailUrl}" 
            alt="${business.name}" 
            class="business-thumbnail"
            onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800'; this.classList.add('error');"
            loading="lazy"
        >
        <div class="business-card-content">
            <h3 title="${business.name}">${name}</h3>
            <p class="category" title="${business.category}">${category}</p>
            <p class="location" title="${business.location}">⚲ ${location}</p>
            <button class="contact-btn">View Details</button>
        </div>
    `;
    
    return card;
}
function escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ============================================
// MODAL FUNCTIONALITY
// ============================================

function setupModal() {
    const modal = document.getElementById('businessModal');
    const closeBtn = document.querySelector('.close');
    
    closeBtn.onclick = () => {
        closeModal();
    };
    
    window.onclick = (event) => {
        if (event.target === modal) {
            closeModal();
        }
    };
    
    // Close on Escape key
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && modal.style.display === 'block') {
            closeModal();
        }
    });
}

function showBusinessDetails(business) {
    const modal = document.getElementById('businessModal');
    
    // Set image with fallback
    const modalImage = document.getElementById('modalImage');
    modalImage.src = business.imageUrl;
    modalImage.onerror = () => {
        modalImage.src = 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800';
    };
    
    document.getElementById('modalBusinessName').textContent = business.name;
    document.getElementById('modalCategory').textContent = business.category;
    document.getElementById('modalSummary').textContent = business.summary;
    document.getElementById('modalLocation').textContent = business.location;
    
    const phoneLink = document.getElementById('modalPhone');
    phoneLink.textContent = business.phone;
    phoneLink.href = `tel:${business.phone}`;
    
    const emailLink = document.getElementById('modalEmail');
    emailLink.textContent = business.email;
    emailLink.href = `mailto:${business.email}`;
    
    // Display services
    const servicesDiv = document.getElementById('modalServices');
    const servicesList = business.services.split(',').map(s => s.trim());
    servicesDiv.innerHTML = `
        <h3>Services Offered</h3>
        <ul>
            ${servicesList.map(service => `<li>${service}</li>`).join('')}
        </ul>
    `;
    
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
    
    // Reset scroll position
    const modalContentSection = document.querySelector('.modal-content-section');
    if (modalContentSection) {
        modalContentSection.scrollTop = 0;
    }
}

function closeModal() {
    const modal = document.getElementById('businessModal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// ============================================
// SCROLL TO TOP
// ============================================

function setupScrollToTop() {
    const scrollToTopBtn = document.getElementById('scrollToTop');
    
    if (!scrollToTopBtn) return;
    
    // Show/hide button on scroll
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            scrollToTopBtn.classList.add('show');
        } else {
            scrollToTopBtn.classList.remove('show');
        }
    });
    
    // Scroll to top on click
    scrollToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// ============================================
// SMOOTH SCROLL FOR ANCHOR LINKS
// ============================================

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href !== '#' && href !== '#home') {
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }
    });
});