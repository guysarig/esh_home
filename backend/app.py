from flask import Flask, jsonify, request, Response
from flask_cors import CORS
import os
from prometheus_client import Summary, generate_latest, CONTENT_TYPE_LATEST, Counter, Gauge, Histogram

app = Flask(__name__)
CORS(app)

# Define Prometheus metrics
api_call_latency = Histogram('api_call_latency_seconds', 'Latency of API calls', ['endpoint', 'error'])
page_load_time = Summary('page_load_time_seconds', 'Page load time')
request_count = Summary('request_count', 'Total number of requests', ['method', 'endpoint'])
request_latency = Summary('request_latency_seconds', 'Request latency', ['method', 'endpoint'])
fe_error_count = Counter('fe_error_count', 'Total number of frontend errors')
open_sessions = Gauge('open_sessions', 'Number of open sessions')

# Example function to simulate session management
def open_session():
    open_sessions.inc()  # Increment the number of open sessions

def close_session():
    open_sessions.dec()  # Decrement the number of open sessions

# Endpoint to accept metrics from the frontend
@app.route('/metrics', methods=['POST'])
def collect_metrics():
    data = request.json
    if data['metricType'] == 'api_call':
        api_call_latency.labels(endpoint=data['endpoint'], error=data.get('error', False)).observe(data['latency'])
    elif data['metricType'] == 'page_load':
        page_load_time.observe(data['loadTime'] / 1000)  # Convert ms to seconds
    elif data['metricType'] == 'fe_errors':
        fe_error_count.inc()  # Increment the frontend error counter
    return jsonify({"status": "metrics collected"}), 200

# Endpoint for Prometheus to scrape metrics
@app.route('/metrics', methods=['GET'])
def metrics():
    return Response(generate_latest(), mimetype=CONTENT_TYPE_LATEST)

@app.route('/api', methods=['GET'])
def hello_world():
    with api_call_latency.labels(endpoint='/api', error=False).time():
        request_count.labels(method='GET', endpoint='/api').observe(1)
        return jsonify(message="Hello, World!!!!")

# Example usage of session management
@app.route('/start_session', methods=['POST'])
def start_session():
    open_session()
    return jsonify({"status": "session started"}), 200

@app.route('/end_session', methods=['POST'])
def end_session():
    close_session()
    return jsonify({"status": "session ended"}), 200

if __name__ == '__main__':
    host = os.getenv('REACT_APP_BACKEND_HOST', '0.0.0.0')
    port = int(os.getenv('REACT_APP_BACKEND_PORT'))
    app.run(debug=True, host=host, port=port)