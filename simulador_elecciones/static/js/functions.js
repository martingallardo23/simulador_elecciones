
function getWeightedTotals (candidates, election="primary", parties) {
    let total;
    if (election == "primary") {
        total = 0;
        candidates.forEach(candidate => {
            let votes = +primarySection.select("#" + election + "-input-" + candidate.name).property("value");
            let retentionInputs = d3.selectAll("." + election + "-retention-" + candidate.name)
            let retention = 0; 
            retentionInputs.each(function() {
                retention += +d3.select(this).property("value");
            });
            total += votes * (retention / 100);
        })
    } else {
        total = true;
        parties.forEach(party => {
            let retentionInputs = d3.selectAll("." + election + "-retention-" + party.name)
            let retention = 0;
            retentionInputs.each(function() {
                retention += +d3.select(this).property("value");
            });
            total = (retention == 100) && total;
        })
        total = total ? 100 : 0;
    }

    return total;
}

function getTotals (id) {
    let total = 0;
    d3.selectAll(id).each(function() {
        total += +d3.select(this).property("value");
    });
    return total;
}

function checkTotals(id, inputElement) {
    var idName = "." + id;
    let total = getTotals(idName);

    let maxPossibleValue = 100 - (total - d3.select(inputElement).property("value"));

    if (+d3.select(inputElement).property("value") > maxPossibleValue) {
        d3.select(inputElement).property("value", maxPossibleValue);
    }

    d3.select(inputElement).attr("data-prev", d3.select(inputElement).property("value"));

    total = getTotals(idName);
    let totalId = "#" + id + "-total";
    d3.select(totalId).style("width", total + "%");
    d3.select("#" + id + "-text")
    .text(total + "%");
    if (total == 100) {
        d3.select(totalId)
        .transition()
        .duration(100)
        .style("background-color", "#ADEBAD");

        d3.select("#" + id + "-message")
        .text("Los votos suman 100");

    } else {
        d3.select(totalId)
        .transition()
        .duration(100)
        .style("background-color", "#A9D5DB");

        d3.select("#" + id + "-message")
        .text("Asegurate que los votos sumen 100!");
    }
    return total;
}

function updateVotes(candidates, election = "primary") {

    candidates.forEach(candidate => {
        candidate.votes = 0;
        let votes = d3.select("#" + election + "-input-" + candidate.name).property("value");
        candidate.votes = +votes;
    });
}

function getVotes(party, candidates, election = "primary") {
    /*
    Calcula los votos para el partido dado
    */
    let votes = 0;
    candidates.forEach(candidate => {
        let primaryVotes = candidate.votes;
        let retention = d3.select("#" + election + "-retention-" + candidate.name + "-" + party.name).property("value") / 100; 
        votes += primaryVotes * retention;
    });
    
    return votes;
}

function updatePrimaryWinners(parties, candidates) {
    // actualiza los ganadores de la primaria por partido
    primaryWinners = [];
    parties.map(party => {
        let partyCandidates = candidates.filter(candidate => candidate.party === party.name);

        partyCandidates.sort((a, b) => b.votes - a.votes);

        primaryWinners.push(partyCandidates[0]);
        let general_votes = getVotes(party, candidates);
        party.general_votes = general_votes;
        party.candidate = partyCandidates[0];

        generalCandidatesRow
        .select("#general-votes-" + party.name)
        .text(Math.round(general_votes * 100) / 100 + "%");
    });

    parties.sort((a, b) => b.general_votes - a.general_votes);

    let first = parties[0];
    let second = parties[1];

    parties.forEach(party => {
        party.general_result = "";
    });

    if (first.general_votes >= 45 || (first.general_votes >= 40 &&
        first.general_votes - second.general_votes >= 10)) {
        first.general_result = "winner";
    } else {
        first.general_result  = "ballotage";
        second.general_result = "ballotage";
        initializeGeneralRetentionRow(parties, candidates, "general");
    }

    primaryWinners.sort((a, b) => {
        let votesA = parties.find(p => p.name == a.party).general_votes;
        let votesB = parties.find(p => p.name == b.party).general_votes;
        return votesB - votesA;
    });

    makeGeneralCandidates(parties); 
    updateGeneralResults(parties, candidates);

}

