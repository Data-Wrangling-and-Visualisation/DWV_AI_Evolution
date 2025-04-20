import { getModelData } from "../dataService.js";

async function createTechCompaniesChart() {
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

  const companyCount = data.reduce((acc, model) => {
    const company = standardizeCompany(model.creators);
    if (company) {
      acc[company] = (acc[company] || 0) + 1;
    }
    return acc;
  }, {});

  const sortedCompanies = Object.entries(companyCount).sort(
    ([, a], [, b]) => b - a
  );

  const companies = sortedCompanies.map(([company]) => company);
  const counts = sortedCompanies.map(([, count]) => count);

  const colors = [
    "#4B0082", // Dark purple
    "#663399", // Medium purple
    "#8B4B8B", // Plum purple
    "#B87CB9", // Light purple-pink
    "#D8BFD8", // Thistle
    "#E6E6FA", // Lavender
  ];

  const ctx = document.getElementById("techCompaniesChart").getContext("2d");
  new Chart(ctx, {
    type: "bar",
    data: {
      labels: companies,
      datasets: [
        {
          label: "Number of Models",
          data: counts,
          backgroundColor: colors,
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
          top: 30,
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
              size: 15,
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
              var xPos = bar.x;
              var yPos = bar.y - 10;

              ctx.fillStyle = "#000000";
              ctx.textAlign = "center";
              ctx.textBaseline = "bottom";
              ctx.font = "bold 12px Arial";
              ctx.fillText(data, xPos, yPos);
            });
          });
        },
      },
    ],
  });
}

export { createTechCompaniesChart };
