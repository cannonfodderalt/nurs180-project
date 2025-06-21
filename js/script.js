const hours = [
    "8am", "9am", "10am", "11am", "12pm",
    "1pm", "2pm", "3pm", "4pm", "5pm",
    "6pm", "7pm"
];

const startSelect = document.getElementById("start-time");
const endSelect = document.getElementById("end-time");
hours.forEach(h => {
    const opt1 = new Option(h, h);
    const opt2 = new Option(h, h);
    startSelect.appendChild(opt1);
    endSelect.appendChild(opt2);
});

function showError(message) {
    document.getElementById("error-message").textContent = message;
}

function clearError() {
    document.getElementById("error-message").textContent = "";
}

function buildScheduleTable() {
    const body = document.getElementById("schedule-table-body");
    const events = JSON.parse(localStorage.getItem("scheduleBlocks") || "[]");
    body.innerHTML = "";

    const rowMap = Array.from({ length: hours.length }, () =>
        Array(8).fill(null)
    );

    events.forEach((event, idx) => {
        const startIdx = hours.indexOf(event.start);
        const endIdx = hours.indexOf(event.end);
        rowMap[startIdx][event.day] = {
        text: event.text,
        span: endIdx - startIdx + 1,
        index: idx,
        color: event.color || "#d0eaff"
        };
        for (let i = startIdx + 1; i <= endIdx; i++) {
        rowMap[i][event.day] = "SKIP";
        }
    });

    for (let i = 0; i < hours.length; i++) {
        const tr = document.createElement("tr");
        const timeCell = document.createElement("td");
        timeCell.textContent = hours[i];
        tr.appendChild(timeCell);

        for (let d = 1; d <= 7; d++) {
        const cellData = rowMap[i][d];
        if (cellData === "SKIP") continue;

        const td = document.createElement("td");
        if (cellData) {
            td.rowSpan = cellData.span;
            td.textContent = cellData.text;
            td.style.background = cellData.color;
            td.style.cursor = "pointer";
            td.onclick = () => {
            if (confirm("Delete this event?")) {
                const events = JSON.parse(localStorage.getItem("scheduleBlocks") || "[]");
                events.splice(cellData.index, 1);
                localStorage.setItem("scheduleBlocks", JSON.stringify(events));
                buildScheduleTable();
            }
            };
        }
        tr.appendChild(td);
        }

        body.appendChild(tr);
    }
}

function addSchedule() {
    const start = document.getElementById("start-time").value;
    const end = document.getElementById("end-time").value;
    const text = document.getElementById("event-text").value.trim();
    const color = document.getElementById("event-color").value;
    const day = parseInt(document.getElementById("day-select").value);

    const startIdx = hours.indexOf(start);
    const endIdx = hours.indexOf(end);

    if (!text) return showError("Please enter an event description.");
    if (startIdx === -1 || endIdx === -1) return showError("Invalid time selected.");
    if (startIdx > endIdx) return showError("Start time must be before end time.");

    const events = JSON.parse(localStorage.getItem("scheduleBlocks") || "[]");
    const overlaps = events.some(event => {
        if (event.day !== day) return false;
        const s1 = hours.indexOf(event.start);
        const e1 = hours.indexOf(event.end);
        return Math.max(startIdx, s1) <= Math.min(endIdx, e1);
    });

    if (overlaps) return showError("This time slot overlaps with an existing event.");

    events.push({ day, start, end, text, color });
    localStorage.setItem("scheduleBlocks", JSON.stringify(events));

    document.getElementById("event-text").value = "";
    clearError();
    buildScheduleTable();
}

function loadTodos() {
    const todos = JSON.parse(localStorage.getItem("todos") || "[]");
    const list = document.getElementById("todo-list");
    list.innerHTML = "";
    todos.forEach((item, index) => {
        const li = document.createElement("li");
        li.style.background = item.color || "#eee";
        li.style.padding = "0.25rem";
        li.style.borderRadius = "5px";
        li.style.marginBottom = "0.25rem";
        li.innerHTML = `${item.text} <button onclick="removeTodo(${index})">❌</button>`;
        list.appendChild(li);
    });
    }

    function addTodo() {
    const input = document.getElementById("todo-input");
    const todos = JSON.parse(localStorage.getItem("todos") || "[]");
    if (input.value.trim()) {
        const color = prompt("Pick a color for this task (or leave blank):", "#fceabb") || "#fceabb";
        todos.push({ text: input.value.trim(), color });
        localStorage.setItem("todos", JSON.stringify(todos));
        input.value = "";
        loadTodos();
    }
}

function removeTodo(index) {
    const todos = JSON.parse(localStorage.getItem("todos") || "[]");
    todos.splice(index, 1);
    localStorage.setItem("todos", JSON.stringify(todos));
    loadTodos();
}

// Initial load
loadTodos();
buildScheduleTable();