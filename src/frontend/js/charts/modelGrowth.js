import { getModelData } from "../dataService.js";

async function createModelGrowthChart() {
  try {
    const data = await getModelData();

    console.log(
      "Fetched data for growth chart via service:",
      data.length,
      "items"
    );

    if (!data || data.length === 0) {
      document.getElementById("modelGrowthContainer").innerHTML =
        '<div style="text-align:center; padding:50px;">No data available for model growth chart</div>';
      return;
    }

    // model type mapping
    const modelTypeMapping = {
      "text-generation": "NLP",
      "text-classification": "NLP",
      "question-answering": "NLP",
      summarization: "NLP",
      translation: "NLP",
      conversational: "NLP",
      "image-classification": "Vision",
      "object-detection": "Vision",
      "image-segmentation": "Vision",
      "image-to-image": "Vision",
      "text-to-image": "Multimodal",
      "text-to-video": "Multimodal",
      "image-to-text": "Multimodal",
      "visual-question-answering": "Multimodal",
      "automatic-speech-recognition": "Audio",
      "text-to-speech": "Audio",
      "audio-classification": "Audio",
      "audio-to-audio": "Audio",
    };

    // Process and organize data
    const processedData = data
      .filter((model) => model.publishing_date && model.task_category)
      .map((model) => ({
        ...model,
        publishing_date: new Date(model.publishing_date),
        model_type: modelTypeMapping[model.task_category] || "Other",
      }))
      .filter((model) => model.model_type !== "Other");

    // Group data by month, model type and task category
    const groupedByMonth = {};

    processedData.forEach((model) => {
      const date = new Date(
        model.publishing_date.getFullYear(),
        model.publishing_date.getMonth(),
        1
      );
      const dateKey = date.toISOString().slice(0, 7); // YYYY-MM format
      const modelType = model.model_type;
      const taskCategory = model.task_category;

      if (!groupedByMonth[dateKey]) {
        groupedByMonth[dateKey] = {
          date: date,
          categories: {},
        };
      }

      if (!groupedByMonth[dateKey].categories[taskCategory]) {
        groupedByMonth[dateKey].categories[taskCategory] = {
          count: 0,
          modelType: modelType,
        };
      }

      groupedByMonth[dateKey].categories[taskCategory].count++;
    });

    // Convert to array and sort by date
    const monthlyData = Object.values(groupedByMonth).sort(
      (a, b) => a.date - b.date
    );

    // Get unique task categories and model types
    const allCategories = {};
    const modelTypes = new Set();

    monthlyData.forEach((month) => {
      Object.entries(month.categories).forEach(([category, data]) => {
        allCategories[category] = data.modelType;
        modelTypes.add(data.modelType);
      });
    });

    // Create datasets for each task category
    const cumulativeCounts = {};
    const timeLabels = monthlyData.map((month) => month.date);

    Object.keys(allCategories).forEach((category) => {
      cumulativeCounts[category] = new Array(timeLabels.length).fill(0);
    });

    // Calculate cumulative counts
    monthlyData.forEach((month, monthIndex) => {
      Object.entries(month.categories).forEach(([category, data]) => {
        cumulativeCounts[category][monthIndex] = data.count;
      });

      if (monthIndex > 0) {
        Object.keys(cumulativeCounts).forEach((category) => {
          cumulativeCounts[category][monthIndex] +=
            cumulativeCounts[category][monthIndex - 1];
        });
      }
    });

    // Define colors for task categories
    const colorScheme = {
      // Audio colors (Greens/Yellows)
      "audio-classification": "rgba(152, 251, 152, 0.7)", // PaleGreen
      "audio-to-audio": "rgba(173, 255, 47, 0.7)", // GreenYellow
      "automatic-speech-recognition": "rgba(240, 230, 140, 0.7)", // Khaki
      "text-to-speech": "rgba(255, 255, 224, 0.7)", // LightYellow

      // Vision colors (Blues/Cyans)
      "image-classification": "rgba(173, 216, 230, 0.7)", // LightBlue
      "image-segmentation": "rgba(175, 238, 238, 0.7)", // PaleTurquoise
      "object-detection": "rgba(135, 206, 250, 0.7)", // LightSkyBlue
      "image-to-image": "rgba(224, 255, 255, 0.7)", // LightCyan

      // NLP colors (Purples/Pinks)
      "text-generation": "rgba(230, 230, 250, 0.7)", // Lavender
      "text-classification": "rgba(255, 182, 193, 0.7)", // LightPink
      summarization: "rgba(221, 160, 221, 0.7)", // Plum
      translation: "rgba(216, 191, 216, 0.7)", // Thistle
      "question-answering": "rgba(255, 192, 203, 0.7)", // Pink
      conversational: "rgba(211, 211, 211, 0.7)", // LightGray

      // Multimodal colors (Oranges/Browns)
      "text-to-image": "rgba(255, 218, 185, 0.7)", // PeachPuff
      "image-to-text": "rgba(245, 222, 179, 0.7)", // Wheat
      "text-to-video": "rgba(210, 180, 140, 0.7)", // Tan
      "visual-question-answering": "rgba(255, 228, 196, 0.7)", // Bisque
    };

    const ctx = document.getElementById("modelGrowthChart").getContext("2d");
    const modelTypeArray = Array.from(modelTypes).sort();
    modelTypeArray.unshift("All"); // Add "All" as first option

    const dropdownContainer = document.createElement("div");
    dropdownContainer.style.position = "absolute";
    dropdownContainer.style.top = "20px";
    dropdownContainer.style.right = "20px";
    dropdownContainer.style.zIndex = "100";
    dropdownContainer.style.padding = "10px 15px";
    dropdownContainer.style.backgroundColor = "rgba(255, 255, 255, 0.9)";
    dropdownContainer.style.borderRadius = "6px";
    dropdownContainer.style.boxShadow = "0 2px 5px rgba(0,0,0,0.15)";

    const dropdownLabel = document.createElement("label");
    dropdownLabel.textContent = "Model Type: ";
    dropdownLabel.style.fontWeight = "bold";
    dropdownLabel.style.marginRight = "10px";
    dropdownLabel.style.fontSize = "14px";

    const dropdown = document.createElement("select");
    dropdown.id = "modelTypeSelector";
    dropdown.style.padding = "8px 12px";
    dropdown.style.borderRadius = "5px";
    dropdown.style.border = "1px solid #ccc";
    dropdown.style.fontSize = "14px";
    dropdown.style.cursor = "pointer";
    dropdown.style.fontWeight = "bold";
    dropdown.style.backgroundColor = "#f8f9fa";

    modelTypeArray.forEach((type) => {
      const option = document.createElement("option");
      option.value = type;
      option.textContent = type;
      dropdown.appendChild(option);
    });

    dropdownContainer.appendChild(dropdownLabel);
    dropdownContainer.appendChild(dropdown);

    document
      .getElementById("modelGrowthContainer")
      .appendChild(dropdownContainer);

    // Function to filter datasets by model type
    function filterDatasetsByModelType(type) {
      const datasetsByType = Object.entries(cumulativeCounts)
        .filter(
          ([category, _]) => type === "All" || allCategories[category] === type
        )
        .map(([category, data]) => ({
          label: category,
          data: data,
          backgroundColor: colorScheme[category] || "rgba(100, 100, 100, 0.7)",
          borderColor:
            colorScheme[category]?.replace("0.7", "1") ||
            "rgba(100, 100, 100, 1)",
          borderWidth: 1.5,
          fill: true,
          pointRadius: 0,
          tension: 0.1,
        }));

      return datasetsByType;
    }

    const backgroundPlugin = {
      id: "custom_canvas_background_color",
      beforeDraw: (chart) => {
        const ctx = chart.canvas.getContext("2d");
        ctx.save();
        ctx.globalCompositeOperation = "destination-over";
        ctx.fillStyle = "#f7f9fc";
        ctx.fillRect(0, 0, chart.width, chart.height);
        ctx.restore();
      },
    };

    const chart = new Chart(ctx, {
      type: "line",
      data: {
        labels: timeLabels,
        datasets: filterDatasetsByModelType("All"),
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            type: "time",
            time: {
              unit: "month",
              displayFormats: {
                month: "MMM yyyy",
              },
            },
            title: {
              display: true,
              text: "Publishing Date",
              font: {
                size: 16,
                weight: "bold",
              },
              padding: { top: 15, bottom: 15 },
            },
            grid: {
              color: "rgba(0, 0, 0, 0.05)",
              tickBorderDash: [5, 5],
              drawBorder: false,
            },
            ticks: {
              padding: 12,
              font: {
                size: 14,
              },
            },
          },
          y: {
            stacked: true,
            title: {
              display: true,
              text: "Number of Models",
              font: {
                size: 16,
                weight: "bold",
              },
              padding: { top: 15, bottom: 15 },
            },
            grid: {
              color: "rgba(0, 0, 0, 0.05)",
              tickBorderDash: [5, 5],
              drawBorder: false,
            },
            ticks: {
              padding: 12,
              font: {
                size: 14,
              },
            },
          },
        },
        plugins: {
          legend: {
            position: "top",
            align: "center",
            labels: {
              padding: 20,
              boxWidth: 20,
              boxHeight: 12,
              usePointStyle: false,
              font: {
                size: 13,
                weight: "bold",
              },
            },
            title: {
              display: true,
              text: "Task Categories",
              font: {
                size: 14,
                weight: "bold",
              },
              padding: { bottom: 10 },
            },
            maxHeight: 150,
            maxWidth: 600,
          },
          title: {
            display: true,
            text: "Growth of AI Models Over Time",
            font: {
              size: 18,
              weight: "bold",
            },
            padding: {
              top: 10,
              bottom: 30,
            },
          },
          tooltip: {
            mode: "index",
            intersect: false,
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            titleFont: {
              size: 16,
              weight: "bold",
            },
            bodyFont: {
              size: 14,
            },
            padding: 16,
            cornerRadius: 6,
            callbacks: {
              title: function (context) {
                return new Date(context[0].parsed.x).toLocaleDateString(
                  "en-US",
                  {
                    year: "numeric",
                    month: "long",
                  }
                );
              },
            },
          },
        },
      },
      plugins: [backgroundPlugin],
    });

    dropdown.addEventListener("change", function () {
      const selectedType = this.value;
      chart.data.datasets = filterDatasetsByModelType(selectedType);
      chart.options.plugins.title.text =
        selectedType === "All"
          ? "Growth of AI Models Over Time"
          : `Growth of ${selectedType} Models Over Time`;
      chart.update();
    });
  } catch (error) {
    console.error("Error creating model growth chart:", error);
    document.getElementById("modelGrowthContainer").innerHTML =
      '<div style="text-align:center; padding:50px;">Error loading chart: ' +
      error.message +
      "</div>";
  }
}

export { createModelGrowthChart };
