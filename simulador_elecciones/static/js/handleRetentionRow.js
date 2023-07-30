
function createRetentionRow(candidate, partyColor, inputSection) {
    inputSection
        .select(".retention-title")
        .html("")
        .append("div")
        .html("Distribucion de los votos de <span style='color:" + partyColor + ";'>" + candidate + "</span> para la general");

    inputSection.selectAll(".party-card").style("display", "none"); 
    inputSection.selectAll(".party-card-" + candidate).style("display", "block");

    //select all retention-buttons in inPutSection with 
    // background-color == #adebad and set it to def7de please 
    inputSection.selectAll(".retention-button")  
        .filter(function() { 
            return d3.select(this).style("background-color") !== "rgb(255, 235, 214);" 
        })
        .style("background-color", "#def7de");

    inputSection
        .select(".retention-row")
        .transition()
        .duration(200)
        .style("height", "130px")
        .style("padding", "10px 10px")
        .style("height", "auto");
    
    inputSection
        .selectAll(".retention")
        .transition()
        .duration(200)
        .style("padding", "20px 0px")
        .style("height", "230px")
        .style("height", "auto")
        .attr("class", "retention row-open");

    inputSection
        .selectAll(".candidate-card")
        .transition()
        .duration(100)
        .style("background-color", "white")
        .style("outline", "0px");
    
    inputSection
        .select("#candidate-card-" + candidate)
        .transition()
        .duration(100)
        .style("background-color", "#F5FBDA")
        .style("outline", "1px solid black");

    inputSection
        .selectAll(".candidate-card-img")
        .transition()
        .duration(100)
        .style("filter", "grayscale(100%)");
        
    inputSection
        .select("#candidate-card-img-" + candidate)
        .transition()
        .duration(100)
        .style("filter", "grayscale(0%)");
}

function closeRetentionRow(inputSection) {

    inputSection
        .select(".retention-title")
        .html("");

    inputSection
        .select(".retention-row")
        .transition()
        .duration(200)
        .style("height", "0px")
        .style("padding", "0px");

    inputSection
        .selectAll(".retention-button")
        .style("background-color", function() {
            if (d3.select(this).style("background-color") == "#adebad") {
                return "#adebad"
            } else if (d3.select(this).style("background-color") == "#FFEBD6") {
                return "#FFEBD6"
            } else {
                return "#DEF7DE"
            }
        })

    inputSection
        .selectAll(".retention")
        .classed("row-open", false)
        .transition()
        .duration(200)
        .style("height", "0px")
        .style("padding", "0px")
        .attr("class", "retention row-closed");

    inputSection
        .selectAll(".party-card").style("display", "none"); 

    inputSection
        .selectAll(".candidate-card")
        .transition()
        .duration(100)
        .style("background-color", "white")
        .style("outline", "0px");

    inputSection
        .selectAll(".candidate-card-img")
        .transition()
        .duration(100)
        .style("filter", "grayscale(100%)");
}
