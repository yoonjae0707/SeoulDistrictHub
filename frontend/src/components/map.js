import { seoulMapData, getHexPoints } from '../assets/seoul_map.js';
import geojson from '../assets/seoul_municipalities_geo_simple.json';

let activeSelectedId = null;

export async function initMap(containerId, districtsData, onSelectDistrict) {
  const container = document.getElementById(containerId);
  if (!container) return;

  if (geojson && geojson.features && geojson.features.length === 25) {
    try {
      renderGeographicMap(container, geojson, districtsData, onSelectDistrict);
    } catch (renderErr) {
      console.error("Geographic map rendering error:", renderErr);
      console.log("Falling back to Hexagonal Grid map due to render error.");
      renderHexagonalMap(container, districtsData, onSelectDistrict);
    }
  } else {
    console.warn("GeoJSON failed. Falling back to Hexagonal Grid map.");
    renderHexagonalMap(container, districtsData, onSelectDistrict);
  }
}

function renderGeographicMap(container, geojson, districtsData, onSelectDistrict) {
  const width = 680;
  const height = 480;

  // Create SVG Element
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
  svg.setAttribute("width", "100%");
  svg.setAttribute("height", "100%");

  // Add Defs for drop shadow filters
  const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
  defs.innerHTML = `
    <filter id="light-shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="4" stdDeviation="8" flood-color="#475569" flood-opacity="0.15"/>
    </filter>
  `;
  svg.appendChild(defs);

  // Project coordinates dynamically to fit container
  let minLng = Infinity, maxLng = -Infinity;
  let minLat = Infinity, maxLat = -Infinity;

  geojson.features.forEach(feature => {
    const coords = feature.geometry.type === "Polygon" ? [feature.geometry.coordinates] : feature.geometry.coordinates;
    coords.forEach(poly => {
      poly[0].forEach(pt => {
        const [lng, lat] = pt;
        if (lng < minLng) minLng = lng;
        if (lng > maxLng) maxLng = lng;
        if (lat < minLat) minLat = lat;
        if (lat > maxLat) maxLat = lat;
      });
    });
  });

  // Scale calculations with padding
  const padding = 25;
  const mapWidth = width - padding * 2;
  const mapHeight = height - padding * 2;
  
  const lngRange = maxLng - minLng;
  const latRange = maxLat - minLat;

  // Preserve aspect ratio
  const scale = Math.min(mapWidth / lngRange, mapHeight / latRange);
  const xOffset = padding + (mapWidth - lngRange * scale) / 2;
  const yOffset = padding + (mapHeight - latRange * scale) / 2;

  function project(lng, lat) {
    const x = xOffset + (lng - minLng) * scale;
    // Invert Y because SVG coordinates increase downwards
    const y = height - (yOffset + (lat - minLat) * scale);
    return [x, y];
  }

  // Render districts as SVG paths
  const districtsGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");

  geojson.features.forEach(feature => {
    const geoName = feature.properties.name; // e.g., "종로구"
    const info = districtsData.find(item => item.name === geoName || item.name_kr === geoName);
    if (!info) return;

    // Draw path
    let dStr = "";
    const coords = feature.geometry.type === "Polygon" ? [feature.geometry.coordinates] : feature.geometry.coordinates;
    coords.forEach(poly => {
      const outerRing = poly[0];
      outerRing.forEach((pt, idx) => {
        const [x, y] = project(pt[0], pt[1]);
        if (idx === 0) {
          dStr += `M ${x.toFixed(1)} ${y.toFixed(1)}`;
        } else {
          dStr += ` L ${x.toFixed(1)} ${y.toFixed(1)}`;
        }
      });
      dStr += " Z";
    });

    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", dStr);
    path.setAttribute("id", `hex-${info.id}`); // Keep id for consistency with app logic
    
    const partyClass = info.party === "더불어민주당" ? "party-minjoo" : "party-ppp";
    path.setAttribute("class", `map-hex ${partyClass}`);
    path.setAttribute("data-id", info.id);
    path.setAttribute("data-name", geoName);

    // Calculate centroid for labels
    const firstPolyRing = coords[0][0];
    let sumX = 0, sumY = 0;
    firstPolyRing.forEach(pt => {
      const [x, y] = project(pt[0], pt[1]);
      sumX += x;
      sumY += y;
    });
    const cx = sumX / firstPolyRing.length;
    const cy = sumY / firstPolyRing.length;

    // Create label
    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.setAttribute("x", cx.toFixed(1));
    text.setAttribute("y", cy.toFixed(1));
    text.setAttribute("class", "map-label light-text");
    text.textContent = geoName; // Displays full name like "종로구"

    districtsGroup.appendChild(path);
    districtsGroup.appendChild(text);

    setupEvents(path, info, onSelectDistrict);
  });

  svg.appendChild(districtsGroup);
  container.innerHTML = "";
  container.appendChild(svg);
}