function updateGeneralResults(parties, candidates=null, election = "primary") {
 
    let totalVotes = getWeightedTotals(candidates, election, parties);

    if (election == "primary") {
        generalCandidatesRow
        .selectAll(".result-label")
        .remove();

        generalCandidatesRow
        .selectAll(".candidate-card")
        .style("background-color", "white")

        generalCandidatesRow
        .selectAll(".candidate-card-img")
        .style("filter", "grayscale(100%)");
    }

    if (totalVotes == 100) {
        generalSection
        .style("display", "block");

        let first  = parties[0];
        let second = parties[1];

        if (parties.some(p => p.general_result == "winner")) {

            generalCandidatesRow
            .select("#candidate-card-" + first.candidate.name)
            .style("background-color", "#F0F9C8")
            .insert("div", ":first-child")
            .attr("class", "result-label winner")
            .text("Ganador");

            generalCandidatesRow
            .select("#candidate-card-img-" + first.candidate.name)
            .style("filter", "grayscale(0%)");
            
            ballotageSection.style("display", "none");
            
            generalCandidatesRow
            .selectAll(".general-retention-button")
            .style("display", "none");

            closeRetentionRow(generalSection, "general");

            makeResultCard(parties, "first");
            
        } else {
            if (election == "primary") {
            generalCandidatesRow
            .selectAll("#candidate-card-" + first.candidate.name + ", #candidate-card-" + second.candidate.name)
            .style("background-color", "#E0E1E1")
            .insert("div", ":first-child")
            .attr("class", "result-label ballotage")
            .text("Ballotage");
            
            generalCandidatesRow
            .selectAll("#candidate-card-img-" + first.candidate.name + ", #candidate-card-img-" + second.candidate.name)
            .style("filter", "grayscale(0%)");

            generalCandidatesRow
            .selectAll(".retention-button")
            .style("display", "flex");
            }

            makeBallotage(parties);

            makeResultCard(parties, "second");
          
        }
    } else {
        resultsSection
        .style("display", "none");
        ballotageSection
        .style("display", "none");
        if (election == "primary") {
            closeRetentionRow(generalSection, "general");
            generalSection.style("display", "none");
        }
    }
}

function updateCandidateNames(parties, candidates) {

    primarySection.selectAll(".primary-candidate-name-retention")
        .text(d => {
            let partyCandidates = candidates.filter(candidate => candidate.party === d.name);
            partyCandidates.sort((a, b) => b.votes - a.votes);
            return partyCandidates[0].name;
        });
  }

function initializeRetentionRow(candidates, parties, section = "primary") {

    let inputSection = d3.select("#" + section + "-section");
    candidates.forEach(candidate => {
        let partyCards = inputSection
        .selectAll(".retention-row")
        .selectAll("#party-card")
        .data(parties)
        .enter()
        .append("div")
        .style("display", "none")
        .attr("class", "party-card party-card-" + candidate.name)
        .attr("id", d => "party-card-" + candidate.name + "-" + d.name);
        
        partyCards.append("div")
        .attr("class", "party-card-name")
        .text(d => d.name)
        .style("color", d => d.color);

        partyCards.append("div")
        .attr("class", section + "-candidate-name-retention")
        .text(d => {
                let partyCandidates = candidates.filter(candidate => candidate.party === d.name);
                partyCandidates.sort((a, b) => b.votes - a.votes);
                return partyCandidates[0].name;
            });
        
        partyCards.append("input")
        .attr("type", "range")
        .attr("min", 0)
        .attr("max", 100)
        .attr("value", d => candidate.party == d.name ? 100 : 0)
        .attr("class", "range-input " + section + "-retention-" + candidate.name)
        .style("background-color", d => d.color)
        .attr("id", d => section + "-retention-" + candidate.name + "-" + d.name)
        .on("touchstart", function() {
            d3.event.stopPropagation();
        });
        
        partyCards.append("div")
        .attr("class", "retention-label")
        .attr("id", d => section + "-retention-label-" + candidate.name + "-" + d.name)
        .text( d => candidate.party == d.name ? "100%" : "0%");
        
        partyCards.selectAll("." + section + "-retention-" + candidate.name)
        .on("input", function() {
            let total = checkTotals(section + "-retention-" + candidate.name, this);

            if (total != 100) {
                primaryCandidatesRow
                .select("#candidate-card-" + candidate.name)
                .select(".retention-button")
                .classed( "retention-not-total", true);
            } else 
            {
                primaryCandidatesRow
                .select("#candidate-card-" + candidate.name)
                .select(".retention-button")
                .attr('class', function(d) {
                    return d3.select(this).attr('class') 
                      .replace('retention-not-total', '');
                  });
            }

            let idParty = d3.select(this).attr("id").split("-");
            let party = idParty[idParty.length - 1];
            d3.select("#" + section + "-retention-label-" + candidate.name + "-" + party).text(d3.select(this).property("value") + "%");

            if (section == "primary") {
                updateVotes(candidates, "primary");
                updatePrimaryWinners(parties, candidates);
            }
        });
    })
}

