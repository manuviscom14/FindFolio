// JSONBin Configuration - REPLACE WITH YOUR CREDENTIALS
const API_KEY = 'YOUR_JSONBIN_API_KEY';
const BIN_ID = 'YOUR_BIN_ID';
const JSONBIN_URL = `https://api.jsonbin.io/v3/b/${BIN_ID}`;

// Initialize admin page
document.addEventListener('DOMContentLoaded', () => {
    setupForm();
    loadRecentBusinesses();
});

// Setup form submission
function setupForm() {
    const form = document.getElementById('businessForm');
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        await addBusiness();
    });
}

// Add new business
async function addBusiness() {
    const formMessage = document.getElementById('formMessage');
    
    // Get form data
    const businessData = {
        id: Date.now().toString(),
        name: document.getElementById('businessName').value.trim(),
        category: document.getElementById('category').value.trim(),
        location: document.getElementById('location').value.trim(),
        phone: document.getElementById('phone').value.trim(),
        email: document.getElementById('email').value.trim(),
        imageUrl: document.getElementById('imageUrl').value.trim(),
        summary: document.getElementById('summary').value.trim(),
        services: document.getElementById('services').value.trim(),
        dateAdded: new Date().toISOString()
    };
    
    try {
        formMessage.textContent = 'Adding business...';
        formMessage.className = 'form-message';
        formMessage.style.display = 'block';
        formMessage.style.backgroundColor = '#fff3cd';
        formMessage.style.color = '#856404';
        
        // Fetch current data
        const getResponse = await fetch(JSONBIN_URL, {
            headers: {
                'X-Master-Key': API_KEY
            }
        });
        
        if (!getResponse.ok) {
            throw new Error('Failed to fetch current data');
        }
        
        const currentData = await getResponse.json();
        let businesses = currentData.record.businesses || [];
        
        // Add new business
        businesses.push(businessData);
        
        // Update JSONBin
        const updateResponse = await fetch(JSONBIN_URL, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-Master-Key': API_KEY
            },
            body: JSON.stringify({ businesses })
        });
        
        if (!updateResponse.ok) {
            throw new Error('Failed to save data');
        }
        
        // Success
        formMessage.textContent = '✓ Business added successfully!';
        formMessage.className = 'form-message success';
        
        // Reset form
        document.getElementById('businessForm').reset();
        
        // Reload recent businesses
        loadRecentBusinesses();
        
        // Hide message after 3 seconds
        setTimeout(() => {
            formMessage.style.display = 'none';
        }, 3000);
        
    } catch (error) {
        console.error('Error adding business:', error);
        formMessage.textContent = '✗ Error adding business. Please try again.';
        formMessage.className = 'form-message error';
    }
}

// Load recent businesses
async function loadRecentBusinesses() {
    const recentList = document.getElementById('recentList');
    
    try {
        const response = await fetch(JSONBIN_URL, {
            headers: {
                'X-Master-Key': API_KEY
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch data');
        }
        
        const data = await response.json();
        const businesses = data.record.businesses || [];
        
        // Get last 5 businesses
        const recentBusinesses = businesses.slice(-5).reverse();
        
        if (recentBusinesses.length === 0) {
            recentList.innerHTML = '<p>No businesses added yet.</p>';
            return;
        }
        
        recentList.innerHTML = recentBusinesses.map(business => `
            <div class="recent-item">
                <h4>${business.name}</h4>
                <p>${business.category} • ${business.location}</p>
            </div>
        `).join('');
        
    } catch (error) {
        console.error('Error loading recent businesses:', error);
        recentList.innerHTML = '<p style="color: red;">Error loading recent businesses.</p>';
    }
}