// Function to fetch and transform JSON data into array of objects
async function fetchAndTransformData() {
    const response = await fetch('/api/model-info');
    const rawData = await response.json();

    // Transform the data into an array of objects
    const modelIds = Object.keys(rawData.model_name);
    return modelIds.map(id => ({
        model_name: rawData.model_name[id],
        model_size: rawData.model_size?.[id],
        model_category: rawData.model_category?.[id],
        downloads: rawData.downloads?.[id],
        likes: rawData.likes?.[id],
        task_category: rawData.task_category?.[id],
        creators: rawData.creators?.[id],
        publishing_date: rawData.publishing_date?.[id]
    }));
}

// Function to count and sort categories
function countAndSortCategories(data, categoryField) {
    const count = data.reduce((acc, item) => {
        const category = item[categoryField];
        if (category) {
            acc[category] = (acc[category] || 0) + 1;
        }
        return acc;
    }, {});

    return Object.entries(count)
        .sort(([,a], [,b]) => b - a);
}

export { fetchAndTransformData, countAndSortCategories }; 