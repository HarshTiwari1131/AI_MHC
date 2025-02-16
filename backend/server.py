from flask import Flask, request, jsonify
from firebase_init import db  # Import Firestore database
from auth import auth ,signup_user, login_user  # Import authentication functions
from firebase_admin import firestore  # Add this line to import Firestore
from chatbot import generate_response 

from flask_cors import CORS
app = Flask(__name__)

CORS(app, resources={r"/*": {"origins": "http://127.0.0.1:5500"}}) # Enable Cross-Origin Resource Sharing
# Temporary user ID for testing (replace with actual user ID after login)
current_user_id = None
# db = firestore.client()
# Route for user signup
@app.route('/signup', methods=['POST'])
def signup():
    data = request.json
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    try:
        # Create a new user in Firebase Authentication
        user = auth.create_user(email=email, password=password)

        # Create a new document in Firestore for the user
        db.collection('users').document(user.uid).set({
            "email": email,
            "created_at": firestore.SERVER_TIMESTAMP
        })

        return jsonify({
            "message": "Account created successfully",
            "uid": user.uid
        }), 201  # 201 Created status code
    except Exception as e:
        return jsonify({"error": str(e)}), 400

# Route for user login
@app.route('/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    try:
        # Get the user by email
        user = auth.get_user_by_email(email)

        # Return success message and uid
        return jsonify({
            "message": "Login successful",
            "uid": user.uid
        }), 200
    except Exception as e:
        return jsonify({"error": "Invalid email or password"}), 400

# Route for sending and receiving chat messages
@app.route('/chat/<user_id>', methods=['POST'])
def chat(user_id):
    try:
        data = request.json
        message = data.get('message')
        if not message:
            return jsonify({"error": "Message cannot be empty"}), 400
        
        print(f"Received message from user ID {user_id}: {message}")  # Debug log

        # Save user message to Firestore
        try:
            db.collection('users').document(user_id).collection('chats').add({
                "message": message,
                "sender": "user",
                "timestamp": firestore.SERVER_TIMESTAMP
            })
            print(f"User message saved successfully.")  # Debug log
        except Exception as e:
            print(f"Error saving user message to Firestore: {e}")
            return jsonify({"error": "Failed to save user message"}), 500

        # Generate AI response using LangChain
        try:
            ai_response = generate_response(message)
            print(f"Generated AI response: {ai_response}")  # Debug log
        except Exception as e:
            print(f"Error generating AI response: {e}")
            return jsonify({"error": f"Failed to generate AI response: {str(e)}"}), 500


        # Save AI response to Firestore
        try:
            db.collection('users').document(user_id).collection('chats').add({
                "message": ai_response,
                "sender": "ai",
                "timestamp": firestore.SERVER_TIMESTAMP
            })
            print(f"AI response saved successfully.")  # Debug log
        except Exception as e:
            print(f"Error saving AI response to Firestore: {e}")
            return jsonify({"error": "Failed to save AI response"}), 500

        return jsonify({"response": ai_response}), 200

    except Exception as e:
        print(f"Error processing chat request: {e}")  # Debug log
        return jsonify({"error": "An internal server error occurred"}), 500


# Route to fetch chat history
@app.route('/chat/<user_id>/history', methods=['GET'])
def get_chat_history(user_id):
    try:
        # Get the 'limit' parameter from the request
        limit = request.args.get('limit', 5)  # Default limit is 5 if not provided
        limit = int(limit)  # Convert limit to integer

        print(f"Fetching last {limit} messages for user ID: {user_id}")

        # Query Firestore: Fetch messages ordered by timestamp (latest first)
        chats_ref = db.collection('users').document(user_id).collection('chats')
        past_chats = (
            chats_ref.order_by("timestamp", direction=firestore.Query.DESCENDING)
            .limit(limit)
            .stream()
        )

        # Convert messages to a list of dictionaries
        messages = [doc.to_dict() for doc in past_chats]

        print(f"Found {len(messages)} messages")  # Debugging log

        return jsonify({"chats": messages}), 200
    except Exception as e:
        print(f"Error fetching chat history: {e}")  # Debug log
        return jsonify({"error": f"Failed to fetch chat history: {str(e)}"}), 500


if __name__ == '__main__':
    app.run(debug=True)