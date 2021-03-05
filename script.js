let h = window.screen.height;
let w = window.screen.width;


var margin = {top: 5, right: 5, bottom: 5, left: 5},

// Set the width and height of the graph depending on the screen size
width = Math.floor(w * 0.9) - margin.left - margin.right,
height = Math.floor(h * 0.80) - margin.top - margin.bottom;


// Handles coloring each box depending on its value
var opacity = d3.scaleLinear()
  .domain([130, 30900])
  .range([.25,1]);

// Add svg element to the main div
var svg = d3.select("#data")
.append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom);


// Define the tooltip
var tool = d3.select("body").append("div").attr("class", "toolTip");

// Read data from the csv file
d3.csv('categories.csv', function(data) {

  // Sort the data based off of each category's value descending
  data.sort(function(a,b) { return b.value - a.value })
  
  // Reformatting CSV file for d3
  var root = d3.stratify()
    .id(function(d) { return d.category; }) 
    .parentId(function(d) { return d.parent; })   
    (data);
  root.sum(function(d) { return +d.value })  

  d3.treemap()
    .size([width, height])
    .padding(3)
    (root)



  // Add rectangles for each datapoint and set up hover features
  svg
    .selectAll("rect")
    .data(root.leaves())
    .enter()
    .append("rect")
      .attr('x', function (d) { return d.x0; })
      .attr('y', function (d) { return d.y0; })
      .attr('width', function (d) { return d.x1 - d.x0; })
      .attr('height', function (d) { return d.y1 - d.y0; })
      .style("stroke", "black")
      .style("fill", "#3333ff")
      .style("opacity", function(d){ return opacity(d.data.value)})
    .on("mouseover", function(d) { // On mouseover change the color of the rectangle
        d3.select(this)
          .style("fill", "#ff9933")
          .style("opacity", 1);
    })
    .on("mousemove", function (d) { // Sets up the tooltip to move along with the cursor over the current rectangle
      tool.style("left", d3.event.pageX + 25 + "px")
      tool.style("top", d3.event.pageY - 80 + "px")
      tool.style("display", "inline-block");
      tool.html(d.data.category.replace(/(?=[A-Z][^A-Z])/g,"<br>").substring(4) + "<br>" + d.data.value);
      d3.select(this)
          .style("fill", "#ff9933")
          .style("opacity", 1);
    })
    .on("mouseout", function(d) { // Remove tooltip and then change color of rectangle back to its original color
      tool.style("display", "none");
      d3.select(this) 
        .transition().duration(150) 
        .style("fill", "#3333ff")
        .style("opacity", function(d){ return opacity(d.data.value)})
    });
    
    
    // Add the text for each box
    svg.selectAll("text")
      .data(root.leaves())
      .enter()
      .append("svg") // Each text element must be in an svg tag so text can be clipped if it does not fit inside rectangle
        .attr('x', function (d) { return d.x0; })
        .attr('y', function (d) { return d.y0; })  
        .attr("width", function (d) { return d.x1 - d.x0; })
        .attr("height", function (d) { return d.y1 - d.y0; })
      .append('text')
        .selectAll('tspan')
        .data(d => {
            return d.data.category.split(/(?=[A-Z][^A-Z])/g).concat(d.value) // Split category names to be on multiple lines
                .map(v => {
                    return {
                        text: v,
                        x0: d.x0,                 
                        y0: d.y0                         
                    }
                });
        })
        .enter()
        .append('tspan')
        .attr("x", (d) => 10)
        .attr("y", (d, i) => 20 + (i * 15))
        .text((d) => d.text)
        .attr("font-size", "15px")
        .attr("fill", "white");
});
