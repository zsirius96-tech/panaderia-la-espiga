/* La Espiga — interactividad. Edita CONFIG con los datos reales de la panadería. */
const CONFIG = {
  whatsapp: "34600123456", // ← número real con prefijo, sin "+" ni espacios
  minDaysAhead: 1,         // antelación mínima del pedido (días)
  cakeNoticeDays: 2        // antelación mínima para tartas (días)
};

document.addEventListener("DOMContentLoaded", () => {
  // Año del footer (no existe en mapa.html)
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Sombra del header al hacer scroll
  const header = document.querySelector(".site-header");
  const onScroll = () => header.classList.toggle("scrolled", window.scrollY > 8);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // Menú móvil
  const toggle = document.querySelector(".nav-toggle");
  const navList = document.getElementById("nav-list");
  toggle.addEventListener("click", () => {
    const open = navList.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
  });
  navList.addEventListener("click", (e) => {
    if (e.target.tagName === "A") {
      navList.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    }
  });

  // Filtro de la carta (reutilizable desde las tarjetas)
  const applyFilter = (f) => {
    document.querySelectorAll(".chip").forEach((c) => c.classList.toggle("is-active", c.dataset.filter === f));
    document.querySelectorAll(".product").forEach((p) => {
      p.classList.toggle("is-hidden", f !== "all" && p.dataset.cat !== f);
    });
  };
  document.querySelectorAll(".chip").forEach((chip) => {
    chip.addEventListener("click", () => applyFilter(chip.dataset.filter));
  });

  // Tarjetas desplegables: listan los productos de su categoría
  document.querySelectorAll(".card-expand").forEach((card) => {
    const cat = card.dataset.target;
    const list = card.querySelector(".card-panel ul");
    if (list) {
      document.querySelectorAll(`.product[data-cat="${cat}"]`).forEach((p) => {
        const h3 = p.querySelector("h3");
        const name = (h3.childNodes[0] ? h3.childNodes[0].textContent : h3.textContent).trim();
        const price = p.querySelector(".price").textContent;
        const li = document.createElement("li");
        const a = document.createElement("a");
        a.href = "#carta";
        const label = document.createElement("span");
        label.textContent = name;
        const cost = document.createElement("strong");
        cost.textContent = price;
        a.appendChild(label);
        a.appendChild(cost);
        a.addEventListener("click", (e) => { e.stopPropagation(); applyFilter(cat); });
        li.appendChild(a);
        list.appendChild(li);
      });
      const link = card.querySelector(".card-link");
      if (link) link.addEventListener("click", (e) => { e.stopPropagation(); applyFilter(cat); });
    }
    const toggle = () => {
      const open = card.getAttribute("aria-expanded") === "true";
      document.querySelectorAll(".card-expand").forEach((c) => c.setAttribute("aria-expanded", "false"));
      card.setAttribute("aria-expanded", String(!open));
    };
    card.addEventListener("click", toggle);
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(); }
    });
  });

  // Fecha mínima del pedido (mañana por defecto) — solo en encargos.html
  const dayInput = document.getElementById("f-day");
  const form = document.getElementById("order-form");
  const errorBox = document.getElementById("form-error");
  if (dayInput && form) {
  const min = new Date();
  min.setDate(min.getDate() + CONFIG.minDaysAhead);
  const iso = min.toISOString().slice(0, 10);
  dayInput.min = iso;
  dayInput.value = iso;

  // Pedido → WhatsApp
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("f-name").value.trim();
    const day = dayInput.value;
    const items = document.getElementById("f-items").value.trim();

    if (!name || !day || !items) {
      errorBox.textContent = "Completa nombre, día y pedido para continuar.";
      errorBox.hidden = false;
      return;
    }
    if (day < dayInput.min) {
      errorBox.textContent = `Necesitamos al menos ${CONFIG.minDaysAhead} día(s) de antelación.`;
      errorBox.hidden = false;
      return;
    }
    errorBox.hidden = true;

    const prettyDay = new Date(day + "T12:00:00").toLocaleDateString("es-ES", {
      weekday: "long", day: "numeric", month: "long"
    });
    const msg =
      `Hola La Espiga, soy ${name}.\n` +
      `Quiero encargar para el ${prettyDay}:\n${items}`;
    window.open(`https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(msg)}`, "_blank");
  });
  } // fin solo-encargos

  // Aparición suave al hacer scroll
  const io = new IntersectionObserver(
    (entries) => entries.forEach((en) => {
      if (en.isIntersecting) {
        en.target.classList.add("is-visible");
        io.unobserve(en.target);
      }
    }),
    { threshold: 0.12 }
  );
  document.querySelectorAll(".card, .product, .steps li, .values li").forEach((el) => {
    el.classList.add("reveal");
    io.observe(el);
  });
});
