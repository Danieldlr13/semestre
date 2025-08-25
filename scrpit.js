document.addEventListener("DOMContentLoaded", () => {
  /* ==== Preferencia de tema (claro/oscuro) ==== */
  const THEME_KEY = "ui_theme";
  const savedTheme = localStorage.getItem(THEME_KEY);
  if (savedTheme === "dark") {
    document.documentElement.setAttribute("data-theme", "dark");
  }
  const themeBtn = document.getElementById("theme-toggle");
  if (themeBtn) {
    const setIcon = () => {
      themeBtn.textContent =
        document.documentElement.getAttribute("data-theme") === "dark" ? "☀️" : "🌙";
    };
    setIcon();
    themeBtn.addEventListener("click", () => {
      const isDark = document.documentElement.getAttribute("data-theme") === "dark";
      if (isDark) {
        document.documentElement.removeAttribute("data-theme");
        localStorage.setItem(THEME_KEY, "light");
      } else {
        document.documentElement.setAttribute("data-theme", "dark");
        localStorage.setItem(THEME_KEY, "dark");
      }
      setIcon();
    });
  }

  /* ==== Selector de color de acento ==== */
  const ACCENT_KEY = "ui_accent";
  const PRIMARY_KEY = "ui_primary";
  const accentInput = document.getElementById("accent-input");
  const savedAccent = localStorage.getItem(ACCENT_KEY);
  const savedPrimary = localStorage.getItem(PRIMARY_KEY);
  if (savedAccent) document.documentElement.style.setProperty("--accent", savedAccent);
  if (savedPrimary) document.documentElement.style.setProperty("--primary", savedPrimary);
  if (accentInput && savedAccent) accentInput.value = savedAccent;

  const darken = (hex, f=0.25) => {
    const n = hex.replace("#","");
    const r=parseInt(n.slice(0,2),16), g=parseInt(n.slice(2,4),16), b=parseInt(n.slice(4,6),16);
    const d = (v)=>Math.max(0,Math.min(255, Math.round(v*(1-f))));
    return `#${d(r).toString(16).padStart(2,"0")}${d(g).toString(16).padStart(2,"0")}${d(b).toString(16).padStart(2,"0")}`;
  };
  if (accentInput) {
    accentInput.addEventListener("input", (e) => {
      const accent = e.target.value;
      const primary = darken(accent, 0.25);
      document.documentElement.style.setProperty("--accent", accent);
      document.documentElement.style.setProperty("--primary", primary);
      localStorage.setItem(ACCENT_KEY, accent);
      localStorage.setItem(PRIMARY_KEY, primary);
    });
  }

  /* ==========  NAV: mostrar/ocultar secciones ========== */
  const navItems = document.querySelectorAll("#menu .nav-item");
  const sections = document.querySelectorAll("main > section");
  const showSection = (id) => {
    sections.forEach(s => s.classList.add("hidden"));
    document.getElementById(id)?.classList.remove("hidden");
  };
  navItems.forEach(item => {
    item.addEventListener("click", () => {
      navItems.forEach(n => n.classList.remove("active"));
      item.classList.add("active");
      showSection(item.dataset.target);
    });
  });
  showSection("seccion-horario");

  /* ==========  HORARIO ========== */
  const horarioContainer = document.getElementById("horario-container");
  if (horarioContainer) {
    const dias = ["Lunes","Martes","Miércoles","Jueves","Viernes","Sábado","Domingo"];
    const franjas = [
      "06:00 - 08:00","08:00 - 10:00","10:00 - 12:00",
      "12:00 - 14:00","14:00 - 16:00","16:00 - 18:00","18:00 - 20:00"
    ];
    const table = document.createElement("table");
    table.className = "horario";
    const thead = document.createElement("thead");
    const trh = document.createElement("tr");
    trh.appendChild(document.createElement("th"));
    dias.forEach(d => {
      const th = document.createElement("th"); th.textContent = d; trh.appendChild(th);
    });
    thead.appendChild(trh);
    table.appendChild(thead);

    const tbody = document.createElement("tbody");
    franjas.forEach(fr => {
      const tr = document.createElement("tr");
      const th = document.createElement("th"); th.textContent = fr; tr.appendChild(th);
      dias.forEach(() => {
        const td = document.createElement("td");
        td.className = "selectable";
        td.addEventListener("click", () => {
          const titulo = prompt("Nombre del bloque:");
          if (!titulo) return;
          const color = prompt("Color (hex o nombre CSS, p.ej. #3490dc):", "#3490dc") || "#3490dc";
          td.innerHTML = `<div class="evento" style="background:${color}">${titulo}</div>`;
        });
        td.addEventListener("dblclick", () => { td.innerHTML = ""; });
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    horarioContainer.appendChild(table);
  }

  /* ==========  MATERIAS ========== */
  const materiasGrid = document.getElementById("materias-grid");
  const materiaInfo = document.getElementById("materia-info");
  if (materiasGrid && materiaInfo) {
    const infoMaterias = {
      "Materia 1":"Contenido de ejemplo para la Materia 1.",
      "Materia 2":"Contenido de ejemplo para la Materia 2.",
      "Materia 3":"Contenido de ejemplo para la Materia 3.",
      "Materia 4":"Contenido de ejemplo para la Materia 4.",
      "Materia 5":"Contenido de ejemplo para la Materia 5.",
      "Materia 6":"Contenido de ejemplo para la Materia 6."
    };
    for (let i=1;i<=6;i++){
      const name = `Materia ${i}`;
      const card = document.createElement("div");
      card.className = "materia-card";
      card.textContent = name;
      card.addEventListener("click", () => {
        materiasGrid.classList.add("hidden");
        materiaInfo.innerHTML = `
          <button class="btn-volver" id="btn-volver">Volver</button>
          <p>${infoMaterias[name] || "Información no disponible."}</p>
        `;
        materiaInfo.classList.remove("hidden");
        document.getElementById("btn-volver").addEventListener("click", () => {
          materiaInfo.classList.add("hidden");
          materiasGrid.classList.remove("hidden");
        });
      });
      materiasGrid.appendChild(card);
    }
  }

  /* ==========  CHECKLIST diario ========== */
  const checklistContainer = document.getElementById("checklist");
  if (checklistContainer) {
    const tz = "America/Bogota";
    const todayBogota = new Date(new Date().toLocaleString("en-US",{timeZone:tz}));
    const y = todayBogota.getFullYear();
    const m = String(todayBogota.getMonth()+1).padStart(2,"0");
    const d = String(todayBogota.getDate()).padStart(2,"0");
    const key = "checklist_state";
    const dateKey = "checklist_date";
    const storedDate = localStorage.getItem(dateKey);
    if (storedDate !== `${y}-${m}-${d}`) {
      localStorage.setItem(key, JSON.stringify(Array(7).fill(false)));
      localStorage.setItem(dateKey, `${y}-${m}-${d}`);
    }
    let state = JSON.parse(localStorage.getItem(key) || "[]");
    if (!Array.isArray(state) || state.length !== 7) { state = Array(7).fill(false); }
    for (let i=0;i<7;i++){
      const li = document.createElement("li");
      const cb = document.createElement("input");
      cb.type="checkbox"; cb.checked = !!state[i];
      const label = document.createElement("span");
      label.textContent = `Tarea ${i+1}`;
      cb.addEventListener("change", () => {
        state[i] = cb.checked;
        localStorage.setItem(key, JSON.stringify(state));
      });
      li.appendChild(cb); li.appendChild(label); checklistContainer.appendChild(li);
    }
  }

  /* ==========  CALENDARIO mensual con eventos ========== */
  const calendar = {
    currentDate: new Date(),
    events: JSON.parse(localStorage.getItem("calendarEvents") || "{}"),
    selectedDate: null,

    init(){
      const prev = document.getElementById("prev-month");
      const next = document.getElementById("next-month");
      const today= document.getElementById("today-btn");
      prev?.addEventListener("click", () => this.changeMonth(-1));
      next?.addEventListener("click", () => this.changeMonth(1));
      today?.addEventListener("click", () => { this.currentDate = new Date(); this.render(); });

      document.getElementById("close-modal")?.addEventListener("click", () => this.closeModal());
      document.getElementById("save-event")?.addEventListener("click", () => this.saveEvent());

      this.render();
    },

    render(){
      const grid = document.getElementById("calendar-days");
      const title= document.getElementById("calendar-title");
      if (!grid || !title) return;
      grid.innerHTML = "";

      const y = this.currentDate.getFullYear();
      const m = this.currentDate.getMonth();
      const first = new Date(y, m, 1);
      const last  = new Date(y, m+1, 0);

      const months = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
      title.textContent = `${months[m]} ${y}`;

      const offset = (first.getDay()+6)%7;
      const prevLast = new Date(y, m, 0).getDate();

      for (let i=0;i<offset;i++) {
        const dayNum = prevLast - offset + i + 1;
        grid.appendChild(this.createCell(new Date(y, m-1, dayNum), true));
      }
      for (let d=1; d<=last.getDate(); d++) {
        grid.appendChild(this.createCell(new Date(y, m, d), false));
      }
      const total = grid.children.length;
      for (let i=total;i<42;i++){
        const dayNum = i - total + 1;
        grid.appendChild(this.createCell(new Date(y, m+1, dayNum), true));
      }
    },

    createCell(date, otherMonth){
      const cell = document.createElement("div");
      cell.className = "day" + (otherMonth ? " other-month" : "");
      const dateStr = date.toISOString().split("T")[0];
      cell.dataset.date = dateStr;

      const num = document.createElement("div");
      num.className = "day-number"; num.textContent = date.getDate();
      if (dateStr === new Date().toISOString().split("T")[0]) num.classList.add("today");
      cell.appendChild(num);

      const cont = document.createElement("div"); cont.className = "day-events";
      const events = this.events[dateStr] || [];
      events.slice(0,2).forEach(ev => {
        const e = document.createElement("div");
        e.className = "event"; e.textContent = ev.title; e.style.background = ev.color || "#6366f1";
        cont.appendChild(e);
      });
      if (events.length > 2) {
        const more = document.createElement("span");
        more.textContent = `+${events.length-2}`;
        cont.appendChild(more);
      }
      cell.appendChild(cont);

      cell.addEventListener("click", () => this.openModal(dateStr));
      return cell;
    },

    changeMonth(delta){ this.currentDate.setMonth(this.currentDate.getMonth()+delta); this.render(); },

    openModal(dateStr){
      this.selectedDate = dateStr;
      document.getElementById("modal-date-title").textContent = dateStr;
      document.getElementById("event-name").value = "";
      document.getElementById("event-notes").value = "";
      document.getElementById("event-color").value = "#007bff";

      const list = document.getElementById("event-list");
      list.innerHTML = "";
      const events = this.events[dateStr] || [];
      events.forEach((ev, i) => {
        const li = document.createElement("li");
        const sw = document.createElement("span");
        sw.className = "event-color-box"; sw.style.background = ev.color || "#6366f1";
        li.appendChild(sw);
        li.appendChild(document.createTextNode(`${ev.title}${ev.notes? " - "+ev.notes : ""}`));
        const del = document.createElement("button"); del.textContent = "x";
        del.style.marginLeft = ".5rem";
        del.addEventListener("click", () => this.deleteEvent(dateStr, i));
        li.appendChild(del); list.appendChild(li);
      });

      document.getElementById("calendar-modal").classList.remove("hidden");
    },

    closeModal(){ document.getElementById("calendar-modal").classList.add("hidden"); },

    saveEvent(){
      const title = document.getElementById("event-name").value.trim();
      if (!title) return;
      const notes = document.getElementById("event-notes").value.trim();
      const color = document.getElementById("event-color").value;
      const date  = this.selectedDate;
      if (!this.events[date]) this.events[date] = [];
      this.events[date].push({title, notes, color});
      localStorage.setItem("calendarEvents", JSON.stringify(this.events));
      this.closeModal(); this.render();
    },

    deleteEvent(dateStr, index){
      this.events[dateStr].splice(index,1);
      if (this.events[dateStr].length===0) delete this.events[dateStr];
      localStorage.setItem("calendarEvents", JSON.stringify(this.events));
      this.openModal(dateStr);
    }
  };
  calendar.init();
});
