import { getModelData } from "../dataService.js";

async function createTopCreatorsChart() {
  const data = await getModelData();

  const creatorCount = data.reduce((acc, model) => {
    if (model.creators) {
      acc[model.creators] = (acc[model.creators] || 0) + 1;
    }
    return acc;
  }, {});

  const sortedCreators = Object.entries(creatorCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 20);

  const creators = sortedCreators.map(([creator]) => creator);
  const counts = sortedCreators.map(([, count]) => count);

  const colors = counts.map((_, index) => {
    const progress = index / (counts.length - 1);
    if (progress < 0.25) {
      return "#4B0082"; // Dark purple
    } else if (progress < 0.5) {
      return "#544B8C"; // Medium purple-blue
    } else if (progress < 0.75) {
      return "#458B74"; // Teal
    } else {
      return "#98FB98"; // Light green
    }
  });

  const ctx = document.getElementById("topCreatorsChart").getContext("2d");
  new Chart(ctx, {
    type: "bar",
    data: {
      labels: creators,
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
      indexAxis: "y",
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              return `Number of Models: ${context.parsed.x}`;
            },
          },
        },
      },
      layout: {
        padding: {
          top: 20,
          right: 120,
          bottom: 20,
          left: 20,
        },
      },
      scales: {
        x: {
          beginAtZero: true,
          grid: {
            color: "rgba(0, 0, 0, 0.1)",
            drawBorder: false,
            drawTicks: true,
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
        y: {
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
              var xPos = bar.x + 15;
              var yPos = bar.y;

              ctx.fillStyle = "#000000";
              ctx.textAlign = "left";
              ctx.textBaseline = "middle";
              ctx.font = "bold 12px Arial";
              ctx.fillText(data, xPos, yPos);
            });
          });
        },
      },
    ],
  });
}

export { createTopCreatorsChart };
