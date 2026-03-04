let sidebarVisible = false;

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('mainContent');
    const overlay = document.getElementById('sidebarOverlay');
    sidebarVisible = !sidebarVisible;

    if (sidebarVisible) {
        sidebar.classList.add('visible');
        mainContent.classList.add('sidebar-open');
        overlay.classList.add('active');
    } else {
        sidebar.classList.remove('visible');
        mainContent.classList.remove('sidebar-open');
        overlay.classList.remove('active');
    }
}

function closeSidebar() {
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('mainContent');
    const overlay = document.getElementById('sidebarOverlay');

    sidebar.classList.remove('visible');
    mainContent.classList.remove('sidebar-open');
    overlay.classList.remove('active');
    sidebarVisible = false;
}

window.onload = function() {
    // Simulate user data
    const currentUser = {name: 'Demo User', username: 'demo'};
    document.getElementById('userName').textContent = currentUser.name || currentUser.username;

    const lastLogin = new Date().toLocaleString();
    document.getElementById('lastLoginInfo').textContent = `Last login: ${lastLogin}`;

    // Set date and time
    updateDateTime();
    setInterval(updateDateTime, 1000);

    // Show quick tip
    const tips = [
        "Avoid outdoor exercise when AQI is high.",
        "Use air purifiers indoors for better air quality.",
        "Keep windows closed on high pollution days.",
        "Wear N95 masks for better protection.",
        "Check AQI before planning outdoor activities.",
        "Ventilate your home when AQI improves.",
        "Sensitive groups should take extra precautions."
    ];
    document.getElementById('quickTip').innerHTML = "<strong>💡 Quick Tip:</strong> " + tips[Math.floor(Math.random() * tips.length)];

    // Fetch AQI data from WAQI API
    simulateAQIData();
};

function updateDateTime() {
    const now = new Date();
    document.getElementById('currentDate').textContent = now.toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
    document.getElementById('currentTime').textContent = now.toLocaleTimeString('en-US', {
        hour: '2-digit', minute: '2-digit', second: '2-digit'
    });
}

function simulateAQIData() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            const { latitude, longitude } = position.coords;
            
            // WAQI API token
            const token = '73d185153b3f12724178d29b4b6dd5b51fcc1e0e';
            const url = `https://api.waqi.info/feed/geo:${latitude};${longitude}/?token=${token}`;

            fetch(url)
                .then(response => response.json())
                .then(data => {
                    if (data.status === 'ok' && data.data) {
                        const aqiData = data.data;
                        const aqi = aqiData.aqi;
                        
                        // Update location info
                        const city = aqiData.city?.name || `Lat: ${latitude.toFixed(4)}, Lon: ${longitude.toFixed(4)}`;
                        document.getElementById('userLocation').textContent = city;
                        document.getElementById('locationAqi').textContent = aqi;

                        // Update main AQI value
                        const aqiValueEl = document.getElementById('aqiValue');
                        aqiValueEl.textContent = aqi;

                        // Update pollutant values (WAQI uses iaqi object)
                        const iaqi = aqiData.iaqi || {};
                        
                        document.getElementById('pm25Value').textContent = iaqi.pm25?.v?.toFixed(1) || 'N/A';
                        document.getElementById('pm10Value').textContent = iaqi.pm10?.v?.toFixed(1) || 'N/A';
                        document.getElementById('coValue').textContent = iaqi.co?.v?.toFixed(1) || 'N/A';
                        document.getElementById('no2Value').textContent = iaqi.no2?.v?.toFixed(1) || 'N/A';
                        document.getElementById('so2Value').textContent = iaqi.so2?.v?.toFixed(1) || 'N/A';

                        // Update health tips based on AQI (US EPA scale: 0-500)
                        updateHealthTips(aqi);
                        updateActionPlan(aqi);

                        // Color coding based on US EPA AQI scale
                        if (aqi <= 50) aqiValueEl.style.color = '#43a047'; // Good
                        else if (aqi <= 100) aqiValueEl.style.color = '#fbc02d'; // Moderate
                        else if (aqi <= 150) aqiValueEl.style.color = '#ffa726'; // Unhealthy for Sensitive
                        else if (aqi <= 200) aqiValueEl.style.color = '#e53935'; // Unhealthy
                        else if (aqi <= 300) aqiValueEl.style.color = '#8e24aa'; // Very Unhealthy
                        else aqiValueEl.style.color = '#6d4c41'; // Hazardous

                        console.log('WAQI Data:', aqiData); // For debugging
                    } else {
                        console.error('No pollution data available:', data);
                        document.getElementById('userLocation').textContent = 'Data unavailable';
                        document.getElementById('locationAqi').textContent = 'N/A';
                    }
                })
                .catch(error => {
                    console.error('Error fetching AQI data:', error);
                    document.getElementById('userLocation').textContent = 'Error fetching data';
                    document.getElementById('locationAqi').textContent = 'N/A';
                });
        }, error => {
            console.error('Geolocation error:', error);
            document.getElementById('userLocation').textContent = 'Location access denied';
            document.getElementById('locationAqi').textContent = 'N/A';
        });
    } else {
        document.getElementById('userLocation').textContent = 'Geolocation not supported';
        document.getElementById('locationAqi').textContent = 'N/A';
    }
}

