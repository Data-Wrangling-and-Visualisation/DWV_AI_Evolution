import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// ADD: Raycaster and mouse vector
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// Country name normalization mapping - RE-ADDED
const countryNameMap = {
    "U.S.": "United States",
    "USA": "United States",
    "US": "United States"
};

// ADD: Pop-up element reference (moved outside initGlobe)
const popupElement = document.getElementById('info-popup');

// ADD: Function to hide the popup (moved outside initGlobe)
function hideInfoPopup() {
    if (popupElement) {
        popupElement.style.display = 'none';
         // Optional: Clean up outside click listener if it was added
         // document.removeEventListener('mousedown', handleOutsideClick, true);
    }
}

function normalizeCountryName(name) {
    return countryNameMap[name] || name.trim(); // Trim whitespace too
}

async function initGlobe() {
    console.log('Initializing globe...'); // DEBUG
    const container = document.getElementById('globe-container');
    const countryListElement = document.getElementById('country-list'); // RE-ADDED

    // if (!container || !countryListElement) { // Adjusted condition
    if (!container || !countryListElement) {
        console.error('Required globe elements (#globe-container, #country-list) not found');
        return;
    }
    // Check if popup element exists early
    if (!popupElement) {
        console.error('Required globe element #info-popup not found');
    }

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.z = 2;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    // Globe Geometry and Material
    const globeRadius = 1.2; // Increased globe radius
    const geometry = new THREE.SphereGeometry(globeRadius, 64, 64); // Use globeRadius
    const textureLoader = new THREE.TextureLoader();
    const earthTexture = textureLoader.load('../img/earth.jpg');
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
    controls.minDistance = 1.8; // Adjusted for larger globe
    controls.maxDistance = 6; // Adjusted for larger globe
    controls.enablePan = false;

    // ADD: Close popup when user starts dragging the globe
    controls.addEventListener('start', hideInfoPopup);

    // Helper function to convert lat/lon to 3D coordinates
    function latLonToVector3(lat, lon, radius) {
        const phi = (90 - lat) * (Math.PI / 180);
        const theta = (lon + 180) * (Math.PI / 180);
        const x = -(radius * Math.sin(phi) * Math.cos(theta));
        const y = radius * Math.cos(phi);
        const z = radius * Math.sin(phi) * Math.sin(theta);
        return new THREE.Vector3(x, y, z);
    }

    // ADD: Helper function to calculate distance between two lat/lon points (Haversine formula)
    function haversineDistance(lat1, lon1, lat2, lon2) {
        if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) {
            return Infinity; // Cannot calculate distance if coordinates are missing
        }
        const R = 6371; // Radius of the Earth in km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c;
        return distance; // in km
    }

    // MODIFY: Helper function to show pop-up for multiple organizations
    function showInfoPopup(organizations, screenPosition) {
        console.log('showInfoPopup called for:', organizations); // DEBUG
        if (!popupElement || !organizations || organizations.length === 0) {
            console.log('showInfoPopup exiting: popupElement or organizations missing/empty'); // DEBUG
            hideInfoPopup(); // Ensure it's hidden if no orgs
            return;
        }

        let popupHTML = `<strong>Nearby Organizations (${organizations.length})</strong><hr style="margin: 2px 0;">`;
        organizations.forEach((organization, index) => {
            const lat = typeof organization.latitude === 'number' ? organization.latitude.toFixed(4) : 'N/A';
            const lon = typeof organization.longitude === 'number' ? organization.longitude.toFixed(4) : 'N/A';
            popupHTML += `
                <div style="margin-bottom: 5px; ${index > 0 ? 'border-top: 1px solid #eee; padding-top: 3px;' : ''}">
                    <strong>${organization.name || 'Unknown Organization'}</strong><br>
                    <small>
                        Country: ${organization.country || 'N/A'}<br>
                        City: ${organization.city || 'N/A'}<br>
                        Lat: ${lat}, Lon: ${lon}
                     </small>
                </div>
            `;
        });

        // Apply scrollbar styles if more than 5 organizations
        const maxItemsWithoutScroll = 5;
        if (organizations.length > maxItemsWithoutScroll) {
            popupElement.style.maxHeight = '250px'; // Adjust max height as needed
            popupElement.style.overflowY = 'auto';
        } else {
            popupElement.style.maxHeight = 'none';
            popupElement.style.overflowY = 'visible';
        }

        popupElement.innerHTML = popupHTML;
        popupElement.style.display = 'block'; // Make it visible first to calculate dimensions
        popupElement.style.position = 'absolute'; // Ensure it's positioned correctly
        popupElement.style.background = 'rgba(255, 255, 255, 0.95)';
        popupElement.style.border = '1px solid #aaa';
        popupElement.style.borderRadius = '4px';
        popupElement.style.padding = '8px';
        popupElement.style.fontSize = '11px';
        popupElement.style.zIndex = '1000'; // Ensure it's on top
        popupElement.style.maxWidth = '250px'; // Prevent popup from becoming too wide
        popupElement.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
        popupElement.style.pointerEvents = 'auto'; // Allow interaction with the close button

        // Position Calculation (after display:block)
        const popupWidth = popupElement.offsetWidth;
        const popupHeight = popupElement.offsetHeight;
        let left = screenPosition.x + 15;
        let top = screenPosition.y - popupHeight / 2; // Center vertically initially

        // Adjust position if it goes off-screen
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        if (left + popupWidth > viewportWidth - 10) { // Leave some margin
            left = screenPosition.x - popupWidth - 15; // Show on the left
        }
        if (top < 10) {
            top = 10; // Prevent going off the top
        } else if (top + popupHeight > viewportHeight - 10) {
            top = viewportHeight - popupHeight - 10; // Prevent going off the bottom
        }


        popupElement.style.left = `${left}px`;
        popupElement.style.top = `${top}px`;


        // Add event listener to close button
        const closeButton = document.getElementById('close-popup');
        if (closeButton) {
            closeButton.onclick = (e) => { // Use onclick for simplicity here
                 e.stopPropagation(); // Prevent the click from bubbling up to the globe listener
                 hideInfoPopup();
            };
        } else {
            console.warn("Close button not found in popup");
        }

        // Optional: Hide popup if clicking outside of it (but not on the globe listener itself)
        // This requires careful event handling to avoid conflicts
        // document.addEventListener('mousedown', handleOutsideClick, true);
    }
    const markers = [];

    try {
        const response = await fetch('/api/organizations-info');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const organizations = await response.json();

        const markerGeometry = new THREE.SphereGeometry(0.015, 16, 16); // Slightly larger marker
        const markerMaterial = new THREE.MeshBasicMaterial({ color: 0x3A59D1 }); // Changed color to light blue
        const countryCounts = {}; // RE-ADDED

        organizations.forEach(org => {
            // Add marker
            if (org.latitude != null && org.longitude != null) {
                const position = latLonToVector3(org.latitude, org.longitude, globeRadius + 0.01); // Use globeRadius, slight offset
                const marker = new THREE.Mesh(markerGeometry, markerMaterial);
                marker.position.copy(position);

                // ADD: Store organization data directly on the marker's userData
                marker.userData.organization = org;

                globe.add(marker);
                markers.push(marker); // ADD: Add marker to our list
            } else {
                console.warn(`Organization ${org.name} missing lat/lon data.`);
            }

            // Count countries - RE-ADDED
            if (org.country) {
                const normalizedCountry = normalizeCountryName(org.country);
                countryCounts[normalizedCountry] = (countryCounts[normalizedCountry] || 0) + 1;
            }
        });

        // Populate sidebar - RE-ADDED
        const sortedCountries = Object.entries(countryCounts)
            .sort(([, countA], [, countB]) => countB - countA)
            .slice(0, 10);

        countryListElement.innerHTML = '';
        sortedCountries.forEach(([country, count]) => {
            const li = document.createElement('li');
            li.innerHTML = `<span title="${country}">${country}</span><span>${count}</span>`; // Add title for long names
            countryListElement.appendChild(li);
        });

    } catch (error) {
        console.error('Error fetching or processing organization data:', error);
        countryListElement.innerHTML = '<li>Error loading data</li>'; // RE-ADDED
    }

    // MODIFY: Click event listener to find nearby points
    function onDocumentMouseDown(event) {
        // Check if the click is on the popup itself or its close button
        if (popupElement && popupElement.contains(event.target)) {
            console.log("Click inside popup, ignoring globe click."); // DEBUG
            return; // Don't process globe click if interacting with popup
        }

        console.log('Mouse down event triggered on globe'); // DEBUG
        // event.preventDefault(); // Prevent default only if needed, might interfere with controls

        const rect = renderer.domElement.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        console.log('Mouse NDC:', mouse.x, mouse.y); // DEBUG

        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(markers);
        console.log('Raycaster intersections:', intersects.length, intersects); // DEBUG

        if (intersects.length > 0) {
            console.log('Intersection found!'); // DEBUG
            const firstIntersectedMarker = intersects.find(intersect => intersect.object.userData.organization);

            if (firstIntersectedMarker) {
                const clickedOrg = firstIntersectedMarker.object.userData.organization;
                console.log('Clicked marker data:', clickedOrg); // DEBUG

                if (clickedOrg.latitude != null && clickedOrg.longitude != null) {
                    const nearbyOrgs = markers.reduce((acc, marker) => {
                        const otherOrg = marker.userData.organization;
                        if (otherOrg && otherOrg.latitude != null && otherOrg.longitude != null) {
                            const distance = haversineDistance(
                                clickedOrg.latitude, clickedOrg.longitude,
                                otherOrg.latitude, otherOrg.longitude
                            );
                            // console.log(`Distance to ${otherOrg.name}: ${distance} km`); // DEBUG distance calc
                            if (distance <= 100) { // 100km threshold
                                acc.push(otherOrg);
                            }
                        }
                        return acc;
                    }, []);

                    console.log(`Found ${nearbyOrgs.length} nearby organizations.`); // DEBUG
                    if (nearbyOrgs.length > 0) {
                        const screenPosition = { x: event.clientX, y: event.clientY };
                        showInfoPopup(nearbyOrgs, screenPosition);
                    } else {
                         hideInfoPopup(); // Should not happen if clickedOrg is valid, but just in case
                    }

                } else {
                     console.log('Clicked marker has no valid lat/lon.'); // DEBUG
                     hideInfoPopup();
                }

            } else {
                console.log('Intersection found, but no organization data on marker.'); // DEBUG
                hideInfoPopup();
            }
        } else {
            console.log('No intersection found with markers.'); // DEBUG
            // Only hide the popup if the click was actually on the renderer's canvas
            // and not outside it (like on other UI elements).
            const rect = renderer.domElement.getBoundingClientRect();
            const isClickOnCanvas = event.clientX >= rect.left && event.clientX <= rect.right &&
                                  event.clientY >= rect.top && event.clientY <= rect.bottom;

            if (isClickOnCanvas) {
                 hideInfoPopup();
            }
        }
    }
    renderer.domElement.addEventListener('mousedown', onDocumentMouseDown, false);
    console.log('Mousedown event listener added to renderer element'); // DEBUG

    // ADD: Mouse move listener for hover effect
    let hoveredMarker = null;
    function onDocumentMouseMove(event) {
        const rect = renderer.domElement.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(markers);

        if (intersects.length > 0 && intersects.find(intersect => intersect.object.userData.organization)) {
            if (!hoveredMarker) {
                renderer.domElement.style.cursor = 'pointer';
                hoveredMarker = intersects.find(intersect => intersect.object.userData.organization).object;
            }
        } else {
            if (hoveredMarker) {
                renderer.domElement.style.cursor = 'default';
                hoveredMarker = null;
            }
        }
    }
    renderer.domElement.addEventListener('mousemove', onDocumentMouseMove, false);

    // Handle window resize
    function onWindowResize() {
        if (container.clientWidth > 0 && container.clientHeight > 0) {
            const width = container.clientWidth;
            const height = container.clientHeight;
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
            renderer.setSize(width, height);
        } else {
             console.warn("Globe container dimensions are zero, skipping resize.")
        }
    }

    // Debounce resize handler
    let resizeTimeout;
    window.addEventListener('resize', () => {
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
    setTimeout(onWindowResize, 100); // Initial setup with delay
}

// Export the hide function and potentially initGlobe if needed elsewhere
export { initGlobe, hideInfoPopup };

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGlobe);
} else {
    initGlobe();
} 