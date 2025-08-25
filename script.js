document.addEventListener("DOMContentLoaded", () => {
  /**
   * Crea y agrega la tabla del horario al contenedor.
   */
  const horarioContainer = document.getElementById("horario-container");
  const dias = [
    "Lunes",
    "Martes",
    "Miércoles",
    "Jueves",
    "Viernes",
    "Sábado",
    "Domingo",
  ];
  const franjas = [
    "06:00 - 08:00",
    "08:00 - 10:00",
    "10:00 - 12:00",
    "12:00 - 14:00",
    "14:00 - 16:00",
    "16:00 - 18:00",
    "18:00 - 20:00",
  ];

  // ====================
  // Gestión de almacenamiento y modal del horario
  // Se utiliza localStorage para persistir las materias asignadas a cada celda del horario.
  let scheduleData;
  try {
    scheduleData = JSON.parse(localStorage.getItem("scheduleData") || "{}");
  } catch (e) {
    scheduleData = {};
  }
  function saveScheduleData() {
    localStorage.setItem("scheduleData", JSON.stringify(scheduleData));
  }
  function loadScheduleData() {
    const cells = horarioContainer.querySelectorAll("td.selectable");
    cells.forEach((td) => {
      const key = `d${td.dataset.day}_s${td.dataset.slot}`;
      const ev = scheduleData[key];
      if (ev) {
        const eventDiv = document.createElement("div");
        eventDiv.classList.add("evento");
        eventDiv.style.backgroundColor = ev.color;
        eventDiv.textContent = ev.title;
        td.innerHTML = "";
        td.appendChild(eventDiv);
      }
    });
  }

  // Referencias al modal del horario
  const scheduleModal = document.getElementById("schedule-modal");
  const scheduleNameInput = document.getElementById("schedule-event-name");
  const scheduleColorInput = document.getElementById("schedule-event-color");
  const scheduleSaveBtn = document.getElementById("schedule-save");
  const scheduleCloseBtn = document.getElementById("close-schedule-modal");
  const scheduleDeleteBtn = document.getElementById("schedule-delete");
  let currentScheduleCell = null;

  if (scheduleSaveBtn) {
    scheduleSaveBtn.addEventListener("click", () => {
      const name = scheduleNameInput.value.trim();
      if (!name || !currentScheduleCell) return;
      const color = scheduleColorInput.value;
      // Crear elemento del evento
      const eventDiv = document.createElement("div");
      eventDiv.classList.add("evento");
      eventDiv.style.backgroundColor = color;
      eventDiv.textContent = name;
      // Limpiar celda y agregar evento
      currentScheduleCell.innerHTML = "";
      currentScheduleCell.appendChild(eventDiv);
      // Guardar en localStorage
      const day = currentScheduleCell.dataset.day;
      const slot = currentScheduleCell.dataset.slot;
      const key = `d${day}_s${slot}`;
      scheduleData[key] = { title: name, color: color };
      saveScheduleData();
      // Cerrar modal
      scheduleModal.classList.add("hidden");
    });
  }
  if (scheduleCloseBtn) {
    scheduleCloseBtn.addEventListener("click", () => {
      scheduleModal.classList.add("hidden");
    });
  }

  // Permitir eliminar la materia desde el modal
  if (scheduleDeleteBtn) {
    scheduleDeleteBtn.addEventListener("click", () => {
      if (!currentScheduleCell) return;
      const day = currentScheduleCell.dataset.day;
      const slot = currentScheduleCell.dataset.slot;
      const key = `d${day}_s${slot}`;
      // Eliminar del almacenamiento y de la celda
      delete scheduleData[key];
      saveScheduleData();
      currentScheduleCell.innerHTML = "";
      scheduleModal.classList.add("hidden");
    });
  }

  // Crear la tabla
  const tabla = document.createElement("table");
  tabla.classList.add("horario");

  // Crear encabezado
  const thead = document.createElement("thead");
  const encabezadoFila = document.createElement("tr");
  // Celda vacía en la esquina superior izquierda
  const celdaVacia = document.createElement("th");
  celdaVacia.textContent = "";
  encabezadoFila.appendChild(celdaVacia);
  // Celdas de días
  dias.forEach((dia) => {
    const th = document.createElement("th");
    th.textContent = dia;
    encabezadoFila.appendChild(th);
  });
  thead.appendChild(encabezadoFila);
  tabla.appendChild(thead);

  // Crear cuerpo de la tabla
  const tbody = document.createElement("tbody");
  franjas.forEach((franja, rowIndex) => {
    const fila = document.createElement("tr");
    // Celda de la franja horaria
    const celdaHora = document.createElement("th");
    celdaHora.textContent = franja;
    fila.appendChild(celdaHora);
    // Crear las celdas para cada día
    dias.forEach((dia, colIndex) => {
      const td = document.createElement("td");
      td.classList.add("selectable");
      // Asignar índices para recuperar del almacenamiento
      td.dataset.day = colIndex;
      td.dataset.slot = rowIndex;
      // Manejar clic para abrir modal y agregar/editar evento
      td.addEventListener("click", () => {
        currentScheduleCell = td;
        // Reiniciar valores del modal
        const day = td.dataset.day;
        const slot = td.dataset.slot;
        const key = `d${day}_s${slot}`;
        const existing = scheduleData[key];
        if (existing) {
          // Si ya existe una materia en esta celda, precargar datos y mostrar botón eliminar
          if (scheduleNameInput) scheduleNameInput.value = existing.title;
          if (scheduleColorInput) scheduleColorInput.value = existing.color;
          if (scheduleDeleteBtn) scheduleDeleteBtn.style.display = "inline-block";
        } else {
          // Si no hay materia, limpiar campos y ocultar botón eliminar
          if (scheduleNameInput) scheduleNameInput.value = "";
          if (scheduleColorInput) scheduleColorInput.value = "#6366f1";
          if (scheduleDeleteBtn) scheduleDeleteBtn.style.display = "none";
        }
        if (scheduleModal) scheduleModal.classList.remove("hidden");
      });
      // Manejar doble clic para limpiar la celda y eliminar del almacenamiento
      td.addEventListener("dblclick", () => {
        td.innerHTML = "";
        const day = td.dataset.day;
        const slot = td.dataset.slot;
        const key = `d${day}_s${slot}`;
        delete scheduleData[key];
        saveScheduleData();
      });
      fila.appendChild(td);
    });
    tbody.appendChild(fila);
  });
  tabla.appendChild(tbody);

  horarioContainer.appendChild(tabla);

  // Cargar datos guardados del horario (si existen)
  loadScheduleData();

  /**
   * Manejo del menú de navegación
   */
  const navItems = document.querySelectorAll("#menu .nav-item");
  const sections = document.querySelectorAll("main > section");
  navItems.forEach((item) => {
    item.addEventListener("click", () => {
      // Cambiar clase activa en el menú
      navItems.forEach((nav) => nav.classList.remove("active"));
      item.classList.add("active");
      // Ocultar todas las secciones
      sections.forEach((sec) => sec.classList.add("hidden"));
      // Mostrar la sección objetivo
      const targetId = item.getAttribute("data-target");
      const targetSection = document.getElementById(targetId);
      if (targetSection) {
        targetSection.classList.remove("hidden");
      }
    });
  });

  /**
   * Generar tarjetas para la sección Materias
   */
  const materiasGrid = document.getElementById("materias-grid");
  const materiaInfo = document.getElementById("materia-info");
  if (materiasGrid) {
    // Definir los nombres y descripciones de cada materia
    const materiasNombres = [
      "Simulación de sistemas",
      "Métodos numéricos",
      "Física",
      "Seminario I",
      "Análisis y estructura de datos",
      "Investigación de operaciones",
    ];
    const infoMaterias = {};
    materiasNombres.forEach((nombre) => {
      infoMaterias[nombre] = `Contenido de ejemplo para ${nombre}. Aquí puedes colocar una descripción o detalles sobre la materia.`;
    });
    // Crear tarjetas para cada materia
    materiasNombres.forEach((nombre) => {
      const card = document.createElement("div");
      card.classList.add("materia-card");
      card.textContent = nombre;
      card.addEventListener("click", () => {
        // Al hacer clic, ocultar la cuadrícula de materias
        materiasGrid.classList.add("hidden");
        // Limpiar contenido previo
        materiaInfo.innerHTML = "";
        const volverBtn = document.createElement("button");
        volverBtn.id = "volver-materias";
        volverBtn.textContent = "Volver";
        volverBtn.classList.add("btn-volver");
        volverBtn.addEventListener("click", () => {
          // Al volver, mostrar la cuadrícula y ocultar la información
          materiasGrid.classList.remove("hidden");
          materiaInfo.classList.add("hidden");
          materiaInfo.innerHTML = "";
        });
        const infoParrafo = document.createElement("p");
        infoParrafo.textContent = infoMaterias[nombre] || "Información no disponible.";
        materiaInfo.appendChild(volverBtn);
        materiaInfo.appendChild(infoParrafo);
        materiaInfo.classList.remove("hidden");
      });
      materiasGrid.appendChild(card);
    });
  }

  // Mostrar solo la sección de horario por defecto
  // Ocultar otras secciones iniciales
  document.getElementById("seccion-horario").classList.remove("hidden");
  const otherSections = ["seccion-materias", "seccion-3", "seccion-4"];
  otherSections.forEach((id) => {
    const sec = document.getElementById(id);
    if (sec) sec.classList.add("hidden");
  });

  /**
   * Inicializar checklist diario en la sección 3
   */
  const checklistContainer = document.getElementById("checklist");
  if (checklistContainer) {
    const numItems = 7;
    // Obtener la fecha actual en zona horaria Colombia (America/Bogota)
    function getCurrentDateBogota() {
      const now = new Date();
      // Utilizamos formato ISO (en-CA) para YYYY-MM-DD
      return now.toLocaleDateString("en-CA", {
        timeZone: "America/Bogota",
      });
    }
    const currentDate = getCurrentDateBogota();
    let savedData;
    try {
      savedData = JSON.parse(localStorage.getItem("checklistData") || "{}");
    } catch (e) {
      savedData = {};
    }
    // Si no hay fecha guardada o no coincide con hoy, reiniciar estados
    if (!savedData.date || savedData.date !== currentDate) {
      savedData = { date: currentDate, states: Array(numItems).fill(false) };
      localStorage.setItem("checklistData", JSON.stringify(savedData));
    }
    // Nombres personalizados para cada tarea
    const taskNames = [
      "NEW",
      "NEW",
      "NEW B",
      "BLUE",
      "BLUE",
      "BLUE B",
      "WHITE",
    ];
    // Crear elementos del checklist con nombres personalizados
    for (let i = 0; i < numItems; i++) {
      const li = document.createElement("li");
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.id = `check-${i}`;
      // Utilizar el estado guardado si existe
      checkbox.checked = savedData.states && savedData.states[i];
      checkbox.addEventListener("change", () => {
        savedData.states[i] = checkbox.checked;
        savedData.date = getCurrentDateBogota();
        localStorage.setItem("checklistData", JSON.stringify(savedData));
      });
      const label = document.createElement("label");
      label.htmlFor = checkbox.id;
      // Usar nombre personalizado si existe, de lo contrario usar "Tarea X"
      label.textContent = taskNames[i] || `Tarea ${i + 1}`;
      li.appendChild(checkbox);
      li.appendChild(label);
      checklistContainer.appendChild(li);
    }
  }

  /**
   * Inicializar calendario interactivo en la sección 4
   * Permite navegar entre meses y agregar eventos por día.
   */
  const calendar = {
    currentDate: new Date(),
    events: JSON.parse(localStorage.getItem("calendarEvents") || "{}"),
    selectedDate: null,
    init() {
      // Render inicial
      this.render();
      // Botones de navegación
      const prevBtn = document.getElementById("prev-month");
      const nextBtn = document.getElementById("next-month");
      const todayBtn = document.getElementById("today-btn");
      if (prevBtn) {
        prevBtn.addEventListener("click", () => {
          this.changeMonth(-1);
        });
      }
      if (nextBtn) {
        nextBtn.addEventListener("click", () => {
          this.changeMonth(1);
        });
      }
      if (todayBtn) {
        todayBtn.addEventListener("click", () => {
          this.currentDate = new Date();
          this.render();
        });
      }
      // Modal botones
      const closeModalBtn = document.getElementById("close-modal");
      if (closeModalBtn) {
        closeModalBtn.addEventListener("click", () => this.closeModal());
      }
      const saveEventBtn = document.getElementById("save-event");
      if (saveEventBtn) {
        saveEventBtn.addEventListener("click", () => this.saveEvent());
      }
    },
    render() {
      const grid = document.getElementById("calendar-days");
      const titleEl = document.getElementById("calendar-title");
      if (!grid || !titleEl) return;
      grid.innerHTML = "";
      const year = this.currentDate.getFullYear();
      const month = this.currentDate.getMonth();
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      const months = [
        "Enero",
        "Febrero",
        "Marzo",
        "Abril",
        "Mayo",
        "Junio",
        "Julio",
        "Agosto",
        "Septiembre",
        "Octubre",
        "Noviembre",
        "Diciembre",
      ];
      titleEl.textContent = `${months[month]} ${year}`;
      // Calcular offset (lunes=0)
      const offset = (firstDay.getDay() + 6) % 7;
      const prevLast = new Date(year, month, 0).getDate();
      // Días del mes anterior
      for (let i = 0; i < offset; i++) {
        const dayNum = prevLast - offset + i + 1;
        const cell = this.createDayCell(year, month - 1, dayNum, true);
        grid.appendChild(cell);
      }
      // Días del mes actual
      for (let d = 1; d <= lastDay.getDate(); d++) {
        const cell = this.createDayCell(year, month, d, false);
        grid.appendChild(cell);
      }
      // Completar hasta 42 celdas
      const totalCells = grid.children.length;
      for (let i = totalCells; i < 42; i++) {
        const dayNum = i - totalCells + 1;
        const cell = this.createDayCell(year, month + 1, dayNum, true);
        grid.appendChild(cell);
      }
    },
    createDayCell(y, m, d, otherMonth) {
      const cell = document.createElement("div");
      cell.classList.add("day");
      if (otherMonth) {
        cell.classList.add("other-month");
      }
      const dateObj = new Date(y, m, d);
      const dateStr = dateObj.toISOString().split("T")[0];
      cell.dataset.date = dateStr;
      // Número de día
      const header = document.createElement("div");
      header.classList.add("day-number");
      header.textContent = d;
      // Destacar hoy
      const todayStr = new Date().toISOString().split("T")[0];
      if (dateStr === todayStr) {
        header.classList.add("today");
      }
      cell.appendChild(header);
      // Eventos del día
      const eventsContainer = document.createElement("div");
      eventsContainer.classList.add("day-events");
      const evts = this.events[dateStr] || [];
      evts.slice(0, 2).forEach((ev) => {
        const evDiv = document.createElement("div");
        evDiv.classList.add("event");
        evDiv.style.backgroundColor = ev.color || "#007bff";
        evDiv.textContent = ev.title;
        eventsContainer.appendChild(evDiv);
      });
      if (evts.length > 2) {
        const more = document.createElement("span");
        more.textContent = `+${evts.length - 2}`;
        eventsContainer.appendChild(more);
      }
      cell.appendChild(eventsContainer);
      cell.addEventListener("click", () => {
        this.openModal(dateStr);
      });
      return cell;
    },
    changeMonth(delta) {
      this.currentDate.setMonth(this.currentDate.getMonth() + delta);
      this.render();
    },
    openModal(dateStr) {
      this.selectedDate = dateStr;
      const modal = document.getElementById("calendar-modal");
      if (!modal) return;
      document.getElementById("modal-date-title").textContent = dateStr;
      document.getElementById("event-name").value = "";
      document.getElementById("event-notes").value = "";
      document.getElementById("event-color").value = "#007bff";
      // Lista eventos existentes
      const list = document.getElementById("event-list");
      list.innerHTML = "";
      const evts = this.events[dateStr] || [];
      evts.forEach((ev, idx) => {
        const li = document.createElement("li");
        const colorBox = document.createElement("span");
        colorBox.classList.add("event-color-box");
        colorBox.style.backgroundColor = ev.color;
        li.appendChild(colorBox);
        li.appendChild(document.createTextNode(`${ev.title}${ev.notes ? " - " + ev.notes : ""}`));
        const delBtn = document.createElement("button");
        delBtn.textContent = "x";
        delBtn.style.marginLeft = "0.5rem";
        delBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          this.deleteEvent(dateStr, idx);
        });
        li.appendChild(delBtn);
        list.appendChild(li);
      });
      modal.classList.remove("hidden");
    },
    closeModal() {
      const modal = document.getElementById("calendar-modal");
      if (modal) {
        modal.classList.add("hidden");
      }
    },
    saveEvent() {
      if (!this.selectedDate) return;
      const titleInput = document.getElementById("event-name");
      const notesInput = document.getElementById("event-notes");
      const colorInput = document.getElementById("event-color");
      const title = titleInput.value.trim();
      if (!title) return;
      const notes = notesInput.value.trim();
      const color = colorInput.value;
      if (!this.events[this.selectedDate]) {
        this.events[this.selectedDate] = [];
      }
      this.events[this.selectedDate].push({ title, notes, color });
      localStorage.setItem("calendarEvents", JSON.stringify(this.events));
      this.closeModal();
      this.render();
    },
    deleteEvent(dateStr, index) {
      if (!this.events[dateStr]) return;
      this.events[dateStr].splice(index, 1);
      if (this.events[dateStr].length === 0) {
        delete this.events[dateStr];
      }
      localStorage.setItem("calendarEvents", JSON.stringify(this.events));
      this.openModal(dateStr);
    },
  };
  // Iniciar calendario al cargar
  calendar.init();
});