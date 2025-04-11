import { fetchAndTransformData } from '../utils/dataTransform.js';

// Register the zoom plugin if needed
if (Chart.register) {
    Chart.register(ChartZoom);
}

// Set up the bubble chart
async function createModelPopularityChart() {
    try {
        // Get and transform data
        const data = await fetchAndTransformData();
        console.log("Fetched data for bubble chart:", data.length, "items");
        
        // Create sample data if no real data available
        let processedData = [];
        
        if (data && data.length > 0) {
            // Filter and process data
            processedData = data
                .filter(model => model.publishing_date && model.likes && model.model_size)
                .map(model => ({
                    ...model,
                    publishing_date: new Date(model.publishing_date),
                    likes: parseInt(model.likes || 0),
                    downloads: parseInt(model.downloads || 0),
                    model_size: parseFloat(model.model_size || 0)
                }))
                .filter(model => {
                    // Filter for recent data (last 24 months)
                    const now = new Date();
                    const twoYearsAgo = new Date(now.setMonth(now.getMonth() - 24));
                    return model.publishing_date >= twoYearsAgo;
                })
                // Sort by likes to get top 100
                .sort((a, b) => (b.likes || 0) - (a.likes || 0))
                .slice(0, 100);
        } else {
            // If no data, create sample data
            const now = new Date();
            for (let i = 0; i < 20; i++) {
                const date = new Date(now);
                date.setMonth(date.getMonth() - Math.floor(Math.random() * 24));
                
                processedData.push({
                    model_name: `Sample Model ${i+1}`,
                    publishing_date: date,
                    likes: Math.floor(Math.random() * 10000),
                    downloads: Math.floor(Math.random() * 5000000),
                    model_size: Math.pow(10, 8 + Math.random() * 3)
                });
            }
        }
        
        console.log("Processed data for bubble chart:", processedData.length, "items");
        
        if (processedData.length === 0) {
            console.error("No data available for bubble chart!");
            document.getElementById('bubbleChartContainer').innerHTML = 
                '<div style="text-align:center; padding:50px;">No data available for this time period</div>';
            return;
        }

        // Create the scatter plot
        const ctx = document.getElementById('modelPopularityChart').getContext('2d');
        
        // Get min and max values for scales
        const maxDownloads = Math.max(...processedData.map(d => d.downloads || 0));
        const maxModelSize = Math.max(...processedData.map(d => d.model_size || 0));
        const maxLikes = Math.max(...processedData.map(d => d.likes || 0));
        
        // Apply root scaling to likes
        const scaledData = processedData.map(model => ({
            ...model,
            scaledLikes: Math.sqrt(model.likes || 0)
        }));

        // Create color scale function
        function getColor(downloads) {
            const normalizedValue = (downloads || 0) / maxDownloads;
            // Viridis-like color scale
            const colors = [
                [68, 1, 84],    // Dark purple
                [72, 35, 116],  // Purple
                [64, 67, 135],  // Blue-purple
                [52, 94, 141],  // Blue
                [41, 121, 142], // Blue-green
                [32, 144, 140], // Teal
                [34, 168, 132], // Light teal
                [68, 190, 112], // Light green
                [122, 209, 81], // Yellow-green
                [189, 223, 38], // Yellow
                [253, 231, 37]  // Bright yellow
            ];
            
            const index = Math.min(
                Math.floor(normalizedValue * (colors.length - 1)),
                colors.length - 2
            );
            const remainder = (normalizedValue * (colors.length - 1)) - index;
            
            const c1 = colors[index];
            const c2 = colors[index + 1];
            
            return `rgb(${
                Math.round(c1[0] + (c2[0] - c1[0]) * remainder)}, ${
                Math.round(c1[1] + (c2[1] - c1[1]) * remainder)}, ${
                Math.round(c1[2] + (c2[2] - c1[2]) * remainder)})`;
        }

        // Function to calculate bubble size - with much smaller bubble sizes
        function getBubbleSize(modelSize) {
            // Use a cube root scale for the bubble size with smaller maximum
            const minSize = 3;  // Smaller minimum
            const maxSize = 15; // Smaller maximum
            
            // Use cube root scaling for better visual representation
            const normalizedValue = Math.cbrt(modelSize || 1) / Math.cbrt(maxModelSize || 1);
            
            // Calculate size
            return minSize + normalizedValue * (maxSize - minSize);
        }

        // Create colorbar legend elements
        const colorBarContainer = document.createElement('div');
        colorBarContainer.className = 'color-bar-container';
        colorBarContainer.style.position = 'absolute';
        colorBarContainer.style.right = '10px';
        colorBarContainer.style.top = '60px';
        colorBarContainer.style.width = '100px';
        colorBarContainer.style.height = '280px';
        colorBarContainer.style.display = 'flex';
        colorBarContainer.style.flexDirection = 'column';
        colorBarContainer.style.justifyContent = 'flex-start';
        colorBarContainer.style.alignItems = 'center';
        colorBarContainer.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
        colorBarContainer.style.borderRadius = '8px';
        colorBarContainer.style.padding = '15px 5px';
        colorBarContainer.style.boxShadow = '0 2px 5px rgba(0,0,0,0.15)';

        // Create title
        const titleDiv = document.createElement('div');
        titleDiv.textContent = 'Downloads';
        titleDiv.style.marginBottom = '15px';
        titleDiv.style.fontSize = '14px';
        titleDiv.style.fontWeight = 'bold';
        titleDiv.style.color = '#333';

        // Create gradient
        const gradientDiv = document.createElement('div');
        gradientDiv.style.width = '30px';
        gradientDiv.style.height = '200px';
        gradientDiv.style.background = 'linear-gradient(to top, rgb(68, 1, 84), rgb(59, 82, 139), rgb(33, 144, 141), rgb(93, 201, 99), rgb(253, 231, 37))';
        gradientDiv.style.borderRadius = '4px';
        gradientDiv.style.boxShadow = '0 1px 3px rgba(0,0,0,0.15)';

        // Create container for gradient and labels
        const gradientContainer = document.createElement('div');
        gradientContainer.style.display = 'flex';
        gradientContainer.style.alignItems = 'center';
        gradientContainer.style.justifyContent = 'center';
        gradientContainer.style.position = 'relative';
        gradientContainer.style.width = '100%';
        gradientContainer.style.height = '200px';

        // Create value labels
        const valuesContainer = document.createElement('div');
        valuesContainer.style.height = '200px';
        valuesContainer.style.position = 'relative';
        valuesContainer.style.marginLeft = '10px';

        // Add labels
        const steps = 5;
        for (let i = 0; i <= steps; i++) {
            const valueDiv = document.createElement('div');
            const value = maxDownloads * (i / steps);
            valueDiv.textContent = formatNumber(value);
            valueDiv.style.position = 'absolute';
            valueDiv.style.left = '0';
            valueDiv.style.top = `${100 - (i / steps) * 100}%`;
            valueDiv.style.fontSize = '12px';
            valueDiv.style.fontWeight = i === 0 || i === steps ? 'bold' : 'normal';
            valueDiv.style.color = '#333';
            valueDiv.style.transform = 'translateY(-50%)';
            valuesContainer.appendChild(valueDiv);
        }

        // Add elements to containers
        gradientContainer.appendChild(gradientDiv);
        gradientContainer.appendChild(valuesContainer);
        
        // Add legend to container
        colorBarContainer.appendChild(titleDiv);
        colorBarContainer.appendChild(gradientContainer);
        
        // Append legend to the specific chart container, not the body
        const bubbleContainer = document.getElementById('bubbleChartContainer');
        if (bubbleContainer) {
            bubbleContainer.style.position = 'relative'; // Ensure parent is positioned
            bubbleContainer.appendChild(colorBarContainer);
        } else {
            console.error("Bubble chart container not found!");
        }

        // Adjust legend position to fit better within the slide
        colorBarContainer.style.top = '60px'; // Adjust top position
        colorBarContainer.style.right = '10px'; // Adjust right position

        // Create background for the chart
        const backgroundPlugin = {
            id: 'custom_canvas_background_color',
            beforeDraw: (chart) => {
                const ctx = chart.canvas.getContext('2d');
                ctx.save();
                ctx.globalCompositeOperation = 'destination-over';
                ctx.fillStyle = '#f7f9fc';
                ctx.fillRect(0, 0, chart.width, chart.height);
                ctx.restore();
            }
        };

        // Helper function to format large numbers
        function formatNumber(num) {
            if (num >= 1000000) {
                return `${(num / 1000000).toFixed(0)}M`;
            } else if (num >= 1000) {
                return `${(num / 1000).toFixed(0)}K`;
            }
            return num.toFixed(0);
        }

        const chart = new Chart(ctx, {
            type: 'bubble',
            data: {
                datasets: [{
                    label: 'AI Models',
                    data: scaledData.map(model => ({
                        x: model.publishing_date,
                        y: model.scaledLikes,
                        r: getBubbleSize(model.model_size),
                        model_name: model.model_name,
                        likes: model.likes,
                        downloads: model.downloads,
                        model_size: model.model_size,
                        // Original value for proper tooltips
                        originalLikes: model.likes
                    })),
                    backgroundColor: scaledData.map(model => 
                        getColor(model.downloads)
                    ),
                    borderColor: 'rgba(255, 255, 255, 0.5)',
                    borderWidth: 1,
                    hoverBorderColor: '#fff',
                    hoverBorderWidth: 2,
                    pointHoverRadius: 5
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'nearest',
                    intersect: false
                },
                layout: {
                    padding: {
                        top: 30,
                        right: 30,
                        bottom: 30,
                        left: 30
                    }
                },
                scales: {
                    x: {
                        type: 'time',
                        time: {
                            unit: 'month',
                            displayFormats: {
                                month: 'MMM yyyy'
                            }
                        },
                        title: {
                            display: true,
                            text: 'Publishing Date',
                            font: {
                                size: 16,
                                weight: 'bold'
                            },
                            padding: {top: 15, bottom: 15}
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)',
                            tickBorderDash: [5, 5],
                            drawBorder: false
                        },
                        ticks: {
                            padding: 12,
                            font: {
                                size: 14
                            }
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Number of Likes (Root Scaled)',
                            font: {
                                size: 16,
                                weight: 'bold'
                            },
                            padding: {top: 15, bottom: 15}
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)',
                            tickBorderDash: [5, 5],
                            drawBorder: false
                        },
                        ticks: {
                            padding: 12,
                            font: {
                                size: 14
                            }
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    title: {
                        display: true,
                        text: 'AI Model Size and Popularity Over Time',
                        font: {
                            size: 18,
                            weight: 'bold'
                        },
                        padding: {
                            top: 10,
                            bottom: 30
                        }
                    },
                    tooltip: {
                        enabled: true,
                        mode: 'nearest',
                        intersect: false,
                        backgroundColor: 'rgba(0, 0, 0, 0.85)',
                        titleFont: { size: 14, weight: 'bold' },
                        bodyFont: { size: 12 },
                        padding: 12,
                        cornerRadius: 6,
                        displayColors: false,
                        callbacks: {
                            title: function(tooltipItems) {
                                return tooltipItems[0].raw.model_name || 'Model';
                            },
                            label: function(context) {
                                const raw = context.raw;
                                return [
                                    `Published: ${raw.x.toLocaleDateString()}`,
                                    `Likes: ${formatNumber(raw.originalLikes)}`,
                                    `Downloads: ${formatNumber(raw.downloads)}`,
                                    `Size: ${formatNumber(raw.model_size)}`
                                ];
                            }
                        }
                    },
                    zoom: {
                        pan: {
                            enabled: true,
                            mode: 'xy'
                        },
                        zoom: {
                            wheel: {
                                enabled: true,
                                speed: 0.05
                            },
                            pinch: {
                                enabled: true
                            },
                            mode: 'xy'
                        }
                    }
                }
            },
            plugins: [backgroundPlugin]
        });

        // Add reset zoom button
        const resetZoomButton = document.createElement('button');
        resetZoomButton.textContent = 'Reset Zoom';
        resetZoomButton.style.position = 'absolute';
        resetZoomButton.style.top = '20px';
        resetZoomButton.style.right = '20px';
        resetZoomButton.style.padding = '10px 20px';
        resetZoomButton.style.backgroundColor = '#4A5568';
        resetZoomButton.style.color = 'white';
        resetZoomButton.style.border = 'none';
        resetZoomButton.style.borderRadius = '6px';
        resetZoomButton.style.cursor = 'pointer';
        resetZoomButton.style.fontWeight = 'bold';
        resetZoomButton.style.fontSize = '14px';
        resetZoomButton.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
        resetZoomButton.addEventListener('click', () => {
            chart.resetZoom();
        });
        resetZoomButton.addEventListener('mouseover', () => {
            resetZoomButton.style.backgroundColor = '#2D3748';
        });
        resetZoomButton.addEventListener('mouseout', () => {
            resetZoomButton.style.backgroundColor = '#4A5568';
        });

        const chartContainer = document.getElementById('bubbleChartContainer');
        chartContainer.style.position = 'relative';
        chartContainer.appendChild(resetZoomButton);
        
        // Add help text with hover effect
        const helpText = document.createElement('div');
        helpText.style.position = 'absolute';
        helpText.style.bottom = '20px';
        helpText.style.right = '20px';
        helpText.style.fontSize = '13px';
        helpText.style.padding = '10px 16px';
        helpText.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
        helpText.style.color = '#4A5568';
        helpText.style.borderRadius = '6px';
        helpText.style.boxShadow = '0 2px 4px rgba(0,0,0,0.15)';
        helpText.style.fontWeight = '500';
        chartContainer.appendChild(helpText);
    } catch (error) {
        console.error("Error creating bubble chart:", error);
        document.getElementById('bubbleChartContainer').innerHTML = 
            '<div style="text-align:center; padding:50px;">Error loading chart: ' + error.message + '</div>';
    }
}

export { createModelPopularityChart }; 