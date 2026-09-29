// IrriSmart Automation - lógica de la página (funciona sin Flask).

// ---------- Navegación entre las 4 pestañas ----------
const pestanas = document.querySelectorAll(".tab");
const botonesMenu = document.querySelectorAll(".menu button");

function mostrarPestana(id, destino) {
  if (!document.getElementById(id)) id = "inicio";
  pestanas.forEach(p => p.classList.toggle("activa", p.id === id));
  botonesMenu.forEach(b => b.toggleAttribute("aria-current", b.dataset.tab === id));
  botonesMenu.forEach(b => { if (b.dataset.tab === id) b.setAttribute("aria-current", "page"); });
  history.replaceState(null, "", "#" + id);
  const meta = destino ? document.getElementById(destino) : null;
  meta ? meta.scrollIntoView({ behavior: "smooth" }) : window.scrollTo(0, 0);
}
botonesMenu.forEach(b => b.addEventListener("click", () => mostrarPestana(b.dataset.tab)));
document.querySelectorAll("[data-goto]").forEach(b =>
  b.addEventListener("click", () => mostrarPestana(b.dataset.goto, b.dataset.scroll)));
window.addEventListener("hashchange", () => mostrarPestana(location.hash.slice(1)));
mostrarPestana(location.hash.slice(1) || "inicio");

// ---------- Dashboard: regla humedad < umbral ----------
const sliderHumedad = document.getElementById("humedad");
const sliderUmbral = document.getElementById("umbral");
const escena = document.getElementById("escenaSim");
const etiquetaEstado = document.getElementById("estado");

function actualizarDashboard() {
  const humedad = Number(sliderHumedad.value);
  const umbral = Number(sliderUmbral.value);
  const riegoActivo = humedad < umbral;           // regla principal

  document.getElementById("valHumedad").textContent = humedad + " %";
  document.getElementById("valUmbral").textContent = umbral + " %";
  etiquetaEstado.textContent = riegoActivo ? "🟢 RIEGO ACTIVO" : "🔴 RIEGO DESACTIVADO";
  etiquetaEstado.className = "estado " + (riegoActivo ? "on" : "off");
  escena.classList.toggle("flujo", riegoActivo);   // anima el agua
  escena.classList.toggle("seca", humedad < umbral); // planta marchita si está seca
  extras(humedad, umbral);
}
sliderHumedad.addEventListener("input", actualizarDashboard);
sliderUmbral.addEventListener("input", actualizarDashboard);

// ---------- Botón "Simular riego" ----------
// Deja el suelo seco y sube la humedad poco a poco mientras el riego está activo.
const botonSimular = document.getElementById("btnSimular");
let temporizador = null;

botonSimular.addEventListener("click", () => {
  clearInterval(temporizador);
  const umbral = Number(sliderUmbral.value);
  sliderHumedad.value = Math.max(0, umbral - 20);
  actualizarDashboard();
  botonSimular.disabled = true;
  botonSimular.textContent = "Simulando…";

  temporizador = setInterval(() => {
    if (Number(sliderHumedad.value) < Number(sliderUmbral.value)) {
      sliderHumedad.value = Number(sliderHumedad.value) + 1;
    } else {
      clearInterval(temporizador);              // humedad suficiente: fin
      botonSimular.disabled = false;
      botonSimular.textContent = "Simular riego";
    }
    actualizarDashboard();
  }, 150);
});

// ---------- Formulario de contacto ----------
// Con Flask local se envía a /api/contacto; en GitHub Pages no hay servidor.
document.getElementById("formContacto").addEventListener("submit", async (e) => {
  e.preventDefault();
  const mensaje = document.getElementById("msgForm");
  const datos = Object.fromEntries(new FormData(e.target));
  try {
    const respuesta = await fetch("/api/contacto", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datos),
    });
    if (!respuesta.ok) throw new Error("Error del servidor");
    mensaje.textContent = "¡Gracias! Tu mensaje fue recibido por el servidor local.";
  } catch {
    mensaje.textContent = "Gracias, " + datos.nombre + ". Esta versión es una demostración: el mensaje no se envía a ningún servidor.";
  }
  e.target.reset();
});

// ---------- Extras visuales: medidor, planta que crece e historial ----------
const CIRCUNFERENCIA = 2 * Math.PI * 50;
const historial = [];

