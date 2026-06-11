export function initSuitabilityCalculator(districtsData) {
  const selectionGrid = document.getElementById("suitability-districts-selection");
  const calculateBtn = document.getElementById("btn-calculate-suitability");
  const placeholder = document.getElementById("suitability-results-placeholder");
  const reportContent = document.getElementById("suitability-report-content");

  if (!selectionGrid || !calculateBtn || !placeholder || !reportContent) return;

  // 1. 25개 자치구 체크박스 동적 렌더링 (기본적으로 모두 체크 상태)
  const sortedDistricts = [...districtsData].sort((a, b) => a.name.localeCompare(b.name, 'ko'));
  selectionGrid.innerHTML = "";
  
  sortedDistricts.forEach(d => {
    const label = document.createElement("label");
    label.className = "checkbox-label";
    label.innerHTML = `
      <input type="checkbox" name="suit-district" value="${d.id}" checked>
      ${d.name}
    `;
    selectionGrid.appendChild(label);
  });

  // 2. 가중치 슬라이더 실시간 수치 표기 이벤트 바인딩
  const sliders = ["safety", "traffic", "education", "nature", "infra"];
  sliders.forEach(key => {
    const slider = document.getElementById(`weight-${key}`);
    const badge = document.getElementById(`val-${key}`);
    if (slider && badge) {
      slider.addEventListener("input", (e) => {
        badge.textContent = e.target.value;
      });
    }
  });

  // 3. 연산 실행 버튼 클릭 이벤트
  calculateBtn.addEventListener("click", async () => {
    // 선택된 자치구 추출
    const checkedBoxes = document.querySelectorAll("input[name='suit-district']:checked");
    const selectedIds = Array.from(checkedBoxes).map(cb => cb.value);

    if (selectedIds.length < 2) {
      alert("비교 분석을 위해 최소 2개 이상의 자치구를 선택해 주세요.");
      return;
    }

    // 가중치 값 추출
    const weights = {};
    sliders.forEach(key => {
      const slider = document.getElementById(`weight-${key}`);
      weights[key] = parseFloat(slider.value);
    });

    // 로딩 상태 표기
    placeholder.style.display = "none";
    reportContent.style.display = "block";
    reportContent.innerHTML = `
      <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; padding: 40px; color: var(--text-muted);">
        <svg class="placeholder-icon" xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="animation: spin 1.5s linear infinite;"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg>
        <p style="margin-top: 10px; font-weight:700;">주거 지표 가중치를 분석하여 적합도를 계산하고 있습니다...</p>
      </div>
    `;

    try {
      // 가중 점수 연산 (클라이언트 사이드 로컬 처리)
      const selectedDistricts = districtsData.filter(d => selectedIds.includes(d.id));

      if (selectedDistricts.length === 0) {
        throw new Error("선택된 자치구가 비어 있거나 유효하지 않습니다.");
      }

      const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);
      if (totalWeight === 0) {
        throw new Error("가중치 합이 0일 수 없습니다.");
      }

      const results = selectedDistricts.map(dist => {
        const scores = dist.scores || {};
        const weightedScore = (
          (scores.safety || 50) * (weights.safety ?? 1) +
          (scores.traffic || 50) * (weights.traffic ?? 1) +
          (scores.education || 50) * (weights.education ?? 1) +
          (scores.nature || 50) * (weights.nature ?? 1) +
          (scores.infra || 50) * (weights.infra ?? 1)
        ) / totalWeight;

        return {
          id: dist.id,
          name: dist.name_kr || dist.name,
          score: Math.round(weightedScore * 10) / 10,
          original_scores: scores
        };
      });

      results.sort((a, b) => b.score - a.score);
      const bestMatch = results[0];
      const report = generateRecommendationReport(bestMatch, results, weights);

      const resData = {
        best_match: bestMatch.id,
        best_name: bestMatch.name,
        rankings: results,
        report: report
      };

      // 결과 렌더링
      renderRecommendationReport(resData);
      
    } catch (err) {
      reportContent.innerHTML = `
        <div style="color:var(--seoul-red); text-align:center; padding: 30px;">
          <strong>오류 발생:</strong> ${err.message}
        </div>
      `;
    }
  });
}

// 상세 페이지에서 계산기에 추가 기능 브릿지
export function addDistrictToCalculator(districtId) {
  // 1. 체크박스 전부 해제 후 해당 구만 활성화하는게 아닌, 기존 목록에 없으면 추가로 체크함
  const cb = document.querySelector(`input[name='suit-district'][value='${districtId}']`);
  if (cb) {
    cb.checked = true;
  }
  
  // 2. 탭 전환 실행 (나의 맞춤 주거지 찾기 탭으로 전환)
  const suitTabBtn = document.querySelector("button[data-tab='suitability']");
  if (suitTabBtn) {
    suitTabBtn.dispatchEvent(new Event("click"));
  }

  // 3. 알림 토스트 (미세 피드백)
  alert(`해당 구가 주거 적합도 시뮬레이션 목록에 활성화되었습니다. 우선순위 가중치를 설정해 보세요!`);
}

