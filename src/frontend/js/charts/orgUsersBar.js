import { getOrganizationData } from "../dataService.js";

export async function createOrgUsersBar() {
  let data;
  try {
    data = await getOrganizationData();
    console.log(
      "Fetched organizations data for D3 Contributors Bar via service:",
      data
    );
  } catch (error) {
    console.error("Error fetching or parsing organizations data:", error);
    const container = document.getElementById("orgUsersBarD3");
    if (container) {
      container.innerHTML =
        '<p style="color: red;">Could not load organization data.</p>';
    }
    return;
  }

  const sortedData = data.sort((a, b) => b.numUsers - a.numUsers).slice(0, 10);

  if (!sortedData || sortedData.length === 0) {
    console.warn(
      "No organization data available for D3 Contributors Bar chart."
    );
    const container = document.getElementById("orgUsersBarD3");
    if (container) {
      container.innerHTML = "<p>No organization data to display.</p>";
    }
    return;
  }

  const container = document.getElementById("orgUsersBarD3");
  if (!container) {
    console.error("D3 chart container #orgUsersBarD3 not found.");
    return;
  }
  container.innerHTML = "";

  const containerRect = container.getBoundingClientRect();
  const margin = { top: 20, right: 30, bottom: 40, left: 150 };
  const width = (containerRect.width || 800) - margin.left - margin.right;
  const height = 500 - margin.top - margin.bottom;

  const svg = d3
    .select("#orgUsersBarD3")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const x = d3
    .scaleLinear()
    .domain([0, d3.max(sortedData, (d) => d.numUsers)])
    .range([0, width]);
  svg
    .append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x).ticks(5).tickFormat(d3.format("~s")))
    .selectAll("text")
    .style("text-anchor", "end");

  const y = d3
    .scaleBand()
    .range([0, height])
    .domain(sortedData.map((d) => d.name))
    .padding(0.1);
  svg.append("g").call(d3.axisLeft(y));

  const color = d3
    .scaleOrdinal()
    .domain(sortedData.map((d) => d.name))
    .range(
      d3.quantize(
        (t) => d3.interpolateViridis(t * 0.8 + 0.1),
        sortedData.length
      )
    );

  const tooltip = d3
    .select("body")
    .append("div")
    .attr("class", "d3-tooltip")
    .style("visibility", "hidden");

  svg
    .selectAll("myRect")
    .data(sortedData)
    .join("rect")
    .attr("x", x(0))
    .attr("y", (d) => y(d.name))
    .attr("width", (d) => x(d.numUsers))
    .attr("height", y.bandwidth())
    .attr("fill", (d) => color(d.name))
    .attr("fill-opacity", 0.8)
    .on("mouseover", function (event, d) {
      tooltip
        .style("visibility", "visible")
        .html(
          `<strong>${
            d.name
          }</strong><br>Contributors: ${d.numUsers.toLocaleString()}`
        );
      d3.select(this).attr("fill-opacity", 1);
    })
    .on("mousemove", function (event) {
      tooltip
        .style("top", event.pageY - 10 + "px")
        .style("left", event.pageX + 10 + "px");
    })
    .on("mouseout", function () {
      tooltip.style("visibility", "hidden");
      d3.select(this).attr("fill-opacity", 0.8);
    });

  svg
    .append("text")
    .attr("text-anchor", "middle")
    .attr("x", width / 2)
    .attr("y", height + margin.bottom - 5)
    .style("font-size", "12px")
    .text("Number of Contributors");

  svg
    .selectAll(".bar-label")
    .data(sortedData)
    .enter()
    .append("text")
    .attr("class", "bar-label")
    .attr("x", (d) => x(d.numUsers) + 5)
    .attr("y", (d) => y(d.name) + y.bandwidth() / 2)
    .attr("dy", ".35em")
    .style("font-size", "10px")
    .style("fill", "#333")
    .text((d) => d3.format(",.0f")(d.numUsers))
    .each(function (d) {
      const textWidth = this.getBBox().width;
      if (x(d.numUsers) < textWidth + 10) {
        d3.select(this).remove();
      }
    });
}
