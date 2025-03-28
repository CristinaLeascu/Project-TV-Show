//You can edit ALL of the code here
let allEpisodes
function setup() {
  allEpisodes = getAllEpisodes();
  makePageForEpisodes(allEpisodes); //!!!! reuse 
  const numberTotal = document.getElementById("total");
  numberTotal.textContent = `${allEpisodes.length}`;
}


function makePageForEpisodes(allEpisodes) {
  const numberElem = document.getElementById("current");
  numberElem.textContent = ` ${allEpisodes.length}`;
  const rootDiv = document.getElementById("root");
  rootDiv.innerHTML = `                   
  <template id="episode-card-template">
    <section> 
      <h3>Film title</h3>
      <img />
      <p>Summary</p>
    </section>
  </template>
  `;
// HTML clean 

  for (let i = 0; i < allEpisodes.length; i++) {
    const episodeCard = document
      .getElementById("episode-card-template")
      .content.cloneNode(true);

    const episodeName = allEpisodes[i].name;
    console.log(episodeName);
    const episodeSeason = String(allEpisodes[i].season).padStart(2, "0");
    console.log(episodeSeason);
    const episodeNumber = String(allEpisodes[i].number).padStart(2, "0");
    console.log(episodeNumber);
    const episodeCode = `- S${episodeSeason}E${episodeNumber}`;
    console.log(episodeCode);

    // set the title (episode name and code)
    episodeCard.querySelector(
      "h3"
    ).textContent = `${episodeName} ${episodeCode}`;

    // set the image for the episode
    const episodeImage = allEpisodes[i].image.medium;
    console.log(episodeImage);
    episodeCard.querySelector("img").src = episodeImage;

    // set the summary
    const episodeSummary = String(
      allEpisodes[i].summary.slice(3, allEpisodes[i].summary.length - 4)
    );
    console.log(episodeSummary);
    episodeCard.querySelector("p").textContent = `${episodeSummary}`;
    rootDiv.append(episodeCard);
  }
}

document.getElementById("myInput").addEventListener("input", searchEpisode);

function searchEpisode(event) {
  const searchText = event.target.value.trim(); 
  const foundEpisode = allEpisodes.filter(ep => ep.name.includes(searchText) || ep.summary.includes(searchText)); 

  if (foundEpisode) {
      makePageForEpisodes (foundEpisode);
  } else {
  }
}



window.onload = setup;
