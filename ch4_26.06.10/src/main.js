import districtsData from './data/districts.json';
import { initMap, highlightMapDistricts } from './components/map.js';
import { showDistrictDetail, resetDistrictDetail } from './components/detail.js';
import { initSearchAndFilters } from './components/search.js';
import { renderDashboardCharts } from './components/charts.js';
import { initCompareTool } from './components/compare.js';

document.addEventListener("DOMContentLoaded", () => {
  initApp();
});

function initApp() {
  // 1. 테마(다크/라이트) 설정 초기화
  initTheme();

  // 2. 인터랙티브 지도 생성
  initMap("map-container", districtsData, (selectedDistrict) => {
    showDistrictDetail(selectedDistrict);
  });

  // 3. 실시간 대시보드 차트 렌더링
  renderDashboardCharts(districtsData);

  // 4. 검색 및 다중 필터 초기화
  initSearchAndFilters(districtsData, (filteredDistricts) => {
    // 필터 결과에 따라 지도 하이라이트 조정
    const filteredIds = filteredDistricts.map(d => d.id);
    highlightMapDistricts(filteredIds);
    
    // 차트 데이터 리프레시
    renderDashboardCharts(filteredDistricts);
  });

  // 5. 일대일 비교 도구 설정
  initCompareTool(districtsData);
}

// 테마 변경 로직
function initTheme() {
  const themeToggleBtn = document.getElementById("theme-toggle-btn");
  if (!themeToggleBtn) return;

  const sunIcon = themeToggleBtn.querySelector(".sun-icon");
  const moonIcon = themeToggleBtn.querySelector(".moon-icon");

  // 기존 쿠키나 로컬스토리지 테마 검사 (기본값: 다크)
  const savedTheme = localStorage.getItem("theme") || "dark";
  document.documentElement.setAttribute("data-theme", savedTheme);
  updateThemeIcons(savedTheme, sunIcon, moonIcon);

  themeToggleBtn.addEventListener("click", () => {
    const currentTheme = document.documentElement.getAttribute("data-theme");
    const newTheme = currentTheme === "dark" ? "light" : "dark";
    
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
    updateThemeIcons(newTheme, sunIcon, moonIcon);
  });
}

function updateThemeIcons(theme, sunIcon, moonIcon) {
  if (!sunIcon || !moonIcon) return;
  if (theme === "dark") {
    sunIcon.style.display = "block";
    moonIcon.style.display = "none";
  } else {
    sunIcon.style.display = "none";
    moonIcon.style.display = "block";
  }
}
