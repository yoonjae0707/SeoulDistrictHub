import { initMap, highlightMapDistricts, selectMapDistrictById } from './components/map.js';
import { showDistrictDetail } from './components/detail.js';
import { initSearchAndFilters } from './components/search.js';
import { renderDashboardCharts } from './components/charts.js';
import { initCompareTool } from './components/compare.js';
import { initSuitabilityCalculator, addDistrictToCalculator } from './components/suitability.js';
import districtsData from './assets/districts.json';

// 서울특별시 기본 행정 정보 객체 (자치구가 미선택 상태일 때 기본 표출)
const seoulCityData = {
  id: "seoul",
  name: "서울특별시",
  name_kr: "서울특별시",
  region: "대한민국 수도",
  mayor: "오세훈",
  party: "국민의힘",
  slogan: "동행·매력 특별시 서울",
  description: "대한민국의 수도이자 경제, 문화, 교육, 교통의 교통 허브인 천만 서울시민의 중심 도시입니다.",
  logo_url: "https://upload.wikimedia.org/wikipedia/commons/2/23/Emblem_of_Seoul.svg",
  mayor_img_url: "https://api.dicebear.com/7.x/initials/svg?seed=%EC%98%A4%EC%84%B8%ED%9B%88&backgroundColor=e61c24&fontFamily=Arial&fontSize=40&bold=true",
  mayor_profile: {
    birth: "1961년생",
    education: "고려대학교 대학원 법학 박사",
    career: "제33·34·38·39대 서울특별시시장 (현 민선8기)",
    votes: "59.0%"
  },
  policies: [
    {
      title: "약자와의 동행",
      description: "안심소득, 서울형 교육 플랫폼(서울런), 안심 주거환경 조성 정책으로 사회적 취약계층의 주거/교육 안전망을 강화합니다."
    },
    {
      title: "매력 특별시 서울",
      description: "그레이트 한강 프로젝트, 녹지생태도심 개발, 매력적인 야간 한강 보행길 구축을 통해 세계적인 랜드마크 도시로 거듭납니다."
    },
    {
      title: "스마트 교통 및 침수 안심도시",
      description: "스마트 대중교통 인프라 구축, 자율주행 심야버스 도입, 대심도 빗물 배수 터널 구축을 통해 기후위기에도 끄떡없는 안전망을 마련합니다."
    }
  ],
  stats: {
    population: "9420000",
    budget: "457400", // ~45.7조 원
    satisfaction: "89"
  },
  link: "https://www.seoul.go.kr"
};

document.addEventListener("DOMContentLoaded", () => {
  bootstrapApp();
});

async function bootstrapApp() {
  try {


    // 2. 탭 메뉴 전환 기능 초기화
    initTabNavigation();
    initTabIndicator();

    // 3. 자치구 신속 선택 리스트 렌더링
    renderSidebarDistrictList(districtsData);

    // 4. 인터랙티브 지도 생성
    // (상세 정보 뷰어 및 적합도 계산기 추가 콜백 바인딩)
    initMap("map-container", districtsData, (selectedDistrict) => {
      // 리스트 선택 동기화
      syncListSelection(selectedDistrict.id);
      showDistrictDetail(selectedDistrict, (id) => {
        addDistrictToCalculator(id);
      });
    });

    // 5. 기본 상세 정보로 '서울특별시' 로드
    showDistrictDetail(seoulCityData, () => {});

    // 6. 대시보드 요약 차트 렌더링
    renderDashboardCharts(districtsData);

    // 7. 검색 및 다중 필터 기능 초기화
    initSearchAndFilters(districtsData, (filteredDistricts) => {
      const filteredIds = filteredDistricts.map(d => d.id);
      highlightMapDistricts(filteredIds);
      renderDashboardCharts(filteredDistricts);
      
      // 리스트 필터링 동기화
      filterSidebarDistrictList(filteredIds);
    });

    // 8. 일대일 구청 대조 도구 초기화 (Compare Tab)
    initCompareTool(districtsData);

    // 9. 주거 적합도 시뮬레이션 계산기 초기화
    initSuitabilityCalculator(districtsData);

  } catch (err) {
    console.error("Initialization error:", err);
    // UI에 에러 표시
    const mapContainer = document.getElementById("map-container");
    if (mapContainer) {
      mapContainer.innerHTML = `
        <div style="color:var(--seoul-red); font-weight:700; text-align:center; padding: 40px 10px;">
          서버 연결에 실패했습니다. <br>
          <span style="font-size:12px; font-weight:600; color:var(--text-muted)">Python 백엔드 서버(main.py)가 구동 중인지 확인해 주세요.</span>
        </div>
      `;
    }
  }
}

