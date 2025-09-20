# Sell Stuff - A Simple E-Commerce Catalog App

This is a simple web application that allows users to create a catalog of items to sell.

## Business Requirements

The application was built to meet the following requirements:

*   **User Management:**
    *   Users can create a new account.
    *   Users can authenticate (log in) to the application.
*   **Item Management:**
    *   Authenticated users can add new items to the catalog.
    *   When adding an item, users can:
        *   Take a photo of the object to sell (simulated with file upload).
        *   Add a description for the object.
        *   Create or select a category to assign to the object.
*   **Catalog Browsing:**
    *   Users can browse the catalog of all items.
    *   Users can search for items by their name.
    *   Users can filter items by their category.
*   **Accessibility:**
    *   The application should be accessible from both desktop and mobile browsers.

## Architecture Design

The application is built with a simple and robust technology stack, chosen for its suitability for rapid development and ease of use.

*   **Backend:**
    *   **Framework:** [Flask](https://flask.palletsprojects.com/) - A lightweight and flexible Python web framework that is easy to get started with and powerful enough for this application's needs.
    *   **Database:** [SQLite](https://www.sqlite.org/index.html) with [Flask-SQLAlchemy](https://flask-sqlalchemy.palletsprojects.com/) - A simple file-based database that is perfect for development and small-scale applications. Flask-SQLAlchemy provides a convenient ORM for interacting with the database.
    *   **Authentication:** [Flask-JWT-Extended](https://flask-jwt-extended.readthedocs.io/) - For handling user authentication with JSON Web Tokens (JWT), a standard and secure method for APIs.
    *   **Password Hashing:** [Flask-Bcrypt](https://flask-bcrypt.readthedocs.io/) - For securely hashing user passwords before storing them in the database.
    *   **CORS:** [Flask-Cors](https://flask-cors.readthedocs.io/) - To handle Cross-Origin Resource Sharing, allowing the frontend to make requests to the backend API.

*   **Frontend:**
    *   **Framework/Libraries:** Plain HTML, CSS, and JavaScript - For simplicity and to avoid the overhead of a large frontend framework. This choice makes the frontend lightweight and easy to understand.
    *   **Structure:** Single-Page Application (SPA) - The application is designed as an SPA, where content is dynamically loaded without full page reloads, providing a smoother user experience.

*   **Image Storage:**
    *   Uploaded images are stored on the server's filesystem in the `backend/uploads` directory. The path to the image is stored in the database.

## Installation Procedure

To run this application locally, please follow these steps:

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd <repository-directory>
    ```

2.  **Set up the backend:**
    *   Navigate to the `backend` directory:
        ```bash
        cd backend
        ```
    *   Install the required Python packages:
        ```bash
        pip install -r requirements.txt
        ```
    *   **Set the `JWT_SECRET_KEY` environment variable.** This is a secret key used for signing JWTs. For development, a default key is provided, but you should set your own for production.
        ```bash
        export JWT_SECRET_KEY='your-own-super-secret-key'
        ```
    *   Run the Flask application. This will also create the `project.db` database file on the first run.
        ```bash
        python app.py
        ```
    *   The backend server will be running on `http://127.0.0.1:5000`.

3.  **Set up the frontend:**
    *   Open a new terminal window.
    *   Navigate to the `frontend` directory:
        ```bash
        cd frontend
        ```
    *   Start a simple Python HTTP server:
        ```bash
        python -m http.server 8000
        ```
    *   The frontend will be accessible at `http://localhost:8000`.

4.  **Access the application:**
    *   Open your web browser and go to `http://localhost:8000`.

## Manual Test Cases

To manually verify the functionality of the application, follow these test cases.

### Test Case 1: User Registration and Login

1.  **Open the application** in your browser at `http://localhost:8000`.
2.  **Click the "Register" link** in the navigation bar.
3.  **Fill in the registration form** with a username (e.g., "testuser") and a password.
4.  **Click the "Register" button.** You should see an alert indicating successful registration.
5.  **You will be taken to the login page.** Fill in the login form with the credentials you just created.
6.  **Click the "Login" button.**
7.  **Verify that you are logged in.** You should see your username and a "Logout" link in the navigation bar.

### Test Case 2: Add a New Item

*Prerequisite: You must be logged in.*

1.  **Click the "Sell an Item" link** in the navigation bar.
2.  **Fill in the "Add Item" form:**
    *   **Name:** e.g., "My Test Item"
    *   **Description:** e.g., "A description for my item."
    *   **Category:** Select a category from the dropdown. If no categories exist, you will need to create one first (this can be done via the API for now).
    *   **Image:** Choose an image file to upload.
3.  **Click the "Add Item" button.** You should see an alert indicating the item was created successfully.
4.  **You will be redirected to the catalog page.** Verify that your new item is visible in the catalog.

### Test Case 3: Search and Filter Items

*Prerequisite: There must be at least one item in the catalog.*

1.  **Go to the catalog page** (the main page when you are logged in).
2.  **Use the search bar** to search for an item by its name. Type a part of the item's name and verify that the list of items is filtered accordingly.
3.  **Use the category dropdown** to filter items by category. Select a category and verify that only items from that category are shown.