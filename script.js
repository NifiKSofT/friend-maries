const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

document.querySelectorAll("[data-scroll-to]").forEach((link) => {
  link.addEventListener("click", (event) => {
    const targetId = link.getAttribute("data-scroll-to");
    const target = targetId ? document.getElementById(targetId) : null;

    if (!target) {
      return;
    }

    event.preventDefault();
    target.scrollIntoView({
      behavior: prefersReducedMotion.matches ? "auto" : "smooth",
      block: "start",
    });
  });
});

const revealItems = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window && !prefersReducedMotion.matches) {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      rootMargin: "0px 0px -10% 0px",
      threshold: 0.12,
    },
  );

  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

let isMapInitialized = false;

function initWeddingMap() {
  if (isMapInitialized) {
    return;
  }

  const config = window.WEDDING_MAP_CONFIG;
  const mapContainer = document.getElementById("wedding-map");

  if (!config || !mapContainer) {
    return;
  }

  isMapInitialized = true;

  const latitude = Number(config.center?.[0]);
  const longitude = Number(config.center?.[1]);
  const hasValidCoordinates = Number.isFinite(latitude) && Number.isFinite(longitude);
  const hasApiKey = config.apiKey && config.apiKey !== "YANDEX_MAP_API_KEY_HERE";

  if (!hasApiKey || !hasValidCoordinates) {
    mapContainer.innerHTML =
      '<p class="map-placeholder">Укажите API-ключ и координаты в <code>window.WEDDING_MAP_CONFIG</code>.</p>';
    return;
  }

  const mapScript = document.createElement("script");
  mapScript.src = `https://api-maps.yandex.ru/2.1/?apikey=${encodeURIComponent(config.apiKey)}&lang=ru_RU`;
  mapScript.onload = () => {
    window.ymaps.ready(() => {
      const map = new window.ymaps.Map("wedding-map", {
        center: [latitude, longitude],
        zoom: config.zoom || 16,
        controls: ["zoomControl", "fullscreenControl"],
      });

      const placemark = new window.ymaps.Placemark(
        [latitude, longitude],
        {
          hintContent: config.address,
          balloonContent: config.address,
        },
        {
          preset: "islands#darkGreenDotIcon",
        },
      );

      map.geoObjects.add(placemark);
    });
  };
  mapScript.onerror = () => {
    mapContainer.innerHTML =
      '<p class="map-placeholder">Не удалось загрузить Яндекс.Карты. Проверьте API-ключ.</p>';
  };

  document.head.appendChild(mapScript);
}
const mapContainer = document.getElementById("wedding-map");

if (mapContainer && "IntersectionObserver" in window) {
  const mapObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          initWeddingMap();
          observer.disconnect();
        }
      });
    },
    {
      rootMargin: "300px 0px",
      threshold: 0.01,
    },
  );

  mapObserver.observe(mapContainer);
} else {
  initWeddingMap();
}
