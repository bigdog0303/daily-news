const weekRange = document.getElementById("weekRange");
const newsContainer = document.getElementById("newsContainer");

let currentWeekStart = getMonday(new Date());

function getMonday(d) {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(date.setDate(diff));
}

function formatDate(date) {
  return date.toISOString().split('T')[0];
}

function formatDisplayDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
}

function formatDisplayTime(time) {
  if (time === 'Tentative') return 'Tentative';
  const [hour, minute] = time.split(':');
  const date = new Date();
  date.setHours(hour, minute);
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

function updateWeekRangeDisplay(startDate) {
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 6);
  const options = { month: 'short', day: 'numeric' };
  weekRange.textContent = `Mon, ${startDate.toLocaleDateString('en-US', options)} – Sun, ${endDate.toLocaleDateString('en-US', options)}`;
}

function isToday(dateStr) {
  const today = new Date();
  const d = new Date(dateStr);
  return d.toDateString() === today.toDateString();
}

async function loadData() {
  const res = await fetch("data/usd-high-impact.json");
  const data = await res.json();
  return data;
}

function renderNews(data) {
  newsContainer.innerHTML = "";
  const weekStart = new Date(currentWeekStart);
  const weekEnd = new Date(currentWeekStart);
  weekEnd.setDate(weekStart.getDate() + 6);

  const grouped = {};
  data.forEach(item => {
    const date = new Date(item.date);
    if (date >= weekStart && date <= weekEnd) {
      if (!grouped[item.date]) grouped[item.date] = [];
      grouped[item.date].push(item);
    }
  });

  const sortedDates = Object.keys(grouped).sort();

  for (const date of sortedDates) {
    const block = document.createElement("div");
    block.className = "date-block";

    const dateTitle = document.createElement("div");
    dateTitle.className = "date-title";
    dateTitle.textContent = date;
    block.appendChild(dateTitle);

    grouped[date].forEach(event => {
      const card = document.createElement("div");
      card.className = "event-card";
      if (isToday(event.date)) {
        card.classList.add("today");
      }

      card.innerHTML = `
        <div class="event-title">${event.event}</div>
        <div>
          <span class="badge usd">USD</span>
          <span class="badge high">High</span>
          ${isToday(event.date) ? '<span class="badge today">Today</span>' : ''}
        </div>
        <div class="event-line">${formatDisplayDate(event.date)} at ${formatDisplayTime(event.time)}</div>
        <div class="event-line">Impact: High · ${event.forecast || "-"}</div>
      `;
      block.appendChild(card);
    });

    newsContainer.appendChild(block);
  }
}

document.getElementById("prevWeek").addEventListener("click", () => {
  currentWeekStart.setDate(currentWeekStart.getDate() - 7);
  updateWeekRangeDisplay(currentWeekStart);
  loadData().then(renderNews);
});

document.getElementById("nextWeek").addEventListener("click", () => {
  currentWeekStart.setDate(currentWeekStart.getDate() + 7);
  updateWeekRangeDisplay(currentWeekStart);
  loadData().then(renderNews);
});

document.getElementById("todayWeek").addEventListener("click", () => {
  currentWeekStart = getMonday(new Date());
  updateWeekRangeDisplay(currentWeekStart);
  loadData().then(renderNews);
});

// Init
updateWeekRangeDisplay(currentWeekStart);
loadData().then(renderNews);
