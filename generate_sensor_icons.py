"""
나노바나나 (Gemini 2.0 Flash) - 센서 대시보드 아이콘 8개 생성
"""
import time
from pathlib import Path
from google import genai
from google.genai import types

API_KEY = "AIzaSyAFcmafkn7FNfGI--xbDVHNLT1p6Hg4kCs"
OUTPUT_DIR = Path("D:/farmsense-project/frontend/assets/sensor-icons")
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

client = genai.Client(api_key=API_KEY)

ICONS = [
    {
        "name": "air_temperature",
        "prompt": "Generate a flat design circular icon, 256x256px. Soft green gradient background (#A8D5BA to #7BC8A4). Inside: a cute red-white mercury thermometer with small temperature lines. Minimalist, clean, no text, app icon style."
    },
    {
        "name": "humidity",
        "prompt": "Generate a flat design circular icon, 256x256px. Soft blue-green gradient background (#87CEEB to #5BACDE). Inside: a large blue water droplet with small ripple effect. Minimalist, clean, no text, app icon style."
    },
    {
        "name": "co2_level",
        "prompt": "Generate a flat design circular icon, 256x256px. Soft green gradient background (#A8D5BA to #7BC8A4). Inside: white CO2 text with small molecule dots around it, cloud shape. Minimalist, clean, app icon style."
    },
    {
        "name": "soil_moisture",
        "prompt": "Generate a flat design circular icon, 256x256px. Soft brown-green gradient background (#C4A882 to #8CB369). Inside: brown soil cross-section with blue water droplets seeping down. Minimalist, clean, no text, app icon style."
    },
    {
        "name": "soil_temperature",
        "prompt": "Generate a flat design circular icon, 256x256px. Soft orange-green gradient background (#E8C170 to #A8D5BA). Inside: a thermometer half buried in brown soil layers. Minimalist, clean, no text, app icon style."
    },
    {
        "name": "solar_radiation",
        "prompt": "Generate a flat design circular icon, 256x256px. Soft yellow-orange gradient background (#FFD700 to #FFA500). Inside: a bright sun with radiating rays and small sparkle dots. Minimalist, clean, no text, app icon style."
    },
    {
        "name": "soil_humidity",
        "prompt": "Generate a flat design circular icon, 256x256px. Soft teal-green gradient background (#6BB5A0 to #4A9A82). Inside: a small plant seedling growing from moist dark soil with water drops. Minimalist, clean, no text, app icon style."
    },
    {
        "name": "wind_speed",
        "prompt": "Generate a flat design circular icon, 256x256px. Soft purple-blue gradient background (#9B8EC1 to #7B9FD4). Inside: curved wind swirl lines flowing from left to right, dynamic motion feel. Minimalist, clean, no text, app icon style."
    },
]

def generate_icon(icon_data):
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
    print(f"=== Generating {len(ICONS)} sensor icons ===")
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
