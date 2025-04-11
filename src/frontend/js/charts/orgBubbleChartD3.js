export async function createOrgBubbleChartD3() {
    const apiUrl = '/api/organizations-info';
    let data;
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        data = await response.json();
        console.log("Fetched organizations data for D3:", data);
    } catch (error) {
        console.error('Error fetching or parsing organizations data:', error);
        const container = document.getElementById('orgBubbleChartD3');
        if (container) {
            container.innerHTML = '<p style="color: red;">Could not load organization data.</p>';
        }
        return;
    }

    // Filter out organizations with 0 models, as they won't show up in the pack layout
    const filteredData = data.filter(d => d.numModels > 0);

    // Ensure data is not empty after filtering
    if (!filteredData || filteredData.length === 0) {
        console.warn('No organization data with models > 0 available for D3 chart.');
         const container = document.getElementById('orgBubbleChartD3');
        if (container) {
            container.innerHTML = '<p>No organization data with models > 0 to display.</p>';
        }
        return;
    }

    const container = document.getElementById('orgBubbleChartD3');
    if (!container) {
        console.error('D3 chart container #orgBubbleChartD3 not found.');
        return;
    }
    container.innerHTML = ''; // Clear previous contents

    // Get container dimensions dynamically
    const containerRect = container.getBoundingClientRect();
    const width = containerRect.width || 600; // Default width if not available
    const height = 500; // Fixed height for simplicity, adjust as needed

    // Prepare data for D3 hierarchy (needs a root node)
    const rootData = { 
        name: "root", 
        children: filteredData.map(d => ({ name: d.name, value: d.numModels }))
    };

    // Create SVG element
    const svg = d3.select("#orgBubbleChartD3").append("svg")
        .attr("viewBox", `0 0 ${width} ${height}`)
        .attr("width", width)
        .attr("height", height)
        .attr("style", "max-width: 100%; height: auto; font: 10px sans-serif;");

    // Create pack layout
    const pack = d3.pack()
        .size([width, height])
        .padding(3);

    // Create hierarchy
    const root = d3.hierarchy(rootData)
        .sum(d => d.value) // Size bubbles based on 'value' (numModels)
        .sort((a, b) => b.value - a.value); // Optional: sort bubbles

    // Apply the pack layout to the hierarchy
    pack(root);

    // Color scale - Use Tableau10 for a different categorical palette
    const color = d3.scaleOrdinal(d3.schemeTableau10);

    // Create tooltip div (append to body to avoid SVG clipping issues)
    const tooltip = d3.select("body").append("div")
        .attr("class", "d3-tooltip")
        .style("position", "absolute")
        .style("z-index", "10")
        .style("visibility", "hidden")
        .style("background", "rgba(255, 255, 255, 0.9)")
        .style("border", "solid 1px #ccc")
        .style("border-radius", "4px")
        .style("padding", "8px")
        .style("font-size", "12px")
        .style("pointer-events", "none"); // Important!

    // Bind data to nodes (circles and text)
    const node = svg.selectAll("g")
        .data(root.leaves()) // Use leaves for individual organizations
        .join("g")
        .attr("transform", d => `translate(${d.x},${d.y})`)
        .on("mouseover", function(event, d) {
            tooltip.style("visibility", "visible")
                   .html(`<strong>${d.data.name}</strong><br>Models: ${d.data.value.toLocaleString()}`);
            d3.select(this).select("circle").attr("stroke", "#000").attr("stroke-width", 1.5);
        })
        .on("mousemove", function(event) {
            tooltip.style("top", (event.pageY - 10) + "px")
                   .style("left", (event.pageX + 10) + "px");
        })
        .on("mouseout", function() {
            tooltip.style("visibility", "hidden");
            d3.select(this).select("circle").attr("stroke", null);
        });

    // Add circles
    node.append("circle")
        .attr("r", d => d.r)
        .attr("fill", d => color(d.data.name)) // Color by organization name
        .attr("fill-opacity", 0.7);

    // Add labels (clip path ensures text stays within circle)
    node.append("clipPath")
        .attr("id", (d, i) => `clip-${i}`)
        .append("circle")
        .attr("r", d => d.r);

    node.append("text")
        .attr("clip-path", (d, i) => `url(#clip-${i})`)
        .selectAll("tspan")
        .data(d => d.data.name.split(/(?=[A-Z][a-z])|\s+/g)) // Split name for wrapping (simple attempt)
        .join("tspan")
        .attr("x", 0)
        .attr("y", (d, i, nodes) => `${i - nodes.length / 2 + 0.8}em`) // Center text vertically
        .attr("text-anchor", "middle")
        .style("font-size", d => Math.max(6, Math.min(d.r / 3, 14)) + 'px') // Dynamic font size (adjust formula as needed)
        .style("fill", "#fff")
        .style("pointer-events", "none") // Prevent text from interfering with mouse events
        .text(d => d);

    // Check if text fits and hide if not
    node.select('text') // Select the text element within the node group
        .each(function(d) { // 'd' here is the datum for the node (circle)
            const textElement = d3.select(this);
            let bbox;
            try {
                 // getBBox() might fail on empty or hidden elements in some browsers
                 bbox = textElement.node().getBBox(); 
            } catch (e) {
                console.warn("Could not get BBox for text:", textElement.text(), e);
                bbox = { width: 0, height: 0 }; // Default to 0 size on error
            }
           
            // Hide if width or height is too large compared to radius (adjust factor as needed)
            const maxDimension = Math.max(bbox.width, bbox.height);
            const radiusThreshold = d.r * 1.6; // Allow text dim up to 1.6x radius (or 0.8x diameter)

            if (maxDimension > radiusThreshold) {
                textElement.style('visibility', 'hidden');
            }
        });

    // Optional: Add a title (useful for accessibility)
    node.append("title")
        .text(d => `${d.data.name}\n${d.data.value.toLocaleString()} models`);
} 