import { getModelData } from '../dataService.js';
// import { fetchAndTransformData, countAndSortCategories } from '../utils/dataTransform.js'; // Removed

// Function to count and sort categories (moved from dataTransform.js)
function countAndSortCategories(data, categoryField) {
    const count = data.reduce((acc, item) => {
        const category = item[categoryField];
        if (category) {
            acc[category] = (acc[category] || 0) + 1;
        }
        return acc;
    }, {});

    return Object.entries(count)
        .sort(([,a], [,b]) => b - a);
}

async function createTaskCategoriesChart() {
    // Get data from the service
    const data = await getModelData();
    // const data = await fetchAndTransformData(); // Removed
    
    // Filter and count categories
    const sortedTasks = countAndSortCategories(data.filter(item => item.task_category), 'task_category');
    
    // Get top 20 and calculate others
    const top20 = sortedTasks.slice(0, 20);
    const otherCount = sortedTasks.slice(20)
        .reduce((sum, [,count]) => sum + count, 0);

    if (otherCount > 0) {
        top20.push(['Other', otherCount]);
    }

    // Prepare data for the chart
    const categories = top20.map(([category]) => category);
    const counts = top20.map(([,count]) => count);

    // Create color gradient
    const colors = counts.map((_, index) => {
        if (categories[index] === 'Other') {
            return '#90EE90'; // Light green for "Other"
        }
        // Calculate position in the gradient (0 to 1)
        const position = index / (categories.length - 2); // -2 to exclude "Other"
        
        // Define gradient colors
        const startColor = { r: 76, g: 44, b: 121 }; // Dark purple
        const midColor = { r: 74, g: 78, b: 120 };   // Mid blue-purple
        const endColor = { r: 72, g: 150, b: 100 };  // Teal-ish green

        let r, g, b;
        if (position < 0.5) {
            // Interpolate between start and mid color
            const p = position * 2;
            r = Math.round(startColor.r + (midColor.r - startColor.r) * p);
            g = Math.round(startColor.g + (midColor.g - startColor.g) * p);
            b = Math.round(startColor.b + (midColor.b - startColor.b) * p);
        } else {
            // Interpolate between mid and end color
            const p = (position - 0.5) * 2;
            r = Math.round(midColor.r + (endColor.r - midColor.r) * p);
            g = Math.round(midColor.g + (endColor.g - midColor.g) * p);
            b = Math.round(midColor.b + (endColor.b - midColor.b) * p);
        }

        return `rgb(${r}, ${g}, ${b})`;
    });

    // Create the chart
    const ctx = document.getElementById('taskCategoryChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: categories,
            datasets: [{
                label: 'Number of Models',
                data: counts,
                backgroundColor: colors,
                borderColor: 'rgba(0, 0, 0, 0.1)',
                borderWidth: 0.5
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `Number of Models: ${context.parsed.x}`;
                        }
                    }
                }
            },
            layout: {
                padding: {
                    top: 20,
                    right: 20,
                    bottom: 20,
                    left: 20
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)',
                        drawBorder: false
                    },
                    ticks: {
                        font: {
                            size: 12
                        }
                    },
                    title: {
                        display: true,
                        text: 'Number of Models',
                        font: {
                            size: 14,
                            weight: 'bold'
                        }
                    }
                },
                y: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        font: {
                            size: 12
                        }
                    }
                }
            }
        }
    });
}

export { createTaskCategoriesChart }; 