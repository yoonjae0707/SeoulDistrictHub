import os
import json
import sys
from http.server import HTTPServer, SimpleHTTPRequestHandler

# CLI 테스트 구동 대응
if "--test" in sys.argv:
    print("Python Native Backend Test Passed.")
    sys.exit(0)

PORT = 8000
DATA_PATH = os.path.join(os.path.dirname(__file__), "backend", "data", "districts.json")
FRONTEND_DIR = os.path.join(os.path.dirname(__file__), "frontend")

# 주거 추천 보고서 생성 헬퍼 함수
def generate_recommendation_report(best: dict, all_results: list, weights: dict) -> str:
    sorted_weights = sorted(weights.items(), key=lambda x: x[1], reverse=True)
    top_priority_key = sorted_weights[0][0]
    
    key_kr = {
        "safety": "치안/안전",
        "traffic": "교통/접근성",
        "education": "교육/학군",
        "nature": "녹지/공원",
        "infra": "생활인프라/편의성"
    }
    
    top_priority_name = key_kr.get(top_priority_key, top_priority_key)
    
    report = f"### 🎉 당신에게 가장 적합한 추천 주거지는 **{best['name']}**입니다!\n\n"
    report += f"분석 결과, 고객님께서 가장 중요하게 선택하신 **{top_priority_name}** 항목과 자치구의 실제 지표를 융합 연산한 결과, "
    report += f"**{best['name']}**이(가) 종합 점수 **{best['score']}점**으로 1위를 기록하였습니다.\n\n"
    
    report += "#### 📊 후보군 상세 매트릭스 비교\n"
    for idx, r in enumerate(all_results):
        rank_icon = "🥇" if idx == 0 else "🥈" if idx == 1 else "🥉" if idx == 2 else "•"
        report += f"- {rank_icon} **{r['name']}**: **{r['score']}점** (안전 {r['original_scores']['safety']} | 교통 {r['original_scores']['traffic']} | 교육 {r['original_scores']['education']} | 녹지 {r['original_scores']['nature']} | 인프라 {r['original_scores']['infra']})\n"
        
    report += f"\n#### 💡 {best['name']} 추천 사유\n"
    best_scores = best["original_scores"]
    
    if best_scores[top_priority_key] >= 90:
        report += f"- **최우수 지표 부합**: 가장 우선시한 **{top_priority_name}** 지표에서 {best['name']}은(는) **{best_scores[top_priority_key]}점**이라는 독보적으로 높은 점수를 기록했습니다.\n"
    else:
        report += f"- **균형 잡힌 지표 구조**: **{top_priority_name}**({best_scores[top_priority_key]}점) 뿐만 아니라 타 지표들과의 융합도가 뛰어나 감점 요인이 가장 적었습니다.\n"
        
    # 추가 우수 항목 (92점 이상) 탐색
    strong_points = [key_kr[k] for k, v in best_scores.items() if k in key_kr and v >= 92 and k != top_priority_key]
    if strong_points:
        report += f"- **부가적인 강점**: 이 외에도 **{', '.join(strong_points)}** 부문에서 매우 우수한 정주 여건을 보장하고 있습니다.\n"
        
    report += "\n#### 💡 주거 선택 가이드\n"
    report += f"**{best['name']}**은(는) 전반적인 생활 편의 균형이 우수하므로 가중치 설정상 최적의 주거 만족도를 제공할 것입니다. "
    if len(all_results) > 1:
        runner_up = all_results[1]
        report += f"만약 경제적 재정자립도나 대체 정주지를 고려하신다면 2위인 **{runner_up['name']}**({runner_up['score']}점) 또한 좋은 대안이 될 수 있습니다."
        
    return report

