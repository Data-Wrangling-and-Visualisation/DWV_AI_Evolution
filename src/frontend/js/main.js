import { createModelCategoryChart } from './charts/modelCategories.js';
import { createTaskCategoriesChart } from './charts/taskCategories.js';
import { createTopCreatorsChart } from './charts/topCreators.js';
import { createTechCompaniesChart } from './charts/techCompanies.js';
import { createTechCompanyCategoriesChart } from './charts/techCompanyCategories.js';
import { createTopDownloadsChart } from './charts/topDownloads.js';
import { createModelPopularityChart } from './charts/modelPopularity.js';
import { createModelGrowthChart } from './charts/modelGrowth.js';

// Initialize Swiper and then charts
document.addEventListener('DOMContentLoaded', async () => {
    // Initialize Swiper
    const swiper = new Swiper('.model-carousel', {
        // Optional parameters
        loop: true,
        grabCursor: true,
        spaceBetween: 30,
        centeredSlides: true,

        // If we need pagination
        pagination: {
            el: '.swiper-pagination',
            clickable: true,
        },

        // Navigation arrows
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
    });

    // Initialize all charts
    await createModelCategoryChart();
    await createTaskCategoriesChart();
    await createTopCreatorsChart();
    await createTechCompaniesChart();
    await createTechCompanyCategoriesChart();
    await createTopDownloadsChart();
    await createModelPopularityChart();
    await createModelGrowthChart();
}); 