function makeGeneralCandidates(parties) {

    let generalCandidateSelection = d3.select("#general-candidates-row")
        .selectAll(".candidate-card")
        .data(primaryWinners, d => d.name); 
    
    generalCandidateSelection.exit().remove();

    generalCandidateSelection
        .order() 
        .select(".candidate-card-name") 
        .text(d => d.name);

    let enterSelection = generalCandidateSelection
        .enter()
        .append("div")
        .attr("class", "candidate-card")
        .attr("id", d => "candidate-card-" + d.name)
        .style("border-bottom", d => "5px solid" + parties.find(p => p.name == d.party).color);

    enterSelection.append("img")
        .attr("class", "candidate-card-img")
        .attr("id", d => "candidate-card-img-" + d.name)
        .attr("style", "width: 100px; height: 100px;")
        .attr("src", d => "../static/img/" + d.name + ".webp");

    enterSelection.append("p")
        .attr("class", "candidate-card-name")
        .text(d => d.name);

    enterSelection.append("div")
        .attr("class", "general-votes")
        .attr("id", d => "general-votes-" + d.party)
        .text(d => {
            let party = d.party;
            let votes = parties.find(p => p.name == party).general_votes;
            return votes + "%" ;
        });

    enterSelection.append("button")
        .attr("class", "general-retention-button retention-button")
        .attr("title", d => "Retencion Generales " + d.name)
        .attr("display", "none")
        .text("Distrib.")
        .on("click", function (event, d) { 
            let candidate = d.party;
            let partyColor = parties.find(p => p.name == d.party).color;
            
            if (d3.select("#general-retention").classed("row-closed") ) {
                createRetentionRow(candidate, partyColor, generalSection, "ballotage", parties);
                d3.select(this)
                .style("background-color","#ADEBAD");
                console.log("1")
            } else if (d3.select(".party-card-" + candidate).style("display") == "none") {
                createRetentionRow(candidate, partyColor, generalSection, "ballotage", parties);
                d3.select(this)
                .style("background-color","#ADEBAD");
                console.log("2")
            } else {
                closeRetentionRow(generalSection, "ballotage");
                console.log("3");
            }
        });
}

function makeResultCard(parties, round = "first") {

    resultsSection
    .style("display", "flex");

    let first = parties[0];
    let second = parties[1];

    let woman = first.candidate.name == "Bullrich" || first.candidate.name == "Bregman" || first.candidate.name == "Castañeira";

    resultsSection
    .select("#election-results-img")
    .attr("src", "../static/img/" + first.candidate.name + ".webp");

    resultsSection
    .select("#election-results-text-winner")
    .text(first.candidate.name);

    resultsSection
    .select(".election-results-title")
    .text("Con tus estimaciones, " + first.candidate.name + " es " + 
    (woman ? "la nueva" : "el nuevo") + " presidente de Argentina.");

    resultsSection
    .select("#election-results-text-party")
    .text(first.name_long);

    resultsSection
    .select("#election-results-card")
    .style("background-color", hexToRGBA(first.color, 0.4))
    
    if (round == "first") {
        resultsSection
        .select("#election-results-text-percent")
        .text(parseFloat(first.general_votes.toFixed(2)) + "%");
        
        resultsSection
        .select("#election-results-type-title")
        .text("Primera ronda")
        .style("background-color", "#eedb6e")
        .style("margin-right", "0");
        
        resultsSection
        .select("#election-results-img-loser")
        .style("display", "none")
    } else {
        resultsSection
        .select("#election-results-text-percent")
        .text(first.ballotage_votes + "%");
        resultsSection
        .select("#election-results-type-title")
        .text("Ballotage")
        .style("background-color", "#E2F1F3")
        .style("margin-right", "5px");

        resultsSection
        .select("#election-results-img-loser")
        .style("display", "block")
        .attr("src", "./static/img/" + second.candidate.name + ".webp");
    }

}