function extras(humedad, umbral) {
  const anillo = document.getElementById("anillo");
  anillo.style.strokeDashoffset = CIRCUNFERENCIA * (1 - humedad / 100);
  anillo.classList.toggle("seco", humedad < umbral);
  document.getElementById("gaugeTxt").textContent = humedad + "%";
  document.getElementById("marcaUmbral").setAttribute("transform", "rotate(" + umbral * 3.6 + " 60 60)");
  // La planta crece un poco cuando hay más humedad
  document.getElementById("plantaSim").style.transform = "scale(" + (0.72 + humedad / 100 * 0.36) + ")";
  historial.push(humedad);
  if (historial.length > 40) historial.shift();
  const puntos = historial.map((v, i) => (i * 200 / 39).toFixed(1) + "," + (48 - v * 0.46).toFixed(1));
  document.getElementById("lineaHist").setAttribute("points", puntos.join(" "));
  const y = (48 - umbral * 0.46).toFixed(1);
  const lu = document.getElementById("lineaUmbral");
  lu.setAttribute("y1", y); lu.setAttribute("y2", y);
}

// Botones rápidos: sequía, normal, lluvia
document.querySelectorAll(".chip").forEach(c => c.addEventListener("click", () => {
  clearInterval(temporizador);
  botonSimular.disabled = false; botonSimular.textContent = "Simular riego";
  sliderHumedad.value = c.dataset.h;
  actualizarDashboard();
}));

// ---------- Efectos: aparición, tarjetas 3D, ondas en botones ----------
const observador = new IntersectionObserver(entradas => entradas.forEach(e => {
  if (e.isIntersecting) { e.target.classList.add("vis"); observador.unobserve(e.target); }
}), { threshold: 0.12 });
document.querySelectorAll("h2, .tarjeta, .panel, .pasos li, details, .valores, .problema, .scroll, pre")
  .forEach((el, i) => { el.classList.add("rev"); el.style.setProperty("--d", (i % 4) * 0.08 + "s"); observador.observe(el); });

document.querySelectorAll(".tarjeta").forEach(t => {
  t.addEventListener("pointermove", e => {
    const r = t.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
    t.style.setProperty("--mx", x * 100 + "%"); t.style.setProperty("--my", y * 100 + "%");
    t.style.setProperty("--ry", (x - 0.5) * 12 + "deg"); t.style.setProperty("--rx", (0.5 - y) * 12 + "deg");
  });
  t.addEventListener("pointerleave", () => { t.style.setProperty("--rx", "0deg"); t.style.setProperty("--ry", "0deg"); });
});

document.querySelectorAll(".btn, .chip").forEach(b => b.addEventListener("click", e => {
  const r = b.getBoundingClientRect(), onda = document.createElement("span");
  onda.className = "onda";
  onda.style.left = e.clientX - r.left + "px"; onda.style.top = e.clientY - r.top + "px";
  b.appendChild(onda); setTimeout(() => onda.remove(), 600);
}));

// ---------- Hero: burbujas de fondo y lluvia al hacer clic ----------
const contenedorBurbujas = document.getElementById("burbujas");
for (let i = 0; i < 16; i++) {
  const b = document.createElement("span");
  const tam = 6 + Math.random() * 16;
  b.style.cssText = "left:" + Math.random() * 100 + "%;width:" + tam + "px;height:" + tam + "px;animation-duration:" + (7 + Math.random() * 9) + "s;animation-delay:-" + Math.random() * 12 + "s";
  contenedorBurbujas.appendChild(b);
}

const escenaHero = document.getElementById("escenaHero");
escenaHero.addEventListener("click", e => {
  const r = escenaHero.getBoundingClientRect();
  for (let i = 0; i < 14; i++) {
    const g = document.createElement("span");
    g.className = "salpica";
    g.style.left = e.clientX - r.left + "px"; g.style.top = e.clientY - r.top + "px";
    escenaHero.appendChild(g);
    g.animate([{ transform: "translate(0,0)", opacity: 1 },
               { transform: "translate(" + (Math.random() * 120 - 60) + "px," + (40 + Math.random() * 90) + "px)", opacity: 0 }],
              { duration: 700 + Math.random() * 400, easing: "ease-out" }).onfinish = () => g.remove();
  }
});
document.querySelector(".hero").addEventListener("pointermove", e => {
  const x = (e.clientX / window.innerWidth - 0.5) * 24, y = (e.clientY / window.innerHeight - 0.5) * 24;
  document.querySelectorAll(".blob").forEach((b, i) => b.style.translate = (i ? -x : x) + "px " + (i ? -y : y) + "px");
});

actualizarDashboard(); // primer dibujo del dashboard
