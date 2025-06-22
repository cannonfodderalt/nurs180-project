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
        if (event.day !== day) 
            return false;
        const s1 = hours.indexOf(event.start);
        const e1 = hours.indexOf(event.end);
        return Math.max(startIdx, s1) <= Math.min(endIdx, e1);
    });

    if (overlaps) 
        return showError("This time slot overlaps with an existing event.");

    events.push({ day, start, end, text, color });
    localStorage.setItem("scheduleBlocks", JSON.stringify(events));

    document.getElementById("event-text").value = "";
    clearError();
    buildScheduleTable();
}

function loadTodos() {
  let todos = JSON.parse(localStorage.getItem("todos") || "[]");

  // Ensure all tasks have unique IDs
  todos = todos.map(todo => {
    if (!todo.id) {
      return { ...todo, id: Date.now() + Math.random() }; // Assign unique ID
    }
    return todo;
  });

  // Save back any updated items
  localStorage.setItem("todos", JSON.stringify(todos));

  const list = document.getElementById("todo-list");
  list.innerHTML = "";

  todos.forEach((item, index) => {
    const li = document.createElement("li");
    li.style.background = item.color || "#eee";
    li.style.padding = "0.5rem";
    li.style.borderRadius = "5px";
    li.style.marginBottom = "0.5rem";
    li.style.display = "flex";
    li.style.alignItems = "center";
    li.style.justifyContent = "space-between";

    const label = document.createElement("label");
    label.style.flex = "1";
    label.style.display = "flex";
    label.style.alignItems = "center";
    label.style.cursor = "pointer";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = item.completed || false;
    checkbox.style.marginRight = "0.5rem";
    checkbox.onchange = () => toggleTodo(item.id);

    const span = document.createElement("span");
    span.textContent = item.text;
    if (item.completed) {
      span.style.textDecoration = "line-through";
      span.style.opacity = "0.6";
    }

    label.appendChild(checkbox);
    label.appendChild(span);

    const removeBtn = document.createElement("button");
    removeBtn.textContent = "❌";
    removeBtn.onclick = () => removeTodo(item.id);
    removeBtn.style.border = "none";
    removeBtn.style.background = "transparent";
    removeBtn.style.cursor = "pointer";
    removeBtn.style.fontSize = "1rem";

    li.appendChild(label);
    li.appendChild(removeBtn);
    list.appendChild(li);
  });
}

function addTodo() {
  const input = document.getElementById("todo-input");
  const todos = JSON.parse(localStorage.getItem("todos") || "[]");
  if (input.value.trim()) {
    const color = "#fceabb";
    const id = Date.now();
    todos.push({ id, text: input.value.trim(), color, completed: false });
    localStorage.setItem("todos", JSON.stringify(todos));
    input.value = "";
    loadTodos();
    clearErrorTodo();
  } else {
    return showError("Please enter an event description.");
  }
}

function toggleTodo(id) {
  const todos = JSON.parse(localStorage.getItem("todos") || "[]");
  const updated = todos.map(todo =>
    todo.id === id ? { ...todo, completed: !todo.completed } : todo
  );
  localStorage.setItem("todos", JSON.stringify(updated));
  loadTodos();
}

function removeTodo(id) {
  const todos = JSON.parse(localStorage.getItem("todos") || "[]");
  const updated = todos.filter(todo => todo.id !== id);
  localStorage.setItem("todos", JSON.stringify(updated));
  loadTodos();
}

function showErrorTodo(message) {
    document.getElementById("error-message-t").textContent = message;
}

function clearErrorTodo() {
    document.getElementById("error-message-t").textContent = "";
}


// Initial load
loadTodos();
buildScheduleTable();