// API 마크다운 데이터를 HTML로 변환하는 간단한 변환기 구현
function parseMarkdownToHtml(mdText) {
  let html = mdText;
  
  // 헤더 변환
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  html = html.replace(/^#### (.*$)/gim, '<h4>$1</h4>');
  
  // 볼드체 변환
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  
  // 리스트 아이템 변환 (ul을 감싸는 마크다운 정비)
  html = html.replace(/^\- (.*$)/gim, '<li>$1</li>');
  
  // 줄바꿈 변환
  html = html.replace(/\n\n/g, '</p><p>');
  html = html.replace(/\n/g, '<br>');
  
  return `<p>${html}</p>`;
}

// 적합도 연산 결과 출력
function renderRecommendationReport(data) {
  const reportContent = document.getElementById("suitability-report-content");
  if (!reportContent) return;

  const htmlReport = parseMarkdownToHtml(data.report);

  // 종합 순위 차트 (게이지 진행바 형태)
  let rankingsHtml = `
    <div style="background-color: var(--bg-primary); border: 1px solid var(--border-light); border-radius: var(--radius-md); padding: 16px; margin-top: 20px;">
      <h4 style="color: var(--seoul-indigo); font-size:13px; font-weight:800; margin-bottom:12px;">📈 최종 분석 적합도 순위</h4>
      <div style="display:flex; flex-direction:column; gap:10px;">
  `;

  data.rankings.forEach((r, idx) => {
    const isFirst = idx === 0;
    const barColor = isFirst ? "var(--seoul-indigo)" : "var(--border-medium)";
    const textColor = isFirst ? "var(--seoul-indigo)" : "var(--text-secondary)";
    
    rankingsHtml += `
      <div style="font-size:12px;">
        <div style="display:flex; justify-content:space-between; font-weight:700; margin-bottom:4px; color:${textColor};">
          <span>${idx+1}위. ${r.name}</span>
          <span>${r.score}점</span>
        </div>
        <div style="background:#e2e8f0; height:8px; border-radius:4px; overflow:hidden;">
          <div style="width:${r.score}%; background:${barColor}; height:100%; border-radius:4px; transition:width 0.5s ease;"></div>
        </div>
      </div>
    `;
  });

  rankingsHtml += `
      </div>
    </div>
  `;

  // 최종 조합 주입
  reportContent.innerHTML = `
    ${htmlReport}
    ${rankingsHtml}
  `;
}

// 로컬 맞춤형 주거지 추천 보고서 생성기 (기존 Python main.py 내 generate_recommendation_report 포팅)
function generateRecommendationReport(best, allResults, weights) {
  const sortedWeights = Object.entries(weights).sort((a, b) => b[1] - a[1]);
  const topPriorityKey = sortedWeights[0][0];
  
  const keyKr = {
    safety: "치안/안전",
    traffic: "교통/접근성",
    education: "교육/학군",
    nature: "녹지/공원",
    infra: "생활인프라/편의성"
  };
  
  const topPriorityName = keyKr[topPriorityKey] || topPriorityKey;
  
  let report = `### 🎉 당신에게 가장 적합한 추천 주거지는 **${best.name}**입니다!\n\n`;
  report += `분석 결과, 고객님께서 가장 중요하게 선택하신 **${topPriorityName}** 항목과 자치구의 실제 지표를 융합 연산한 결과, `;
  report += `**${best.name}**이(가) 종합 점수 **${best.score}점**으로 1위를 기록하였습니다.\n\n`;
  
  report += "#### 📊 후보군 상세 매트릭스 비교\n";
  allResults.forEach((r, idx) => {
    const rankIcon = idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : "•";
    report += `- ${rankIcon} **${r.name}**: **${r.score}점** (안전 ${r.original_scores.safety || 50} | 교통 ${r.original_scores.traffic || 50} | 교육 ${r.original_scores.education || 50} | 녹지 ${r.original_scores.nature || 50} | 인프라 ${r.original_scores.infra || 50})\n`;
  });
  
  report += `\n#### 💡 ${best.name} 추천 사유\n`;
  const bestScores = best.original_scores || {};
  const bestTopScore = bestScores[topPriorityKey] || 50;
  
  if (bestTopScore >= 90) {
    report += `- **최우수 지표 부합**: 가장 우선시한 **${topPriorityName}** 지표에서 ${best.name}은(는) **${bestTopScore}점**이라는 독보적으로 높은 점수를 기록했습니다.\n`;
  } else {
    report += `- **균형 잡힌 지표 구조**: **${topPriorityName}**(${bestTopScore}점) 뿐만 아니라 타 지표들과의 융합도가 뛰어나 감점 요인이 가장 적었습니다.\n`;
  }
  
  // 추가 우수 항목 (92점 이상) 탐색
  const strongPoints = [];
  for (const [k, v] of Object.entries(bestScores)) {
    if (keyKr[k] && v >= 92 && k !== topPriorityKey) {
      strongPoints.push(keyKr[k]);
    }
  }
  if (strongPoints.length > 0) {
    report += `- **부가적인 강점**: 이 외에도 **${strongPoints.join(", ")}** 부문에서 매우 우수한 정주 여건을 보장하고 있습니다.\n`;
  }
  
  report += "\n#### 💡 주거 선택 가이드\n";
  report += `**${best.name}**은(는) 전반적인 생활 편의 균형이 우수하므로 가중치 설정상 최적의 주거 만족도를 제공할 것입니다. `;
  if (allResults.length > 1) {
    const runnerUp = allResults[1];
    report += `만약 경제적 재정자립도나 대체 정주지를 고려하신다면 2위인 **${runnerUp.name}**(${runnerUp.score}점) 또한 좋은 대안이 될 수 있습니다.`;
  }
  
  return report;
}