function initializeGeneralRetentionRow(parties, candidates = null, section = "general") {

    let inputSection = d3.select("#" + section + "-section");

    let ballotageParties = parties.filter(party => party.general_result == "ballotage");

    inputSection
    .select("#"+ section + "-retention-row")
    .html("");

    parties.forEach(party => {
        let partyCards = inputSection
        .selectAll(".retention-row")
        .selectAll("#party-card")
        .data(ballotageParties)
        .enter()
        .append("div")
        .style("display", "none")
        .attr("class", "party-card party-card-" + party.name)
        .attr("id", d => "party-card-" + party.name + "-" + d.name);
        
        partyCards.append("div")
        .attr("class", "party-card-name")
        .text(d => d.name)
        .style("color", d => d.color);

        partyCards.append("div")
        .attr("class", section + "-candidate-name-retention")
        .text(d => d.candidate.name);
        
        partyCards.append("input")
        .attr("type", "range")
        .attr("min", 0)
        .attr("max", 100)
        .attr("value", d => {
            if (ballotageParties.some(p => p.name == party.name)) {
                return party.name == d.name ? 100 : 0;
            } else {
                return 50;
            }
        })
        .attr("class", "range-input " + section + "-retention-" + party.name)
        .style("background-color", d => d.color)
        .attr("id", d => section + "-retention-" + party.name + "-" + d.name)
        .on("touchstart", function() {
            d3.event.stopPropagation();
        });
        
        partyCards.append("div")
        .attr("class", "retention-label")
        .attr("id", d => section + "-retention-label-" + party.name + "-" + d.name)
        .text( d => {          
            if (ballotageParties.some(p => p.name == party.name)) {
            return party.name == d.name ? "100%" : "0%";
            } else {
                return "50%";
            }});
        
        partyCards.selectAll("." + section + "-retention-" + party.name)
        .on("input", function() {
            let total = checkTotals(section + "-retention-" + party.name, this);

            if (total != 100) {
                generalCandidatesRow
                .select("#candidate-card-" + party.candidate.name)
                .select(".retention-button")
                .classed( "retention-not-total", true);
            } else {
                generalCandidatesRow
                .select("#candidate-card-" + party.candidate.name)
                .select(".retention-button")
                .attr('class', function() {
                    return d3.select(this).attr('class') 
                      .replace('retention-not-total', '');
                  });
            }

            let idParty = d3.select(this).attr("id").split("-");
            let partyID = idParty[idParty.length - 1];
            d3.select("#" + section + "-retention-label-" + party.name + "-" + partyID).
            text(d3.select(this).property("value") + "%");

            updateGeneralResults(parties, candidates, section);

        });
    })
}

function makeBallotage(parties) {
    ballotageSection
    .style("display", "block")
    
    getBallotageResults(parties) 

    parties.sort((a, b) => b.ballotage_votes - a.ballotage_votes);

    let ballotageParties = parties.filter(party => party.general_result == "ballotage").sort((a, b) => b.ballotage_votes - a.ballotage_votes);

    d3.select("#ballotage-candidates-row").html("");

    let ballotageCandidateSection = d3.select("#ballotage-candidates-row")
        .selectAll(".candidate-card")
        .data(ballotageParties, d => d.candidate.name); 
    
    ballotageCandidateSection.exit().remove();

    let enterSelection = ballotageCandidateSection
        .enter()
        .append("div")
        .attr("class", "candidate-card")
        .attr("id", d => "candidate-card-" + d.candidate.name)
        .style("border-bottom", d => "5px solid" + d.color)
        .style("background-color", (d, i) => i == 0 ? "rgb(240, 249, 200)" : "white");

    enterSelection
        .append("div")
        .attr("class", (d, i) => i == 0 ? "result-label winner" : "")
        .text((d, i) => i == 0 ? "Ganador" : null)

    enterSelection
        .append("img")
        .attr("class", "candidate-card-img")
        .attr("id", d => "candidate-card-img-" + d.candidate.name)
        .attr("style", "width: 100px; height: 100px;")
        .attr("src", d => "../static/img/" + d.candidate.name + ".webp")
        .style("filter", (d, i) => i == 0 ? "grayscale(0%)" : "grayscale(100%)");

    enterSelection.append("p")
        .attr("class", "candidate-card-name")
        .text(d => d.candidate.name);

    enterSelection.append("div")
        .attr("class", "general-votes")
        .attr("id", d => "ballotage-votes-" + d.name)
        .text(d => {
            let votes = d.ballotage_votes;
            return votes + "%" ;
        });

    

}

function getBallotageResults(parties) {
    let ballotageParties = parties.filter(party => party.general_result == "ballotage") 

    ballotageParties.forEach(balParty => {
        let votes = 0;
        parties.forEach(party => {

            let retention = d3.select("#general-retention-row")
            .select("#general-retention-" + party.name + "-" + balParty.name)
            .property("value");

            votes += party.general_votes * (retention / 100)
        })
        parties.find(partido => partido.name == balParty.name).ballotage_votes = parseFloat(votes.toFixed(2));
    })

}
