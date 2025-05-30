import { getModelData } from "../dataService.js";

async function createTechCompanyCategoriesChart() {
  const data = await getModelData();

  const companyMappings = {
    openai: "OpenAI",
    google: "Google",
    meta: "Meta/Facebook",
    facebook: "Meta/Facebook",
    nvidia: "NVIDIA",
    microsoft: "Microsoft",
    deepseek: "DeepSeek",
  };

  function standardizeCompany(creator) {
    if (!creator) return null;
    const creatorLower = creator.toLowerCase();
    for (const [keyword, company] of Object.entries(companyMappings)) {
      if (creatorLower.includes(keyword)) {
        return company;
      }
    }
    return null;
  }

  const companyCategoryCounts = data.reduce((acc, model) => {
    const company = standardizeCompany(model.creators);
    if (company && model.model_category) {
      if (!acc[company]) {
        acc[company] = {};
      }
      acc[company][model.model_category] =
        (acc[company][model.model_category] || 0) + 1;
    }
    return acc;
  }, {});

  const allCategories = new Set();
  Object.values(companyCategoryCounts).forEach((categories) => {
    Object.keys(categories).forEach((category) => allCategories.add(category));
  });
  const categories = Array.from(allCategories);

  const companies = Object.keys(companyCategoryCounts);
  const datasets = categories.map((category, index) => ({
    label: category,
    data: companies.map(
      (company) => companyCategoryCounts[company][category] || 0
    ),
    backgroundColor: getCategoryColor(category),
    borderColor: "rgba(0, 0, 0, 0.1)",
    borderWidth: 0.5,
  }));

  const ctx = document
    .getElementById("techCompanyCategoriesChart")
    .getContext("2d");
  new Chart(ctx, {
    type: "bar",
    data: {
      labels: companies,
      datasets: datasets,
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: "top",
          align: "center",
          labels: {
            font: {
              size: 12,
            },
            padding: 15,
          },
          title: {
            display: true,
            text: "Model Category",
            font: {
              size: 14,
              weight: "bold",
            },
            padding: 10,
          },
        },
      },
      scales: {
        x: {
          grid: {
            display: false,
          },
          ticks: {
            font: {
              size: 12,
            },
          },
        },
        y: {
          beginAtZero: true,
          grid: {
            color: "rgba(0, 0, 0, 0.1)",
            drawBorder: false,
          },
          ticks: {
            font: {
              size: 12,
            },
          },
          title: {
            display: true,
            text: "Number of Models",
            font: {
              size: 14,
              weight: "bold",
            },
          },
        },
      },
    },
  });
}

function getCategoryColor(category) {
  const colorMap = {
    Multimodal: "#4B0082", // Dark purple
    "Natural Language Processing": "#663399", // Medium purple
    "Computer Vision": "#B87CB9", // Light purple-pink
    Tabular: "#D8BFD8", // Thistle
    Audio: "#E6E6FA", // Lavender
  };
  return colorMap[category] || "#808080"; // Default gray for unknown categories
}

export { createTechCompanyCategoriesChart };
