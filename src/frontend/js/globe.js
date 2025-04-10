import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// Country name normalization mapping - RE-ADDED
const countryNameMap = {
    "U.S.": "United States",
    "USA": "United States",
    "US": "United States"
};

function normalizeCountryName(name) {
    return countryNameMap[name] || name.trim(); // Trim whitespace too
}

async function initGlobe() {
    const container = document.getElementById('globe-container');
    const countryListElement = document.getElementById('country-list'); // RE-ADDED

    // if (!container || !countryListElement) { // Adjusted condition
    if (!container || !countryListElement) {
        console.error('Required globe elements (#globe-container, #country-list) not found');
        return;
    }

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.z = 2.5;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    // Globe Geometry and Material
    const geometry = new THREE.SphereGeometry(1, 64, 64);
    const textureLoader = new THREE.TextureLoader();
    const earthTexture = textureLoader.load('https://upload.wikimedia.org/wikipedia/commons/e/ea/Equirectangular-projection.jpg');
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
    controls.minDistance = 1.5;
    controls.maxDistance = 5;
    controls.enablePan = false;

    // Helper function to convert lat/lon to 3D coordinates
    function latLonToVector3(lat, lon, radius) {
        const phi = (90 - lat) * (Math.PI / 180);
        const theta = (lon + 180) * (Math.PI / 180);
        const x = -(radius * Math.sin(phi) * Math.cos(theta));
        const y = radius * Math.cos(phi);
        const z = radius * Math.sin(phi) * Math.sin(theta);
        return new THREE.Vector3(x, y, z);
    }

    // Fetch organization data, add markers, and populate sidebar
    try {
        const response = await fetch('/api/organizations-info');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const organizations = await response.json();

        const markerGeometry = new THREE.SphereGeometry(0.01, 16, 16);
        const markerMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        const countryCounts = {}; // RE-ADDED

        organizations.forEach(org => {
            // Add marker
            if (org.latitude != null && org.longitude != null) {
                const position = latLonToVector3(org.latitude, org.longitude, 1.01);
                const marker = new THREE.Mesh(markerGeometry, markerMaterial);
                marker.position.copy(position);
                globe.add(marker);
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

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGlobe);
} else {
    initGlobe();
} 