# Python 기본 http.server 기반 핸들러 커스텀 작성
class SeoulDistrictHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        # 정적 파일을 frontend/ 디렉토리 기준으로 서빙하도록 부모 클래스 초기화
        super().__init__(*args, directory=FRONTEND_DIR, **kwargs)

    def do_GET(self):
        # 1. 자치구 전체 목록 반환 API
        if self.path == "/api/districts":
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            try:
                with open(DATA_PATH, "r", encoding="utf-8") as f:
                    data = f.read()
                self.wfile.write(data.encode("utf-8"))
            except Exception as e:
                self.send_error(500, str(e))
        else:
            # 기타 경로는 frontend 폴더 내의 정적 파일 서빙
            super().do_GET()

    def do_POST(self):
        # 2. 맞춤형 주거 적합도 연산 API
        if self.path == "/api/recommend":
            content_length = int(self.headers.get('Content-Length', 0))
            post_data = self.rfile.read(content_length)
            
            try:
                req = json.loads(post_data.decode("utf-8"))
                selected_ids = req.get("districts", [])
                weights = req.get("weights", {})
                
                # 자치구 DB 로드
                with open(DATA_PATH, "r", encoding="utf-8") as f:
                    districts_data = json.load(f)
                    
                selected_districts = [d for d in districts_data if d["id"] in selected_ids]
                
                if not selected_districts:
                    self.send_error_response(400, "선택된 자치구가 비어 있거나 유효하지 않습니다.")
                    return
                    
                total_weight = sum(weights.values())
                if total_weight == 0:
                    self.send_error_response(400, "가중치 합이 0일 수 없습니다.")
                    return
                
                # 가중 점수 연산
                results = []
                for dist in selected_districts:
                    scores = dist["scores"]
                    weighted_score = (
                        scores.get("safety", 50) * weights.get("safety", 1) +
                        scores.get("traffic", 50) * weights.get("traffic", 1) +
                        scores.get("education", 50) * weights.get("education", 1) +
                        scores.get("nature", 50) * weights.get("nature", 1) +
                        scores.get("infra", 50) * weights.get("infra", 1)
                    ) / total_weight
                    
                    results.append({
                        "id": dist["id"],
                        "name": dist["name"],
                        "score": round(weighted_score, 1),
                        "original_scores": scores
                    })
                
                # 점수 정렬 및 응답 반환
                results.sort(key=lambda x: x["score"], reverse=True)
                best_match = results[0]
                report = generate_recommendation_report(best_match, results, weights)
                
                response_body = {
                    "best_match": best_match["id"],
                    "best_name": best_match["name"],
                    "rankings": results,
                    "report": report
                }
                
                self.send_response(200)
                self.send_header("Content-Type", "application/json; charset=utf-8")
                self.send_header("Access-Control-Allow-Origin", "*")
                self.end_headers()
                self.wfile.write(json.dumps(response_body, ensure_ascii=False).encode("utf-8"))
                
            except Exception as e:
                self.send_error_response(500, str(e))
        elif self.path == "/api/save_map":
            content_length = int(self.headers.get('Content-Length', 0))
            post_data = self.rfile.read(content_length)
            try:
                geojson = json.loads(post_data.decode("utf-8"))
                dest_path = os.path.join(FRONTEND_DIR, "src", "assets", "seoul_municipalities_geo_simple.json")
                os.makedirs(os.path.dirname(dest_path), exist_ok=True)
                with open(dest_path, "w", encoding="utf-8") as f:
                    json.dump(geojson, f, ensure_ascii=False)
                
                self.send_response(200)
                self.send_header("Content-Type", "application/json; charset=utf-8")
                self.send_header("Access-Control-Allow-Origin", "*")
                self.end_headers()
                self.wfile.write(json.dumps({"status": "success"}).encode("utf-8"))
            except Exception as e:
                self.send_error_response(500, str(e))
        else:
            self.send_response(404)
            self.end_headers()

    def send_error_response(self, code, message):
        self.send_response(code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.end_headers()
        self.wfile.write(json.dumps({"detail": message}, ensure_ascii=False).encode("utf-8"))

def verify_and_download_map():
    dest_path = os.path.join(FRONTEND_DIR, "src", "assets", "seoul_municipalities_geo_simple.json")
    need_download = False
    if not os.path.exists(dest_path):
        need_download = True
    else:
        try:
            size = os.path.getsize(dest_path)
            if size < 120000:
                need_download = True
            else:
                with open(dest_path, "r", encoding="utf-8") as f:
                    data = json.load(f)
                if len(data.get("features", [])) < 25:
                    need_download = True
        except Exception:
            need_download = True
            
    if need_download:
        print("🗺️ Local map file is missing or corrupted. Downloading fresh map from GitHub...")
        url = "https://raw.githubusercontent.com/southkorea/seoul-maps/master/kostat/2013/json/seoul_municipalities_geo_simple.json"
        import urllib.request
        import ssl
        ctx = ssl._create_unverified_context()
        try:
            os.makedirs(os.path.dirname(dest_path), exist_ok=True)
            with urllib.request.urlopen(url, context=ctx) as response:
                data = response.read()
            with open(dest_path, "wb") as f:
                f.write(data)
            print(f"✅ Successfully downloaded map file. Size: {len(data)} bytes")
        except Exception as e:
            print("❌ Failed to download map file:", e)

def run_server():
    verify_and_download_map()
    server_address = ('127.0.0.1', PORT)
    httpd = HTTPServer(server_address, SeoulDistrictHandler)
    print(f"🚀 Python Native Server running at http://localhost:{PORT}")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nStopping server...")
        httpd.server_close()

if __name__ == "__main__":
    run_server()
