# ESH Home

## Setup Instructions

1. Clone the repository:
   ```bash
   git clone https://guysarig:[TOKEN]@github.com/guysarig/esh_home.git
   ```
   (replace [TOKEN] with the github token supplied separately in the email)

## Requirements

- **Local Testing**: Docker Desktop must be installed.
- **Local Development**: Node.js (with npm and npx) and Python 3 (with pip) must be installed.

## Building & Running the App (Dockerized)

1. Navigate to the project directory:
   ```bash
   cd esh_home
   ```
2. Build and run the Docker containers:
   ```bash
   docker compose build && docker compose up
   ```
3. Test the Frontend:
   ```bash
   curl http://localhost:3000/
   ```
4. Test the Backend:
   ```bash
   curl http://localhost:4100/api/v1/
   ```

## Build Automation Process

Implemented as a pipeline in GitHub Actions (`.github/workflows/build.yml`). You can check the status in the GitHub Actions tab of the repository. This process can be triggered by modifying and committing to the `.env` file at the root of the repository.

## Local Development

To run the app locally:

1. Load the `.env` file:
   ```bash
   set -o allexport; source .env; set +o allexport
   ```
2. Start the Backend:
   ```bash
   cd backend
   python3 -m venv venv
   source venv/bin/activate
   pip install flask flask-cors prometheus_client
   python app.py
   ```
3. Start the Frontend:
   ```bash
   cd frontend
   npm install --legacy-peer-deps
   npm install
   npm start
   ```

*Note: To change the "Hello World" message, modify the `app.py` file in the backend directory.*

## Monitoring

To monitor the application, you can use Prometheus and Grafana.

1. **Prometheus**: 
   - Ensure Prometheus is installed and running.
   - Add the following configuration to your `prometheus.yml`:
     ```yaml
     scrape_configs:
       - job_name: 'esh_home'
         static_configs:
           - targets: ['localhost:9100']
     ```

2. **Grafana**:
   - Install Grafana and configure it to connect to your Prometheus instance.
   - Import dashboards to visualize metrics.

*Note: The backend is already set up to expose metrics using `prometheus_client`.*