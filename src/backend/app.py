from flask import Flask, jsonify, send_from_directory
import os

# Get the absolute path of the directory containing app.py
APP_ROOT = os.path.dirname(os.path.abspath(__file__))
# Path to the frontend folder (one level up from backend, then into frontend)
FRONTEND_FOLDER = os.path.join(APP_ROOT, '..', 'frontend')
# Path to the data folder (two levels up from backend, then into data)
DATA_FOLDER = os.path.join(APP_ROOT, '..', '..', 'data')

app = Flask(__name__, static_folder=FRONTEND_FOLDER, static_url_path='')

# Serve index.html from the frontend directory
@app.route('/')
def index():
    return send_from_directory(FRONTEND_FOLDER, 'index.html')

# Serve models_info.json from the data directory
@app.route('/api/model-info')
def get_model_info():
    json_path = os.path.join(DATA_FOLDER, 'models_info.json')
    if os.path.exists(json_path):
        return send_from_directory(DATA_FOLDER, 'models_info.json')
    else:
        return jsonify({"error": "models_info.json not found in data directory"}), 404

# Serve organizations_info.json from the data directory
@app.route('/api/organizations-info')
def get_organizations_info():
    json_path = os.path.join(DATA_FOLDER, 'organizations_info.json')
    if os.path.exists(json_path):
        return send_from_directory(DATA_FOLDER, 'organizations_info.json')
    else:
        return jsonify({"error": "organizations_info.json not found in data directory"}), 404

if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True, port=5001) 