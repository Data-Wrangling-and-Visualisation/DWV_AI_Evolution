from flask import Flask, jsonify, send_from_directory
import os

# Get the absolute path of the directory containing app.py
APP_ROOT = os.path.dirname(os.path.abspath(__file__))
# Path to the frontend folder (one level up from backend, then into frontend)
FRONTEND_FOLDER = os.path.join(APP_ROOT, '..', 'frontend')
# Path to the backend folder (where app.py and model_info.json reside)
BACKEND_FOLDER = APP_ROOT

app = Flask(__name__, static_folder=FRONTEND_FOLDER, static_url_path='')

# Serve index.html from the frontend directory
@app.route('/')
def index():
    return send_from_directory(FRONTEND_FOLDER, 'index.html')

# Serve models_info.json from the backend directory
@app.route('/api/model-info')
def get_model_info():
    json_path = os.path.join(BACKEND_FOLDER, 'models_info.json')
    if os.path.exists(json_path):
        return send_from_directory(BACKEND_FOLDER, 'models_info.json')
    else:
        return jsonify({"error": "models_info.json not found in backend directory"}), 404

# Serve organizations_info.json from the backend directory
@app.route('/api/organizations-info')
def get_organizations_info():
    json_path = os.path.join(BACKEND_FOLDER, 'organizations_info.json')
    if os.path.exists(json_path):
        return send_from_directory(BACKEND_FOLDER, 'organizations_info.json')
    else:
        return jsonify({"error": "organizations_info.json not found in backend directory"}), 404

if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True, port=5001) 