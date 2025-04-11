import { fetchAndTransformData } from '../utils/dataTransform.js';

async function createTopDownloadsChart() {
    // Get and transform data
    const data = await fetchAndTransformData();
    
    // Define major companies and their colors
    const companyMappings = {
        'openai': 'OpenAI',
        'google': 'Google',
        'meta': 'Meta/Facebook',
        'facebook': 'Meta/Facebook',
        'nvidia': 'NVIDIA',
        'microsoft': 'Microsoft'
    };

    const companyColors = {
        'OpenAI': '#FF9500',
        'Google': '#4285F4',
        'Meta/Facebook': '#1877F2',
        'Microsoft': '#7FBA00',
        'NVIDIA': '#76B900'
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

    // Process data to get top 5 models by downloads for each company
    const companyModels = data.reduce((acc, model) => {
        const company = standardizeCompany(model.creators);
        if (company && companyColors[company]) {
            if (!acc[company]) {
                acc[company] = [];
            }
            acc[company].push({
                name: model.model_name,
                downloads: model.downloads || 0
            });
        }
        return acc;
    }, {});

    // Get top 5 models for each company
    Object.keys(companyModels).forEach(company => {
        companyModels[company].sort((a, b) => b.downloads - a.downloads);
        companyModels[company] = companyModels[company].slice(0, 5);
    });

    // Prepare data for the chart
    const allModels = [];
    Object.entries(companyModels).forEach(([company, models]) => {
        models.forEach(model => {
            allModels.push({
                company,
                model: model.name,
                downloads: model.downloads
            });
        });
    });

    // Sort by company and downloads
    allModels.sort((a, b) => {
        if (a.company === b.company) {
            return b.downloads - a.downloads;
        }
        return a.company.localeCompare(b.company);
    });

    // Create the chart
    const ctx = document.getElementById('topDownloadsChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: allModels.map(m => m.model),
            datasets: [{
                label: 'Downloads',
                data: allModels.map(m => m.downloads),
                backgroundColor: allModels.map(m => companyColors[m.company]),
                borderColor: 'white',
                borderWidth: 0.5
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    align: 'center',
                    title: {
                        display: true,
                        text: 'Companies',
                        font: {
                            size: 14,
                            weight: 'bold'
                        }
                    },
                    labels: {
                        usePointStyle: true,
                        generateLabels: function(chart) {
                            return Object.entries(companyColors).map(([company, color]) => ({
                                text: company,
                                fillStyle: color,
                                strokeStyle: color,
                                lineWidth: 0,
                                pointStyle: 'rect'
                            }));
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const downloads = context.raw;
                            if (downloads >= 1000000) {
                                return `Downloads: ${(downloads/1000000).toFixed(1)}M`;
                            } else if (downloads >= 1000) {
                                return `Downloads: ${(downloads/1000).toFixed(0)}K`;
                            }
                            return `Downloads: ${downloads}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)',
                        drawBorder: false
                    },
                    ticks: {
                        callback: function(value) {
                            if (value >= 1000000) {
                                return (value/1000000).toFixed(1) + 'M';
                            }
                            if (value >= 1000) {
                                return (value/1000).toFixed(0) + 'K';
                            }
                            return value;
                        },
                        font: {
                            size: 12
                        }
                    },
                    title: {
                        display: true,
                        text: 'Number of Downloads',
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
                        display: false,
                        font: {
                            size: 11
                        }
                    }
                }
            }
        },
        plugins: [{
            afterDraw: function(chart) {
                const ctx = chart.ctx;
                const meta = chart.getDatasetMeta(0);
                meta.data.forEach((bar, index) => {
                    const data = chart.data.datasets[0].data[index];
                    const model = chart.data.labels[index];
                    
                    // Format downloads number
                    let formattedDownloads;
                    if (data >= 1000000) {
                        formattedDownloads = `(${(data/1000000).toFixed(1)}M)`;
                    } else if (data >= 1000) {
                        formattedDownloads = `(${(data/1000).toFixed(0)}K)`;
                    } else {
                        formattedDownloads = `(${data})`;
                    }

                    // Add downloads number after model name
                    const xPos = bar.x + 10;
                    const yPos = bar.y;
                    ctx.fillStyle = '#505050';
                    ctx.textAlign = 'left';
                    ctx.textBaseline = 'middle';
                    ctx.font = 'bold 11px Arial';

                    const fullText = `${model} ${formattedDownloads}`;
                    const textWidth = ctx.measureText(fullText).width;
                    const availableWidth = chart.chartArea.right - xPos;

                    // Only draw text if it fits, otherwise draw only downloads
                    if (textWidth < availableWidth) {
                        ctx.fillText(fullText, xPos, yPos);
                    } else {
                        // Optionally, draw only downloads if full text doesn't fit
                        const downloadsTextWidth = ctx.measureText(formattedDownloads).width;
                        if (downloadsTextWidth < availableWidth) {
                             ctx.fillText(formattedDownloads, xPos, yPos);
                        }
                        // If even downloads don't fit, draw nothing for this bar
                    }
                });
            }
        }]
    });
}

export { createTopDownloadsChart }; 