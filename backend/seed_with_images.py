"""Seed Pavle + 6 cars + download real car images from Unsplash CDN."""
import asyncio, os, uuid, urllib.request
from sqlalchemy import select
from app.core.database import AsyncSessionLocal
from app.core.security import get_password_hash
import app.models.favorite, app.models.chat, app.models.inquiry, app.models.review
from app.models.user import User
from app.models.listing import Listing

UPLOAD_DIR = "/app/uploads"

# Unsplash direct CDN image URLs — high res, no auth needed
CAR_IMAGES = {
    "bmw": [
        "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=1600&q=85&fm=jpg&fit=crop",
        "https://images.unsplash.com/photo-1617469767-9a998a0b6d66?w=1600&q=85&fm=jpg&fit=crop",
        "https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?w=1600&q=85&fm=jpg&fit=crop",
    ],
    "porsche": [
        "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1600&q=85&fm=jpg&fit=crop",
        "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=1600&q=85&fm=jpg&fit=crop",
        "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=1600&q=85&fm=jpg&fit=crop",
    ],
    "golf": [
        "https://images.unsplash.com/photo-1541348263662-e068662d82af?w=1600&q=85&fm=jpg&fit=crop",
        "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=1600&q=85&fm=jpg&fit=crop",
        "https://images.unsplash.com/photo-1583267746897-2cf415887172?w=1600&q=85&fm=jpg&fit=crop",
    ],
    "mercedes": [
        "https://images.unsplash.com/photo-1618843479619-a1f1d44e7e72?w=1600&q=85&fm=jpg&fit=crop",
        "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=1600&q=85&fm=jpg&fit=crop",
        "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=1600&q=85&fm=jpg&fit=crop",
    ],
    "tesla": [
        "https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=1600&q=85&fm=jpg&fit=crop",
        "https://images.unsplash.com/photo-1571127236794-81c0bbfe1ce3?w=1600&q=85&fm=jpg&fit=crop",
        "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=1600&q=85&fm=jpg&fit=crop",
    ],
    "audi": [
        "https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?w=1600&q=85&fm=jpg&fit=crop",
        "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?w=1600&q=85&fm=jpg&fit=crop",
        "https://images.unsplash.com/photo-1493238792000-8113da705763?w=1600&q=85&fm=jpg&fit=crop",
    ],
}

