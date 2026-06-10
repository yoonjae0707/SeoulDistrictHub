// 서울시 25개 자치구의 벌집형(Hexagonal Grid) 지도 좌표 및 시각적 배치 데이터
export const seoulMapData = {
  // Grid layout configuration
  config: {
    width: 680,
    height: 520,
    hexRadius: 36, // 반지름
    spacingX: 62.3, // x 간격 (R * sqrt(3))
    spacingY: 54.0, // y 간격 (R * 1.5)
    originX: 65,
    originY: 55
  },
  // 25개 자치구 격자 위치 정의 (행, 열)
  districts: [
    // --- 강북 지역 (14개 구) ---
    { id: "gangbuk", name: "강북구", row: 0, col: 3 },
    { id: "dobong", name: "도봉구", row: 0, col: 4 },
    
    { id: "eunpyeong", name: "은평구", row: 1, col: 1 },
    { id: "seongbuk", name: "성북구", row: 1, col: 3 },
    { id: "nowon", name: "노원구", row: 1, col: 5 },
    
    { id: "mapo", name: "마포구", row: 2, col: 0 },
    { id: "seodaemun", name: "서대문구", row: 2, col: 1 },
    { id: "jongno", name: "종로구", row: 2, col: 2 },
    { id: "dongdaemun", name: "동대문구", row: 2, col: 3 },
    { id: "jungnang", name: "중랑구", row: 2, col: 4 },
    
    { id: "yongsan", name: "용산구", row: 3, col: 1 },
    { id: "junggu", name: "중구", row: 3, col: 2 },
    { id: "seongdong", name: "성동구", row: 3, col: 3 },
    { id: "gwangjin", name: "광진구", row: 3, col: 4 },
    
    // --- 강남 지역 (11개 구) ---
    { id: "gangseo", name: "강서구", row: 4, col: 0 },
    { id: "yeongdeungpo", name: "영등포구", row: 4, col: 1 },
    { id: "dongjak", name: "동작구", row: 4, col: 2 },
    { id: "gangdong", name: "강동구", row: 4, col: 6 },
    
    { id: "yangcheon", name: "양천구", row: 5, col: 0 },
    { id: "guro", name: "구로구", row: 5, col: 1 },
    { id: "gwanak", name: "관악구", row: 5, col: 2 },
    { id: "seocho", name: "서초구", row: 5, col: 3 },
    { id: "gangnam", name: "강남구", row: 5, col: 4 },
    { id: "songpa", name: "송파구", row: 5, col: 5 },
    
    { id: "geumcheon", name: "금천구", row: 6, col: 1 }
  ],
  // 한강(Han River) 보조선 좌표
  hanRiver: [
    { row: 3.5, col: -0.5 },
    { row: 3.6, col: 0.5 },
    { row: 3.7, col: 1.5 },
    { row: 4.1, col: 2.5 },
    { row: 3.9, col: 3.5 },
    { row: 4.2, col: 4.5 },
    { row: 4.4, col: 5.5 },
    { row: 3.8, col: 6.5 }
  ]
};

// 벌집(정육각형)의 6개 꼭짓점 상대 좌표 계산 함수
export function getHexPoints(centerX, centerY, r) {
  const points = [];
  for (let i = 0; i < 6; i++) {
    // 30도 회전시켜 정점이 위를 향하도록 설정 (Flat-topped or Pointy-topped)
    // 여기서는 Pointy-topped로 설정
    const angleRad = (Math.PI / 180) * (60 * i - 30);
    const x = centerX + r * Math.cos(angleRad);
    const y = centerY + r * Math.sin(angleRad);
    points.push(`${x.toFixed(1)},${y.toFixed(1)}`);
  }
  return points.join(" ");
}
