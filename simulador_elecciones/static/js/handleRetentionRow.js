
function createRetentionRow(candidate, partyColor, inputSection, nextElection="general", parties = null) {
    inputSection
        .select(".retention-title")
        .html("")
        .append("div")
        .html("Distribucion de los votos de <span style='color:" + partyColor + ";'>" + candidate + "</span> para" + (nextElection == "general" ? " las elecciones generales" : " el ballotage"));

    inputSection.selectAll(".party-card").style("display", "none"); 
    inputSection.selectAll(".party-card-" + candidate).style("display", "block");

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

    let candidateSpecial = false

    if (parties !== null) {
        //filter parties with p.general_result either "winner" or "ballotage"
        let specialParties = parties.filter(p =>  p.general_result == "winner" || p.general_result == "ballotage");
        if (nextElection == "general") {
            candidateSpecial = specialParties.map(p => p.candidate.name).includes(candidate);
        } else {
            candidateSpecial = specialParties.map(p => p.name).includes(candidate);
        }
    }

    let inputName = nextElection == "general" ? candidate : parties.find(p => p.name == candidate).candidate.name;

    inputSection.selectAll(".candidate-card")
    .style("outline", "0px");

    inputSection
    .select("#candidate-card-" + inputName)
    .style("outline", "1px solid black");

    let openCards = inputSection.selectAll(".candidate-card")
    .filter(function() {
        return d3.select(this).style("background-color") == "rgb(245, 251, 218)" 
    })

    openCards
        .transition()
        .duration(100)
        .style("background-color", "white");

    openCards
        .selectAll(".candidate-card-img")
        .transition()
        .duration(100)
        .style("filter", "grayscale(100%)");

    if (nextElection == "general" || !candidateSpecial) {

    inputSection
        .select("#candidate-card-" + inputName)
        .transition()
        .duration(100)
        .style("background-color", "#F5FBDA");
        
    inputSection
        .select("#candidate-card-img-" + inputName)
        .transition()
        .duration(100)
        .style("filter", "grayscale(0%)");
    }
}

function closeRetentionRow(inputSection, election = "primary") {

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

    if (election == "primary") {
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
    } else {
        inputSection
            .selectAll(".candidate-card")
            .filter(function() {
                return d3.select(this).style("outline") != "0px";
                }
            )
            .style("outline", "0px")

        inputSection
            .selectAll(".candidate-card")
            .filter(function() {
                return d3.select(this).style("background-color") == "rgb(245, 251, 218)" 
                }
            )
            .transition()
            .duration(100)
            .style("background-color", "white")
            .select(".candidate-card-img")
            .transition()
            .duration(100)
            .style("filter", "grayscale(100%)");
            
    }
}
