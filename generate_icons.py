"""
나노바나나 (Gemini 2.0 Flash) 이미지 생성 스크립트
홈 화면 메뉴 아이콘 10개 생성
"""
import time
from pathlib import Path
from google import genai
from google.genai import types

# API 설정
API_KEY = "AIzaSyAFcmafkn7FNfGI--xbDVHNLT1p6Hg4kCs"
OUTPUT_DIR = Path("D:/farmsense-project/frontend/assets/menu-icons")
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

client = genai.Client(api_key=API_KEY)

# 아이콘 정의
ICONS = [
    {
        "name": "farm_status",
        "prompt": "Generate a flat design circular icon, dark teal green background color #2D5A3D. Inside: white line illustration of vineyard landscape with grape vines, small sun, clouds. Minimalist app icon, 256x256px, clean edges, no text."
    },
    {
        "name": "sensor_data",
        "prompt": "Generate a flat design circular icon, dark teal blue background color #1A4A5A. Inside: white and light green line illustration of bar chart with WiFi signal waves and sensor device. Minimalist app icon, 256x256px, clean edges, no text."
    },
    {
        "name": "disease_diagnosis",
        "prompt": "Generate a flat design circular icon, dark teal green background color #2D5A3D. Inside: white line illustration of camera with magnifying glass and small leaf. Minimalist app icon, 256x256px, clean edges, no text."
    },
    {
        "name": "ai_consult",
        "prompt": "Generate a flat design circular icon, dark teal blue background color #1A4A5A. Inside: white and green line illustration of friendly robot face with speech bubbles. Minimalist app icon, 256x256px, clean edges, no text."
    },
    {
        "name": "farm_diary",
        "prompt": "Generate a flat design circular icon, dark teal blue background color #1A4A5A. Inside: white line illustration of open notebook journal with pen writing. Minimalist app icon, 256x256px, clean edges, no text."
    },
    {
        "name": "community",
        "prompt": "Generate a flat design circular icon, dark teal green background color #2D5A3D. Inside: white line illustration of three people silhouettes grouped together. Minimalist app icon, 256x256px, clean edges, no text."
    },
    {
        "name": "farm_settings",
        "prompt": "Generate a flat design circular icon, dark teal blue background color #1A4A5A. Inside: white and green line illustration of gear cog with wrench tool. Minimalist app icon, 256x256px, clean edges, no text."
    },
    {
        "name": "sensor_manage",
        "prompt": "Generate a flat design circular icon, dark teal blue background color #1A4A5A. Inside: white line illustration of radio antenna tower emitting signal waves. Minimalist app icon, 256x256px, clean edges, no text."
    },
    {
        "name": "help",
        "prompt": "Generate a flat design circular icon, dark teal green background color #2D5A3D. Inside: large bold white question mark symbol centered. Minimalist app icon, 256x256px, clean edges, no other text."
    },
    {
        "name": "notifications",
        "prompt": "Generate a flat design circular icon, dark teal blue background color #1A4A5A. Inside: white and green line illustration of notification bell with small dots. Minimalist app icon, 256x256px, clean edges, no text."
    },
]

def generate_icon(icon_data):
    """Gemini로 아이콘 생성"""
    name = icon_data["name"]
    prompt = icon_data["prompt"]
    output_path = OUTPUT_DIR / f"{name}.png"

    if output_path.exists():
        print(f"  [SKIP] {name}.png already exists")
        return True

    try:
        response = client.models.generate_content(
            model="gemini-2.0-flash-exp-image-generation",
            contents=prompt,
            config=types.GenerateContentConfig(
                response_modalities=["IMAGE", "TEXT"],
            ),
        )

        # 응답에서 이미지 추출
        if response.candidates and response.candidates[0].content and response.candidates[0].content.parts:
            for part in response.candidates[0].content.parts:
                if part.inline_data is not None:
                    image_data = part.inline_data.data
                    with open(output_path, "wb") as f:
                        f.write(image_data)
                    print(f"  [OK] {name}.png saved ({len(image_data)} bytes)")
                    return True
                elif part.text:
                    print(f"  [TEXT] {part.text[:100]}")

        print(f"  [WARN] {name}: No image in response")
        return False

    except Exception as e:
        print(f"  [ERR] {name}: {e}")
        return False

def main():
    print(f"=== Generating {len(ICONS)} menu icons ===")
    print(f"Output: {OUTPUT_DIR}\n")

    success = 0
    for i, icon in enumerate(ICONS):
        print(f"[{i+1}/{len(ICONS)}] {icon['name']}...")
        if generate_icon(icon):
            success += 1
        if i < len(ICONS) - 1:
            time.sleep(5)

    print(f"\n=== Done: {success}/{len(ICONS)} generated ===")

if __name__ == "__main__":
    main()
