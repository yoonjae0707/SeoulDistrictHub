function getDistrictLogoSVG(id, name, party) {
  const bg_color = party === "더불어민주당" ? "#1b4d8a" : "#e61c24";
  const displayName = name.substring(0, 2);
  
  if (id === "seoul") {
    return `
      <svg class="detail-logo-svg" viewBox="0 0 100 100" style="width:46px; height:46px; vertical-align: middle;">
        <defs>
          <linearGradient id="seoul-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#2c3e50" />
            <stop offset="100%" stop-color="#34495e" />
          </linearGradient>
        </defs>
        <rect x="4" y="4" width="92" height="92" rx="28" fill="url(#seoul-grad)" />
        <circle cx="50" cy="50" r="40" stroke="#ffffff" stroke-width="2" opacity="0.2" fill="none" />
        <path d="M50 15 C30 40 30 60 50 85 C70 60 70 40 50 15 Z" fill="#e74c3c" opacity="0.85"/>
        <path d="M15 50 C40 30 60 30 85 50 C60 70 40 70 15 50 Z" fill="#2ecc71" opacity="0.85"/>
        <circle cx="50" cy="50" r="12" fill="#ffffff" />
        <circle cx="50" cy="50" r="8" fill="#3498db" />
      </svg>
    `;
  }
  
  return `
    <svg class="detail-logo-svg" viewBox="0 0 100 100" style="width:46px; height:46px; vertical-align: middle;">
      <defs>
        <linearGradient id="emblem-grad-${id}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${bg_color}" />
          <stop offset="100%" stop-color="#2c3e50" />
        </linearGradient>
      </defs>
      <rect x="4" y="4" width="92" height="92" rx="28" fill="url(#emblem-grad-${id})" />
      <rect x="8" y="8" width="84" height="84" rx="24" fill="none" stroke="#ffffff" stroke-width="1.5" opacity="0.15" />
      <path d="M50 22 L72 34 V62 C72 74 50 82 50 82 C50 82 28 74 28 62 V34 Z" fill="none" stroke="#ffffff" stroke-width="3" stroke-linejoin="round" />
      <text x="50" y="48" font-family="'Noto Sans KR', 'Segoe UI', sans-serif" font-size="12" font-weight="900" fill="#ffffff" text-anchor="middle" dominant-baseline="middle" letter-spacing="0.5">${displayName}</text>
      <text x="50" y="68" font-family="'Noto Sans KR', 'Segoe UI', sans-serif" font-size="6.5" font-weight="800" fill="#ffffff" opacity="0.8" text-anchor="middle" dominant-baseline="middle" letter-spacing="1">DISTRICT</text>
    </svg>
  `;
}

function getMayorAvatarSVG(id, mayor, party) {
  const color_map = {
    "더불어민주당": ["#3498db", "#1b4d8a"],
    "국민의힘": ["#e74c3c", "#e61c24"]
  };
  const [c1, c2] = color_map[party] || ["#94a3b8", "#475569"];
  
  return `
    <svg class="detail-mayor-avatar-svg" viewBox="0 0 100 100" style="width:44px; height:44px; vertical-align: middle; border-radius: 50%; overflow: hidden;">
      <defs>
        <linearGradient id="avatar-grad-${id}" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="${c1}" />
          <stop offset="100%" stop-color="${c2}" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="50" fill="url(#avatar-grad-${id})" />
      <circle cx="50" cy="50" r="46" fill="none" stroke="#ffffff" stroke-width="1.5" opacity="0.2" />
      <circle cx="50" cy="38" r="15" fill="#ffffff" />
      <path d="M25 78 C25 61 36 56 50 56 C64 56 75 61 75 78 C75 84 75 86 75 86 H25 Z" fill="#ffffff" />
      <rect x="30" y="72" width="40" height="12" rx="6" fill="#ffffff" />
      <text x="50" y="78.5" font-family="'Noto Sans KR', 'Segoe UI', sans-serif" font-size="7.5" font-weight="900" fill="#2c3e50" text-anchor="middle" dominant-baseline="middle">${mayor}</text>
    </svg>
  `;
}

