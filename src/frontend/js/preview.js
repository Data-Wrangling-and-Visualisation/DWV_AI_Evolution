import { initGlobe, hideInfoPopup } from './globe.js'; // Import initGlobe and hideInfoPopup
import { initializeSwiper, initializeAllCharts } from './main.js'; // Import initializers

document.addEventListener('DOMContentLoaded', () => {
    const previewScreen = document.getElementById('preview-screen');
    const mainContent = document.getElementById('main-content');
    const proceedButton = document.getElementById('proceed-button');

    if (proceedButton && previewScreen && mainContent) {
        proceedButton.addEventListener('click', async () => { // Make listener async
            console.log("Proceed button clicked.");
            previewScreen.classList.add('hidden');
            mainContent.classList.remove('hidden');
            
            // Allow DOM updates to render before initializing
            await new Promise(resolve => setTimeout(resolve, 0)); 

            console.log("Main content revealed. Initializing components...");

            // 1. Initialize Swiper
            const swiper = initializeSwiper();

            // 2. Initialize Charts
            await initializeAllCharts(); // Wait for charts to be created

            // 3. Initialize Globe
            initGlobe(); 

            // 4. Add Swiper listener (if Swiper initialized successfully)
            if (swiper) {
                swiper.on('slideChange', () => {
                    hideInfoPopup(); // Hide globe popup on slide change
                });
            } else {
                console.error("Swiper initialization failed. Cannot add slideChange listener.");
            }

            console.log("All components initialized.");
        });
    }
    else {
        console.error("Could not find one or more elements: #proceed-button, #preview-screen, #main-content");
    }
}); 