import urllib.request
import ssl
import os

def download():
    url = "https://raw.githubusercontent.com/southkorea/seoul-maps/master/kostat/2013/json/seoul_municipalities_geo_simple.json"
    dest = os.path.join("frontend", "src", "assets", "seoul_municipalities_geo_simple.json")
    os.makedirs(os.path.dirname(dest), exist_ok=True)
    
    print(f"Downloading {url} to {dest}...")
    ctx = ssl._create_unverified_context()
    try:
        with urllib.request.urlopen(url, context=ctx) as response:
            data = response.read()
            with open(dest, "wb") as f:
                f.write(data)
        print("Download successful! File size:", os.path.getsize(dest))
    except Exception as e:
        print("Download failed:", e)

if __name__ == "__main__":
    download()
