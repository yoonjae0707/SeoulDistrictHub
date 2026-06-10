// Light Theme Adapted SVG Dashboard Charts

export function renderDashboardCharts(filteredDistricts) {
  renderPartyDonutChart(filteredDistricts);
  renderRegionBarChart(filteredDistricts);
  renderPolicyKeywordChart(filteredDistricts);
}

// 1. Party Distribution Donut Chart
function renderPartyDonutChart(districts) {
  const container = document.getElementById("party-chart-container");
  if (!container) return;

  const minjooCount = districts.filter(d => d.party === "더불어민주당").length;
  const pppCount = districts.filter(d => d.party === "국민의힘").length;
  const total = minjooCount + pppCount;

  const statText = document.getElementById("stat-parties");
  if (statText) {
    statText.textContent = total > 0 ? `민주 ${minjooCount} : 국힘 ${pppCount}` : "데이터 없음";
  }

  if (total === 0) {
    container.innerHTML = `<span style="font-size:11px; color:var(--text-muted)">매칭 데이터 없음</span>`;
    return;
  }

  const minjooPct = (minjooCount / total) * 100;
  const pppPct = (pppCount / total) * 100;

  const radius = 30;
  const strokeWidth = 8;
  const circ = 2 * Math.PI * radius; // 188.49

  container.innerHTML = `
    <svg width="100" height="90" viewBox="0 0 100 100" style="transform: rotate(-90deg);">
      <circle cx="50" cy="50" r="${radius}" fill="none" stroke="var(--border-light)" stroke-width="${strokeWidth}" />
      
      <circle cx="50" cy="50" r="${radius}" fill="none" 
        stroke="var(--party-minjoo)" 
        stroke-width="${strokeWidth}" 
        stroke-dasharray="${circ}" 
        stroke-dashoffset="${circ - (minjooPct / 100) * circ}" 
        stroke-linecap="round"
      />
      
      <circle cx="50" cy="50" r="${radius}" fill="none" 
        stroke="var(--party-ppp)" 
        stroke-width="${strokeWidth}" 
        stroke-dasharray="${circ}" 
        stroke-dashoffset="${circ - (pppPct / 100) * circ}"
        transform="rotate(${(minjooPct / 100) * 360} 50 50)" 
        stroke-linecap="round"
      />
      
      <circle cx="50" cy="50" r="${radius - strokeWidth/2 - 1}" fill="var(--bg-panel)" />
    </svg>
    <div style="position: absolute; display: flex; flex-direction: column; align-items: center; justify-content: center; transform: rotate(0deg);">
      <div style="font-size: 9px; font-weight: 700; color: var(--text-muted);">전체</div>
      <div style="font-size: 15px; font-weight: 800; color: var(--seoul-indigo);">${total}</div>
    </div>
  `;
}

// 2. Region Bar Chart
function renderRegionBarChart(districts) {
  const container = document.getElementById("region-chart-container");
  if (!container) return;

  const regions = ["도심권", "동북권", "서북권", "서남권", "동남권"];
  const regionCounts = regions.map(r => ({
    name: r,
    count: districts.filter(d => d.region === r).length
  }));

  const maxCount = Math.max(...regionCounts.map(rc => rc.count), 1);

  const statText = document.getElementById("stat-regions");
  if (statText) {
    const highestRegion = [...regionCounts].sort((a,b) => b.count - a.count)[0];
    statText.textContent = highestRegion && highestRegion.count > 0 ? `${highestRegion.name} 우세` : "5개 대권역 구성";
  }

  let html = `<div style="display:flex; flex-direction:column; gap:5px; width:100%; padding: 0 10px;">`;
  
  regionCounts.forEach(rc => {
    const pct = (rc.count / maxCount) * 100;
    html += `
      <div style="display:flex; align-items:center; gap:8px; font-size:10px; width:100%;">
        <span style="width:36px; font-weight:700; color:var(--text-secondary); text-align:right;">${rc.name}</span>
        <div style="flex:1; background:var(--border-light); height:6px; border-radius:3px; overflow:hidden;">
          <div style="width:${pct}%; background:var(--seoul-indigo); height:100%; border-radius:3px; transition:width 0.4s ease;"></div>
        </div>
        <span style="width:12px; font-weight:800; color:var(--text-primary); text-align:left;">${rc.count}</span>
      </div>
    `;
  });

  html += `</div>`;
  container.innerHTML = html;
}

// 3. Policy Keywords Bar Chart
function renderPolicyKeywordChart(districts) {
  const container = document.getElementById("policy-chart-container");
  if (!container) return;

  const keywords = [
    { name: "주거/정비", keys: ["재개발", "재건축", "주거", "정비", "주택", "용적률", "역세권"], count: 0 },
    { name: "복지/안전", keys: ["복지", "안전", "어르신", "가족", "아이", "돌봄", "안심", "보육", "치료"], count: 0 },
    { name: "일자리/창업", keys: ["창업", "일자리", "벤처", "기업", "산업", "비즈니스", "밸리", "R&D", "MICE"], count: 0 },
    { name: "환경/생태", keys: ["친환경", "생태", "환경", "녹색", "공원", "숲", "자원순환", "탄소", "하천"], count: 0 },
    { name: "교육/문화", keys: ["문화", "관광", "축제", "예술", "교육", "대학", "역사", "박물관"], count: 0 }
  ];

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

  const statText = document.getElementById("stat-policies");
  if (statText) {
    const highestKw = [...keywords].sort((a,b) => b.count - a.count)[0];
    statText.textContent = highestKw && highestKw.count > 0 ? `${highestKw.name} 관심` : "정책 관심도";
  }

  let html = `<div style="display:flex; flex-direction:column; gap:5px; width:100%; padding: 0 10px;">`;
  
  keywords.forEach(kw => {
    const pct = (kw.count / maxCount) * 100;
    html += `
      <div style="display:flex; align-items:center; gap:8px; font-size:10px; width:100%;">
        <span style="width:48px; font-weight:700; color:var(--text-secondary); text-align:right;">${kw.name}</span>
        <div style="flex:1; background:var(--border-light); height:6px; border-radius:3px; overflow:hidden;">
          <div style="width:${pct}%; background:var(--seoul-green); height:100%; border-radius:3px; transition:width 0.4s ease;"></div>
        </div>
        <span style="width:12px; font-weight:800; color:var(--text-primary); text-align:left;">${kw.count}</span>
      </div>
    `;
  });

  html += `</div>`;
  container.innerHTML = html;
}
