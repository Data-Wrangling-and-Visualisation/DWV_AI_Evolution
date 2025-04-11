import { initGlobe } from './globe.js'; // Import initGlobe

document.addEventListener('DOMContentLoaded', () => {
    const previewScreen = document.getElementById('preview-screen');
    const mainContent = document.getElementById('main-content');
    const proceedButton = document.getElementById('proceed-button');

    if (proceedButton) {
        proceedButton.addEventListener('click', () => {
            if (previewScreen && mainContent) {
                previewScreen.classList.add('hidden');
                mainContent.classList.remove('hidden');
                // Initialize charts or other main content functionality here if needed
                console.log("Main content revealed, initializing globe..."); // Debug log
                initGlobe(); // Initialize the globe AFTER main content is shown
            }
        });
    }
}); 