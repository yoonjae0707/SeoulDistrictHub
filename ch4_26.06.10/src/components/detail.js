export function showDistrictDetail(district) {
  const placeholder = document.getElementById("detail-placeholder");
  const content = document.getElementById("detail-content");

  if (!placeholder || !content) return;

  // 1. 플레이스홀더 감추고 컨텐츠 표시
  placeholder.style.display = "none";
  content.style.display = "flex";

  // 정당 컬러 매핑 클래스
  const partyBgClass = district.party === "더불어민주당" ? "bg-minjoo" : "bg-ppp";
  const partyBadgeClass = district.party === "더불어민주당" ? "minjoo" : "ppp";

  // 예산 단위 및 인구수 포맷 변환
  const formattedPopulation = (Number(district.stats.population) / 10000).toFixed(1); // 만 명 단위
  const formattedBudget = (Number(district.stats.budget)).toLocaleString(); // 억 원 단위

  // HTML 동적 주입
  content.innerHTML = `
    <!-- 상단 요약 카드 -->
    <div class="detail-header-card">
      <div class="district-badge-circle ${partyBgClass}">
        ${district.name.substring(0, 2)}
      </div>
      <div class="detail-header-info">
        <div class="detail-district-name">
          ${district.name}
          <span class="party-badge ${partyBadgeClass}">${district.party.replace("더불어민주당", "민주당").replace("국민의힘", "국민의힘")}</span>
        </div>
        <div class="detail-mayor-name">
          제9대 구청장: <strong>${district.mayor}</strong>
        </div>
      </div>
    </div>

    <!-- 슬로건 카드 -->
    <div class="detail-slogan-card">
      <div class="detail-slogan-title">구정 슬로건</div>
      <div class="detail-slogan-text">"${district.slogan}"</div>
    </div>

    <!-- 구정 소개 -->
    <div>
      <div class="detail-section-title">지역 특징 및 소개</div>
      <p class="desc-text">${district.description}</p>
    </div>

    <!-- 핵심 3대 정책 -->
    <div>
      <div class="detail-section-title">핵심 추진 정책 (Top 3)</div>
      <div class="policy-list">
        ${district.policies.map((policy, idx) => `
          <div class="policy-item">
            <div class="policy-header">
              <span class="policy-number">${idx + 1}</span>
              <span>${policy.title}</span>
            </div>
            <div class="policy-desc">
              ${policy.description}
            </div>
          </div>
        `).join("")}
      </div>
    </div>

    <!-- 주요 통계 정보 -->
    <div>
      <div class="detail-section-title">주요 행정 통계</div>
      <div class="detail-stats-grid">
        <div class="detail-stat-box">
          <div class="detail-stat-label">인구수</div>
          <div class="detail-stat-val">${formattedPopulation}만 명</div>
        </div>
        <div class="detail-stat-box">
          <div class="detail-stat-label">행정 예산</div>
          <div class="detail-stat-val">${formattedBudget}억 원</div>
        </div>
        <div class="detail-stat-box">
          <div class="detail-stat-label">구정 만족도</div>
          <div class="detail-stat-val" style="color: var(--accent-color)">${district.stats.satisfaction}%</div>
        </div>
      </div>
    </div>

    <!-- 공식 링크 바로가기 -->
    <a href="${district.link}" target="_blank" rel="noopener noreferrer" class="btn btn-primary" style="justify-content: center; text-decoration: none; margin-top: 10px;">
      ${district.name} 공식 홈페이지 바로가기
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
        <polyline points="15 3 21 3 21 9"></polyline>
        <line x1="10" y1="14" x2="21" y2="3"></line>
      </svg>
    </a>
  `;
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
