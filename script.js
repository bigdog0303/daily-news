let currentWeekStart = getMonday(new Date());
let newsData = [];

document.getElementById("prevWeek").addEventListener("click", () => {
  currentWeekStart.setDate(currentWeekStart.getDate() - 7);
  updateWeekRangeDisplay(currentWeekStart);
  renderNews(newsData);
});

document.getElementById("nextWeek").addEventListener("click", () => {
  currentWeekStart.setDate(currentWeekStart.getDate() + 7);
  updateWeekRangeDisplay(currentWeekStart);
  renderNews(newsData);
});

document.getElementById("todayWeek").addEventListener("click", () => {
  currentWeekStart = getMonday(new Date());
  updateWeekRangeDisplay(currentWeekStart);
  renderNews(newsData);
});

function getMonday(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when Sunday
  return new Date(d.setDate(diff));
}

function formatDateRange(startDate) {
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 6);
  const options = { month: 'short', day: 'numeric' };
  return `Mon, ${startDate.toLocaleDateString('en-US', options)} – Sun, ${endDate.toLocaleDateString('en-US', options)}`;
}

function updateWeekRangeDisplay(startDate) {
  const rangeText = formatDateRange(startDate);
  document.getElementById("weekRange").textContent = rangeText;
}

function loadData() {
  return fetch('data/usd-high-impact.json')
    .then(response => response.json())
    .then(data => {
      newsData = data;
      return data;
    });
}

function renderNews(data) {
  const tbody = document.getElementById("newsTable");
  tbody.innerHTML = '';

  const weekStart = new Date(currentWeekStart);
  const weekEnd = new Date(weekStart);
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

  if (sortedDates.length === 0) {
    const noRow = document.createElement('tr');
    const td = document.createElement('td');
    td.colSpan = 5;
    td.textContent = "No high-impact events this week.";
    td.style.textAlign = "center";
    noRow.appendChild(td);
    tbody.appendChild(noRow);
    return;
  }

  sortedDates.forEach(date => {
    const dateRow = document.createElement('tr');
    const dateCell = document.createElement('td');
    dateCell.colSpan = 5;
    dateCell.classList.add('date-header');
    dateCell.textContent = date;
    dateRow.appendChild(dateCell);
    tbody.appendChild(dateRow);

    grouped[date].forEach(event => {
      const row = document.createElement('tr');

      const tdDate = document.createElement('td');
      tdDate.textContent = event.date;

      const tdTime = document.createElement('td');
      tdTime.textContent = event.time;

      const tdEvent = document.createElement('td');
      tdEvent.textContent = event.event;

      const tdImpact = document.createElement('td');
      tdImpact.innerHTML = `🔴 ${event.impact}`;

      const tdForecast = document.createElement('td');
      tdForecast.textContent = event.forecast;

      row.appendChild(tdDate);
      row.appendChild(tdTime);
      row.appendChild(tdEvent);
      row.appendChild(tdImpact);
      row.appendChild(tdForecast);

      tbody.appendChild(row);
    });
  });
}

// Initial load
loadData().then(() => {
  updateWeekRangeDisplay(currentWeekStart);
  renderNews(newsData);
});
