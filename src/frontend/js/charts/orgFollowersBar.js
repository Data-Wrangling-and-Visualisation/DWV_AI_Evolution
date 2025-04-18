import { getOrganizationData } from '../dataService.js';

export async function createOrgFollowersBar() {
    // const apiUrl = '/api/organizations-info'; // Removed
    let data;
    try {
        // const response = await fetch(apiUrl); // Removed
        // if (!response.ok) { // Removed
        //     throw new Error(`HTTP error! status: ${response.status}`); // Removed
        // } // Removed
        // data = await response.json(); // Removed
        data = await getOrganizationData(); // Added
        console.log("Fetched organizations data for D3 Followers Bar via service:", data); // Updated log
    } catch (error) {
        console.error('Error fetching or parsing organizations data:', error);
        const container = document.getElementById('orgFollowersBarD3');
        if (container) {
            container.innerHTML = '<p style="color: red;">Could not load organization data.</p>';
        }
        return;
    }

    // Sort by followers descending and take top 10
    const sortedData = data.sort((a, b) => b.numFollowers - a.numFollowers).slice(0, 10);

    if (!sortedData || sortedData.length === 0) {
        console.warn('No organization data available for D3 Followers Bar chart.');
        const container = document.getElementById('orgFollowersBarD3');
        if (container) {
            container.innerHTML = '<p>No organization data to display.</p>';
        }
        return;
    }

    const container = document.getElementById('orgFollowersBarD3');
    if (!container) {
        console.error('D3 chart container #orgFollowersBarD3 not found.');
        return;
    }
    container.innerHTML = ''; // Clear previous contents

    const containerRect = container.getBoundingClientRect();
    const margin = { top: 20, right: 30, bottom: 40, left: 150 }; // Increase left margin for labels
    const width = (containerRect.width || 800) - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom; // Adjust height as needed

    const svg = d3.select("#orgFollowersBarD3").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // X axis (Followers count)
    const x = d3.scaleLinear()
        .domain([0, d3.max(sortedData, d => d.numFollowers)])
        .range([0, width]);
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x).ticks(5).tickFormat(d3.format("~s"))) // Use SI prefix format
        .selectAll("text")
        .style("text-anchor", "end");

    // Y axis (Organization name)
    const y = d3.scaleBand()
        .range([0, height])
        .domain(sortedData.map(d => d.name))
        .padding(.1);
    svg.append("g")
        .call(d3.axisLeft(y));

    // Color scale - Use PuBuGn sequential gradient mapped ordinally, adjusted range for dimmer colors
    const color = d3.scaleOrdinal()
        .domain(sortedData.map(d => d.name)) // Domain is the org names
        .range(d3.quantize(t => d3.interpolatePuBuGn(t * 0.7 + 0.2), sortedData.length)); // Adjust range: 0.2 to 0.9

    // Tooltip
    const tooltip = d3.select("body").append("div")
        .attr("class", "d3-tooltip") // Reuse existing tooltip style
        .style("visibility", "hidden");

    // Bars
    svg.selectAll("myRect")
        .data(sortedData)
        .join("rect")
        .attr("x", x(0))
        .attr("y", d => y(d.name))
        .attr("width", d => x(d.numFollowers))
        .attr("height", y.bandwidth())
        .attr("fill", d => color(d.name))
        .attr("fill-opacity", 0.8)
        .on("mouseover", function(event, d) {
            tooltip.style("visibility", "visible")
                   .html(`<strong>${d.name}</strong><br>Followers: ${d.numFollowers.toLocaleString()}`);
            d3.select(this).attr("fill-opacity", 1);
        })
        .on("mousemove", function(event) {
            tooltip.style("top", (event.pageY - 10) + "px")
                   .style("left", (event.pageX + 10) + "px");
        })
        .on("mouseout", function() {
            tooltip.style("visibility", "hidden");
            d3.select(this).attr("fill-opacity", 0.8);
        });

    // Add X axis label
    svg.append("text")
        .attr("text-anchor", "middle")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom - 5) // Position below axis
        .style("font-size", "12px")
        .text("Number of Followers");

    // Optional: Add values on bars (if they fit)
    svg.selectAll(".bar-label")
        .data(sortedData)
        .enter()
        .append("text")
        .attr("class", "bar-label")
        .attr("x", d => x(d.numFollowers) + 5) // Position slightly right of bar end
        .attr("y", d => y(d.name) + y.bandwidth() / 2)
        .attr("dy", ".35em") // Vertical alignment
        .style("font-size", "10px")
        .style("fill", "#333")
        .text(d => d3.format(",.0f")(d.numFollowers)) // Format number
        .each(function(d) { // Hide label if bar is too small
            const textWidth = this.getBBox().width;
            if (x(d.numFollowers) < textWidth + 10) { // Check if bar width accommodates label
                d3.select(this).remove();
            }
        });
} 