import { createModelCategoryChart } from "./charts/modelCategories.js";
import { createTaskCategoriesChart } from "./charts/taskCategories.js";
import { createTopCreatorsChart } from "./charts/topCreators.js";
import { createTechCompaniesChart } from "./charts/techCompanies.js";
import { createTechCompanyCategoriesChart } from "./charts/techCompanyCategories.js";
import { createTopDownloadsChart } from "./charts/topDownloads.js";
import { createModelPopularityChart } from "./charts/modelPopularity.js";
import { createModelGrowthChart } from "./charts/modelGrowth.js";
import { createOrgBubbleChart } from "./charts/orgBubbleChart.js";
import { createOrgFollowersBar } from "./charts/orgFollowersBar.js";
import { createOrgUsersBar } from "./charts/orgUsersBar.js";

export function initializeSwiper() {
  console.log("Initializing Swiper...");
  if (typeof Swiper === "undefined") {
    console.error(
      "Swiper library is not loaded. Check the script tag in index.html."
    );
    return null;
  }
  try {
    const swiper = new Swiper(".model-carousel", {
      loop: true,
      grabCursor: true,
      spaceBetween: 30,
      centeredSlides: false,
      slidesPerView: 1,
      slidesPerGroup: 1,
      allowTouchMove: false,

      pagination: {
        el: ".swiper-pagination",
        clickable: true,
      },

      navigation: {
        nextEl: ".swiper-button-next",
        prevEl: ".swiper-button-prev",
      },
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

export async function initializeAllCharts() {
  console.log("Initializing all charts...");
  try {
    await createModelCategoryChart();
    await createTaskCategoriesChart();
    await createTopCreatorsChart();
    await createTechCompaniesChart();
    await createTechCompanyCategoriesChart();
    await createTopDownloadsChart();
    await createModelPopularityChart();
    await createModelGrowthChart();
    await createOrgBubbleChart();
    await createOrgFollowersBar();
    await createOrgUsersBar();
    console.log("All charts initialized successfully.");
  } catch (error) {
    console.error("Error initializing charts:", error);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM fully loaded and parsed (main.js)");
});
