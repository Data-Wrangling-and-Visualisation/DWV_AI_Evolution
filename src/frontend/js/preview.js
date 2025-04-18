import { initGlobe, hideInfoPopup } from './charts/globe.js'; // Import initGlobe and hideInfoPopup
import { initializeSwiper, initializeAllCharts } from './main.js'; // Import initializers
import { getModelData } from './dataService.js';

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

            // Get spinner element
            const spinner = document.getElementById('loading-spinner');
            // Show spinner before loading starts
            if (spinner) spinner.classList.remove('hidden');

            // 1. Initialize Swiper
            const swiper = initializeSwiper();

            // 2. Initialize Charts
            try {
                await initializeAllCharts(); // Wait for charts to be created
                console.log("Charts initialized, hiding spinner.");
            } catch (error) {
                console.error("Error initializing charts, spinner might remain visible.", error);
                // Optionally, display an error message to the user here
            } finally {
                 // Hide spinner regardless of success or failure after attempting to load charts
                 if (spinner) spinner.classList.add('hidden');
            }

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