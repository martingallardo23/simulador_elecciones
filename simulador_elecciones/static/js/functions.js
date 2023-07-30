function hexToRGBA(hex, alpha) {
    var r = parseInt(hex.slice(1, 3), 16),
        g = parseInt(hex.slice(3, 5), 16),
        b = parseInt(hex.slice(5, 7), 16);

    if (alpha) {
        return "rgba(" + r + ", " + g + ", " + b + ", " + alpha + ")";
    } else {
        return "rgb(" + r + ", " + g + ", " + b + ")";
    }
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

function getGeneralResult(party, candidates) {
    /*
    Calcula los votos para el partido dado
    */
    let votes = 0;
    candidates.forEach(candidate => {
        let primaryVotes = candidate.votes;
        let retention = d3.select("#primary-retention-" + candidate.name + "-" + party.name).property("value") / 100; 
        votes += primaryVotes * retention;
    });
    
    return votes;
}

function updatePrimaryVotes(candidates) {
    // actualiza la cantidad de votos por candidato en la primaria
    candidates.forEach(candidate => {
        candidate.votes = 0;
        let votes = d3.select("#primary-input-" + candidate.name).property("value");
        candidate.votes = +votes;
    });
}

function updatePrimaryWinners(parties, candidates) {
    // actualiza los ganadores de la primaria por partido
    primaryWinners = [];
    parties.map(party => {
        let partyCandidates = candidates.filter(candidate => candidate.party === party.name);

        partyCandidates.sort((a, b) => b.votes - a.votes);

        primaryWinners.push(partyCandidates[0]);
        let general_votes = getGeneralResult(party, candidates);
        party.general_votes = general_votes;
        party.candidate = partyCandidates[0];

        generalCandidatesRow
        .select("#general-votes-" + party.name)
        .text(Math.round(general_votes * 100) / 100 + "%");
    });

    parties.sort((a, b) => b.general_votes - a.general_votes);

    let first = parties[0];
    let second = parties[1];

    if (first.general_votes >= 45 || (first.general_votes >= 40 &&
        first.general_votes - second.general_votes >= 10)) {
        first.general_result = "winner";
    } else {
        first.general_result  = "ballotage";
        second.general_result = "ballotage";
    }

    primaryWinners.sort((a, b) => {
        let votesA = parties.find(p => p.name == a.party).general_votes;
        let votesB = parties.find(p => p.name == b.party).general_votes;
        return votesB - votesA;
    });
    // actualiza los candidatos y resultados de la general
    makeGeneralCandidates(parties); 
    updateGeneralResults(parties);

}

function updateGeneralResults(parties) {
 
    let totalVotes = getTotals(".primary-input");

    generalCandidatesRow
    .selectAll(".result-label")
    .remove();

    generalCandidatesRow
    .selectAll(".candidate-card")
    .style("background-color", "white")

    generalCandidatesRow
    .selectAll(".candidate-card-img")
    .style("filter", "grayscale(100%)");

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

            makeResultCard(parties, "first");
            
        } else {
            generalCandidatesRow
            .selectAll("#candidate-card-" + first.candidate.name + ", #candidate-card-" + second.candidate.name)
            .style("background-color", "#E0E1E1")
            .insert("div", ":first-child")
            .attr("class", "result-label ballotage")
            .text("Ballotage");
            
            generalCandidatesRow
            .selectAll("#candidate-card-img-" + first.candidate.name + ", #candidate-card-img-" + second.candidate.name)
            .style("filter", "grayscale(0%)");

            makeResultCard(parties, "second");
          
        }
    } else {
        generalSection
        .style("display", "none");
        resultsSection
        .style("display", "none");
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
        .attr("class", "primary-candidate-name-retention")
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
        //on touchstart stop propagation;
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
                updatePrimaryVotes(candidates);
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

    let enterSelection = generalCandidateSelection.enter()
        .append("div")
        .attr("class", "candidate-card")
        .attr("id", d => "candidate-card-" + d.name)
        .style("border-bottom", d => "5px solid" + parties.find(p => p.name == d.party).color);

    enterSelection.append("img")
        .attr("class", "candidate-card-img")
        .attr("id", d => "candidate-card-img-" + d.name)
        .attr("style", "width: 100px; height: 100px;")
        .attr("src", d => "./static/img/" + d.name + ".webp");

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
}

function makeResultCard(parties, round = "first") {

    resultsSection
    .style("display", "flex");

    let first = parties[0];
    let second = parties[1];

    let woman = first.candidate.name == "Bullrich" || first.candidate.name == "Bregman";

    resultsSection
    .select("#election-results-img")
    .attr("src", "./static/img/" + first.candidate.name + ".webp");

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
    .select("#election-results-text-percent")
    .text(first.general_votes + "%");

    resultsSection
    .select("#election-results-card")
    .style("background-color", hexToRGBA(first.color, 0.4))

    if (round == "first") {
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

function loadData(parties, candidates) {
    // Get the id from the URL
    let urlParams = new URLSearchParams(window.location.search);
    let id = urlParams.get('id');

    if (id !== null) {
        fetch('/load/?id=' + id)
            .then(response => response.json())
            .then(data => {
                if (!data.error) {
                    
                d3.selectAll("input").each(function() {
                    let inputId = d3.select(this).attr("id");  
                    this.value = data[inputId];
                    let id = inputId.split("-")[0] + "-" + inputId.split("-")[1];
                    checkTotals(id, this);
                    updatePrimaryVotes(candidates);
                    updatePrimaryWinners(parties, candidates);
                    updateCandidateNames(parties, candidates)

                });
            }
            })            
            .catch(error => console.error('Error:', error));
    }
}
function openShare() {
    shareModal.style("display", "flex");

    let data = {};

    allInputs.each(function() {
        data[this.id] = this.value;
    });

    resultsData = {
        "winner": d3.select("#election-results-text-winner").text(),
        "round": d3.select("#election-results-type-title").text() == "Primera ronda" ? "first" : "second",
        "percentage": d3.select("#election-results-text-percent").text().replace(/%/g, ""),
        "loser": d3.select("#election-results-img-loser").attr("src"),
    }

    let imageURL = `https://vercel-og-nextjs-omega-six.vercel.app/api/simulador?winner=${resultsData.winner}&round=${resultsData.round}&loser=${resultsData.loser}&percentage=${resultsData.percentage}`
    shareModal.select("#share-modal-img-img").attr("src", imageURL);

    fetch('/save/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            'data': data,
            'results': resultsData
        })
    })
    .then(response => {
        if (response.ok) {
            return response.json();
        } else {
            throw new Error('Failed to save data');
        }
    }).then(data => {
        urlShare.text("simuladorelecciones.com.ar/?id=" + data.id);
    })
    .catch(error => console.log(error));
}



function closeShare() {
    shareModal.style("display", "none");
}

function shareButton() {
    if (navigator.share) {
        navigator.share({
            title: 'Simulador de Elecciones',
            text: 'Hacé tu predicción de las elecciones 2023',
            url: 'https://martingallardo23.github.io/simulador-elecciones',
        })
            .then(() => console.log('Successful share'))
            .catch((error) => console.log('Error sharing', error));
    }
}
