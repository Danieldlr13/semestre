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

  /* ==== Selector de color de acento (actualiza variables CSS) ==== */
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

  /* ==========  HORARIO: tabla interactiva