function getPartyLogoSVG(party) {
  if (party === "더불어민주당") {
    return `
      <svg class="party-emblem-svg" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style="width: 14px; height: 14px; vertical-align: middle; margin-right: 4px;">
        <rect width="100" height="100" rx="20" fill="#1b4d8a"/>
        <path d="M25 75C40 50 60 50 75 75" stroke="#ffffff" stroke-width="8" stroke-linecap="round"/>
        <circle cx="50" cy="40" r="15" fill="#ffffff"/>
      </svg>
    `;
  } else if (party === "국민의힘") {
    return `
      <svg class="party-emblem-svg" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style="width: 14px; height: 14px; vertical-align: middle; margin-right: 4px;">
        <rect width="100" height="100" rx="20" fill="#e61c24"/>
        <path d="M50 20 L80 35 V60 C80 75 50 85 50 85 C50 85 20 75 20 60 V35 L50 20 Z" fill="#ffffff"/>
      </svg>
    `;
  }
  return "";
}

export function showDistrictDetail(district, onAddToCalculator) {
  const placeholder = document.getElementById("detail-placeholder");
  const content = document.getElementById("detail-content");

  if (!placeholder || !content) return;

  placeholder.style.display = "none";
  content.style.display = "block";

  const displayName = district.name_kr || district.name;
  const partyBadgeClass = district.party === "더불어민주당" ? "minjoo" : "ppp";
  const formattedPopulation = (Number(district.stats.population) / 10000).toFixed(1);
  const formattedBudget = (Number(district.stats.budget)).toLocaleString();

  content.innerHTML = `
    <!-- 구 상징 헤더 영역 -->
    <div class="detail-header" style="border-bottom: 2px solid var(--border-light); padding-bottom: 12px; margin-bottom: 16px;">
      ${getDistrictLogoSVG(district.id, displayName, district.party)}
      <div class="detail-title-box">
        <div class="detail-gu-name">
          ${displayName}
          <span class="detail-party-badge ${partyBadgeClass}">${district.party.replace("더불어민주당", "민주").replace("국민의힘", "국힘")}</span>
        </div>
        <div style="font-size:12px; color:var(--text-muted); font-weight:600;">
          ${district.id === "seoul" ? "대한민국의 수도" : `${district.region} 소속 자치구`}
        </div>
      </div>
    </div>

    <!-- 구청장 상세 프로필 카드 (One UI 8.5 Style) -->
    <div class="detail-mayor-profile" style="background: var(--bg-card); border: 1px solid var(--border-light); border-radius: var(--radius-md); box-shadow: var(--shadow-sm); padding: 16px; margin-bottom: 16px; display: flex; flex-direction: column; gap: 12px;">
      <div style="display: flex; align-items: center; gap: 14px;">
        ${getMayorAvatarSVG(district.id, district.mayor, district.party)}
        <div class="detail-mayor-info">
          <span class="detail-mayor-lbl">제8회 지선 당선자</span>
          <span class="detail-mayor-val" style="font-size: 15px; font-weight: 800;">
            ${district.mayor} ${district.id === "seoul" ? "시장" : "구청장"}
          </span>
          <div style="display: flex; align-items: center; margin-top: 4px; font-size: 11.5px; font-weight: 700; color: var(--text-secondary);">
            ${getPartyLogoSVG(district.party)}
            <span>${district.party}</span>
          </div>
        </div>
      </div>
      
      <!-- 상세 메타데이터 Grid -->
      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; border-top: 1px dashed var(--border-medium); padding-top: 12px; font-size: 12px;">
        <div>
          <span style="color: var(--text-muted); font-weight: 700; display: block; margin-bottom: 2px;">출생년도</span>
          <span style="font-weight: 800; color: var(--text-primary);">${district.mayor_profile?.birth || '정보 없음'}</span>
        </div>
        <div>
          <span style="color: var(--text-muted); font-weight: 700; display: block; margin-bottom: 2px;">지선 득표율</span>
          <span style="font-weight: 800; color: var(--seoul-green);">${district.mayor_profile?.votes || '정보 없음'}</span>
        </div>
        <div style="grid-column: 1 / span 2;">
          <span style="color: var(--text-muted); font-weight: 700; display: block; margin-bottom: 2px;">최종 학력</span>
          <span style="font-weight: 800; color: var(--text-primary); line-height: 1.4;">${district.mayor_profile?.education || '정보 없음'}</span>
        </div>
        <div style="grid-column: 1 / span 2;">
          <span style="color: var(--text-muted); font-weight: 700; display: block; margin-bottom: 2px;">주요 경력</span>
          <span style="font-weight: 700; color: var(--text-secondary); line-height: 1.5; display: block;">${district.mayor_profile?.career || '정보 없음'}</span>
        </div>
      </div>
    </div>

    <!-- 구정 슬로건 -->
    <div class="detail-slogan-box" style="box-shadow: var(--shadow-sm); background-color: var(--seoul-indigo-light); border-left: 4px solid var(--seoul-indigo);">
      <div class="detail-slogan-lbl">${district.id === "seoul" ? "시정 슬로건" : "구정 슬로건"}</div>
      <div class="detail-slogan-val">"${district.slogan}"</div>
    </div>

    <!-- 구 소개 -->
    <div class="detail-lbl-title">${district.id === "seoul" ? "도시 소개" : "지역 특징"}</div>
    <p class="detail-text-desc">${district.description}</p>

    <!-- 3대 공약 정책 -->
    <div class="detail-lbl-title">${district.id === "seoul" ? "핵심 정책" : "핵심 공약 (Top 3)"}</div>
    <div style="display:flex; flex-direction:column; gap:6px; margin-bottom:18px;">
      ${district.policies.map((p, idx) => `
        <div class="detail-policy-item" style="background: var(--bg-card); border-radius: var(--radius-sm); padding: 10px; margin-bottom: 4px; box-shadow: var(--shadow-sm);">
          <div class="detail-policy-title">
            <span class="detail-policy-idx">${idx + 1}</span>
            <span>${p.title}</span>
          </div>
          <div class="detail-policy-desc">${p.description}</div>
        </div>
      `).join("")}
    </div>

    <!-- 주요 통계 -->
    <div class="detail-lbl-title">${district.id === "seoul" ? "서울 시정 통계" : "주요 행정 통계"}</div>
    <div class="detail-grid-metrics">
      <div class="detail-metric-card" style="box-shadow: var(--shadow-sm);">
        <div class="detail-metric-lbl">주민등록인구</div>
        <div class="detail-metric-val">${formattedPopulation}만 명</div>
      </div>
      <div class="detail-metric-card" style="box-shadow: var(--shadow-sm);">
        <div class="detail-metric-lbl">행정예산 규모</div>
        <div class="detail-metric-val">${formattedBudget}억 원</div>
      </div>
      <div class="detail-metric-card" style="box-shadow: var(--shadow-sm);">
        <div class="detail-metric-lbl">${district.id === "seoul" ? "시정 만족도" : "구정 만족도"}</div>
        <div class="detail-metric-val" style="color:var(--seoul-green);">${district.stats.satisfaction}%</div>
      </div>
    </div>

    <!-- 액션 링크 및 추천기 추가 버튼 -->
    <div style="display:flex; flex-direction:column; gap:8px;">
      ${district.id === "seoul" ? `
        <div style="font-size:11.5px; color:var(--text-muted); font-weight:700; text-align:center; padding: 10px; border: 1px dashed var(--border-medium); border-radius:var(--radius-sm); margin-bottom:4px;">
          💡 지도의 자치구를 클릭하면 추천 비교군에 추가할 수 있습니다.
        </div>
      ` : `
        <button class="btn btn-primary" id="btn-add-to-calc" style="justify-content:center; width:100%;">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>
          이 구를 추천 비교군에 추가
        </button>
      `}
      <a href="${district.link}" target="_blank" rel="noopener noreferrer" class="btn" style="justify-content:center; width:100%; text-decoration:none;">
        ${district.id === "seoul" ? "공식 시청 홈페이지 방문" : "공식 구청 홈페이지 방문"}
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-left:4px;"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
      </a>
    </div>
  `;

  // 추천기 추가 버튼 이벤트 리스너 바인딩
  const addBtn = document.getElementById("btn-add-to-calc");
  if (addBtn) {
    addBtn.addEventListener("click", () => {
      onAddToCalculator(district.id);
    });
  }
}

export function resetDistrictDetail() {
  const placeholder = document.getElementById("detail-placeholder");
  const content = document.getElementById("detail-content");

  if (placeholder && content) {
    placeholder.style.display = "flex";
    content.style.display = "none";
    content.innerHTML = "";
  }
}
