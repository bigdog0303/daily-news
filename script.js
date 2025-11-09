const newsContainer = document.getElementById("newsContainer");
const weekRangeEl = document.getElementById("weekRange");

let allNews = [];
let currentWeekStart = getStartOfWeek(new Date());

// Load and initialize
fetch("data/usd-high-impact.json")
  .then(res => res.json())
  .then(data => {
    allNews = data.map(item => ({
      ...item,
      dateObj: new Date(`${item.date}T${item.time === "Tentative" ? "00:00" : item.time}`)
    }));
    renderWeek(currentWeekStart);
  });

document.getElementById("prevWeek").onclick = () => {
  currentWeekStart.setDate(currentWeekStart.getDate() - 7);
  renderWeek(currentWeekStart);
};

document.getElementById("nextWeek").onclick = () => {
  currentWeekStart.setDate(currentWeekStart.getDate() + 7);
  renderWeek(currentWeekStart);
};

function renderWeek(startDate) {
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 6);

  const todayStr = new Date().toISOString().split("T")[0];

  const weekEvents = allNews.filter(event => {
    return event.dateObj >= startDate && event.dateObj <= endDate;
  });

  const grouped = groupByDate(weekEvents);

  weekContainer(grouped, todayStr);

  const startStr = startDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const endStr = endDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  weekRangeEl.textContent = `Mon, ${startStr} – Sun, ${endStr}`;
}

function groupByDate(events) {
  return events.reduce((acc, event) => {
    const key = event.date;
    acc[key] = acc[key] || [];
    acc[key].push(event);
    return acc;
  }, {});
}

function weekContainer(groupedEvents, todayStr) {
  newsContainer.innerHTML = "";

  Object.entries(groupedEvents).forEach(([date, events]) => {
    const block = document.createElement("div");
    block.className = "date-block";

    const title = document.createElement("div");
    title.className = "date-title";
    title.textContent = date;
    block.appendChild(title);

    events.forEach(ev => {
      const isToday = ev.date === todayStr;

      const card = document.createElement("div");
      card.className = "event-card";
      if (isToday) card.classList.add("today");

      const title = document.createElement("div");
      title.className = "event-title";
      title.textContent = ev.event;

      const badgeRow = document.createElement("div");
      badgeRow.innerHTML = `
        <span class="badge usd">USD</span>
        <span class="badge high">High</span>
        ${isToday ? '<span class="badge today">Today</span>' : ''}
      `;

      const time = document.createElement("div");
      time.className = "event-line";
      time.textContent = formatDateTime(ev.date, ev.time);

      const impact = document.createElement("div");
      impact.className = "event-line";
      impact.textContent = `Impact: ${ev.impact} · Forecast: ${ev.forecast || "-"}`;

      card.appendChild(title);
      card.appendChild(badgeRow);
      card.appendChild(time);
      card.appendChild(impact);

      block.appendChild(card);
    });

    newsContainer.appendChild(block);
  });
}

function formatDateTime(dateStr, timeStr) {
  if (timeStr === "Tentative") return `${formatDate(dateStr)} (Tentative)`;
  const d = new Date(`${dateStr}T${timeStr}`);
  const options = { month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: true };
  return d.toLocaleString("en-US", options).replace(",", " at");
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "2-digit" });
}

function getStartOfWeek(d) {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is Sunday
  return new Date(date.setDate(diff));
}
