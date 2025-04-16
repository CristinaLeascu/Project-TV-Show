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
const input = document.getElementById("q");

const currentCount = document.getElementById("current");
const totalCount = document.getElementById("total");

const loadingMessage = document.getElementById("loadingMessage");
const errorMessage = document.getElementById("errorMessage");

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
  showsList.innerHTML =
    "<option value='' disabled selected>Select a show</option>";
  shows.forEach((show) => {
    const option = document.createElement("option");
    option.value = show.id;
    option.textContent = show.name;
    showsList.appendChild(option);
  });
};

// fill the dropdown with episodes
const populateEpisodesList = (episodes) => {
  episodesList.innerHTML = "<option value='' >Select an episode</option>";
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

// update episodes
function makePageForEpisodes(episodes) {
  rootDiv.innerHTML = "";

  currentCount.textContent = episodes.length;
  totalCount.textContent = episodes.length;
  if (episodes.length === 0) {
    rootDiv.innerHTML = "<p>No episodes available.</p>";
    return;
  }

  // iterate through episodes and create episode cards
  episodes.forEach((episode) => {
    const episodeCard = document.createElement("section");
    episodeCard.classList.add("episode-card");

    const episodeName = episode.name;

    episodeCard.setAttribute("episode", episode.id);
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
}
const allEpisodesButton = () => {
  const allEpButton =
    document.getElementById("all-episodes-button") ||
    document.createElement("button");

  allEpButton.textContent = "Show all episodes";
  allEpButton.id = "all-episodes-button";
  allEpButton.onclick = () => {
    makePageForEpisodes(state.episodes);
    episodesList.selectedIndex = 0; // Reset the list to the default
    input.value = "";
    searchMessage.textContent = `Displaying ${state.episodes.length}/${state.episodes.length} episodes`;
  };
  rootDiv.before(allEpButton);
};

// to handle show selection
showsList.addEventListener("change", async (event) => {
  const showId = parseInt(event.target.value);
  const episodes = await fetchEpisodes(showId);

  state.episodes = episodes;
  makePageForEpisodes(episodes);
  populateEpisodesList(episodes);
  allEpisodesButton();
});

// episode selection
episodesList.addEventListener("change", (event) => {
  const episodeID = parseInt(event.target.value);

  const selectedEpisode = state.episodes.find((ep) => ep.id === episodeID);
  if (selectedEpisode) {
    makePageForEpisodes([selectedEpisode]);
  }
});

// filter episodes based on search input
input.addEventListener("input", () => {
  const searchText = input.value.toLowerCase();
  const filteredEpisodes = state.episodes.filter(
    (episode) =>
      episode.name.toLowerCase().includes(searchText) ||
      (episode.summary && episode.summary.toLowerCase().includes(searchText))
  );
  makePageForEpisodes(filteredEpisodes);
});

const setup = async () => {
  const shows = await fetchShows();
  state.shows = shows.sort((a, b) => a.name.localeCompare(b.name)); // Sort show alphabetically

  populateShowsList(state.shows);

  showsList.selectedIndex = 1;
  showsList.dispatchEvent(new Event("change"));
};

window.onload = setup;
