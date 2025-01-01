from flask import Flask, jsonify
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app)    

@app.route('/api', methods=['GET'])
def hello_world():
    return jsonify(message="Hello, World!!!!")

if __name__ == '__main__':
    host = os.getenv('REACT_APP_BACKEND_HOST', '0.0.0.0')
    port = int(os.getenv('REACT_APP_BACKEND_PORT'))
    app.run(debug=True, host=host, port=port)