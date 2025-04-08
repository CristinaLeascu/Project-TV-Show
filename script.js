document.addEventListener("DOMContentLoaded", function () {
  let allEpisodes = [];
  const select = document.getElementById("episodeSelect");
  const input = document.getElementById("q");
  const currentCount = document.getElementById("current");
  const totalCount = document.getElementById("total");
  const rootDiv = document.getElementById("root");
  const loadingMessage = document.getElementById("loadingMessage");
  const errorMessage = document.getElementById("errorMessage");

  // fetch episodes from the TVMaze API
  async function setup() {
    try {
      loadingMessage.style.display = "block"; // show loading message
      allEpisodes = await fetchEpisodes();
      makePageForEpisodes(allEpisodes); // show all episodes initially
      fillSelector(allEpisodes); // fill the dropdown with episodes
      loadingMessage.style.display = "none"; // hide loading message
      totalCount.textContent = allEpisodes.length; // total number of episodes (73)
    } catch (error) {
      console.error("Error fetching episodes:", error);
      loadingMessage.style.display = "none"; // hide loading message
      errorMessage.style.display = "block"; // show error message
    }
  }

  // fetch episodes from the API
  async function fetchEpisodes() {
    const response = await fetch("https://api.tvmaze.com/shows/82/episodes");
    if (!response.ok) {
      throw new Error(`Failed to fetch episodes: ${response.status}`);
    }
    return await response.json();
  }

  // update the page with episodes
  function makePageForEpisodes(episodes) {
    rootDiv.innerHTML = "";
    currentCount.textContent = episodes.length;
    if (episodes.length === 0) {
      rootDiv.innerHTML = "<p>No episodes available.</p>";
      return;
    }

    // iterate through episodes and create episode cards
    episodes.forEach((episode) => {
      const episodeCard = document.createElement("section");
      episodeCard.classList.add("episode-card");

      const episodeName = episode.name;
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
        episode.name.toLowerCase().includes(searchText) ||
        stripHTMLTags(episode.summary).toLowerCase().includes(searchText)
    );
    makePageForEpisodes(filteredEpisodes);
    currentCount.textContent = filteredEpisodes.length; // update current count after search
  });

  // event listener for episode selection from dropdown
  select.addEventListener("change", function () {
    const selectedEpisode = findEpisodeById(allEpisodes, Number(this.value));
    if (selectedEpisode) {
      makePageForEpisodes([selectedEpisode]);
    } else {
      makePageForEpisodes(allEpisodes);
    }
  });

  // find an episode by its ID
  function findEpisodeById(episodes, id) {
    return episodes.find((episode) => episode.id === id);
  }

  // fill the dropdown with episodes
  function fillSelector(episodes) {
    select.innerHTML = "<option value=''>Select an Episode</option>"; // Clear previous options
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

  setup();
});
