let currentFilters = {
  query: "",
  party: "all",
  region: "all"
};

export function initSearchAndFilters(districtsData, onFilterChange) {
  const searchInput = document.getElementById("search-input");
  const partyFilterContainer = document.getElementById("party-filter-container");
  const regionFilterContainer = document.getElementById("region-filter-container");

  if (!searchInput) return;

  // 1. Search input event
  searchInput.addEventListener("input", (e) => {
    currentFilters.query = e.target.value.trim().toLowerCase();
    applyFilters(districtsData, onFilterChange);
  });

  // 2. Filter pills click events
  const registerFilterGroup = (container, filterKey) => {
    if (!container) return;
    
    container.addEventListener("click", (e) => {
      const pill = e.target.closest(".filter-pill");
      if (!pill) return;

      container.querySelectorAll(".filter-pill").forEach(p => p.classList.remove("active"));
      pill.classList.add("active");

      currentFilters[filterKey] = pill.getAttribute("data-val");
      
      applyFilters(districtsData, onFilterChange);
    });
  };

  registerFilterGroup(partyFilterContainer, "party");
  registerFilterGroup(regionFilterContainer, "region");

  // Initialize filter sliding background indicators
  initFilterIndicators();
}

function initFilterIndicators() {
  document.querySelectorAll(".filter-pills").forEach(container => {
    let indicator = container.querySelector(".slide-indicator");
    if (!indicator) {
      indicator = document.createElement("span");
      indicator.className = "slide-indicator";
      container.appendChild(indicator);
    }

    const updateIndicator = () => {
      const activePill = container.querySelector(".filter-pill.active");
      if (activePill) {
        indicator.style.left = `${activePill.offsetLeft}px`;
        indicator.style.top = `${activePill.offsetTop}px`;
        indicator.style.width = `${activePill.offsetWidth}px`;
        indicator.style.height = `${activePill.offsetHeight}px`;
      }
    };

    // Run on initial load and resize
    setTimeout(updateIndicator, 50);
    window.addEventListener("resize", updateIndicator);

    // Watch for click events on filter pills
    container.addEventListener("click", (e) => {
      if (e.target.closest(".filter-pill")) {
        setTimeout(updateIndicator, 0);
      }
    });
  });
}

function applyFilters(districtsData, onFilterChange) {
  const filtered = districtsData.filter(d => {
    const matchParty = currentFilters.party === "all" || d.party === currentFilters.party;
    const matchRegion = currentFilters.region === "all" || d.region === currentFilters.region;

    let matchQuery = true;
    if (currentFilters.query) {
      const q = currentFilters.query;
      const inName = (d.name_kr || d.name).toLowerCase().includes(q);
      const inMayor = d.mayor.toLowerCase().includes(q);
      const inSlogan = d.slogan.toLowerCase().includes(q);
      const inDescription = d.description.toLowerCase().includes(q);
      const inPolicies = d.policies.some(p => 
        p.title.toLowerCase().includes(q) || 
        p.description.toLowerCase().includes(q)
      );

      matchQuery = inName || inMayor || inSlogan || inDescription || inPolicies;
    }

    return matchParty && matchRegion && matchQuery;
  });

  onFilterChange(filtered);
}

export function resetFilters(districtsData, onFilterChange) {
  currentFilters = { query: "", party: "all", region: "all" };
  
  const searchInput = document.getElementById("search-input");
  if (searchInput) searchInput.value = "";
  
  document.querySelectorAll(".filter-pills").forEach(container => {
    container.querySelectorAll(".filter-pill").forEach((pill, idx) => {
      if (idx === 0) pill.classList.add("active");
      else pill.classList.remove("active");
    });

    const indicator = container.querySelector(".slide-indicator");
    if (indicator) {
      const activePill = container.querySelector(".filter-pill.active");
      if (activePill) {
        setTimeout(() => {
          indicator.style.left = `${activePill.offsetLeft}px`;
          indicator.style.top = `${activePill.offsetTop}px`;
          indicator.style.width = `${activePill.offsetWidth}px`;
          indicator.style.height = `${activePill.offsetHeight}px`;
        }, 0);
      }
    }
  });

  onFilterChange(districtsData);
}
