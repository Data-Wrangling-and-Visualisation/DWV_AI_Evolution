# Visualizing AI Models Evolution Over Time

## Project Goal and Vision

This project aims to create a data visualization platform to explore the evolution of machine learning models over time. By analyzing key attributes of models and the communities that develop them, we will provide insights into trends such as model complexity and popularity, distribution of task categories, and the geography of main contributors.

The intended audience includes AI researchers, data scientists, industry professionals, and enthusiasts who want to understand how the field has progressed. The visualizations will help users identify important milestones, track emerging trends, and compare different models and communities.

## Live Demo

A live version of the application is hosted at: [http://e-order.ru:5001](http://e-order.ru:5001)

## Dataset Description

### Data Source and Collection Plan

- **Models Metadata**: We will fetch metadata about AI models from HuggingFace, the leading open-source platform for sharing AI models.
- **Communities Geolocation**: We will manually scrape data on communities that developed these models from HuggingFace and extract additional company details from Wikipedia and GitHub.
- **Twitter Posts**: We will scrape Twitter posts about AI models to track the popularity of certain models by counting the number of mentions of these models in tweets. The model names to scrape for will be obtained from the HuggingFace metadata we collect.

To manipulate HTML, we will use BeautifulSoup4 (BS4) and Selenium. BS4 will help us parse HTML content while Selenium will handle dynamic JavaScript-rendered pages. We'll manage rate limits by adding appropriate delays between requests.

For the sake of this project, we will collect the dataset only once. However, due to the intensive development speed in the sphere, continuous dataset updates should be performed.

### Data Content

We will collect data about two main entities: AI models and communities that developed them.

- **Models**
  - Model size
  - Number of downloads
  - Number of likes
  - Task category
  - Model category
  - Model creators
  - Date of publishing
  - Number of mentions on Twitter

- **Communities**
  - Community name
  - Location
  - Models developed by the community

## Visualization App Architecture

The application will use the standard data visualization pipeline:

1. **Data Collection**
   - Fetch AI model data using Hugging Face API in JSON format.
   - Scrape additional model details and company data from Hugging Face, Wikipedia, Twitter, and GitHub using BeautifulSoup and Selenium.

2. **Data Cleaning and Preprocessing**
   - Use Pandas to filter unnecessary fields, handle missing values, and transform timestamps to Python format.

3. **Exploratory Data Analysis (EDA)**
   - Analyze how model sizes have grown and evolved over time.
   - Estimate model popularity across different categories.
   - Map the geographic distribution of model creators.

4. **Data Storage and API**
   - Store processed data in a PostgreSQL database.
   - Develop a REST API using Python and FastAPI to serve the data.

5. **Data Visualization**
   - Use D3.js for interactive visualizations.
   - Develop an intuitive interface for exploring AI model evolution.

## Repository Structure

The project is organized into the following main directories:

-   `src/`: Contains the core application code:
    -   `data_collection/`: Scripts for collecting data from Hugging Face, Wikipedia, and GitHub.
    -   `backend/`: The Flask application serving the collected data via a REST API.
    -   `frontend/`: The HTML, CSS, and JavaScript files for the user interface and interactive visualizations.
    -   `visualization/`: Contains Jupyter notebooks used for Exploratory Data Analysis (EDA).
-   `data/`: Stores the collected raw and/or processed data files (e.g., CSV, JSON).
-   `images/`: Contains screenshots used in the README and potentially other static image assets.

## Proposed Visualizations and Features

1. **Bubble Chart (Model Properties)**
   - X-axis: Model publishing date
   - Y-axis: Number of likes
   - Bubble size: Model size
   - Filters: Task category, model category, model creators

2. **Stacked Area Chart (Model Growth Over Time)**
   - X-axis: Date of model publishing
   - Y-axis: Number of models
   - Stacked by: Task categories (e.g., text generation, classification) grouped by model type (Multimodal, Computer Vision, Natural Language Processing)

3. **Global Map (Company Locations)**
   - Shows where the top AI communities are located.
   - Helps to understand the most influential communities and their distribution by country.

4. **Bar Chart Race (Model Popularity Over Time)**
   - Shows dynamic changes in models' popularity, measured by the number of mentions on Twitter.
   - Each bar represents a model, where its length and position in ranking show popularity. Bars dynamically change in length and ranking to reflect popularity shifts over time.

## Checkpoint 2

This checkpoint marks the implementation of several key components:

1.  **Organization Data Collection Pipeline**: Added a pipeline to collect data about the top organizations on Hugging Face, complementing the existing model metadata collection.
2.  **Backend Implementation**: Developed a backend using Flask to serve the collected model and organization data via a REST API.
3.  **Frontend Development**: Built the frontend interface using HTML, CSS, and JavaScript.
    - Implemented a carousel (`Swiper.js`) for navigation.
    - Created interactive visualizations using Chart.js and D3.js, including:
        - Model Category Distribution (Pie Chart)
        - Top Task Categories (Bar Chart)
        - Model Popularity & Size Evolution (Bubble Chart - Chart.js)
        - Model Growth Over Time (Stacked Area Chart)
        - Top Creators (Bar Chart)
        - Major Tech Company Contributions (Bar Chart)
        - Major Tech Company Model Categories (Pie Chart)
        - Major Tech Company Top Models (Bar Chart)
        - Organization Locations (3D Globe - Three.js)
        - Organizations by Model Count (Bubble Chart - D3.js)
        - Top Organizations by Followers (Bar Chart - D3.js)
        - Top Organizations by Contributors (Bar Chart - D3.js)
4.  **Containerization**: Packaged the application components (backend, frontend, database) into Docker containers and orchestrated them using Docker Compose for easier setup and deployment.

## Screenshots

Here are some examples of the visualizations:

**Model Popularity & Size Evolution (Bubble Chart):**
![Model Bubble Chart](images/bubble.png)

**Model Growth Over Time (Stacked Area Chart):**
![Model Growth Chart](images/growth.png)

**Organization Locations (3D Globe):**
![Organization Globe](images/globe.png)

## Acknowledgments

- **Data Sources**:
    - HuggingFace for providing the model metadata.
    - Wikipedia and GitHub for additional company/organization details.
- **Technologies & Libraries**:
    - The open-source community for essential tools like:
        - *Backend*: Flask
        - *Data Handling*: Pandas, BeautifulSoup
        - *Frontend*: Chart.js, D3.js, Swiper.js, Three.js
        - *Containerization*: Docker, Docker Compose
