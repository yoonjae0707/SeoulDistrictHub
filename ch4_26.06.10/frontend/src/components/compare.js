function getDistrictLogoSVG(id, name, party, size = 46) {
  const bg_color = party === "더불어민주당" ? "#1b4d8a" : "#e61c24";
  const displayName = name.substring(0, 2);
  
  if (id === "seoul") {
    return `
      <svg class="detail-logo-svg" viewBox="0 0 100 100" style="width:${size}px; height:${size}px; vertical-align: middle;">
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
    <svg class="detail-logo-svg" viewBox="0 0 100 100" style="width:${size}px; height:${size}px; vertical-align: middle;">
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

function getMayorAvatarSVG(id, mayor, party, size = 44) {
  const color_map = {
    "더불어민주당": ["#3498db", "#1b4d8a"],
    "국민의힘": ["#e74c3c", "#e61c24"]
  };
  const [c1, c2] = color_map[party] || ["#94a3b8", "#475569"];
  
  return `
    <svg class="detail-mayor-avatar-svg" viewBox="0 0 100 100" style="width:${size}px; height:${size}px; vertical-align: middle; border-radius: 50%; overflow: hidden;">
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
      <text x="50" y="78.5" font-family="'Noto Sans KR', 'Segoe UI', sans-serif" font-size="7.5" font-weight="900" fill="#2c3e50" text-anchor="middle" dominant-baseline="middle">{mayor}</text>
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

export function initCompareTool(districtsData) {
  const selectA = document.getElementById("compare-select-a");
  const selectB = document.getElementById("compare-select-b");

  if (!selectA || !selectB) return;

  const sortedDistricts = [...districtsData].sort((a, b) => {
    const nameA = a.name_kr || a.name;
    const nameB = b.name_kr || b.name;
    return nameA.localeCompare(nameB, 'ko');
  });
  
  const populateOptions = (selectEl) => {
    selectEl.innerHTML = `<option value="">-- 자치구 선택 --</option>`;
    sortedDistricts.forEach(d => {
      const opt = document.createElement("option");
      opt.value = d.id;
      opt.textContent = d.name_kr || d.name; // Correctly show '마포구' instead of 'mapo'
      selectEl.appendChild(opt);
    });
  };

  populateOptions(selectA);
  populateOptions(selectB);

  selectA.addEventListener("change", () => renderMatrix(districtsData));
  selectB.addEventListener("change", () => renderMatrix(districtsData));

  renderMatrix(districtsData);
}

function renderMatrix(districtsData) {
  const selectA = document.getElementById("compare-select-a");
  const selectB = document.getElementById("compare-select-b");
  const matrixContent = document.getElementById("compare-matrix-content");

  if (!selectA || !selectB || !matrixContent) return;

  const idA = selectA.value;
  const idB = selectB.value;

  const distA = districtsData.find(d => d.id === idA);
  const distB = districtsData.find(d => d.id === idB);

  matrixContent.innerHTML = "";

  const colA = document.createElement("div");
  colA.className = "compare-column";
  if (distA) {
    colA.appendChild(createCompareColumnHtml(distA));
  } else {
    colA.innerHTML = `<div class="compare-empty-state">비교 대상 A구를 선택해 주세요.</div>`;
  }

  const colB = document.createElement("div");
  colB.className = "compare-column";
  if (distB) {
    colB.appendChild(createCompareColumnHtml(distB));
  } else {
    colB.innerHTML = `<div class="compare-empty-state">비교 대상 B구를 선택해 주세요.</div>`;
  }

  matrixContent.appendChild(colA);
  matrixContent.appendChild(colB);
}

function createCompareColumnHtml(district) {
  const container = document.createElement("div");
  container.className = "compare-container";
  container.style.display = "flex";
  container.style.flexDirection = "column";
  container.style.gap = "12px";

  const displayName = district.name_kr || district.name;
  const partyBadgeClass = district.party === "더불어민주당" ? "minjoo" : "ppp";
  const formattedPopulation = (Number(district.stats.population) / 10000).toFixed(1);

  container.innerHTML = `
    <!-- 헤더 정보 -->
    <div class="compare-card" style="display:flex; align-items:center; gap:12px; border-top: 4px solid ${district.party === '더불어민주당' ? 'var(--party-minjoo)' : 'var(--party-ppp)'}; box-shadow: var(--shadow-sm); border-radius: var(--radius-md);">
      ${getDistrictLogoSVG(district.id, displayName, district.party, 40)}
      <div>
         <div style="font-size:15px; font-weight:800; display:flex; align-items:center; gap:6px;">
          ${displayName}
          <span class="detail-party-badge ${partyBadgeClass}" style="font-size:8px;">${district.party.replace("더불어민주당", "민주").replace("국민의힘", "국힘")}</span>
        </div>
        <div style="font-size:11.5px; color:var(--text-secondary); margin-top:2px;">
          제8회 지선 당선자: <strong>${district.mayor}</strong>
        </div>
      </div>
    </div>

    <!-- 구청장 상세 프로필 카드 (One UI 8.5 Style) -->
    <div class="compare-card" style="box-shadow: var(--shadow-sm); border-radius: var(--radius-md);">
      <div class="compare-title-section">구청장 프로필</div>
      <div style="display:flex; align-items:center; gap:10px; margin-bottom:8px;">
        ${getMayorAvatarSVG(district.id, district.mayor, district.party, 36)}
        <div>
          <div style="font-weight:800; font-size:12.5px;">${district.mayor} 구청장</div>
          <div style="display:flex; align-items:center; margin-top:2px; font-size:10.5px; font-weight:700;">
            ${getPartyLogoSVG(district.party)}
            <span style="color: ${district.party === '더불어민주당' ? 'var(--party-minjoo)' : 'var(--party-ppp)'}">${district.party.replace("더불어민주당", "민주").replace("국민의힘", "국힘")}</span>
          </div>
        </div>
      </div>
      <table style="width:100%; font-size:11.5px; border-collapse:collapse; margin-top:4px;">
        <tr style="border-bottom:1px solid var(--border-medium);">
          <td style="padding:4px 0; font-weight:700; color:var(--text-muted); width: 45px;">출생</td>
          <td style="padding:4px 0; font-weight:700; color:var(--text-primary);">${district.mayor_profile?.birth || '정보 없음'}</td>
        </tr>
        <tr style="border-bottom:1px solid var(--border-medium);">
          <td style="padding:4px 0; font-weight:700; color:var(--text-muted);">득표율</td>
          <td style="padding:4px 0; font-weight:700; color:var(--seoul-green);">${district.mayor_profile?.votes || '정보 없음'}</td>
        </tr>
        <tr style="border-bottom:1px solid var(--border-medium);">
          <td style="padding:4px 0; font-weight:700; color:var(--text-muted); vertical-align: top;">학력</td>
          <td style="padding:4px 0; font-weight:700; color:var(--text-primary); line-height: 1.3;">${district.mayor_profile?.education || '정보 없음'}</td>
        </tr>
        <tr>
          <td style="padding:4px 0; font-weight:700; color:var(--text-muted); vertical-align: top;">경력</td>
          <td style="padding:4px 0; font-weight:700; color:var(--text-secondary); line-height: 1.3;">${district.mayor_profile?.career || '정보 없음'}</td>
        </tr>
      </table>
    </div>

    <!-- 구정 슬로건 -->
    <div class="compare-card" style="box-shadow: var(--shadow-sm); border-radius: var(--radius-md);">
      <div class="compare-title-section">구청 슬로건</div>
      <div style="font-size:13.5px; font-weight:800; text-align:center; color:var(--seoul-indigo); padding:4px 0;">
        "${district.slogan}"
      </div>
    </div>

    <!-- 특징 -->
    <div class="compare-card" style="box-shadow: var(--shadow-sm); border-radius: var(--radius-md);">
      <div class="compare-title-section">지역 특성</div>
      <div style="font-size:12px; color:var(--text-secondary); line-height:1.5;">
        ${district.description}
      </div>
    </div>

    <!-- 공약 -->
    <div class="compare-card" style="box-shadow: var(--shadow-sm); border-radius: var(--radius-md);">
      <div class="compare-title-section">핵심 공약</div>
      <div style="display:flex; flex-direction:column; gap:8px; margin-top:4px;">
        ${district.policies.map((p, idx) => `
          <div style="font-size:12px;">
            <div style="font-weight:800; display:flex; align-items:center; gap:6px; margin-bottom:2px;">
              <span class="detail-policy-idx" style="width:14px; height:14px; font-size:8px; border-radius:3px;">${idx+1}</span>
              ${p.title}
            </div>
            <div style="color:var(--text-secondary); font-size:11px; padding-left:20px;">${p.description}</div>
          </div>
        `).join("")}
      </div>
    </div>

    <!-- 주거 정주성 평가 지표 -->
    <div class="compare-card" style="background-color: var(--seoul-indigo-light); box-shadow: var(--shadow-sm); border-radius: var(--radius-md);">
      <div class="compare-title-section" style="color: var(--seoul-indigo);">주거 적합도 상세 점수</div>
      <table style="width:100%; font-size:11.5px; border-collapse:collapse; margin-top:4px;">
        <tr style="border-bottom:1px solid #ffffff;">
          <td style="padding:4px 0; font-weight:700; color:var(--text-secondary);">👮 치안/안전</td>
          <td style="padding:4px 0; text-align:right; font-weight:800; color:var(--seoul-indigo);">${district.scores.safety}점</td>
        </tr>
        <tr style="border-bottom:1px solid #ffffff;">
          <td style="padding:4px 0; font-weight:700; color:var(--text-secondary);">🚌 교통/접근성</td>
          <td style="padding:4px 0; text-align:right; font-weight:800; color:var(--seoul-indigo);">${district.scores.traffic}점</td>
        </tr>
        <tr style="border-bottom:1px solid #ffffff;">
          <td style="padding:4px 0; font-weight:700; color:var(--text-secondary);">🏫 교육/학군</td>
          <td style="padding:4px 0; text-align:right; font-weight:800; color:var(--seoul-indigo);">${district.scores.education}점</td>
        </tr>
        <tr style="border-bottom:1px solid #ffffff;">
          <td style="padding:4px 0; font-weight:700; color:var(--text-secondary);">🌳 녹지/공원</td>
          <td style="padding:4px 0; text-align:right; font-weight:800; color:var(--seoul-indigo);">${district.scores.nature}점</td>
        </tr>
        <tr>
          <td style="padding:4px 0; font-weight:700; color:var(--text-secondary);">🛍️ 생활인프라</td>
          <td style="padding:4px 0; text-align:right; font-weight:800; color:var(--seoul-indigo);">${district.scores.infra}점</td>
        </tr>
      </table>
    </div>

    <!-- 일반 행정 통계 -->
    <div class="compare-card" style="box-shadow: var(--shadow-sm); border-radius: var(--radius-md);">
      <div class="compare-title-section">행정 통계</div>
      <table style="width:100%; font-size:11.5px; border-collapse:collapse;">
        <tr style="border-bottom:1px solid var(--border-light);">
          <td style="padding:5px 0; font-weight:700; color:var(--text-secondary);">인구수</td>
          <td style="padding:5px 0; text-align:right; font-weight:800;">${formattedPopulation}만 명</td>
        </tr>
        <tr style="border-bottom:1px solid var(--border-light);">
          <td style="padding:5px 0; font-weight:700; color:var(--text-secondary);">예산 규모</td>
          <td style="padding:5px 0; text-align:right; font-weight:800;">${Number(district.stats.budget).toLocaleString()}억 원</td>
        </tr>
        <tr>
          <td style="padding:5px 0; font-weight:700; color:var(--text-secondary);">구정 만족도</td>
          <td style="padding:5px 0; text-align:right; font-weight:800; color:var(--seoul-green);">${district.stats.satisfaction}%</td>
        </tr>
      </table>
    </div>

    <!-- 공식 링크 -->
    <a href="${district.link}" target="_blank" rel="noopener noreferrer" class="btn" style="justify-content:center; font-size:11.5px; padding:8px 0; text-decoration:none; box-shadow: var(--shadow-sm);">
      공식 홈페이지 바로가기
    </a>
  `;

  return container;
}
