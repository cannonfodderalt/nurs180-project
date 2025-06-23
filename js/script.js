const hours = [
  "8am", "9am", "10am", "11am", "12pm",
  "1pm", "2pm", "3pm", "4pm", "5pm",
  "6pm", "7pm", "8pm"
];

const startSelect = document.getElementById("start-time");
const endSelect = document.getElementById("end-time");
hours.forEach((h, i) => {
    if (i < hours.length - 1) {  // allow all except the last for start
        const opt1 = new Option(h, h);
        startSelect.appendChild(opt1);
    }
    if (i > 0) {  // allow all except the first for end
        const opt2 = new Option(h, h);
        endSelect.appendChild(opt2);
    }
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
      span: endIdx - startIdx,
      index: idx,
      color: event.color || "#d0eaff"
    };
    for (let i = startIdx + 1; i <= endIdx; i++) {
      rowMap[i][event.day] = "SKIP";
    }
  });

  for (let i = 0; i < hours.length - 1; i++) {
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
        const container = document.createElement("div");
        container.style.display = "flex";
        container.style.justifyContent = "space-between";
        container.style.alignItems = "center";

        const textSpan = document.createElement("span");
        textSpan.textContent = cellData.text;

        const rightDiv = document.createElement("div");

        const editBtn = document.createElement("button");
        editBtn.textContent = "✏️";
        editBtn.onclick = (e) => {
          e.stopPropagation();
          const newText = prompt("Edit event text:", cellData.text);
          if (newText !== null) {
            const events = JSON.parse(localStorage.getItem("scheduleBlocks") || "[]");
            events[cellData.index].text = newText.trim() || cellData.text;
            localStorage.setItem("scheduleBlocks", JSON.stringify(events));
            buildScheduleTable();
          }
        };
        styleSmallBtn(editBtn);

        const removeBtn = document.createElement("button");
        removeBtn.textContent = "❌";
        removeBtn.onclick = (e) => {
          e.stopPropagation();
          if (confirm("Delete this event?")) {
            const events = JSON.parse(localStorage.getItem("scheduleBlocks") || "[]");
            events.splice(cellData.index, 1);
            localStorage.setItem("scheduleBlocks", JSON.stringify(events));
            buildScheduleTable();
          }
        };
        styleSmallBtn(removeBtn);

        rightDiv.appendChild(editBtn);
        rightDiv.appendChild(removeBtn);

        container.appendChild(textSpan);
        container.appendChild(rightDiv);

        td.appendChild(container);
        td.style.background = cellData.color;
        td.style.cursor = "pointer";
        td.onclick = () => {
          const container = document.createElement("div");
          container.style.display = "flex";
          container.style.justifyContent = "space-between";
          container.style.alignItems = "center";

          const textSpan = document.createElement("span");
          textSpan.textContent = cellData.text;

          const rightDiv = document.createElement("div");

          const editBtn = document.createElement("button");
          editBtn.textContent = "✏️";
          editBtn.onclick = (e) => {
            e.stopPropagation();
            const newText = prompt("Edit event text:", cellData.text);
            if (newText !== null) {
              const events = JSON.parse(localStorage.getItem("scheduleBlocks") || "[]");
              events[cellData.index].text = newText.trim() || cellData.text;
              localStorage.setItem("scheduleBlocks", JSON.stringify(events));
              buildScheduleTable();
            }
          };
          styleSmallBtn(editBtn);

          const removeBtn = document.createElement("button");
          removeBtn.textContent = "❌";
          removeBtn.onclick = (e) => {
            e.stopPropagation();
            if (confirm("Delete this event?")) {
              const events = JSON.parse(localStorage.getItem("scheduleBlocks") || "[]");
              events.splice(cellData.index, 1);
              localStorage.setItem("scheduleBlocks", JSON.stringify(events));
              buildScheduleTable();
            }
          };
          styleSmallBtn(removeBtn);

          rightDiv.appendChild(editBtn);
          rightDiv.appendChild(removeBtn);

          container.appendChild(textSpan);
          container.appendChild(rightDiv);
          td.innerHTML = "";
          td.appendChild(container);
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
  if (startIdx >= endIdx) return showError("Start time must be before end time.");

  const events = JSON.parse(localStorage.getItem("scheduleBlocks") || "[]");
  const overlaps = events.some(event => {
    if (event.day !== day)
      return false;
    const s1 = hours.indexOf(event.start);
    const e1 = hours.indexOf(event.end);
    return Math.max(startIdx, s1) < Math.min(endIdx, e1);
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

  // Ensure unique IDs
  todos = todos.map(todo => {
    if (!todo.id) {
      return { ...todo, id: Date.now() + Math.random() };
    }
    return todo;
  });

  localStorage.setItem("todos", JSON.stringify(todos));

  // Sort incomplete first
  todos.sort((a, b) => (a.completed === b.completed ? 0 : a.completed ? 1 : -1));

  const list = document.getElementById("todo-list");
  list.innerHTML = "";

  const incompleteItems = todos.filter(t => !t.completed);
  const completedItems = todos.filter(t => t.completed);

  // Render incomplete tasks
  incompleteItems.forEach(item => {
    list.appendChild(createTodoItemElement(item));
  });

  // Completed dropdown header
  if (completedItems.length > 0) {
    const header = document.createElement("li");
    header.textContent = "✔ Completed Tasks (click to toggle)";
    header.style.background = "#ddd";
    header.style.padding = "0.3rem";
    header.style.textAlign = "center";
    header.style.fontWeight = "bold";
    header.style.margin = "0.5rem 0";
    header.style.borderRadius = "5px";
    header.style.cursor = "pointer";

    const completedContainer = document.createElement("ul");
    completedContainer.style.listStyle = "none";
    completedContainer.style.padding = "0";
    completedContainer.style.margin = "0";

    completedItems.forEach(item => {
      completedContainer.appendChild(createTodoItemElement(item));
    });

    let visible = true;
    header.onclick = () => {
      visible = !visible;
      completedContainer.style.display = visible ? "block" : "none";
    };

    list.appendChild(header);
    list.appendChild(completedContainer);
  }
}

function createTodoItemElement(item) {
  const li = document.createElement("li");
  li.style.background = item.color || "#eee";
  li.style.padding = "0.5rem";
  li.style.borderRadius = "5px";
  li.style.marginBottom = "0.5rem";
  li.style.display = "flex";
  li.style.justifyContent = "space-between";
  li.style.alignItems = "center";

  const label = document.createElement("label");
  label.style.display = "flex";
  label.style.alignItems = "center";
  label.style.flex = "1";

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.classList.add("filled-in");
  checkbox.checked = item.completed || false;
  checkbox.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleTodo(item.id);
  });

  const span = document.createElement("span");
  span.textContent = item.text;
  if (item.completed) {
    span.style.textDecoration = "line-through";
    span.style.opacity = "0.6";
  }

  label.appendChild(checkbox);
  label.appendChild(span);

  const rightDiv = document.createElement("div");

  const editBtn = document.createElement("button");
  editBtn.textContent = "✏️";
  editBtn.onclick = (e) => {
    e.stopPropagation();
    const newText = prompt("Edit task:", item.text);
    if (newText === null) return;
    updateTodoText(item.id, newText.trim());
  };
  styleSmallBtn(editBtn);

  const removeBtn = document.createElement("button");
  removeBtn.textContent = "❌";
  removeBtn.onclick = (e) => {
    e.stopPropagation();
    removeTodo(item.id);
  };
  styleSmallBtn(removeBtn);

  rightDiv.appendChild(editBtn);
  rightDiv.appendChild(removeBtn);

  li.appendChild(label);
  li.appendChild(rightDiv);

  return li;
}

function styleSmallBtn(btn) {
  btn.style.border = "none";
  btn.style.background = "transparent";
  btn.style.cursor = "pointer";
  btn.style.fontSize = "1rem";
  btn.style.marginLeft = "0.5rem";
}

function toggleTodo(id) {
  let todos = JSON.parse(localStorage.getItem("todos") || "[]");
  todos = todos.map(todo =>
    todo.id === id ? { ...todo, completed: !todo.completed } : todo
  );
  localStorage.setItem("todos", JSON.stringify(todos));
  loadTodos();
}

function updateTodoText(id, newText) {
  let todos = JSON.parse(localStorage.getItem("todos") || "[]");
  todos = todos.map(todo =>
    todo.id === id ? { ...todo, text: newText || todo.text } : todo
  );
  localStorage.setItem("todos", JSON.stringify(todos));
  loadTodos();
}

function removeTodo(id) {
  let todos = JSON.parse(localStorage.getItem("todos") || "[]");
  todos = todos.filter(todo => todo.id !== id);
  localStorage.setItem("todos", JSON.stringify(todos));
  loadTodos();
}

function addTodo() {
  const input = document.getElementById("todo-input");
  if (!input.value.trim()) return showErrorTodo("Please enter a task.");

  const todos = JSON.parse(localStorage.getItem("todos") || "[]");
  const newTodo = {
    id: Date.now() + Math.random(),
    text: input.value.trim(),
    color: "#fceabb",
    completed: false
  };
  todos.push(newTodo);
  localStorage.setItem("todos", JSON.stringify(todos));
  input.value = "";
  clearErrorTodo();
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

// function addTodo() {
//   const input = document.getElementById("todo-input");
//   const todos = JSON.parse(localStorage.getItem("todos") || "[]");
//   if (input.value.trim()) {
//     const color = "#fceabb";
//     const id = Date.now() + Math.random();
//     todos.push({ id, text: input.value.trim(), color, completed: false });
//     localStorage.setItem("todos", JSON.stringify(todos));
//     input.value = "";
//     loadTodos();
//     clearErrorTodo();
//   } else {
//     return showErrorTodo("Please enter a task.");
//   }
// }