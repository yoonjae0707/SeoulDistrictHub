import os
import json

# Setup paths
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_PATH = os.path.join(BASE_DIR, "backend", "data", "districts.json")
EMBLEMS_DIR = os.path.join(BASE_DIR, "frontend", "src", "assets", "emblems")
AVATARS_DIR = os.path.join(BASE_DIR, "frontend", "src", "assets", "avatars")

os.makedirs(EMBLEMS_DIR, exist_ok=True)
os.makedirs(AVATARS_DIR, exist_ok=True)

# Emblem SVG generator with clean Korean initials and party gradient theme
def make_emblem_svg(id_str, name_kr, party):
    bg_color = "#1b4d8a" if party == "더불어민주당" else "#e61c24"
    displayName = name_kr[:2] if len(name_kr) >= 2 else name_kr
    
    svg = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <defs>
    <linearGradient id="emblem-grad-{id_str}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="{bg_color}" />
      <stop offset="100%" stop-color="#2c3e50" />
    </linearGradient>
    <filter id="capsule-shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity="0.15" />
    </filter>
  </defs>
  <!-- Beautiful Pill Capsule Outline Badge -->
  <rect x="4" y="4" width="92" height="92" rx="28" fill="url(#emblem-grad-{id_str})" filter="url(#capsule-shadow)" />
  <rect x="8" y="8" width="84" height="84" rx="24" fill="none" stroke="#ffffff" stroke-width="1.5" opacity="0.15" />
  
  <!-- Crest shield -->
  <path d="M50 22 L72 34 V62 C72 74 50 82 50 82 C50 82 28 74 28 62 V34 Z" fill="none" stroke="#ffffff" stroke-width="3" stroke-linejoin="round" stroke-linecap="round" />
  <circle cx="50" cy="46" r="10" fill="#ffffff" opacity="0.15" />
  
  <text x="50" y="48" font-family="'Noto Sans KR', 'Segoe UI', sans-serif" font-size="12" font-weight="900" fill="#ffffff" text-anchor="middle" dominant-baseline="middle" letter-spacing="0.5">{displayName}</text>
  <text x="50" y="68" font-family="'Noto Sans KR', 'Segoe UI', sans-serif" font-size="6.5" font-weight="800" fill="#ffffff" opacity="0.8" text-anchor="middle" dominant-baseline="middle" letter-spacing="1">DISTRICT</text>
</svg>"""
    return svg

# Avatar SVG generator with clean modern One UI silhouette profile
def make_avatar_svg(id_str, mayor_name, party):
    color_map = {
        "더불어민주당": ("#3498db", "#1b4d8a"),
        "국민의힘": ("#e74c3c", "#e61c24")
    }
    c1, c2 = color_map.get(party, ("#94a3b8", "#475569"))
    
    svg = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <defs>
    <linearGradient id="avatar-grad-{id_str}" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="{c1}" />
      <stop offset="100%" stop-color="{c2}" />
    </linearGradient>
  </defs>
  <!-- Capsule circular backdrop -->
  <circle cx="50" cy="50" r="50" fill="url(#avatar-grad-{id_str})" />
  <circle cx="50" cy="50" r="46" fill="none" stroke="#ffffff" stroke-width="1.5" opacity="0.2" />
  
  <!-- Silhouette -->
  <circle cx="50" cy="38" r="15" fill="#ffffff" />
  <path d="M25 78 C25 61 36 56 50 56 C64 56 75 61 75 78 C75 84 75 86 75 86 H25 Z" fill="#ffffff" />
  
  <!-- Initials Badge -->
  <rect x="30" y="72" width="40" height="12" rx="6" fill="#ffffff" />
  <text x="50" y="78.5" font-family="'Noto Sans KR', 'Segoe UI', sans-serif" font-size="7" font-weight="900" fill="#2c3e50" text-anchor="middle" dominant-baseline="middle">{mayor_name}</text>
</svg>"""
    return svg

def generate_local_images():
    print("Reading districts database...")
    with open(DATA_PATH, "r", encoding="utf-8") as f:
        districts = json.load(f)
        
    for d in districts:
        id_str = d["id"]
        name_kr = d.get("name_kr", d["name"])
        mayor = d["mayor"]
        party = d["party"]
        
        # 1. Create Emblem SVG
        emblem_svg = make_emblem_svg(id_str, name_kr, party)
        emblem_path = os.path.join(EMBLEMS_DIR, f"{id_str}.svg")
        with open(emblem_path, "w", encoding="utf-8") as f_emb:
            f_emb.write(emblem_svg)
            
        # 2. Create Avatar SVG
        avatar_svg = make_avatar_svg(id_str, mayor, party)
        avatar_path = os.path.join(AVATARS_DIR, f"{id_str}.svg")
        with open(avatar_path, "w", encoding="utf-8") as f_av:
            f_av.write(avatar_svg)
            
        # 3. Update paths inside districts.json to local assets
        d["logo_url"] = f"/src/assets/emblems/{id_str}.svg"
        d["mayor_img_url"] = f"/src/assets/avatars/{id_str}.svg"
        
    # Write back the updated districts.json
    with open(DATA_PATH, "w", encoding="utf-8") as f:
        json.dump(districts, f, ensure_ascii=False, indent=2)
        
    print(f"Successfully generated {len(districts)} local emblems & avatars, and updated districts.json.")

    # Generate images for the default Seoul City data as well
    seoul_emblem = make_emblem_svg("seoul", "서울특별시", "국민의힘")
    seoul_avatar = make_avatar_svg("seoul", "오세훈", "국민의힘")
    
    with open(os.path.join(EMBLEMS_DIR, "seoul.svg"), "w", encoding="utf-8") as f:
        f.write(seoul_emblem)
    with open(os.path.join(AVATARS_DIR, "seoul.svg"), "w", encoding="utf-8") as f:
        f.write(seoul_avatar)
    print("Successfully generated default Seoul City assets.")

if __name__ == "__main__":
    generate_local_images()
