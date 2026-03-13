// Icons and helper functions for SVG rendering.

function rand(prefix = "id") {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

function createSVGIcon({ size = 14, className = "", elements = [] }) {
  const ns = "http://www.w3.org/2000/svg";

  const svg = document.createElementNS(ns, "svg");
  svg.setAttribute("width", size);
  svg.setAttribute("height", size);
  svg.setAttribute("viewBox", "0 0 24 24");

  if (className) svg.setAttribute("class", className);

  elements.forEach((el) => {
    const node = document.createElementNS(ns, el.type);
    Object.entries(el.attrs).forEach(([k, v]) => node.setAttribute(k, v));
    svg.appendChild(node);
  });

  return svg;
}

// Sphere icon with border
export function createSphereIcon({
  size = 14,
  className = "",
  strokeColor = "currentColor",
  strokeWidth = 1.5,
} = {}) {
  const gradId = rand("sphere-grad");

  const svg = createSVGIcon({
    size,
    className,
    elements: [{ type: "defs", attrs: {} }],
  });

  const ns = "http://www.w3.org/2000/svg";
  const defs = svg.querySelector("defs");

  const grad = document.createElementNS(ns, "radialGradient");
  grad.setAttribute("id", gradId);
  grad.setAttribute("cx", "30%");
  grad.setAttribute("cy", "30%");
  grad.setAttribute("r", "90%");

  const stops = [
    { offset: "0%", color: "#ffffff", opacity: "0.5" },
    { offset: "80%", color: "currentColor" },
    { offset: "100%", color: "#000000", opacity: "0.4" },
  ];

  stops.forEach((s) => {
    const stop = document.createElementNS(ns, "stop");
    stop.setAttribute("offset", s.offset);
    stop.setAttribute("stop-color", s.color);
    if (s.opacity) stop.setAttribute("stop-opacity", s.opacity);
    grad.appendChild(stop);
  });

  defs.appendChild(grad);

  const circle = document.createElementNS(ns, "circle");
  circle.setAttribute("cx", "12");
  circle.setAttribute("cy", "12");
  circle.setAttribute("r", "10");
  circle.setAttribute("fill", `url(#${gradId})`);
  svg.appendChild(circle);

  const border = document.createElementNS(ns, "circle");
  border.setAttribute("cx", "12");
  border.setAttribute("cy", "12");
  border.setAttribute("r", "10");
  border.setAttribute("fill", "none");
  border.setAttribute("stroke", strokeColor);
  border.setAttribute("stroke-width", strokeWidth);
  svg.appendChild(border);

  return svg;
}

export function createCubeIcon({ size = 14, className = "" } = {}) {
  return createSVGIcon({
    size,
    className,
    elements: [
      {
        type: "polygon",
        attrs: {
          points: "12 2 20 6 12 10 4 6",
          fill: "currentColor",
          opacity: "0.9",
        },
      },
      {
        type: "polygon",
        attrs: {
          points: "4 6 12 10 12 18 4 14",
          fill: "currentColor",
          opacity: "0.7",
        },
      },
      {
        type: "polygon",
        attrs: {
          points: "20 6 12 10 12 18 20 14",
          fill: "currentColor",
          opacity: "0.5",
        },
      },
    ],
  });
}

export function createMeshIcon({ size = 14, className = "" } = {}) {
  const ns = "http://www.w3.org/2000/svg";

  const svg = document.createElementNS(ns, "svg");
  svg.setAttribute("width", size);
  svg.setAttribute("height", size);
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("fill", "none");
  svg.setAttribute("stroke", "currentColor");
  svg.setAttribute("stroke-width", "1.2");
  svg.setAttribute("stroke-linecap", "round");
  svg.setAttribute("stroke-linejoin", "round");

  if (className) svg.setAttribute("class", className);

  // soft pentagon-ish face
  const face = document.createElementNS(ns, "polygon");
  face.setAttribute("points", "12 3 19 7 16 17 8 17 5 7");
  face.setAttribute("fill", "currentColor");
  face.setAttribute("opacity", "0.35");
  face.setAttribute("stroke", "none");

  // outer edges
  const edges = [
    "M12 3L19 7",
    "M19 7L16 17",
    "M16 17L8 17",
    "M8 17L5 7",
    "M5 7L12 3",
  ];

  [...edges].forEach((d) => {
    const path = document.createElementNS(ns, "path");
    path.setAttribute("d", d);
    svg.appendChild(path);
  });

  svg.insertBefore(face, svg.firstChild);

  return svg;
}
