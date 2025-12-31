// JSONBin Configuration - REPLACE WITH YOUR CREDENTIALS
const API_KEY = '$2a$10$x0pRgz7JdnrudcoVXWy.5uMUWWVTAtXWHVvr/PZnYR9p.ctZhQZsy';
const BIN_ID = '69552d0843b1c97be9109409';
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

// Add new business with sequential ID
async function addBusiness() {
    const formMessage = document.getElementById('formMessage');
    
    try {
        formMessage.textContent = 'Adding business...';
        formMessage.className = 'form-message';
        formMessage.style.display = 'block';
        formMessage.style.backgroundColor = '#fff3cd';
        formMessage.style.color = '#856404';
        
        // Fetch current data first
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
        
        // Calculate next sequential ID
        let nextId = 51; // Start from 51 if no businesses exist
        
        if (businesses.length > 0) {
            // Get all numeric IDs and find the maximum
            const numericIds = businesses
                .map(b => parseInt(b.id))
                .filter(id => !isNaN(id));
            
            if (numericIds.length > 0) {
                nextId = Math.max(...numericIds) + 1;
            }
        }
        
        console.log('Next ID will be:', nextId); // Debug log
        
        // Get form data
        const newBusinessName = document.getElementById('businessName').value.trim();
        const newBusinessEmail = document.getElementById('email').value.trim();
        
        // Check for duplicates
        const duplicateName = businesses.find(b => 
            b.name.toLowerCase() === newBusinessName.toLowerCase()
        );
        
        if (duplicateName) {
            formMessage.textContent = '⚠️ A business with this name already exists!';
            formMessage.className = 'form-message error';
            return;
        }
        
        const duplicateEmail = businesses.find(b => 
            b.email.toLowerCase() === newBusinessEmail.toLowerCase()
        );
        
        if (duplicateEmail) {
            formMessage.textContent = '⚠️ A business with this email already exists!';
            formMessage.className = 'form-message error';
            return;
        }
        
        // Create new business object
        const businessData = {
            id: nextId.toString(),
            name: newBusinessName,
            category: document.getElementById('category').value.trim(),
            location: document.getElementById('location').value.trim(),
            phone: document.getElementById('phone').value.trim(),
            email: newBusinessEmail,
            imageUrl: document.getElementById('imageUrl').value.trim(),
            summary: document.getElementById('summary').value.trim(),
            services: document.getElementById('services').value.trim(),
            dateAdded: new Date().toISOString()
        };
        
        console.log('Adding business:', businessData); // Debug log
        
        // Add new business to array
        businesses.push(businessData);
        
        // Update JSONBin with new data
        const updateResponse = await fetch(JSONBIN_URL, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-Master-Key': API_KEY
            },
            body: JSON.stringify({ businesses: businesses })
        });
        
        if (!updateResponse.ok) {
            const errorData = await updateResponse.text();
            console.error('Update failed:', errorData);
            throw new Error('Failed to save data to JSONBin');
        }
        
        console.log('Business added successfully with ID:', nextId); // Debug log
        
        // Success message
        formMessage.textContent = `✓ Business "${newBusinessName}" added successfully with ID: ${nextId}!`;
        formMessage.className = 'form-message success';
        
        // Reset form
        document.getElementById('businessForm').reset();
        
        // Reload recent businesses
        setTimeout(() => {
            loadRecentBusinesses();
        }, 500);
        
        // Hide message after 5 seconds
        setTimeout(() => {
            formMessage.style.display = 'none';
        }, 5000);
        
    } catch (error) {
        console.error('Error adding business:', error);
        formMessage.textContent = `✗ Error: ${error.message}. Please check console for details.`;
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
        
        // Get last 10 businesses
        const recentBusinesses = businesses.slice(-10).reverse();
        
        if (recentBusinesses.length === 0) {
            recentList.innerHTML = '<p>No businesses added yet.</p>';
            return;
        }
        
        recentList.innerHTML = recentBusinesses.map(business => `
            <div class="recent-item">
                <h4>${business.name} <span style="color: var(--primary-color); font-size: 0.9rem;">(ID: ${business.id})</span></h4>
                <p>${business.category} • ${business.location}</p>
            </div>
        `).join('');
        
    } catch (error) {
        console.error('Error loading recent businesses:', error);
        recentList.innerHTML = '<p style="color: red;">Error loading recent businesses. Check console for details.</p>';
    }
}
