// === FIREBASE CONFIGURATION ===
const firebaseConfig = {
  apiKey: "AIzaSyDLu-9iYvE0nxHKW5xGpyby0GvSG8UcdEA",
  authDomain: "next-bus-tracker.firebaseapp.com",
  projectId: "next-bus-tracker",
  storageBucket: "next-bus-tracker.firebasestorage.app",
  messagingSenderId: "929357337561",
  appId: "1:929357337561:web:5bec6d37b7852ff7727fc8",
  measurementId: "G-FRLKFSXDXP"
};

// Initialize Firebase using the tools exposed in index.html
const app = window.firebaseTools.initializeApp(firebaseConfig);
const auth = window.firebaseTools.getAuth(app);
const provider = new window.firebaseTools.GoogleAuthProvider();

// DOM Elements
const authSection = document.getElementById('auth-section');
const dashboardSection = document.getElementById('dashboard-section');
const loginBtn = document.getElementById('login-btn');
const logoutBtn = document.getElementById('logout-btn');
const authError = document.getElementById('auth-error');
const dataError = document.getElementById('data-error');
const userEmailSpan = document.getElementById('user-email');
const refreshBtn = document.getElementById('refresh-btn');
const lastUpdatedText = document.getElementById('last-updated-text');
const spinner = document.getElementById('loading-spinner');
const cardsGrid = document.querySelector('.cards-grid');

// Mapping Stop IDs to DOM elements
const stopMappings = {
    '9923': document.getElementById('arrivals-orenco'),
    '14593': document.getElementById('arrivals-ra1'),
    '14595': document.getElementById('arrivals-ra3')
};

let currentUserToken = null;

// Auth State Listener
window.firebaseTools.onAuthStateChanged(auth, async (user) => {
    if (user) {
        // User is signed in
        authSection.classList.add('hidden');
        dashboardSection.classList.remove('hidden');
        userEmailSpan.textContent = user.email;
        
        // Get the JWT token for the backend
        currentUserToken = await user.getIdToken();
        fetchBusData();
    } else {
        // User is signed out
        currentUserToken = null;
        authSection.classList.remove('hidden');
        dashboardSection.classList.add('hidden');
    }
});

// Login Handler
loginBtn.addEventListener('click', () => {
    authError.classList.add('hidden');
    window.firebaseTools.signInWithPopup(auth, provider)
        .catch((error) => {
            authError.textContent = `Login failed: ${error.message}`;
            authError.classList.remove('hidden');
        });
});

// Logout Handler
logoutBtn.addEventListener('click', () => {
    window.firebaseTools.signOut(auth);
});

// Refresh Handler
refreshBtn.addEventListener('click', fetchBusData);

// Fetch data from our serverless backend
async function fetchBusData() {
    if (!currentUserToken) return;

    // Show loading state
    spinner.classList.remove('hidden');
    cardsGrid.classList.add('hidden');
    dataError.classList.add('hidden');

    try {
        const response = await fetch('/api/bus-times', {
            headers: {
                'Authorization': `Bearer ${currentUserToken}`
            }
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || 'Failed to fetch bus data');
        }

        renderBusData(result.data);
        updateLastRefreshed();

    } catch (error) {
        console.error('Fetch error:', error);
        dataError.textContent = error.message;
        dataError.classList.remove('hidden');
    } finally {
        spinner.classList.add('hidden');
        cardsGrid.classList.remove('hidden');
    }
}

function renderBusData(arrivals) {
    // Clear current lists
    Object.values(stopMappings).forEach(container => {
        if(container) container.innerHTML = '';
    });

    // Group arrivals by stopId
    const groupedArrivals = arrivals.reduce((acc, curr) => {
        if (!acc[curr.stopId]) acc[curr.stopId] = [];
        acc[curr.stopId].push(curr);
        return acc;
    }, {});

    // Render for each stop
    Object.keys(stopMappings).forEach(stopId => {
        const container = stopMappings[stopId];
        if (!container) return;

        const stopArrivals = groupedArrivals[stopId];

        if (!stopArrivals || stopArrivals.length === 0) {
            container.innerHTML = '<div class="no-data">No upcoming arrivals</div>';
            return;
        }

        // Sort by estimated time
        stopArrivals.sort((a, b) => new Date(a.estimatedTime) - new Date(b.estimatedTime));

        stopArrivals.forEach(arrival => {
            const timeObj = new Date(arrival.estimatedTime);
            const diffMinutes = Math.max(0, Math.floor((timeObj - new Date()) / 60000));
            
            const timeDisplay = diffMinutes === 0 ? 'Due' : `${diffMinutes}`;
            const timeLabel = diffMinutes === 0 ? 'Now' : 'Min';
            
            const item = document.createElement('div');
            item.className = 'arrival-item';
            item.innerHTML = `
                <div class="time-box">
                    <span class="time-mins">${timeDisplay}</span>
                    <span class="time-label">${timeLabel}</span>
                </div>
                <div class="sign-box">
                    ${arrival.shortSign || 'Bus 47'}
                </div>
            `;
            container.appendChild(item);
        });
    });
}

function updateLastRefreshed() {
    const now = new Date();
    lastUpdatedText.textContent = `Last updated: ${now.toLocaleTimeString()}`;
}
