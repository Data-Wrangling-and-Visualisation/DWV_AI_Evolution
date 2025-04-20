import { getOrganizationData } from "../dataService.js";

export async function createOrgBubbleChart() {
  let data;
  try {
    data = await getOrganizationData();
    console.log("Fetched organizations data for D3 via service:", data);
  } catch (error) {
    console.error("Error fetching or parsing organizations data:", error);
    const container = document.getElementById("orgBubbleChartD3");
    if (container) {
      container.innerHTML =
        '<p style="color: red;">Could not load organization data.</p>';
    }
    return;
  }

  const filteredData = data.filter((d) => d.numModels > 0);

  if (!filteredData || filteredData.length === 0) {
    console.warn(
      "No organization data with models > 0 available for D3 chart."
    );
    const container = document.getElementById("orgBubbleChartD3");
    if (container) {
      container.innerHTML =
        "<p>No organization data with models > 0 to display.</p>";
    }
    return;
  }

  const container = document.getElementById("orgBubbleChartD3");
  if (!container) {
    console.error("D3 chart container #orgBubbleChartD3 not found.");
    return;
  }
  container.innerHTML = "";

  const containerRect = container.getBoundingClientRect();
  const width = containerRect.width || 600;
  const height = 500;

  const rootData = {
    name: "root",
    children: filteredData.map((d) => ({ name: d.name, value: d.numModels })),
  };

  const svg = d3
    .select("#orgBubbleChartD3")
    .append("svg")
    .attr("viewBox", `0 0 ${width} ${height}`)
    .attr("width", width)
    .attr("height", height)
    .attr("style", "max-width: 100%; height: auto; font: 10px sans-serif;");

  const pack = d3.pack().size([width, height]).padding(3);

  const root = d3
    .hierarchy(rootData)
    .sum((d) => d.value)
    .sort((a, b) => b.value - a.value);

  pack(root);

  const color = d3.scaleOrdinal(d3.schemeTableau10);

  const tooltip = d3
    .select("body")
    .append("div")
    .attr("class", "d3-tooltip")
    .style("position", "absolute")
    .style("z-index", "10")
    .style("visibility", "hidden")
    .style("background", "rgba(255, 255, 255, 0.9)")
    .style("border", "solid 1px #ccc")
    .style("border-radius", "4px")
    .style("padding", "8px")
    .style("font-size", "12px")
    .style("pointer-events", "none");

  const node = svg
    .selectAll("g")
    .data(root.leaves()) // leaves for individual organizations
    .join("g")
    .attr("transform", (d) => `translate(${d.x},${d.y})`)
    .on("mouseover", function (event, d) {
      tooltip
        .style("visibility", "visible")
        .html(
          `<strong>${
            d.data.name
          }</strong><br>Models: ${d.data.value.toLocaleString()}`
        );
      d3.select(this)
        .select("circle")
        .attr("stroke", "#000")
        .attr("stroke-width", 1.5);
    })
    .on("mousemove", function (event) {
      tooltip
        .style("top", event.pageY - 10 + "px")
        .style("left", event.pageX + 10 + "px");
    })
    .on("mouseout", function () {
      tooltip.style("visibility", "hidden");
      d3.select(this).select("circle").attr("stroke", null);
    });

  node
    .append("circle")
    .attr("r", (d) => d.r)
    .attr("fill", (d) => color(d.data.name))
    .attr("fill-opacity", 0.7);

  node
    .append("clipPath")
    .attr("id", (d, i) => `clip-${i}`)
    .append("circle")
    .attr("r", (d) => d.r);

  node
    .append("text")
    .attr("clip-path", (d, i) => `url(#clip-${i})`)
    .selectAll("tspan")
    .data((d) => d.data.name.split(/(?=[A-Z][a-z])|\s+/g))
    .join("tspan")
    .attr("x", 0)
    .attr("y", (d, i, nodes) => `${i - nodes.length / 2 + 0.8}em`)
    .attr("text-anchor", "middle")
    .style("font-size", (d) => Math.max(6, Math.min(d.r / 3, 14)) + "px")
    .style("fill", "#fff")
    .style("pointer-events", "none")
    .text((d) => d);

  node.select("text").each(function (d) {
    const textElement = d3.select(this);
    let bbox;
    try {
      bbox = textElement.node().getBBox();
    } catch (e) {
      console.warn("Could not get BBox for text:", textElement.text(), e);
      bbox = { width: 0, height: 0 };
    }

    const maxDimension = Math.max(bbox.width, bbox.height);
    const radiusThreshold = d.r * 1.6;

    if (maxDimension > radiusThreshold) {
      textElement.style("visibility", "hidden");
    }
  });

  node
    .append("title")
    .text((d) => `${d.data.name}\n${d.data.value.toLocaleString()} models`);
}
