export function initCompareTool(districtsData) {
  const modal = document.getElementById("compare-modal");
  const openBtn = document.getElementById("open-compare-btn");
  const closeBtn = document.getElementById("close-compare-btn");
  const selectA = document.getElementById("compare-select-a");
  const selectB = document.getElementById("compare-select-b");

  if (!modal || !openBtn || !closeBtn || !selectA || !selectB) return;

  // 1. 드롭다운 옵션 채우기 (가나다 순 정렬)
  const sortedDistricts = [...districtsData].sort((a, b) => a.name.localeCompare(b.name, 'ko'));
  
  const populateOptions = (selectEl) => {
    selectEl.innerHTML = `<option value="">-- 자치구 선택 --</option>`;
    sortedDistricts.forEach(d => {
      const opt = document.createElement("option");
      opt.value = d.id;
      opt.textContent = d.name;
      selectEl.appendChild(opt);
    });
  };

  populateOptions(selectA);
  populateOptions(selectB);

  // 2. 모달 열기/닫기 이벤트
  openBtn.addEventListener("click", () => {
    modal.classList.add("active");
  });

  closeBtn.addEventListener("click", () => {
    modal.classList.remove("active");
  });

  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.classList.remove("active");
    }
  });

  // 3. 드롭다운 변경 이벤트
  selectA.addEventListener("change", () => renderMatrix(districtsData));
  selectB.addEventListener("change", () => renderMatrix(districtsData));
}

// 비교 행렬 매트릭스 렌더링
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

  // 컬럼 A 생성
  const colA = document.createElement("div");
  colA.className = "compare-column";
  if (distA) {
    colA.appendChild(createCompareColumnHtml(distA));
  } else {
    colA.innerHTML = `<div class="compare-empty">자치구 A를 선택해 주세요.</div>`;
  }

  // 컬럼 B 생성
  const colB = document.createElement("div");
  colB.className = "compare-column";
  if (distB) {
    colB.appendChild(createCompareColumnHtml(distB));
  } else {
    colB.innerHTML = `<div class="compare-empty">자치구 B를 선택해 주세요.</div>`;
  }

  matrixContent.appendChild(colA);
  matrixContent.appendChild(colB);
}

// 개별 비교 카드 HTML 생성
function createCompareColumnHtml(district) {
  const container = document.createElement("div");
  container.className = "compare-container";
  container.style.display = "flex";
  container.style.flexDirection = "column";
  container.style.gap = "14px";

  const partyBgClass = district.party === "더불어민주당" ? "bg-minjoo" : "bg-ppp";
  const partyBadgeClass = district.party === "더불어민주당" ? "minjoo" : "ppp";
  const formattedPopulation = (Number(district.stats.population) / 10000).toFixed(1);

  container.innerHTML = `
    <!-- 기본 프로필 카드 -->
    <div class="compare-card" style="display: flex; align-items: center; gap: 12px; border-left: 5px solid ${district.party === "더불어민주당" ? "var(--party-minjoo)" : "var(--party-ppp)"};">
      <div class="district-badge-circle ${partyBgClass}" style="width: 50px; height: 50px; font-size: 18px;">
        ${district.name.substring(0, 2)}
      </div>
      <div>
        <div style="font-size: 16px; font-weight: 800; display: flex; align-items: center; gap: 6px;">
          ${district.name}
          <span class="party-badge ${partyBadgeClass}" style="font-size: 8px; padding: 1px 4px;">${district.party.replace("더불어민주당", "민주").replace("국민의힘", "국힘")}</span>
        </div>
        <div style="font-size: 12px; color: var(--text-secondary); margin-top: 2px;">
          구청장: <strong>${district.mayor}</strong>
        </div>
      </div>
    </div>

    <!-- 슬로건 -->
    <div class="compare-card">
      <div class="compare-column-title">구정 슬로건</div>
      <div style="font-size: 14px; font-weight: 700; text-align: center; color: var(--accent-color); padding: 6px 0;">
        "${district.slogan}"
      </div>
    </div>

    <!-- 지역 특징 -->
    <div class="compare-card">
      <div class="compare-column-title">지역 특징</div>
      <div style="font-size: 12.5px; color: var(--text-secondary); line-height: 1.5;">
        ${district.description}
      </div>
    </div>

    <!-- 3대 핵심 정책 -->
    <div class="compare-card">
      <div class="compare-column-title">3대 핵심 추진 정책</div>
      <div style="display: flex; flex-direction: column; gap: 10px; margin-top: 8px;">
        ${district.policies.map((p, idx) => `
          <div style="font-size: 12.5px;">
            <div style="font-weight: 700; display: flex; align-items: center; gap: 6px; margin-bottom: 2px;">
              <span style="display: inline-flex; width: 16px; height: 16px; background: var(--accent-light); color: var(--accent-color); border-radius: 4px; justify-content: center; align-items: center; font-size: 9px; font-weight: 800;">${idx+1}</span>
              ${p.title}
            </div>
            <div style="color: var(--text-secondary); font-size: 11.5px; padding-left: 22px;">${p.description}</div>
          </div>
        `).join("")}
      </div>
    </div>

    <!-- 행정 지표 -->
    <div class="compare-card">
      <div class="compare-column-title">행정 통계 대조</div>
      <table style="width: 100%; font-size: 12.5px; border-collapse: collapse; margin-top: 6px;">
        <tr style="border-bottom: 1px solid var(--panel-border);">
          <td style="padding: 6px 0; color: var(--text-muted); font-weight: 600;">인구수</td>
          <td style="padding: 6px 0; text-align: right; font-weight: 700;">${formattedPopulation}만 명</td>
        </tr>
        <tr style="border-bottom: 1px solid var(--panel-border);">
          <td style="padding: 6px 0; color: var(--text-muted); font-weight: 600;">행정 예산</td>
          <td style="padding: 6px 0; text-align: right; font-weight: 700;">${Number(district.stats.budget).toLocaleString()}억 원</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: var(--text-muted); font-weight: 600;">구정 만족도</td>
          <td style="padding: 6px 0; text-align: right; font-weight: 700; color: var(--accent-color);">${district.stats.satisfaction}%</td>
        </tr>
      </table>
    </div>

    <!-- 공식 웹사이트 바로가기 -->
    <a href="${district.link}" target="_blank" rel="noopener noreferrer" class="btn" style="justify-content: center; font-size: 12px; padding: 8px 12px;">
      공식 홈페이지 방문
      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
        <polyline points="15 3 21 3 21 9"></polyline>
        <line x1="10" y1="14" x2="21" y2="3"></line>
      </svg>
    </a>
  `;

  return container;
}
