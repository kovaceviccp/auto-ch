"""Seed: create user Pavle + 6 car listings."""
import asyncio
from sqlalchemy import select
from app.core.database import AsyncSessionLocal
from app.core.security import get_password_hash
import app.models.favorite, app.models.chat, app.models.inquiry, app.models.review
from app.models.user import User
from app.models.listing import Listing

LISTINGS = [
    dict(
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

async def main():
    async with AsyncSessionLocal() as db:
        # Find or create Pavle
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
            print(f"Found existing user Pavle (ID {pavle.id})")

        for data in LISTINGS:
            listing = Listing(seller_id=pavle.id, images=[], **data)
            db.add(listing)
            print(f"  Adding: {data['title']}")

        await db.commit()
        print("Done! 6 listings created.")

asyncio.run(main())
