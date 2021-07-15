function formatter(row) {
  return {
    ...row,
    year: +row.year,
    balance: +row.balance,
    savings: +row.savings,
    id: +row.id,
  };
}

var tooltip = d3.select("body").append("div").classed("tooltip", true);

function showTooltip(d) {
  tooltip.style("opacity", 1).style("left", d.balance).style("top", d.savings)
    .html(`
    <p>${d.first_name} ${d.last_name}</p>
    <p>Savings: $${d.savings.toLocaleString()}</p>
    <p>Balance: $${d.balance.toLocaleString()}</p>
    <p>Country: ${d.country}</p>
    <p>Year: ${d.year}</p>
  `);
}

function hideTooltip(d) {
  return tooltip.style("opacity", 0);
}

d3.queue()
  .defer(d3.csv, "./data.csv", formatter)
  .await((err, data) => {
    if (err) console.log(err);
    console.log("data ", data[0]);

    // 1. SETUP SVG WITH AXIS
    var height = 500;
    var width = 600;
    var padding = 50;

    var svg = d3.select("svg").style("height", height).style("width", width);

    // Y / savings
    var yScale = d3
      .scaleLinear()
      .domain(d3.extent(data, (d) => d.savings))
      .range([height - padding, padding]);

    var yAxis = d3.axisLeft(yScale);

    svg.append("g").attr("transform", `translate(${padding}, 0)`).call(yAxis);

    svg
      .append("text")
      .attr("transform", `rotate(-90)`)
      .style("text-anchor", "middle")
      .attr("x", -height / 2)
      .attr("y", padding - 40)
      .text("savings");

    // X / balance
    var xScale = d3
      .scaleLinear()
      .domain(d3.extent(data, (d) => d.balance))
      .range([padding, width - padding]);

    var xAxis = d3.axisBottom(xScale);

    svg
      .append("g")
      .attr(`transform`, `translate(0, ${height - padding})`)
      .call(xAxis);

    svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", height - 20)
      .style("text-anchor", "middle")
      .text("balance");

    // R / age
    var rScale = d3
      .scaleLinear()
      .domain(d3.extent(data, (d) => d.age))
      .range([3, 20]);

    // 2. SETUP INPUT w/ 'range'
    var yearRange = d3.extent(data, (d) => d.year);

    var input = d3.select("input");
    input.property("min", yearRange[0]);
    input.property("max", yearRange[1]);
    input.property("value", yearRange[0]);

    // 3. DEFINING UPDATE SELECTION
    var circles = d3
      .select("svg")
      .selectAll("circle")
      .data(
        data.filter((customer) => customer.year === 1990),
        (d) => d.id
      );

    circles
      .enter()
      .append("circle")
      .on("mousemove", (d) => {
        showTooltip(d);
      })
      .on("mouseout", (d) => {
        hideTooltip(d);
      })
      .transition("ease-in")
      .duration(400)
      .attr("cx", (d) => xScale(d.balance))
      .attr("cy", (d) => yScale(d.savings))
      .attr("r", (d) => rScale(d.age))
      .style("opacity", 1)
      .attr("stroke-width", 1)
      .attr("stroke", "black")
      .attr("fill", "green");

    d3.select("svg")
      .selectAll("circle")
      .transition("ease-in")
      .duration(600)
      .delay((d, i) => i * 10);
    // CHANGING DATA
    input.on("change", () => {
      var newYear = d3.event.target.value;

      var updatedData = data.filter((customer) => customer.year === +newYear);

      circles = d3
        .select("svg")
        .selectAll("circle")
        .data(updatedData, (d) => d.id);

      circles.exit().transition().duration(500).attr("r", 0).remove();

      circles
        .enter()
        .append("circle")
        .attr("stroke-width", 1)
        .attr("stroke", "black")
        .on("mousemove", (d) => {
          showTooltip(d);
        })
        .on("mouseout", (d) => {
          hideTooltip(d);
        })
        .attr("fill", "green")
        .merge(circles)
        .transition()
        .duration(500)
        .delay((d, i) => i * 20)
        .attr("cx", (d) => xScale(d.balance))
        .attr("cy", (d) => yScale(d.savings))
        .attr("r", (d) => rScale(d.age));
    });
  });
