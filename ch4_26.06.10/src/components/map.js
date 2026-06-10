import { seoulMapData, getHexPoints } from '../assets/seoul_map.js';

let activeSelectedId = null;

export function initMap(containerId, districtsData, onSelectDistrict) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const { config, districts, hanRiver } = seoulMapData;
  const { width, height, hexRadius, spacingX, spacingY, originX, originY } = config;

  // 1. SVG 엘리먼트 생성
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
  svg.setAttribute("width", "100%");
  svg.setAttribute("height", "100%");

  // Gradients and Filters definition
  const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
  defs.innerHTML = `
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="6" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  `;
  svg.appendChild(defs);

  // 2. 한강(Han River) 렌더링
  const riverPoints = hanRiver.map(pt => {
    // 짝수/홀수 행에 따른 x 오프셋 계산 (벌집 배치 대응)
    const isOdd = Math.floor(pt.row) % 2 !== 0;
    const xOffset = isOdd ? spacingX / 2 : 0;
    const x = originX + pt.col * spacingX + xOffset;
    const y = originY + pt.row * spacingY;
    return `${x},${y}`;
  });

  const riverPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
  riverPath.setAttribute("d", `M ${riverPoints.join(" L ")}`);
  riverPath.setAttribute("class", "han-river-path");
  svg.appendChild(riverPath);

  // 3. 자치구 벌집 노드 렌더링을 위한 그룹
  const districtsGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");

  districts.forEach(d => {
    // 구 정보 맵핑
    const info = districtsData.find(item => item.id === d.id);
    if (!info) return;

    // 행/열에 따른 실제 x, y 중심점 좌표 구하기
    const isOdd = d.row % 2 !== 0;
    const xOffset = isOdd ? spacingX / 2 : 0;
    const cx = originX + d.col * spacingX + xOffset;
    const cy = originY + d.row * spacingY;

    // 정육각형 Points 구하기
    const pointsStr = getHexPoints(cx, cy, hexRadius);

    // polygon 노드 생성
    const poly = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    poly.setAttribute("points", pointsStr);
    poly.setAttribute("id", `hex-${d.id}`);
    
    // 정당에 따른 기본 클래스 할당
    const partyClass = info.party === "더불어민주당" ? "party-minjoo" : "party-ppp";
    poly.setAttribute("class", `map-hex ${partyClass}`);
    poly.setAttribute("data-id", d.id);
    poly.setAttribute("data-name", d.name);

    // 텍스트 라벨 노드 생성
    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.setAttribute("x", cx.toFixed(1));
    text.setAttribute("y", (cy + 2).toFixed(1)); // 약간 아래쪽 정렬 보정
    text.setAttribute("class", "map-label light-text");
    text.textContent = d.name.replace("구", ""); // '강남구' -> '강남' 형태로 출력해 시각성 확보

    // 그룹에 추가
    districtsGroup.appendChild(poly);
    districtsGroup.appendChild(text);

    // 이벤트 리스너 설정
    setupEvents(poly, info, onSelectDistrict);
  });

  svg.appendChild(districtsGroup);
  container.innerHTML = "";
  container.appendChild(svg);
}

// 툴팁 및 클릭 이벤트 바인딩
function setupEvents(element, info, onSelectDistrict) {
  const tooltip = document.getElementById("map-tooltip");

  element.addEventListener("mouseenter", (e) => {
    // 툴팁 노출
    tooltip.innerHTML = `
      <div class="tooltip-header">${info.name}</div>
      <div>구청장: <strong>${info.mayor}</strong> (${info.party.replace("더불어민주당", "민주").replace("국민의힘", "국힘")})</div>
      <div style="font-size: 10.5px; margin-top: 4px; color: #a1a1aa; font-style: italic;">"${info.slogan}"</div>
    `;
    tooltip.style.opacity = "1";
    positionTooltip(e);
  });

  element.addEventListener("mousemove", (e) => {
    positionTooltip(e);
  });

  element.addEventListener("mouseleave", () => {
    tooltip.style.opacity = "0";
  });

  element.addEventListener("click", () => {
    // 기존 선택 하이라이트 해제 및 신규 할당
    if (activeSelectedId) {
      const prev = document.getElementById(`hex-${activeSelectedId}`);
      if (prev) prev.classList.remove("selected");
    }
    
    element.classList.add("selected");
    activeSelectedId = info.id;
    
    // 외부 콜백 실행
    onSelectDistrict(info);
  });
}

// 툴팁 마우스 트래킹 위치 계산
function positionTooltip(e) {
  const tooltip = document.getElementById("map-tooltip");
  const offset = 15;
  // 부모 컨테이너(map-panel) 기준으로 마우스 위치 계산
  const rect = e.currentTarget.ownerSVGElement.parentNode.getBoundingClientRect();
  const x = e.clientX - rect.left + offset;
  const y = e.clientY - rect.top + offset;
  
  tooltip.style.left = `${x}px`;
  tooltip.style.top = `${y}px`;
}

// 검색 및 필터링 결과에 따른 지도 상태 업데이트 함수
export function highlightMapDistricts(filteredIds) {
  const hexagons = document.querySelectorAll(".map-hex");
  
  hexagons.forEach(hex => {
    const id = hex.getAttribute("data-id");
    
    if (filteredIds.length === 0) {
      // 필터링 결과가 없으면 모두 비활성화 처리
      hex.style.opacity = "0.15";
      hex.style.pointerEvents = "none";
    } else if (filteredIds.includes(id)) {
      // 검색 대상인 경우 활성화
      hex.style.opacity = "1";
      hex.style.pointerEvents = "auto";
    } else {
      // 검색 대상이 아닌 경우 반투명 처리
      hex.style.opacity = "0.2";
      hex.style.pointerEvents = "none";
    }
  });
}

// 특정 자치구 강제 선택 및 하이라이트 (리스트 등 외부 제어용)
export function selectMapDistrictById(districtId) {
  const hex = document.getElementById(`hex-${districtId}`);
  if (hex) {
    hex.dispatchEvent(new Event("click"));
  }
}
