let currentWeekOffset = 0;
let allData = [];

async function loadData() {
  const res = await fetch("data/usd-high-impact.json");
  const rawData = await res.json();
  allData = rawData.map(item => ({
    ...item,
    dateObj: new Date(`${item.date}T${item.time === "Tentative" ? "23:59" : item.time}`)
  }));
  renderWeek();
}

function groupByDate(events) {
  return events.reduce((acc, item) => {
    if (!acc[item.date]) acc[item.date] = [];
    acc[item.date].push(item);
    return acc;
  }, {});
}

function getNextEventGroup(events) {
  const now = new Date();
  const upcoming = events
    .filter(e => e.dateObj > now)
    .sort((a, b) => a.dateObj - b.dateObj);

  if (upcoming.length === 0) return null;

  const nextTime = upcoming[0].dateObj.getTime();
  return upcoming.filter(e => e.dateObj.getTime() === nextTime);
}

function renderWeek() {
  const start = new Date();
  start.setDate(start.getDate() - start.getDay() + 1 + currentWeekOffset * 7); // Monday
  const end = new Date(start);
  end.setDate(start.getDate() + 6); // Sunday

  const weekEvents = allData.filter(item => {
    const d = item.dateObj;
    return d >= start && d <= end;
  });

  // Set header
  const weekRange = `${start.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })} – ${end.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}`;
  document.getElementById("weekRange").textContent = weekRange;

  const grouped = groupByDate(weekEvents);
  const upcomingEvents = getNextEventGroup(weekEvents);
  const container = document.getElementById("newsContainer");
  container.innerHTML = "";

  Object.entries(grouped).sort().forEach(([date, items]) => {
    const block = document.createElement("div");
    block.className = "date-block";

    // Check if this date contains the next upcoming events
    if (upcomingEvents && upcomingEvents.some(ev => ev.date === date)) {
      block.classList.add("highlight");
    }

    const dateTitle = document.createElement("div");
    dateTitle.className = "date-title";
    dateTitle.textContent = date;
    block.appendChild(dateTitle);

    items.forEach(item => {
      const row = document.createElement("div");
      row.className = "event-row";

      row.innerHTML = `
        <span><strong>Time:</strong> ${item.time}</span>
        <span><strong>Event:</strong> ${item.event}</span>
        <span><strong>Impact:</strong> 🔴 ${item.impact}</span>
        <span><strong>Forecast:</strong> ${item.forecast ?? '-'}</span>
      `;

      block.appendChild(row);
    });

    container.appendChild(block);
  });
}

document.getElementById("prevWeek").addEventListener("click", () => {
  currentWeekOffset--;
  renderWeek();
});

document.getElementById("nextWeek").addEventListener("click", () => {
  currentWeekOffset++;
  renderWeek();
});

loadData();