// 탭 네비게이션 처리
function initTabNavigation() {
  const tabs = document.querySelectorAll(".nav-tab");
  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      // 1. 버튼 액티브 클래스 교체
      tabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");

      // 2. 뷰 전환
      const targetTab = tab.getAttribute("data-tab");
      document.querySelectorAll(".tab-view").forEach(view => {
        view.classList.remove("active");
      });

      const activeView = document.getElementById(`view-${targetTab}`);
      if (activeView) {
        activeView.classList.add("active");
      }
    });
  });
}

// 탭 백그라운드 슬라이드 인디케이터 초기화
function initTabIndicator() {
  const navTabs = document.querySelector(".nav-tabs");
  if (!navTabs) return;

  let indicator = navTabs.querySelector(".slide-indicator");
  if (!indicator) {
    indicator = document.createElement("span");
    indicator.className = "slide-indicator";
    navTabs.appendChild(indicator);
  }

  const updateIndicator = () => {
    const activeTab = navTabs.querySelector(".nav-tab.active");
    if (activeTab) {
      indicator.style.left = `${activeTab.offsetLeft}px`;
      indicator.style.top = `${activeTab.offsetTop}px`;
      indicator.style.width = `${activeTab.offsetWidth}px`;
      indicator.style.height = `${activeTab.offsetHeight}px`;
    }
  };

  // Run on initial load and resize
  setTimeout(updateIndicator, 50);
  window.addEventListener("resize", updateIndicator);

  // Watch for click events on tabs
  navTabs.querySelectorAll(".nav-tab").forEach(tab => {
    tab.addEventListener("click", () => {
      setTimeout(updateIndicator, 0);
    });
  });
}

// 자치구 신속 선택 리스트 렌더링
function renderSidebarDistrictList(data) {
  const container = document.getElementById("district-list-container");
  if (!container) return;

  // 가나다순 정렬
  const sorted = [...data].sort((a, b) => {
    const nameA = a.name_kr || a.name;
    const nameB = b.name_kr || b.name;
    return nameA.localeCompare(nameB, 'ko');
  });

  container.innerHTML = sorted.map(d => {
    const displayName = d.name_kr || d.name;
    const partyClass = d.party === "더불어민주당" ? "minjoo" : "ppp";
    return `
      <div class="district-list-item" data-id="${d.id}" id="list-item-${d.id}">
        <span>${displayName}</span>
        <span class="district-list-item-party-dot ${partyClass}"></span>
      </div>
    `;
  }).join("");

  // 클릭 이벤트 바인딩
  container.querySelectorAll(".district-list-item").forEach(item => {
    item.addEventListener("click", () => {
      const id = item.getAttribute("data-id");
      selectMapDistrictById(id);
    });
  });
}

// 지도 선택에 맞춰 리스트의 액티브 상태 변경 및 스크롤 동기화
function syncListSelection(selectedId) {
  document.querySelectorAll(".district-list-item").forEach(item => {
    const id = item.getAttribute("data-id");
    if (id === selectedId) {
      item.classList.add("active");
      item.scrollIntoView({ block: "nearest", behavior: "smooth" });
    } else {
      item.classList.remove("active");
    }
  });
}

// 검색 및 필터에 맞춰 리스트 노출 여부 제어
function filterSidebarDistrictList(filteredIds) {
  document.querySelectorAll(".district-list-item").forEach(item => {
    const id = item.getAttribute("data-id");
    if (filteredIds.includes(id)) {
      item.style.display = "inline-flex";
    } else {
      item.style.display = "none";
    }
  });
}
