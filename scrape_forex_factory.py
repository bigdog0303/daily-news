import requests
from bs4 import BeautifulSoup
import json
from datetime import datetime

URL = "https://www.forexfactory.com/calendar"
HEADERS = {
    "User-Agent": "Mozilla/5.0"
}

def scrape_forex_factory():
    response = requests.get(URL, headers=HEADERS)
    soup = BeautifulSoup(response.content, "html.parser")

    rows = soup.find_all("tr", class_="calendar__row")

    events = []

    for row in rows:
        try:
            # Extract basic fields
            impact_icon = row.find("td", class_="calendar__impact")
            if not impact_icon or "high" not in impact_icon.get("class", []):
                continue  # skip if not high impact

            currency = row.find("td", class_="calendar__currency").text.strip()
            if currency != "USD":
                continue  # only USD

            date_elem = row.find_previous("tr", class_="calendar__row--new-day")
            date_text = date_elem.find("td", class_="calendar__date").text.strip() if date_elem else ""
            date = datetime.today().strftime("%Y-%m-%d") if not date_text else date_text

            time = row.find("td", class_="calendar__time").text.strip()
            event = row.find("td", class_="calendar__event").text.strip()
            forecast = row.find("td", class_="calendar__forecast").text.strip()

            events.append({
                "date": date,
                "time": time,
                "event": event,
                "impact": "High",
                "forecast": forecast or "N/A"
            })
        except Exception as e:
            print("Error parsing row:", e)

    with open("data/usd-high-impact.json", "w") as f:
        json.dump(events, f, indent=2)

if __name__ == "__main__":
    scrape_forex_factory()
