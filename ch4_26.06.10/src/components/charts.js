// SVG 기반 경량 대시보드 차트 렌더러 모듈

export function renderDashboardCharts(filteredDistricts) {
  renderPartyDonutChart(filteredDistricts);
  renderRegionBarChart(filteredDistricts);
  renderPolicyKeywordChart(filteredDistricts);
}

// 1. 정당 분포 도넛 차트
function renderPartyDonutChart(districts) {
  const container = document.getElementById("party-chart-container");
  if (!container) return;

  const minjooCount = districts.filter(d => d.party === "더불어민주당").length;
  const pppCount = districts.filter(d => d.party === "국민의힘").length;
  const total = minjooCount + pppCount;

  // 통계 헤더 수치 업데이트
  const statText = document.getElementById("stat-parties");
  if (statText) {
    statText.textContent = total > 0 ? `민주 ${minjooCount} : 국힘 ${pppCount}` : "데이터 없음";
  }

  if (total === 0) {
    container.innerHTML = `<span style="font-size:12px; color:var(--text-muted)">적합한 데이터가 없습니다.</span>`;
    return;
  }

  const minjooPct = (minjooCount / total) * 100;
  const pppPct = (pppCount / total) * 100;

  // Donut geometry variables
  const radius = 30;
  const strokeWidth = 8;
  const circ = 2 * Math.PI * radius; // 188.49

  // Stroke offsets
  const minjooOffset = circ;
  const pppOffset = circ - (minjooPct / 100) * circ;

  container.innerHTML = `
    <svg width="120" height="90" viewBox="0 0 100 100" style="transform: rotate(-90deg);">
      <!-- Background Circle -->
      <circle cx="50" cy="50" r="${radius}" fill="none" stroke="var(--panel-border)" stroke-width="${strokeWidth}" />
      
      <!-- 민주당 Arc -->
      <circle cx="50" cy="50" r="${radius}" fill="none" 
        stroke="var(--party-minjoo)" 
        stroke-width="${strokeWidth}" 
        stroke-dasharray="${circ}" 
        stroke-dashoffset="${circ - (minjooPct / 100) * circ}" 
        stroke-linecap="round"
        style="transition: stroke-dashoffset 0.5s ease;"
      />
      
      <!-- 국민의힘 Arc (누적 오프셋 적용) -->
      <circle cx="50" cy="50" r="${radius}" fill="none" 
        stroke="var(--party-ppp)" 
        stroke-width="${strokeWidth}" 
        stroke-dasharray="${circ}" 
        stroke-dashoffset="${circ - (pppPct / 100) * circ}"
        transform="rotate(${(minjooPct / 100) * 360} 50 50)" 
        stroke-linecap="round"
        style="transition: stroke-dashoffset 0.5s ease;"
      />
      
      <!-- Center Label Background -->
      <circle cx="50" cy="50" r="${radius - strokeWidth/2 - 1}" fill="var(--card-bg)" />
    </svg>
    <div style="position: absolute; display: flex; flex-direction: column; align-items: center; justify-content: center; transform: rotate(0deg);">
      <div style="font-size: 10px; font-weight: 700; color: var(--text-muted)">전체</div>
      <div style="font-size: 16px; font-weight: 800; color: var(--text-primary)">${total}</div>
    </div>
  `;
}

// 2. 권역별 분포 가로 막대 그래프
function renderRegionBarChart(districts) {
  const container = document.getElementById("region-chart-container");
  if (!container) return;

  const regions = ["도심권", "동북권", "서북권", "서남권", "동남권"];
  const regionCounts = regions.map(r => ({
    name: r,
    count: districts.filter(d => d.region === r).length
  }));

  const maxCount = Math.max(...regionCounts.map(rc => rc.count), 1);

  // 헤더 갱신
  const statText = document.getElementById("stat-regions");
  if (statText) {
    const highestRegion = [...regionCounts].sort((a,b) => b.count - a.count)[0];
    statText.textContent = highestRegion && highestRegion.count > 0 ? `${highestRegion.name} 우세 (${highestRegion.count}개)` : "5개 대권역 구성";
  }

  let html = `<div style="display:flex; flex-direction:column; gap:6px; width:100%; padding: 0 10px;">`;
  
  regionCounts.forEach(rc => {
    const pct = (rc.count / maxCount) * 100;
    html += `
      <div style="display:flex; align-items:center; gap:8px; font-size:10.5px; width:100%;">
        <span style="width:40px; font-weight:700; color:var(--text-secondary); text-align:right;">${rc.name}</span>
        <div style="flex:1; background:var(--panel-border); height:8px; border-radius:4px; overflow:hidden; position:relative;">
          <div style="width:${pct}%; background:linear-gradient(90deg, var(--accent-color), #818cf8); height:100%; border-radius:4px; transition:width 0.5s ease;"></div>
        </div>
        <span style="width:15px; font-weight:800; color:var(--text-primary); text-align:left;">${rc.count}</span>
      </div>
    `;
  });

  html += `</div>`;
  container.innerHTML = html;
}

// 3. 주요 정책 키워드 차트
function renderPolicyKeywordChart(districts) {
  const container = document.getElementById("policy-chart-container");
  if (!container) return;

  // 키워드 그룹별 정의
  const keywords = [
    { name: "주거/정비", keys: ["재개발", "재건축", "주거", "정비", "주택", "용적률", "역세권"], count: 0 },
    { name: "복지/안전", keys: ["복지", "안전", "어르신", "가족", "아이", "돌봄", "안심", "보육", "치료"], count: 0 },
    { name: "일자리/창업", keys: ["창업", "일자리", "벤처", "기업", "산업", "비즈니스", "밸리", "R&D", "MICE"], count: 0 },
    { name: "환경/생태", keys: ["친환경", "생태", "환경", "녹색", "공원", "숲", "자원순환", "탄소", "하천"], count: 0 },
    { name: "교육/문화", keys: ["문화", "관광", "축제", "예술", "교육", "대학", "역사", "박물관"], count: 0 }
  ];

  // 정책 검색
  districts.forEach(d => {
    d.policies.forEach(p => {
      const text = (p.title + " " + p.description).toLowerCase();
      keywords.forEach(kw => {
        const matches = kw.keys.some(k => text.includes(k));
        if (matches) kw.count++;
      });
    });
  });

  const maxCount = Math.max(...keywords.map(k => k.count), 1);

  // 헤더 갱신
  const statText = document.getElementById("stat-policies");
  if (statText) {
    const highestKw = [...keywords].sort((a,b) => b.count - a.count)[0];
    statText.textContent = highestKw && highestKw.count > 0 ? `${highestKw.name} 관심 집중` : "정책 키워드 순위";
  }

  let html = `<div style="display:flex; flex-direction:column; gap:6px; width:100%; padding: 0 10px;">`;
  
  keywords.forEach(kw => {
    const pct = (kw.count / maxCount) * 100;
    html += `
      <div style="display:flex; align-items:center; gap:8px; font-size:10.5px; width:100%;">
        <span style="width:55px; font-weight:700; color:var(--text-secondary); text-align:right;">${kw.name}</span>
        <div style="flex:1; background:var(--panel-border); height:8px; border-radius:4px; overflow:hidden; position:relative;">
          <div style="width:${pct}%; background:linear-gradient(90deg, #ec4899, #f43f5e); height:100%; border-radius:4px; transition:width 0.5s ease;"></div>
        </div>
        <span style="width:15px; font-weight:800; color:var(--text-primary); text-align:left;">${kw.count}</span>
      </div>
    `;
  });

  html += `</div>`;
  container.innerHTML = html;
}
