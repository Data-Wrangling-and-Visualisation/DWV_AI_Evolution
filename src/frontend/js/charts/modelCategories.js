import { getModelData } from "../dataService.js";

function countAndSortCategories(data, categoryField) {
  const count = data.reduce((acc, item) => {
    const category = item[categoryField];
    if (category) {
      acc[category] = (acc[category] || 0) + 1;
    }
    return acc;
  }, {});

  return Object.entries(count).sort(([, a], [, b]) => b - a);
}

async function createModelCategoryChart() {
  // Get data from the service
  const data = await getModelData();

  // Count and sort categories using the inlined function
  const sortedCategories = countAndSortCategories(data, "model_category");

  // Prepare data for the chart
  const categories = sortedCategories.map(([category]) => category);
  const counts = sortedCategories.map(([, count]) => count);

  // Define colors for each category
  const categoryColors = {
    "Natural Language Processing": "#4B0082", // Dark purple
    "Computer Vision": "#663399", // Medium purple
    Audio: "#8B4B8B", // Plum purple
    Multimodal: "#B87CB9", // Light purple-pink
    "Reinforcement Learning": "#D8BFD8", // Thistle
    Tabular: "#E6E6FA", // Lavender
  };

  // Create the chart
  const ctx = document.getElementById("modelCategoryChart").getContext("2d");
  new Chart(ctx, {
    type: "bar",
    data: {
      labels: categories,
      datasets: [
        {
          label: "Number of Models",
          data: counts,
          backgroundColor: categories.map(
            (category) => categoryColors[category] || "#4B0082"
          ),
          borderColor: "rgba(0, 0, 0, 0.1)",
          borderWidth: 0.5,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              return `Number of Models: ${context.parsed.y}`;
            },
          },
        },
      },
      layout: {
        padding: {
          top: 40,
          right: 20,
          bottom: 20,
          left: 20,
        },
      },
      scales: {
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
      },
    },
    plugins: [
      {
        afterDraw: function (chart) {
          var ctx = chart.ctx;
          chart.data.datasets.forEach(function (dataset, i) {
            var meta = chart.getDatasetMeta(i);
            meta.data.forEach(function (bar, index) {
              var data = dataset.data[index];
              ctx.fillStyle = "#000000";
              ctx.textAlign = "center";
              ctx.textBaseline = "bottom";
              ctx.font = "bold 12px Arial";
              ctx.fillText(data, bar.x, bar.y - 5);
            });
          });
        },
      },
    ],
  });
}

export { createModelCategoryChart };
