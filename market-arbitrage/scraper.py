from playwright.sync_api import sync_playwright
import json

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page()
    page.goto("https://www.eveos.space/lukesguide/c1/datarelic")
    page.wait_for_selector(".site-card")

    cards = page.query_selector_all(".site-card")
    all_data = []

    for card in cards:
        site_name = card.query_selector(".site-header").inner_text().strip()
        site_loot = None

        try:
            loot_text = card.inner_text()
            if "Blue Loot:" in loot_text:
                amount = loot_text.split("Blue Loot:")[1].split("ISK")[0].strip()
                site_loot = int(amount.replace(",", "").replace(".", ""))
        except:
            pass

        waves = []
        for wave in card.query_selector_all(".wave-container"):
            wave_name = wave.query_selector(".wave-title").inner_text().strip()
            ships = []

            for row in wave.query_selector_all("table tbody tr"):
                tds = row.query_selector_all("td")
                if len(tds) < 9:
                    continue
                ships.append({
                    "qty": int(tds[0].inner_text().strip()),
                    "name": tds[1].inner_text().strip(),
                    "dps": int(tds[2].inner_text().strip().replace(",", "")),
                    "alpha": int(tds[3].inner_text().strip().replace(",", "")),
                    "ehp": int(tds[4].inner_text().strip().replace(",", "")),
                    "sig": int(tds[5].inner_text().strip().replace(",", "")),
                    "orbit_velocity": tds[6].inner_text().strip(),
                    "distance": tds[7].inner_text().strip(),
                    "special": tds[8].inner_text().strip().split()
                })

            waves.append({
                "wave": wave_name,
                "ships": ships
            })

        all_data.append({
            "site": site_name,
            "blue_loot_isk": site_loot,
            "waves": waves
        })

    with open("c1_datarelic_sites.json", "w") as f:
        json.dump(all_data, f, indent=2)

    print("✅ Scraping complete.")
    browser.close()
