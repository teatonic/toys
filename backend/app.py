import os
from flask import Flask, request, jsonify, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import func
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask_cors import CORS
from werkzeug.utils import secure_filename

# Get the absolute path of the directory where this file is located
basedir = os.path.abspath(os.path.dirname(__file__))

app = Flask(__name__)
CORS(app)
# Configure the SQLite database
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'project.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'super-secret-dev-key')  # Change this for production!
app.config['UPLOAD_FOLDER'] = os.path.join(basedir, 'uploads')


db = SQLAlchemy(app)
bcrypt = Bcrypt(app)
jwt = JWTManager(app)

# Define the User model
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(120), nullable=False)

    def __repr__(self):
        return f'<User {self.username}>'

# Define the Category model
class Category(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)

    def __repr__(self):
        return f'<Category {self.name}>'

# Define the Item model
class Item(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=True)
    image_file = db.Column(db.String(120), nullable=True)
    category_id = db.Column(db.Integer, db.ForeignKey('category.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

    category = db.relationship('Category', backref=db.backref('items', lazy=True))
    user = db.relationship('User', backref=db.backref('items', lazy=True))

    def __repr__(self):
        return f'<Item {self.name}>'

@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({"msg": "Username and password are required"}), 400

    if User.query.filter_by(username=username).first():
        return jsonify({"msg": "Username already exists"}), 400

    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
    new_user = User(username=username, password_hash=hashed_password)
    db.session.add(new_user)
    db.session.commit()

    return jsonify({"msg": "User created successfully"}), 201

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    user = User.query.filter_by(username=username).first()

    if user and bcrypt.check_password_hash(user.password_hash, password):
        access_token = create_access_token(identity=str(user.id))
        return jsonify(access_token=access_token)

    return jsonify({"msg": "Bad username or password"}), 401

@app.route('/api/profile')
@jwt_required()
def profile():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    return jsonify({"id": user.id, "username": user.username}), 200

@app.route('/api/users', methods=['GET'])
def get_users():
    users = User.query.all()
    return jsonify([{"id": u.id, "username": u.username} for u in users])

# Category Routes
@app.route('/api/categories', methods=['GET'])
def get_categories():
    categories_with_counts = db.session.query(
        Category.id,
        Category.name,
        func.count(Item.id).label('item_count')
    ).outerjoin(Item, Category.id == Item.category_id).group_by(Category.id).all()

    return jsonify([{
        "id": c.id,
        "name": c.name,
        "item_count": c.item_count
    } for c in categories_with_counts])

@app.route('/api/categories', methods=['POST'])
@jwt_required()
def create_category():
    data = request.get_json()
    name = data.get('name')
    if not name:
        return jsonify({"msg": "Category name is required"}), 400
    if Category.query.filter_by(name=name).first():
        return jsonify({"msg": "Category already exists"}), 400
    new_category = Category(name=name)
    db.session.add(new_category)
    db.session.commit()
    return jsonify({"id": new_category.id, "name": new_category.name}), 201

# Item Routes
@app.route('/api/items', methods=['GET'])
def get_items():
    query = Item.query
    search_term = request.args.get('search')
    category_id = request.args.get('category')
    user_id = request.args.get('user')

    if search_term:
        query = query.filter(Item.name.contains(search_term))
    if category_id:
        query = query.filter_by(category_id=category_id)
    if user_id:
        query = query.filter_by(user_id=user_id)

    items = query.all()
    return jsonify([{
        "id": item.id,
        "name": item.name,
        "description": item.description,
        "image_file": item.image_file,
        "category": {"id": item.category.id, "name": item.category.name},
        "user": {"id": item.user.id, "username": item.user.username}
    } for item in items])

@app.route('/api/items', methods=['POST'])
@jwt_required()
def create_item():
    if 'image' not in request.files:
        return jsonify({"msg": "No image part"}), 400

    file = request.files['image']
    if file.filename == '':
        return jsonify({"msg": "No selected file"}), 400

    if file:
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)

        name = request.form.get('name')
        description = request.form.get('description')
        category_id = request.form.get('category_id')
        user_id = get_jwt_identity()

        if not all([name, category_id]):
            return jsonify({"msg": "Missing required fields"}), 400

        new_item = Item(
            name=name,
            description=description,
            category_id=category_id,
            user_id=user_id,
            image_file=filename
        )
        db.session.add(new_item)
        db.session.commit()
        return jsonify({"msg": "Item created successfully"}), 201

    return jsonify({"msg": "Something went wrong"}), 500

@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

@app.route('/')
def index():
    return "Hello, World! This is the backend."

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)
