let currentWeekOffset = 0;
let allData = [];

// Load data from JSON
async function loadData() {
  const res = await fetch("data/usd-high-impact.json");
  const rawData = await res.json();

  allData = rawData.map(item => ({
    ...item,
    dateObj: new Date(`${item.date}T${item.time === "Tentative" ? "23:59" : item.time}`)
  }));

  renderWeek();
}

// Group events by date
function groupByDate(events) {
  return events.reduce((acc, item) => {
    if (!acc[item.date]) acc[item.date] = [];
    acc[item.date].push(item);
    return acc;
  }, {});
}

// Render current week
function renderWeek() {
  const start = new Date();
  start.setDate(start.getDate() - start.getDay() + 1 + currentWeekOffset * 7); // Monday
  const end = new Date(start);
  end.setDate(start.getDate() + 6); // Sunday

  const weekEvents = allData.filter(item => {
    const d = item.dateObj;
    return d >= start && d <= end;
  });

  // Set header range
  const weekRange = `${start.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })} – ${end.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}`;
  document.getElementById("weekRange").textContent = weekRange;

  // Group by date
  const grouped = groupByDate(weekEvents);
  const container = document.getElementById("newsContainer");
  container.innerHTML = "";

  Object.entries(grouped).sort().forEach(([date, items]) => {
    const block = document.createElement("div");
    block.className = "date-block";

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

// Navigation
document.getElementById("prevWeek").addEventListener("click", () => {
  currentWeekOffset--;
  renderWeek();
});

document.getElementById("nextWeek").addEventListener("click", () => {
  currentWeekOffset++;
  renderWeek();
});

// Start
loadData();
