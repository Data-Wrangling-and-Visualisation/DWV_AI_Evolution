import { initGlobe, hideInfoPopup } from "./charts/globe.js";
import { initializeSwiper, initializeAllCharts } from "./main.js";
import { getModelData } from "./dataService.js";

document.addEventListener("DOMContentLoaded", () => {
  const previewScreen = document.getElementById("preview-screen");
  const mainContent = document.getElementById("main-content");
  const proceedButton = document.getElementById("proceed-button");

  if (proceedButton && previewScreen && mainContent) {
    proceedButton.addEventListener("click", async () => {
      console.log("Proceed button clicked.");
      previewScreen.classList.add("hidden");
      mainContent.classList.remove("hidden");

      await new Promise((resolve) => setTimeout(resolve, 0));

      console.log("Main content revealed. Initializing components...");

      const spinner = document.getElementById("loading-spinner");
      if (spinner) spinner.classList.remove("hidden");

      const swiper = initializeSwiper();

      try {
        await initializeAllCharts();
        console.log("Charts initialized, hiding spinner.");
      } catch (error) {
        console.error(
          "Error initializing charts, spinner might remain visible.",
          error
        );
      } finally {
        if (spinner) spinner.classList.add("hidden");
      }

      initGlobe();

      if (swiper) {
        swiper.on("slideChange", () => {
          hideInfoPopup();
        });
      } else {
        console.error(
          "Swiper initialization failed. Cannot add slideChange listener."
        );
      }

      console.log("All components initialized.");
    });
  } else {
    console.error(
      "Could not find one or more elements: #proceed-button, #preview-screen, #main-content"
    );
  }
});
