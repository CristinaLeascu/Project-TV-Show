const state = {
  shows: [],
  episodes: [],
  serchTerm: "",
  cache: {}, //to store fetched data to be reused
};

const showEndpoint = "https://api.tvmaze.com/shows";
const episodesEndpoint = (showId) =>
  `https://api.tvmaze.com/shows/${showId}/episodes`;

const showsList = document.getElementById("shows");
const rootDiv = document.getElementById("root");
const episodesList = document.getElementById("episodes");
// innitialy hide the episodes dropdown
episodesList.style.display = "none";
const input = document.getElementById("q");

const currentCount = document.getElementById("current");
const totalCount = document.getElementById("total");

const loadingMessage = document.getElementById("loadingMessage");
const errorMessage = document.getElementById("errorMessage");
const searchMessage = document.getElementById("searchMessage");

// helper function to update counts
const updateCounts = (current, total) => {
  currentCount.textContent = current.toString();
  totalCount.textContent = total.toString();
};

// helper function to update search message
const updateSearchMessage = (currentCount, totalCount, type = "shows") => {
  if (currentCount === 0) {
    searchMessage.textContent = `No ${type} available.`;
  } else {
    searchMessage.textContent = `Displaying ${currentCount}/${totalCount} ${type}`;
  }
};

// helper function to toggle dropdown visibility
const toggleDropdown = (visible) => {
  episodesList.style.display = visible ? "block" : "none";
};

// fetch shows from the API
const fetchShows = async () => {
  try {
    const response = await fetch(showEndpoint);
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Error fetching shows:", error);
    return [];
  }
};

// fetch episodes for a given show
const fetchEpisodes = async (showId) => {
  if (state.cache[showId]) return state.cache[showId]; // Use cached data if available

  try {
    const response = await fetch(episodesEndpoint(showId));
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    const episodes = await response.json();
    state.cache[showId] = episodes; // Cache the episodes
    return episodes;
  } catch (error) {
    console.error("Error fetching episodes:", error);
    return [];
  }
};

//polupate dropdown shows list
const populateShowsList = (shows) => {
  showsList.innerHTML = "<option value='all' selected>All Shows</option>";

  // add dynamic individual options for each show
  shows.forEach((show) => {
    const option = document.createElement("option");
    option.value = show.id;
    option.textContent = show.name;
    showsList.appendChild(option);
  });
};

// fill the dropdown with episodes
const populateEpisodesList = (episodes) => {
  episodesList.innerHTML = "<option value='all' selected>All Episodes</option>";
  episodes.forEach((episode) => {
    const option = document.createElement("option");
    option.value = episode.id;
    const episodeCode = `S${String(episode.season).padStart(2, "0")}E${String(
      episode.number
    ).padStart(2, "0")}`;
    option.textContent = `${episodeCode} - ${episode.name}`;
    episodesList.appendChild(option);
  });
};

//show listing
function makepageForShows(shows) {
  rootDiv.innerHTML = "";

  if (shows.length === 0) {
    rootDiv.innerHTML = "<p>No shows available.</p>";
    return;
  }

  shows.forEach((show) => {
    const showCard = document.createElement("section");
    showCard.classList.add("show-card");

    const showTitle = document.createElement("h3");
    showTitle.textContent = show.name;
    showCard.appendChild(showTitle);

    const showImage = document.createElement("img");
    showImage.src = show.image.medium;
    showImage.alt = `${show.name} poster`;
    showCard.appendChild(showImage);

    const showSummary = document.createElement("p");
    showSummary.innerHTML = show.summary || "No summary available.";
    showCard.appendChild(showSummary);

    const showGenres = document.createElement("p");
    showGenres.textContent = `Genres: ${show.genres.join(", ") || "N/A"}`;
    showCard.appendChild(showGenres);

    const showStatus = document.createElement("p");
    showStatus.textContent = `Status: ${show.status}`;
    showCard.appendChild(showStatus);

    const showRating = document.createElement("p");
    showRating.textContent = `Rating: ${show.rating.average || "N/A"}`;
    showCard.appendChild(showRating);

    const showRuntime = document.createElement("p");
    showRuntime.textContent = `Runtime: ${
      show.runtime ? `${show.runtime} minutes` : "N/A"
    }`;
    showCard.appendChild(showRuntime);

    // add click event to fetch episodes
    showTitle.addEventListener("click", async () => {
      const episodes = await fetchEpisodes(show.id);
      state.episodes = episodes;

      toggleDropdown(true);
      populateEpisodesList(episodes);
      makePageForEpisodes(episodes);
    });
    rootDiv.appendChild(showCard);
  });

  updateSearchMessage(state.shows.length, state.shows.length, "shows");

  toggleDropdown(false);
}

