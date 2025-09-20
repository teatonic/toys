# #!/bin/bash

# # # Exit on error
# # set -e

# # # Get the absolute path of the script
# # SCRIPT_DIR=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &> /dev/null && pwd)
# # VENV_DIR="$SCRIPT_DIR/backend/venv"
# # UPLOADS_DIR="$SCRIPT_DIR/backend/uploads"

# # # --- Backend Setup ---
# # echo "Setting up backend..."
# # # Create venv if it doesn't exist
# # if [ ! -d "$VENV_DIR" ]; then
# #     python3 -m venv "$VENV_DIR"
# # fi

# # # Create uploads directory if it doesn't exist
# # if [ ! -d "$UPLOADS_DIR" ]; then
# #     mkdir -p "$UPLOADS_DIR"
# # fi

# # # Activate venv, install dependencies, and initialize DB
# # source "$VENV_DIR/bin/activate"
# # pip install -r "$SCRIPT_DIR/backend/requirements.txt"
# # pip install gunicorn
# # python -c "from backend.app import app, db; app.app_context().push(); db.create_all()"

# # # --- Frontend Server ---
# # echo "Starting frontend server..."
# # # Serve the 'frontend' directory on port 8000
# # python3 -m http.server 8000 --directory "$SCRIPT_DIR/frontend" &

# # # --- Backend Server ---
# # echo "Starting backend server..."
# # # Start Gunicorn server for the Flask app
# # gunicorn --workers 3 --bind 0.0.0.0:5000 --chdir "$SCRIPT_DIR/backend" "app:app" &

# # deactivate

# # echo "Deployment complete. Frontend is on http://localhost:8000"