function renderHexagonalMap(container, districtsData, onSelectDistrict) {
  const { config, districts, hanRiver } = seoulMapData;
  const { width, height, hexRadius, spacingX, spacingY, originX, originY } = config;

  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
  svg.setAttribute("width", "100%");
  svg.setAttribute("height", "100%");

  const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
  defs.innerHTML = `
    <filter id="light-shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="#475569" flood-opacity="0.12"/>
    </filter>
  `;
  svg.appendChild(defs);

  // Render Han River Flow
  const riverPoints = hanRiver.map(pt => {
    const isOdd = Math.floor(pt.row) % 2 !== 0;
    const xOffset = isOdd ? spacingX / 2 : 0;
    const x = originX + pt.col * spacingX + xOffset;
    const y = originY + pt.row * spacingY;
    return `${x},${y}`;
  });

  const riverPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
  riverPath.setAttribute("d", `M ${riverPoints.join(" L ")}`);
  riverPath.setAttribute("class", "han-river-path");
  svg.appendChild(riverPath);

  // Render Districts Hexagon Group
  const districtsGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");

  districts.forEach(d => {
    const info = districtsData.find(item => item.id === d.id);
    if (!info) return;

    const isOdd = d.row % 2 !== 0;
    const xOffset = isOdd ? spacingX / 2 : 0;
    const cx = originX + d.col * spacingX + xOffset;
    const cy = originY + d.row * spacingY;

    const pointsStr = getHexPoints(cx, cy, hexRadius);

    const poly = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    poly.setAttribute("points", pointsStr);
    poly.setAttribute("id", `hex-${d.id}`);
    
    const partyClass = info.party === "더불어민주당" ? "party-minjoo" : "party-ppp";
    poly.setAttribute("class", `map-hex ${partyClass}`);
    poly.setAttribute("data-id", d.id);
    poly.setAttribute("data-name", info.name_kr || info.name);

    // Text label (Pointy-topped correction: +2px vertical adjustment)
    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.setAttribute("x", cx.toFixed(1));
    text.setAttribute("y", (cy + 2).toFixed(1));
    text.setAttribute("class", "map-label light-text");
    text.textContent = info.name_kr || info.name; // Displays full name with "구"

    districtsGroup.appendChild(poly);
    districtsGroup.appendChild(text);

    setupEvents(poly, info, onSelectDistrict);
  });

  svg.appendChild(districtsGroup);
  container.innerHTML = "";
  container.appendChild(svg);
}

function setupEvents(element, info, onSelectDistrict) {
  const tooltip = document.getElementById("map-tooltip");
  const displayName = info.name_kr || info.name;

  element.addEventListener("mouseenter", (e) => {
    tooltip.innerHTML = `
      <div class="tooltip-header">${displayName}</div>
      <div>구청장: <strong>${info.mayor}</strong> (${info.party.replace("더불어민주당", "민주").replace("국민의힘", "국힘")})</div>
      <div style="font-size: 10px; margin-top: 4px; color: #cbd5e1; font-style: italic;">"${info.slogan}"</div>
    `;
    tooltip.style.opacity = "1";
    positionTooltip(e);
  });

  element.addEventListener("mousemove", (e) => {
    positionTooltip(e);
  });

  element.addEventListener("mouseleave", () => {
    tooltip.style.opacity = "0";
  });

  element.addEventListener("click", () => {
    if (activeSelectedId) {
      const prev = document.getElementById(`hex-${activeSelectedId}`);
      if (prev) prev.classList.remove("selected");
    }
    
    element.classList.add("selected");
    activeSelectedId = info.id;

    // Bring selected district path and its text label to the top of the rendering stack
    const parent = element.parentNode;
    if (parent) {
      const nextSibling = element.nextSibling;
      parent.appendChild(element);
      if (nextSibling && nextSibling.tagName && nextSibling.tagName.toLowerCase() === "text") {
        parent.appendChild(nextSibling);
      }
    }
    
    onSelectDistrict(info);
  });
}

function positionTooltip(e) {
  const tooltip = document.getElementById("map-tooltip");
  const offset = 15;
  const rect = e.currentTarget.ownerSVGElement.parentNode.getBoundingClientRect();
  const x = e.clientX - rect.left + offset;
  const y = e.clientY - rect.top + offset;
  
  tooltip.style.left = `${x}px`;
  tooltip.style.top = `${y}px`;
}

export function highlightMapDistricts(filteredIds) {
  const hexagons = document.querySelectorAll(".map-hex");
  
  hexagons.forEach(hex => {
    const id = hex.getAttribute("data-id");
    
    if (filteredIds.length === 0) {
      hex.style.opacity = "0.15";
      hex.style.pointerEvents = "none";
    } else if (filteredIds.includes(id)) {
      hex.style.opacity = "1";
      hex.style.pointerEvents = "auto";
    } else {
      hex.style.opacity = "0.2";
      hex.style.pointerEvents = "none";
    }
  });
}

export function selectMapDistrictById(districtId) {
  const hex = document.getElementById(`hex-${districtId}`);
  if (hex) {
    hex.dispatchEvent(new Event("click"));
  }
}
