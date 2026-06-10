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

  // 1. 실시간 검색창 이벤트
  searchInput.addEventListener("input", (e) => {
    currentFilters.query = e.target.value.trim().toLowerCase();
    applyFilters(districtsData, onFilterChange);
  });

  // 2. 필터 버튼 그룹 이벤트 등록 공통 함수
  const registerFilterGroup = (container, filterKey) => {
    if (!container) return;
    
    container.addEventListener("click", (e) => {
      const pill = e.target.closest(".filter-pill");
      if (!pill) return;

      // 액티브 클래스 교체
      container.querySelectorAll(".filter-pill").forEach(p => p.classList.remove("active"));
      pill.classList.add("active");

      // 필터 상태 갱신
      currentFilters[filterKey] = pill.getAttribute("data-val");
      
      // 필터 적용
      applyFilters(districtsData, onFilterChange);
    });
  };

  registerFilterGroup(partyFilterContainer, "party");
  registerFilterGroup(regionFilterContainer, "region");
}

// 필터 로직 구현
function applyFilters(districtsData, onFilterChange) {
  const filtered = districtsData.filter(d => {
    // 1) 정당 필터 검사
    const matchParty = currentFilters.party === "all" || d.party === currentFilters.party;

    // 2) 권역 필터 검사
    const matchRegion = currentFilters.region === "all" || d.region === currentFilters.region;

    // 3) 키워드 검색 검사 (구청 이름, 구청장 이름, 정책 내용 전체 탐색)
    let matchQuery = true;
    if (currentFilters.query) {
      const q = currentFilters.query;
      const inName = d.name.toLowerCase().includes(q);
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

  // 필터 완료 리스트를 지도 및 메인 컴포넌트로 전달
  onFilterChange(filtered);
}

// 필터링 초기화 함수
export function resetFilters(districtsData, onFilterChange) {
  currentFilters = { query: "", party: "all", region: "all" };
  
  const searchInput = document.getElementById("search-input");
  if (searchInput) searchInput.value = "";
  
  document.querySelectorAll(".filter-pills").forEach(container => {
    container.querySelectorAll(".filter-pill").forEach((pill, idx) => {
      if (idx === 0) pill.classList.add("active");
      else pill.classList.remove("active");
    });
  });

  onFilterChange(districtsData);
}
