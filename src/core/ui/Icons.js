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

// toolbarIcons
export const toolbarIcons = {
  undo: `
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" 
    fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M9 14 4 9l5-5"/>
      <path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5a5.5 5.5 0 0 1-5.5 5.5H11"/>
    </svg>
  `,
  redo: `
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="m15 14 5-5-5-5"/>
      <path d="M20 9H9.5A5.5 5.5 0 0 0 4 14.5A5.5 5.5 0 0 0 9.5 20H13"/>
    </svg>`,
  fullscreen: `
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="m15 15 6 6"/>
      <path d="m15 9 6-6"/>
      <path d="M21 16v5h-5"/>
      <path d="M21 8V3h-5"/>
      <path d="M3 16v5h5"/>
      <path d="m3 21 6-6"/>
      <path d="M3 8V3h5"/>
      <path d="M9 9 3 3"/>
    </svg>`,
  measure: `
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21.3 15.3a2.4 2.4 0 0 1 0 3.4l-2.6 2.6a2.4 2.4 0 0 1-3.4 0L2.7 8.7a2.41 2.41 0 0 1 0-3.4l2.6-2.6a2.41 2.41 0 0 1 3.4 0Z"/>
      <path d="m14.5 12.5 2-2"/>
      <path d="m11.5 9.5 2-2"/>
      <path d="m8.5 6.5 2-2"/>
      <path d="m17.5 15.5 2-2"/>
    </svg>`,
  import: `
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="7 10 12 15 17 10"/>
      <line x1="12" y1="15" x2="12" y2="3"/>
    </svg>`,
  export: `
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="17 8 12 3 7 8"/>
      <line x1="12" y1="3" x2="12" y2="15"/>
    </svg>`,
  keyboard: `
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2"/>
      <path d="M6 8h.01M10 8h.01M14 8h.01M18 8h.01M8 12h.01M12 12h.01M16 12h.01M6 16h.01M10 16h.01M14 16h.01M18 16h.01"/>
    </svg>`,
  camera: `
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/>
      <circle cx="12" cy="13" r="3"/>
    </svg>`,
};
