import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { getOrganizationData } from "../dataService.js";

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

const countryNameMap = {
  "U.S.": "United States",
  USA: "United States",
  US: "United States",
};

const popupElement = document.getElementById("info-popup");

function hideInfoPopup() {
  if (popupElement) {
    popupElement.style.display = "none";
  }
}

function normalizeCountryName(name) {
  return countryNameMap[name] || name.trim();
}

export async function initGlobe() {
  console.log("Initializing globe..."); // DEBUG
  const container = document.getElementById("globe-container");
  const countryListElement = document.getElementById("country-list");

  if (!container || !countryListElement) {
    console.error(
      "Required globe elements (#globe-container, #country-list) not found"
    );
    return;
  }
  if (!popupElement) {
    console.error("Required globe element #info-popup not found");
  }

  // Scene, Camera, Renderer
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    75,
    container.clientWidth / container.clientHeight,
    0.1,
    1000
  );
  camera.position.z = 2;

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  container.appendChild(renderer.domElement);

  // Globe Geometry and Material
  const globeRadius = 1.2;
  const geometry = new THREE.SphereGeometry(globeRadius, 64, 64);
  const textureLoader = new THREE.TextureLoader();
  const earthTexture = textureLoader.load("../img/earth.jpg");
  const material = new THREE.MeshPhongMaterial({ map: earthTexture });
  const globe = new THREE.Mesh(geometry, material);
  scene.add(globe);

  // Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);
  const pointLight = new THREE.PointLight(0xffffff, 1, 300);
  pointLight.position.set(5, 3, 5);
  scene.add(pointLight);

  // Controls
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.screenSpacePanning = false;
  controls.minDistance = 1.8;
  controls.maxDistance = 6;
  controls.enablePan = false;

  controls.addEventListener("start", hideInfoPopup);

  // Helper function to convert lat/lon to 3D coordinates
  function latLonToVector3(lat, lon, radius) {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);
    const x = -(radius * Math.sin(phi) * Math.cos(theta));
    const y = radius * Math.cos(phi);
    const z = radius * Math.sin(phi) * Math.sin(theta);
    return new THREE.Vector3(x, y, z);
  }

  // Helper function to calculate distance between two lat/lon points
  function haversineDistance(lat1, lon1, lat2, lon2) {
    if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) {
      return Infinity; // Cannot calculate distance if coordinates are missing
    }
    const R = 6371; // Radius of the Earth in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance; // in km
  }

  function showInfoPopup(organizations, screenPosition) {
    console.log("showInfoPopup called for:", organizations);
    if (!popupElement || !organizations || organizations.length === 0) {
      console.log(
        "showInfoPopup exiting: popupElement or organizations missing/empty"
      );
      hideInfoPopup(); // Ensure it's hidden if no orgs
      return;
    }

    let popupHTML = `<strong>Nearby Organizations (${organizations.length})</strong><hr style="margin: 2px 0;">`;
    organizations.forEach((organization, index) => {
      const lat =
        typeof organization.latitude === "number"
          ? organization.latitude.toFixed(4)
          : "N/A";
      const lon =
        typeof organization.longitude === "number"
          ? organization.longitude.toFixed(4)
          : "N/A";
      popupHTML += `
                <div style="margin-bottom: 5px; ${
                  index > 0
                    ? "border-top: 1px solid #eee; padding-top: 3px;"
                    : ""
                }">
                    <strong>${
                      organization.name || "Unknown Organization"
                    }</strong><br>
                    <small>
                        Country: ${organization.country || "N/A"}<br>
                        City: ${organization.city || "N/A"}<br>
                        Lat: ${lat}, Lon: ${lon}
                     </small>
                </div>
            `;
    });

    // Apply scrollbar styles if more than 5 organizations
    const maxItemsWithoutScroll = 5;
    if (organizations.length > maxItemsWithoutScroll) {
      popupElement.style.maxHeight = "250px";
      popupElement.style.overflowY = "auto";
    } else {
      popupElement.style.maxHeight = "none";
      popupElement.style.overflowY = "visible";
    }

    popupElement.innerHTML = popupHTML;
    popupElement.style.display = "block";
    popupElement.style.position = "absolute";
    popupElement.style.background = "rgba(255, 255, 255, 0.95)";
    popupElement.style.border = "1px solid #aaa";
    popupElement.style.borderRadius = "4px";
    popupElement.style.padding = "8px";
    popupElement.style.fontSize = "11px";
    popupElement.style.zIndex = "1000";
    popupElement.style.maxWidth = "250px";
    popupElement.style.boxShadow = "0 2px 5px rgba(0,0,0,0.2)";
    popupElement.style.pointerEvents = "auto";

    const popupWidth = popupElement.offsetWidth;
    const popupHeight = popupElement.offsetHeight;
    let left = screenPosition.x + 15;
    let top = screenPosition.y - popupHeight / 2;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    if (left + popupWidth > viewportWidth - 10) {
      left = screenPosition.x - popupWidth - 15;
    }
    if (top < 10) {
      top = 10;
    } else if (top + popupHeight > viewportHeight - 10) {
      top = viewportHeight - popupHeight - 10;
    }

    popupElement.style.left = `${left}px`;
    popupElement.style.top = `${top}px`;

    // Add event listener to close button
    const closeButton = document.getElementById("close-popup");
    if (closeButton) {
      closeButton.onclick = (e) => {
        e.stopPropagation();
        hideInfoPopup();
      };
    } else {
      console.warn("Close button not found in popup");
    }
  }
  const markers = [];

  try {
    const organizations = await getOrganizationData();
    console.log(
      "Fetched organization data for globe via service:",
      organizations.length
    );

    const markerGeometry = new THREE.SphereGeometry(0.015, 16, 16);
    const markerMaterial = new THREE.MeshBasicMaterial({ color: 0x3a59d1 });
    const countryCounts = {};

    organizations.forEach((org) => {
      if (org.latitude != null && org.longitude != null) {
        const position = latLonToVector3(
          org.latitude,
          org.longitude,
          globeRadius + 0.01
        );
        const marker = new THREE.Mesh(markerGeometry, markerMaterial);
        marker.position.copy(position);

        marker.userData.organization = org;

        globe.add(marker);
        markers.push(marker);
      } else {
        console.warn(`Organization ${org.name} missing lat/lon data.`);
      }

      if (org.country) {
        const normalizedCountry = normalizeCountryName(org.country);
        countryCounts[normalizedCountry] =
          (countryCounts[normalizedCountry] || 0) + 1;
      }
    });

    const sortedCountries = Object.entries(countryCounts)
      .sort(([, countA], [, countB]) => countB - countA)
      .slice(0, 10);

    countryListElement.innerHTML = "";
    sortedCountries.forEach(([country, count]) => {
      const li = document.createElement("li");
      li.innerHTML = `<span title="${country}">${country}</span><span>${count}</span>`;
      countryListElement.appendChild(li);
    });
  } catch (error) {
    console.error("Error fetching or processing organization data:", error);
    countryListElement.innerHTML = "<li>Error loading data</li>";
  }

  function onDocumentMouseDown(event) {
    if (popupElement && popupElement.contains(event.target)) {
      console.log("Click inside popup, ignoring globe click.");
      return;
    }

    console.log("Mouse down event triggered on globe");

    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    console.log("Mouse NDC:", mouse.x, mouse.y);

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(markers);
    console.log("Raycaster intersections:", intersects.length, intersects);

    if (intersects.length > 0) {
      console.log("Intersection found!");
      const firstIntersectedMarker = intersects.find(
        (intersect) => intersect.object.userData.organization
      );

      if (firstIntersectedMarker) {
        const clickedOrg = firstIntersectedMarker.object.userData.organization;
        console.log("Clicked marker data:", clickedOrg); // DEBUG

        if (clickedOrg.latitude != null && clickedOrg.longitude != null) {
          const nearbyOrgs = markers.reduce((acc, marker) => {
            const otherOrg = marker.userData.organization;
            if (
              otherOrg &&
              otherOrg.latitude != null &&
              otherOrg.longitude != null
            ) {
              const distance = haversineDistance(
                clickedOrg.latitude,
                clickedOrg.longitude,
                otherOrg.latitude,
                otherOrg.longitude
              );
              if (distance <= 100) {
                acc.push(otherOrg);
              }
            }
            return acc;
          }, []);

          console.log(`Found ${nearbyOrgs.length} nearby organizations.`);
          if (nearbyOrgs.length > 0) {
            const screenPosition = { x: event.clientX, y: event.clientY };
            showInfoPopup(nearbyOrgs, screenPosition);
          } else {
            hideInfoPopup();
          }
        } else {
          console.log("Clicked marker has no valid lat/lon.");
          hideInfoPopup();
        }
      } else {
        console.log("Intersection found, but no organization data on marker.");
        hideInfoPopup();
      }
    } else {
      console.log("No intersection found with markers.");
      const rect = renderer.domElement.getBoundingClientRect();
      const isClickOnCanvas =
        event.clientX >= rect.left &&
        event.clientX <= rect.right &&
        event.clientY >= rect.top &&
        event.clientY <= rect.bottom;

      if (isClickOnCanvas) {
        hideInfoPopup();
      }
    }
  }
  renderer.domElement.addEventListener("mousedown", onDocumentMouseDown, false);
  console.log("Mousedown event listener added to renderer element");

  // Mouse move listener for hover effect
  let hoveredMarker = null;
  function onDocumentMouseMove(event) {
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(markers);

    if (
      intersects.length > 0 &&
      intersects.find((intersect) => intersect.object.userData.organization)
    ) {
      if (!hoveredMarker) {
        renderer.domElement.style.cursor = "pointer";
        hoveredMarker = intersects.find(
          (intersect) => intersect.object.userData.organization
        ).object;
      }
    } else {
      if (hoveredMarker) {
        renderer.domElement.style.cursor = "default";
        hoveredMarker = null;
      }
    }
  }
  renderer.domElement.addEventListener("mousemove", onDocumentMouseMove, false);

  // Handle window resize
  function onWindowResize() {
    if (container.clientWidth > 0 && container.clientHeight > 0) {
      const width = container.clientWidth;
      const height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    } else {
      console.warn("Globe container dimensions are zero, skipping resize.");
    }
  }

  // Debounce resize handler
  let resizeTimeout;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(onWindowResize, 100);
  });

  // Animation loop
  function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  }

  animate();
  setTimeout(onWindowResize, 100);
}

export { hideInfoPopup };