LISTINGS = [
    dict(
        key="bmw",
        title="BMW 330d xDrive M Sport",
        make="BMW", model="3er", year=2021, vehicle_type="car", condition="used",
        mileage_km=38000, fuel_type="diesel", transmission="automatic",
        engine_cc=2993, power_kw=210, doors=4, seats=5, color="Schwarz",
        price_chf=42900, price_negotiable=True, leasing_available=True,
        canton="ZH", city="Zürich",
        description="Sehr gepflegter BMW 330d xDrive in tadellosem Zustand. Vollausstattung, M-Sportpaket, Panoramadach, Harman Kardon Sound, Head-Up Display. Scheckheftgepflegt beim BMW Händler.",
        features={"navigation": True, "panorama_roof": True, "bluetooth": True, "apple_carplay": True, "led_lights": True, "abs": True, "esp": True},
    ),
    dict(
        key="porsche",
        title="Porsche Cayenne E-Hybrid Coupé",
        make="Porsche", model="Cayenne Coupé", year=2022, vehicle_type="car", condition="used",
        mileage_km=19500, fuel_type="plugin_hybrid", transmission="automatic",
        engine_cc=2995, power_kw=340, doors=4, seats=5, color="Weiss",
        price_chf=98500, price_negotiable=False, leasing_available=True,
        canton="ZG", city="Zug",
        description="Porsche Cayenne E-Hybrid Coupé in Pearl White Metallic. Elektrische Reichweite ~50km, Sport Chrono Paket, BOSE Surround Sound, 21-Zoll Felgen, Matrix LED Scheinwerfer. Wie neu.",
        features={"navigation": True, "panorama_roof": True, "adaptive_cruise": True, "blind_spot": True, "led_lights": True, "keyless_entry": True},
    ),
    dict(
        key="golf",
        title="Volkswagen Golf 8 GTI DSG",
        make="Volkswagen", model="Golf", year=2023, vehicle_type="car", condition="used",
        mileage_km=12300, fuel_type="petrol", transmission="automatic",
        engine_cc=1984, power_kw=180, doors=5, seats=5, color="Grau",
        price_chf=38700, price_negotiable=True, leasing_available=False,
        canton="BE", city="Bern",
        description="Golf 8 GTI in Nardo Grey, nahezu neuwertig. IQ.DRIVE Fahrerassistenz, Harman Kardon, DCC Adaptivfahrwerk, 18 Zoll 'Richmond' Felgen. Unfallfreies Fahrzeug.",
        features={"navigation": True, "bluetooth": True, "apple_carplay": True, "android_auto": True, "lane_assist": True, "abs": True},
    ),
    dict(
        key="mercedes",
        title="Mercedes-Benz E 220d AMG Line 4MATIC",
        make="Mercedes-Benz", model="E-Klasse", year=2020, vehicle_type="car", condition="used",
        mileage_km=54000, fuel_type="diesel", transmission="automatic",
        engine_cc=1950, power_kw=143, doors=4, seats=5, color="Silber",
        price_chf=34900, price_negotiable=True, leasing_available=False,
        canton="BS", city="Basel",
        description="Elegante E-Klasse mit AMG Line Ausstattung und 4MATIC Allradantrieb. Multibeam LED, Burmester Sound, Widescreen Cockpit, 360° Kamera, AHK. Vollständige Servicedokumentation.",
        features={"navigation": True, "reversing_camera": True, "seat_heating": True, "steering_heating": True, "led_lights": True, "tow_bar": True},
    ),
    dict(
        key="tesla",
        title="Tesla Model 3 Long Range AWD",
        make="Tesla", model="Model 3", year=2022, vehicle_type="car", condition="used",
        mileage_km=28700, fuel_type="electric", transmission="automatic",
        engine_cc=None, power_kw=357, doors=4, seats=5, color="Rot",
        price_chf=44500, price_negotiable=False, leasing_available=True,
        canton="GE", city="Genf",
        description="Tesla Model 3 Long Range in Deep Red Metallic. Reichweite ca. 600km, Autopilot, Premium Audio, Glassdach, 18 Zoll Aero Felgen. Inklusive CCS Adapter für Schnellladen.",
        features={"navigation": True, "bluetooth": True, "apple_carplay": False, "wireless_charging": True, "led_lights": True, "adaptive_cruise": True},
    ),
    dict(
        key="audi",
        title="Audi A4 Avant 40 TDI Quattro S-Line",
        make="Audi", model="A4", year=2021, vehicle_type="car", condition="used",
        mileage_km=41200, fuel_type="diesel", transmission="automatic",
        engine_cc=1968, power_kw=140, doors=5, seats=5, color="Blau",
        price_chf=36800, price_negotiable=True, leasing_available=False,
        canton="LU", city="Luzern",
        description="Audi A4 Avant in Navarra Blau Metallic mit S-Line Sportpaket und Quattro Allrad. Virtual Cockpit Plus, Matrix LED, B&O Sound, Panoramadach, AHK. Top gepflegt.",
        features={"navigation": True, "panorama_roof": True, "bluetooth": True, "apple_carplay": True, "tow_bar": True, "led_lights": True, "seat_heating": True},
    ),
]


def download_images(listing_id: int, key: str) -> list[str]:
    folder = f"{UPLOAD_DIR}/{listing_id}"
    os.makedirs(folder, exist_ok=True)
    paths = []
    headers = {"User-Agent": "Mozilla/5.0 (compatible; AutoCH/1.0)"}
    for url in CAR_IMAGES[key]:
        try:
            filename = f"{uuid.uuid4()}.jpg"
            filepath = f"{folder}/{filename}"
            req = urllib.request.Request(url, headers=headers)
            with urllib.request.urlopen(req, timeout=15) as resp, open(filepath, "wb") as f:
                f.write(resp.read())
            if os.path.getsize(filepath) > 10_000:  # at least 10KB = real image
                paths.append(f"/uploads/{listing_id}/{filename}")
                print(f"    ✓ Downloaded image {len(paths)}/3")
            else:
                os.remove(filepath)
                print(f"    ✗ Skipped (too small): {url[:60]}")
        except Exception as e:
            print(f"    ✗ Failed: {e}")
    return paths


async def main():
    async with AsyncSessionLocal() as db:
        # Create Pavle
        result = await db.execute(select(User).where(User.email == "pavle@autoch.ch"))
        pavle = result.scalar_one_or_none()
        if not pavle:
            pavle = User(
                email="pavle@autoch.ch",
                first_name="Pavle",
                last_name="Owner",
                hashed_password=get_password_hash("pavle1234"),
                role="seller",
                canton="ZH",
                city="Zürich",
                phone="+41 79 123 45 67",
            )
            db.add(pavle)
            await db.flush()
            print(f"Created user Pavle (ID {pavle.id})")
        else:
            print(f"Found Pavle (ID {pavle.id})")

        for data in LISTINGS:
            key = data.pop("key")
            listing = Listing(seller_id=pavle.id, images=[], **data)
            db.add(listing)
            await db.flush()  # get the ID

            print(f"\n  [{listing.id}] {listing.title}")
            images = download_images(listing.id, key)
            listing.images = images
            print(f"    → {len(images)} images saved")

        await db.commit()
        print("\nDone! 6 listings with images created.")


asyncio.run(main())