const updateEpisodesDisplay = (filteredEpisodes) => {
  makePageForEpisodes(filteredEpisodes);
};

// update episodes
function makePageForEpisodes(episodes) {
  rootDiv.innerHTML = "";

  if (episodes.length === 0) {
    rootDiv.innerHTML = "<p>No episodes available.</p>";
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
    img.src = episode.image.medium;
    episodeCard.appendChild(img);

    // set episode summary with tags removed
    const summary = document.createElement("p");
    summary.innerHTML = episode.summary;
    episodeCard.appendChild(summary);

    rootDiv.appendChild(episodeCard);
  });
  updateSearchMessage(episodes.length, state.episodes.length, "episodes");
}

// Reset to all shows
const resetToShows = () => {
  makepageForShows(state.shows);
  toggleDropdown(false);
};

// to handle show selection
showsList.addEventListener("change", async (event) => {
  const showId = event.target.value;

  if (showId === "all") {
    resetToShows();
    return;
  }
  const episodes = await fetchEpisodes(showId);
  state.episodes = episodes;
  toggleDropdown(true);
  populateEpisodesList(episodes);
  makePageForEpisodes(episodes);
});

// episode selection
episodesList.addEventListener("change", (event) => {
  const episodeID = parseInt(event.target.value);

  const episode = state.episodes.find((ep) => ep.id === episodeID);
  if (episodeID === "all") {
    makePageForEpisodes(state.episodes);
  } else {
    if (event.target.value === "all") {
      makePageForEpisodes(state.episodes); // Display all episodes
    } else {
      const episodeID = parseInt(event.target.value);
      const episode = state.episodes.find((ep) => ep.id === episodeID);
      if (episode) makePageForEpisodes([episode]);
    }
  }
});

// filter episodes based on search input
input.addEventListener("input", () => {
  const searchText = input.value.toLowerCase();

  if (episodesList.style.display === "none") {
    // search in shows
    const filteredShows = state.shows.filter(
      (show) =>
        show.name.toLowerCase().includes(searchText) ||
        (show.summary && show.summary.toLowerCase().includes(searchText)) ||
        (show.genres &&
          show.genres.some((genre) => genre.toLowerCase().includes(searchText)))
    );

    makepageForShows(filteredShows);
    updateSearchMessage(filteredShows.length, state.shows.length, "shows");
  } else {
    const filteredEpisodes = state.episodes.filter(
      (episode) =>
        episode.name.toLowerCase().includes(searchText) ||
        (episode.summary && episode.summary.toLowerCase().includes(searchText))
    );

    updateEpisodesDisplay(filteredEpisodes);
    updateSearchMessage(
      filteredEpisodes.length,
      state.episodes.length,
      "episodes"
    );
  }
});

const setup = async () => {
  try {
    const shows = await fetchShows();
    state.shows = shows.sort((a, b) => a.name.localeCompare(b.name)); // Sort show alphabetically

    populateShowsList(state.shows);
    makepageForShows(state.shows);
  } catch (error) {
    console.error("Error during setup:", error);
    errorMessage.textContent =
      "An error occurred while loading shows. Please try again later.";
  }
};

window.onload = setup;
