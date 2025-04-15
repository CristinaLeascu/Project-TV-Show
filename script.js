const selectShow = document.getElementById("showSelect");
const rootDiv = document.getElementById("root");

  
  let allEpisodes = [];
  let allShows = [];
  const select = document.getElementById("episodeSelect");

  const input = document.getElementById("q");
  const currentCount = document.getElementById("current");
  const totalCount = document.getElementById("total");

  const loadingMessage = document.getElementById("loadingMessage");
  const errorMessage = document.getElementById("errorMessage");

  // Setup
  async function setup() {
    try {
      loadingMessage.style.display = "block"; 
      allShows = await fetchShows();
      makePageForShows(allShows);
      selectPageForShows(allShows);
      loadingMessage.style.display = "none"; 
    } catch (error) {
      console.error("Error fetching episodes:", error);
      loadingMessage.style.display = "none"; // hide loading message
      errorMessage.style.display = "block"; // show error message
    }
  }

  // fetch shows from the API
  async function fetchShows() {
    const response = await fetch("https://api.tvmaze.com/shows");
    if (!response.ok) {
      throw new Error(`Failed to fetch shows: ${response.status}`);
    }
    //console.log(await response.json())
    return await response.json();
  }

  function selectPageForShows(shows) {
    selectShow.innerHTML = "<option value=''>Select a Show</option>";
    shows.forEach((show) => {
      const option = document.createElement("option");
      option.value = show.id;
      option.textContent = show.name;
      selectShow.appendChild(option);
    });
  }


  // strip HTML tags from a string
  function stripHTMLTags(htmlString) {
    const parser = new DOMParser();
    return (
      parser.parseFromString(htmlString, "text/html").body.textContent || ""
    );
  }

  // filter episodes based on search input
  input.addEventListener("input", function (event) {
    const searchText = event.target.value.trim().toLowerCase();
    const filteredEpisodes = allEpisodes.filter(
      (episode) =>
        episode.name.toLowerCase().includes(searchText)
    );
    makePageForEpisodes(filteredEpisodes);
  });

  setup()

console.log(selectShow);
// event listener for shows selection from dropdown
selectShow.addEventListener("change", function () {
  const episodeId = Number(this.value);
  console.log(episodeId);
  if (episodeId) {
    fetch(`https://api.tvmaze.com/shows/${episodeId}/episodes`)
      //fetch(`https://api.tvmaze.com/shows ([documentation](https://www.tvmaze.com/api#show-index))`)
      .then((res) => res.json())
      .then((episodes) => {
        console.log(episodes);
        allEpisodes = episodes;
        makePageForEpisodes(episodes);
        fillSelector(episodes);
      })
      .catch((err) => {
        console.error("Error fetching episodes for selected show:", err);
      });
    } else {
        makePageForShows(allShows);
        select.innerHTML = "<option value=''>Select an Episode</option>";
      }
  })

  // find an episode by its ID
  function findEpisodeById(episodes, id) {
    return episodes.find((episode) => episode.id === id);
  }

  // fill the dropdown with episodes
  function fillSelector(episodes) {
    select.innerHTML = "<option value=''>Select an Episode</option>"; // Clear previous options !!!!
    episodes.forEach((episode) => {
      const option = document.createElement("option");
      option.value = episode.id;
      const episodeCode = `S${String(episode.season).padStart(2, "0")}E${String(
        episode.number
      ).padStart(2, "0")}`;
      option.textContent = `${episodeCode} - ${episode.name}`;
      select.appendChild(option);
    });
  }
  function makePageForShows(shows) {
    rootDiv.innerHTML = ""; 

    shows.forEach((show) => {
      const showCard = document.createElement("section");
      showCard.classList.add("show-card");

      const title = document.createElement("h3");
      title.textContent = show.name;
      showCard.appendChild(title);

      const img = document.createElement("img");
      img.src = show.image
        ? show.image.medium
        : "https://via.placeholder.com/210x295?text=No+Image";
      showCard.appendChild(img);

      const summary = document.createElement("p");
      showCard.appendChild(summary);
      showCard.addEventListener("click", () => {
        fetch(`https://api.tvmaze.com/shows/${show.id}/episodes`)
          .then((res) => res.json())
          .then((episodes) => {
            allEpisodes = episodes;
            makePageForEpisodes(episodes);
            fillSelector(episodes);
          })
          .catch((err) => {
            console.error("Error fetching episodes for selected show:", err);
          });
      });

      rootDiv.appendChild(showCard);
    });
  }

// });


// update the page with episodes
function makePageForEpisodes(episodes) {
  rootDiv.innerHTML = "";
  currentCount.textContent = episodes.length;
  totalCount.textContent = allEpisodes.length;
  if (episodes.length === 0) {
    rootDiv.innerHTML = "<p>No episodes available.</p>";
    return;
  }




  console.log(episodes)
  // iterate through episodes and create episode cards
  episodes.forEach((episode) => {
    const episodeCard = document.createElement("section");
    episodeCard.classList.add("episode-card");
    console.log(episode)
    const episodeName = episode.name ;
    episodeCard.setAttribute('episode', episode.id)
    const episodeSeason = String(episode.season).padStart(2, "0");
    const episodeNumber = String(episode.number).padStart(2, "0");
    const episodeCode = `S${episodeSeason}E${episodeNumber}`;

    // set episode title and code
    const title = document.createElement("h3");
    title.textContent = `${episodeName} ${episodeCode}`;
    episodeCard.appendChild(title);

    // set episode image (if available)
    const img = document.createElement("img");
    img.src = episode.image
      ? episode.image.medium
      : "https://via.placeholder.com/210x118?text=No+Image";
    episodeCard.appendChild(img);

    // set episode summary with tags removed
    const summary = document.createElement("p");
    summary.textContent = stripHTMLTags(episode.summary);
    episodeCard.appendChild(summary);

    rootDiv.appendChild(episodeCard);
  });
}


select.addEventListener("change", function () {
  const episodeID = Number(this.value);

  if (this.value === "") {
    makePageForEpisodes(allEpisodes);
  } else {
    const selectedEpisode = allEpisodes.find(episode => episode.id === episodeID);
    if (selectedEpisode) {
      makePageForEpisodes([selectedEpisode]);
    }
  }
  
})