
function loadData() {
    let urlParams = new URLSearchParams(window.location.search);
    let id = urlParams.get('id');

    if (id !== null) {
        fetch('/load/?id=' + id)
            .then(response => response.json())
            .then(data => {
                if (!data.error) {
                    
                    const groupByPrefix = (obj) => {
                        return {
                            "primary-input": [],
                            "primary-retention": [],
                            "general-retention": []
                        };
                    };

                    let grouped = Object.keys(data).reduce((acc, key) => {
                        if (key.startsWith('primary-input')) {
                            acc['primary-input'].push(key);
                        } else if (key.startsWith('primary-retention')) {
                            acc['primary-retention'].push(key);
                        } else if (key.startsWith('general-retention')) {
                            acc['general-retention'].push(key);
                        }
                        return acc;
                    }, groupByPrefix(data));
                    
                    Object.keys(grouped).forEach(group => {
                        grouped[group].sort((a, b) => {
                            return data[a] - data[b]; 
                        });
                    });

                    let finalOrder = [].concat(grouped["primary-input"], grouped["primary-retention"], grouped["general-retention"]);

                    finalOrder.forEach(key => {
                        d3.select("#" + key).property("value", data[key])
                        .dispatch("input");
                  });
            }})            
            .catch(error => console.error('Error:', error));
    }
}

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

function openShare() {
    shareModal.style("display", "flex");

    let data = {};

    allInputs = d3.selectAll("input");

    allInputs.each(function() {
        data[this.id] = this.value;
    });

    resultsData = {
        "winner": d3.select("#election-results-text-winner").text(),
        "round": d3.select("#election-results-type-title").text() == "Primera ronda" ? "first" : "second",
        "percentage": d3.select("#election-results-text-percent").text().replace(/%/g, ""),
        "loser": d3.select("#election-results-img-loser").attr("src").replace("./static/img/", "").replace(".webp", ""),
    }

    let imageURL = `https://vercel-og-nextjs-omega-six.vercel.app/api/simulador?winner=${resultsData.winner}&round=${resultsData.round}&loser=${resultsData.loser}&percentage=${resultsData.percentage}&cache=1`
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
        urlShare.text("simuladorelecciones.vercel.app/?id=" + data.id);
        dataId = data.id;

        d3.select("#share-modal-twitter")
        .attr("href", "https://twitter.com/intent/tweet?text=Mi predicción para estas elecciones&url=https://simuladorelecciones.vercel.app/?id=" + data.id)
    })
    .catch(error => console.log(error));
}

function closeShare() {
    shareModal.style("display", "none");
}

function shareButton() {
    if (navigator.share) {
        navigator.share({
            title: 'Simulador de Elecciones Argentina 2023',
            text: 'Mi predicción para estas elecciones',
            url: 'https://simuladorelecciones.vercel.app/?id=' + dataId,
        })
            .then(() => console.log('Successful share'))
            .catch((error) => console.log('Error sharing', error));
    }
}

function createResetButton() {

    d3.select("body")
    .append("button")
    .attr("id", "reset-button")
    .attr("class", "reset-button")
    .attr("title", "Resetear")
    .on("click", function() {
        d3.selectAll(".primary-input")
            .property("value", 0)
            .dispatch("input");

        d3.select("#primary-retention-row")
            .selectAll(".range-input")
            .property("value", function() {
                let candidate = d3.select(this).attr("id").split("-")[2];
                let party = d3.select(this).attr("id").split("-")[3];
                let candidateData = candidates.find(c => c.name == candidate);
                
                return candidateData.party === party ? 100 : 0;
            })
            .dispatch("input");

            closeRetentionRow(primarySection);
    });

}
