/*
 * Centralized data fetching and caching service.
 */

let cachedModelData = null;
let cachedOrgData = null;

let modelDataPromise = null;
let orgDataPromise = null;

// Transforms raw model info from the API into a more usable array format
function transformModelInfo(rawData) {
  if (!rawData || typeof rawData !== "object" || !rawData.model_name) {
    console.error("Invalid raw model data received:", rawData);
    return [];
  }
  const modelIds = Object.keys(rawData.model_name);
  return modelIds.map((id) => ({
    id: id,
    model_name: rawData.model_name[id],
    model_size: rawData.model_size?.[id],
    model_category: rawData.model_category?.[id],
    downloads: rawData.downloads?.[id],
    likes: rawData.likes?.[id],
    task_category: rawData.task_category?.[id],
    creators: rawData.creators?.[id],
    publishing_date: rawData.publishing_date?.[id],
  }));
}

/**
 * Fetches model data from the API, transforms it, caches it, and returns it.
 * Ensures data is fetched only once.
 * @returns {Promise<Array<Object>>} A promise that resolves with the model data array.
 */
export async function getModelData() {
  if (cachedModelData) {
    return cachedModelData;
  }

  if (!modelDataPromise) {
    modelDataPromise = fetch("/api/model-info")
      .then((response) => {
        if (!response.ok) {
          throw new Error(
            `HTTP error! status: ${response.status} for /api/model-info`
          );
        }
        return response.json();
      })
      .then((rawData) => {
        console.log("Fetched raw model data.");
        cachedModelData = transformModelInfo(rawData);
        console.log(
          "Transformed and cached model data:",
          cachedModelData.length,
          "models"
        );
        return cachedModelData;
      })
      .catch((error) => {
        console.error("Error fetching or processing model data:", error);
        modelDataPromise = null;
        throw error;
      });
  }

  return modelDataPromise;
}

/**
 * Fetches organization data from the API, caches it, and returns it.
 * Ensures data is fetched only once.
 * @returns {Promise<Array<Object>>} A promise that resolves with the organization data array.
 */
export async function getOrganizationData() {
  if (cachedOrgData) {
    return cachedOrgData;
  }

  if (!orgDataPromise) {
    orgDataPromise = fetch("/api/organizations-info")
      .then((response) => {
        if (!response.ok) {
          throw new Error(
            `HTTP error! status: ${response.status} for /api/organizations-info`
          );
        }
        return response.json();
      })
      .then((data) => {
        console.log(
          "Fetched and cached organization data:",
          data.length,
          "organizations"
        );
        cachedOrgData = data;
        return cachedOrgData;
      })
      .catch((error) => {
        console.error("Error fetching or processing organization data:", error);
        orgDataPromise = null;
        throw error;
      });
  }

  return orgDataPromise;
}