function updateHealthTips(aqi) {
    const healthAqiEl = document.getElementById('healthAqi');
    const categoryEl = document.getElementById('aqiCategory');
    const adviceEl = document.getElementById('mainHealthAdvice');

    if (healthAqiEl) healthAqiEl.textContent = aqi;

    // US EPA AQI Scale (0-500)
    if (aqi <= 50) {
        if (categoryEl) {
            categoryEl.textContent = 'Good';
            categoryEl.style.background = '#43a047';
            categoryEl.style.color = 'white';
        }
        if (adviceEl) adviceEl.innerHTML = '<strong>Great!</strong> Air quality is satisfactory. Outdoor activities are safe for everyone. Perfect time for exercise and outdoor recreation.';
    } else if (aqi <= 100) {
        if (categoryEl) {
            categoryEl.textContent = 'Moderate';
            categoryEl.style.background = '#fbc02d';
            categoryEl.style.color = 'white';
        }
        if (adviceEl) adviceEl.innerHTML = '<strong>Acceptable.</strong> Air quality is acceptable for most people. Unusually sensitive people should consider reducing prolonged outdoor exertion.';
    } else if (aqi <= 150) {
        if (categoryEl) {
            categoryEl.textContent = 'Unhealthy for Sensitive';
            categoryEl.style.background = '#ffa726';
            categoryEl.style.color = 'white';
        }
        if (adviceEl) adviceEl.innerHTML = '<strong>Caution!</strong> Sensitive groups (children, elderly, people with respiratory/heart conditions) should reduce prolonged outdoor exertion. General public should limit outdoor activities.';
    } else if (aqi <= 200) {
        if (categoryEl) {
            categoryEl.textContent = 'Unhealthy';
            categoryEl.style.background = '#e53935';
            categoryEl.style.color = 'white';
        }
        if (adviceEl) adviceEl.innerHTML = '<strong>Warning!</strong> Everyone may experience health effects. Sensitive groups should avoid outdoor activities. Everyone else should limit prolonged outdoor exertion.';
    } else if (aqi <= 300) {
        if (categoryEl) {
            categoryEl.textContent = 'Very Unhealthy';
            categoryEl.style.background = '#8e24aa';
            categoryEl.style.color = 'white';
        }
        if (adviceEl) adviceEl.innerHTML = '<strong>Alert!</strong> Health alert - everyone may experience serious health effects. Avoid all outdoor activities. Keep windows closed and use air purifiers.';
    } else {
        if (categoryEl) {
            categoryEl.textContent = 'Hazardous';
            categoryEl.style.background = '#6d4c41';
            categoryEl.style.color = 'white';
        }
        if (adviceEl) adviceEl.innerHTML = '<strong>Emergency!</strong> Health warning of emergency conditions. Everyone should avoid all outdoor exposure. Stay indoors with air purifiers running continuously.';
    }
}

function updateActionPlan(aqi) {
    const planEl = document.getElementById('actionPlanText');
    if (!planEl) return;

    if (aqi <= 50) {
        planEl.innerHTML = '✅ <strong>Air Quality is Good!</strong> Safe to enjoy outdoor activities. Consider opening windows for natural ventilation.';
        planEl.parentElement.style.background = 'linear-gradient(135deg, #e8f5e9, #c8e6c9)';
        planEl.parentElement.style.borderLeftColor = '#2e7d32';
        planEl.style.color = '#1b5e20';
    } else if (aqi <= 100) {
        planEl.innerHTML = '⚠️ <strong>Moderate Air Quality.</strong> Most people can enjoy normal outdoor activities. Sensitive individuals should watch for symptoms.';
        planEl.parentElement.style.background = 'linear-gradient(135deg, #fff9c4, #fff59d)';
        planEl.parentElement.style.borderLeftColor = '#f9a825';
        planEl.style.color = '#f57f17';
    } else if (aqi <= 150) {
        planEl.innerHTML = '🟠 <strong>Unhealthy for Sensitive Groups.</strong> Wear masks outdoors, run air purifiers, and limit outdoor time for vulnerable populations.';
        planEl.parentElement.style.background = 'linear-gradient(135deg, #fff3e0, #ffe0b2)';
        planEl.parentElement.style.borderLeftColor = '#f57c00';
        planEl.style.color = '#e65100';
    } else if (aqi <= 200) {
        planEl.innerHTML = '🔴 <strong>Unhealthy Air Quality!</strong> Everyone should wear N95 masks outdoors, close all windows, run air purifiers, and minimize outdoor exposure.';
        planEl.parentElement.style.background = 'linear-gradient(135deg, #ffebee, #ffcdd2)';
        planEl.parentElement.style.borderLeftColor = '#d32f2f';
        planEl.style.color = '#c62828';
    } else {
        planEl.innerHTML = '🚨 <strong>Very Unhealthy/Hazardous!</strong> Stay indoors, seal all entry points, run multiple air purifiers, and avoid all outdoor exposure.';
        planEl.parentElement.style.background = 'linear-gradient(135deg, #f3e5f5, #e1bee7)';
        planEl.parentElement.style.borderLeftColor = '#7b1fa2';
        planEl.style.color = '#4a148c';
    }
}

function actionAlert(title, message) {
    alert('📋 ' + title + '\n\n' + message);
}

function logout() {
    window.location.href = '/landing_page/index.html';
}

function showSection(sectionId) {
    // Hide all content sections
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => {
        section.classList.remove('active');
    });

    // Show the selected content section
    const selectedSection = document.getElementById(sectionId);
    if (selectedSection) {
        selectedSection.classList.add('active');
    }

    // Update active state in sidebar
    const sidebarItems = document.querySelectorAll('.sidebar-item');
    sidebarItems.forEach(item => {
        item.classList.remove('active');
    });

    const selectedSidebarItem = document.querySelector(`.sidebar-item[onclick="showSection('${sectionId}')"]`);
    if (selectedSidebarItem) {
        selectedSidebarItem.classList.add('active');
    }

    // Close sidebar on mobile after selection
    if (window.innerWidth <= 768) {
        closeSidebar();
    }
}