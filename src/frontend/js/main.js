// import Swiper from 'https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.mjs'; // Remove this import
import { createModelCategoryChart } from './charts/modelCategories.js'; // Corrected path
import { createTaskCategoriesChart } from './charts/taskCategories.js'; // Corrected import name (plural)
import { createTopCreatorsChart } from './charts/topCreators.js';
import { createTechCompaniesChart } from './charts/techCompanies.js';
import { createTechCompanyCategoriesChart } from './charts/techCompanyCategories.js';
import { createTopDownloadsChart } from './charts/topDownloads.js';
import { createModelPopularityChart } from './charts/modelPopularity.js';
import { createModelGrowthChart } from './charts/modelGrowth.js';
import { createOrgBubbleChart } from './charts/orgBubbleChart.js';
import { createOrgFollowersBar } from './charts/orgFollowersBar.js'; // Import Followers Bar Chart
import { createOrgUsersBar } from './charts/orgUsersBar.js'; // Import Users Bar Chart
// Removed: import { hideInfoPopup } from './globe.js'; - will be handled in preview.js

// Function to initialize Swiper (reinstated)
export function initializeSwiper() { // Export this function
    console.log("Initializing Swiper...");
    // Use the global Swiper object from the script tag
    if (typeof Swiper === 'undefined') {
        console.error('Swiper library is not loaded. Check the script tag in index.html.');
        return null;
    }
    try {
        const swiper = new Swiper('.model-carousel', {
            // Optional parameters
            loop: true, // Set loop to true for continuous cycle
            grabCursor: true, // Keep grab cursor for visual cue, though dragging is disabled
            spaceBetween: 30,
            centeredSlides: false,
            slidesPerView: 1,
            slidesPerGroup: 1,
            allowTouchMove: false, // Disable swiping with touch/mouse

            // If we need pagination
            pagination: {
                el: '.swiper-pagination',
                clickable: true, // Keep pagination clickable if desired
            },

            // Navigation arrows
            navigation: {
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev',
            },
            // Add keyboard navigation
            keyboard: {
                enabled: true,
                onlyInViewport: false,
            },
        });
        console.log("Swiper initialized:", swiper);
        return swiper;
    } catch (error) {
        console.error("Error initializing Swiper:", error);
        return null;
    }
}

// Export a function to initialize all charts
export async function initializeAllCharts() {
     console.log("Initializing all charts...");
    try {
        await createModelCategoryChart();
        await createTaskCategoriesChart(); // Corrected function call name (plural)
        await createTopCreatorsChart();
        await createTechCompaniesChart();
        await createTechCompanyCategoriesChart();
        await createTopDownloadsChart();
        await createModelPopularityChart();
        await createModelGrowthChart();
        await createOrgBubbleChart();
        await createOrgFollowersBar(); // Initialize Followers Bar Chart
        await createOrgUsersBar(); // Initialize Users Bar Chart
        console.log("All charts initialized successfully.");
    } catch (error) {
        console.error("Error initializing charts:", error);
    }
}

// Initialize Swiper and then charts - MOVED TO PREVIEW.JS
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM fully loaded and parsed (main.js)");
    // Initialization logic is now triggered by preview.js after content is visible
}); 