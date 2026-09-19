/* La Espiga — interactividad. Edita CONFIG con los datos reales de la panadería. */
const CONFIG = {
  whatsapp: "34600123456", // ← número real con prefijo, sin "+" ni espacios
  minDaysAhead: 1,         // antelación mínima del pedido (días)
  cakeNoticeDays: 2        // antelación mínima para tartas (días)
};

document.addEventListener("DOMContentLoaded", () => {
  // Año del footer
  document.getElementById("year").textContent = new Date().getFullYear();

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

  // Filtro de la carta
  document.querySelectorAll(".chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      document.querySelectorAll(".chip").forEach((c) => c.classList.remove("is-active"));
      chip.classList.add("is-active");
      const f = chip.dataset.filter;
      document.querySelectorAll(".product").forEach((p) => {
        p.classList.toggle("is-hidden", f !== "all" && p.dataset.cat !== f);
      });
    });
  });

  // Fecha mínima del pedido (mañana por defecto)
  const dayInput = document.getElementById("f-day");
  const min = new Date();
  min.setDate(min.getDate() + CONFIG.minDaysAhead);
  const iso = min.toISOString().slice(0, 10);
  dayInput.min = iso;
  dayInput.value = iso;

  // Pedido → WhatsApp
  const form = document.getElementById("order-form");
  const errorBox = document.getElementById("form-error");
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
