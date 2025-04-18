import { getModelData } from '../dataService.js';
// import { fetchAndTransformData } from '../utils/dataTransform.js'; // Removed

async function createTechCompaniesChart() {
    // Get data from the service
    const data = await getModelData();
    // const data = await fetchAndTransformData(); // Removed
    
    // Define major companies and their standardized names
    const companyMappings = {
        'openai': 'OpenAI',
        'google': 'Google',
        'meta': 'Meta/Facebook',
        'facebook': 'Meta/Facebook',
        'nvidia': 'NVIDIA',
        'microsoft': 'Microsoft',
        'deepseek': 'DeepSeek'
    };

    // Function to standardize company names
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

    // Count models by company
    const companyCount = data.reduce((acc, model) => {
        const company = standardizeCompany(model.creators);
        if (company) {
            acc[company] = (acc[company] || 0) + 1;
        }
        return acc;
    }, {});

    // Sort companies by count
    const sortedCompanies = Object.entries(companyCount)
        .sort(([,a], [,b]) => b - a);

    // Prepare data for the chart
    const companies = sortedCompanies.map(([company]) => company);
    const counts = sortedCompanies.map(([,count]) => count);

    // Create color gradient using magma-like colors
    const colors = [
        '#4B0082',  // Dark purple
        '#663399',  // Medium purple
        '#8B4B8B',  // Plum purple
        '#B87CB9',  // Light purple-pink
        '#D8BFD8',  // Thistle
        '#E6E6FA'   // Lavender
    ];

    // Create the chart
    const ctx = document.getElementById('techCompaniesChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: companies,
            datasets: [{
                label: 'Number of Models',
                data: counts,
                backgroundColor: colors,
                borderColor: 'rgba(0, 0, 0, 0.1)',
                borderWidth: 0.5
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `Number of Models: ${context.parsed.y}`;
                        }
                    }
                }
            },
            layout: {
                padding: {
                    top: 30,
                    right: 20,
                    bottom: 20,
                    left: 20
                }
            },
            scales: {
                y: {
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
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        font: {
                            size: 15
                        }
                    }
                }
            }
        },
        plugins: [{
            afterDraw: function(chart) {
                var ctx = chart.ctx;
                chart.data.datasets.forEach(function(dataset, i) {
                    var meta = chart.getDatasetMeta(i);
                    meta.data.forEach(function(bar, index) {
                        var data = dataset.data[index];
                        var xPos = bar.x;
                        var yPos = bar.y - 10;
                        
                        ctx.fillStyle = '#000000';
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'bottom';
                        ctx.font = 'bold 12px Arial';
                        ctx.fillText(data, xPos, yPos);
                    });
                });
            }
        }]
    });
}

export { createTechCompaniesChart }; 