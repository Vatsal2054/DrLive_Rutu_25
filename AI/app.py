from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import google.generativeai as genai
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.prompts import ChatPromptTemplate
from langchain.schema.output_parser import StrOutputParser
import PyPDF2
import os
import json
import re
import logging
from typing import Dict, Any, Optional
from pymongo import MongoClient
from bson import ObjectId

# Basic logging setup
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class MongoJSONEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, ObjectId):
            return str(obj)
        return super().default(obj)

# Load environment variables
load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
MONGO_URI = os.getenv("MONGO_URI")

app = Flask(__name__)
# Improved CORS configuration
CORS(app, resources={
    r"/*": {
        "origins": ["http://localhost:5173", "http://127.0.0.1:3000","*"],
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "supports_credentials": True
    }
})
app.json_encoder = MongoJSONEncoder

# MongoDB setup
try:
    db_client = MongoClient(
        MONGO_URI,
        serverSelectionTimeoutMS=5000,
        connectTimeoutMS=5000,
        socketTimeoutMS=6000,
        retryWrites=True,
        tls=True,
        tlsAllowInvalidCertificates=True
    )
    db_client.server_info()
    logger.info("MongoDB Atlas connection successful!")
    db = db_client.get_database()
    doctors_collection = db["doctors"]
    users_collection = db["users"]
except Exception as e:
    logger.error(f"MongoDB connection error: {str(e)}")
    db = None
    doctors_collection = None
    users_collection = None
    logger.warning("Running with database functionality disabled")

# Initialize Gemini models
try:
    genai.configure(api_key=GEMINI_API_KEY)
    # List available models to identify the correct model name
    models = genai.list_models()
    logger.info(f"Available models: {[model.name for model in models]}")
    gemini_model_name = None
    
    # Find an appropriate Gemini model
    for model in models:
        if "gemini" in model.name.lower():
            if "pro" in model.name.lower():
                gemini_model_name = model.name
                logger.info(f"Selected Gemini model: {gemini_model_name}")
                break
    
    if not gemini_model_name:
        # If no pro model found, use the first available Gemini model
        for model in models:
            if "gemini" in model.name.lower():
                gemini_model_name = model.name
                logger.info(f"Selected alternative Gemini model: {gemini_model_name}")
                break
    
    if not gemini_model_name:
        gemini_model_name = "gemini-1.5-pro"  # Fallback to a common model name
        logger.warning(f"No Gemini model found, using fallback: {gemini_model_name}")
    
    llm = ChatGoogleGenerativeAI(
        model=gemini_model_name,
        google_api_key=GEMINI_API_KEY,
        temperature=0.3,
        timeout=5,
        max_retries=2
    )
except Exception as e:
    logger.error(f"Gemini API initialization error: {str(e)}")
    gemini_model_name = None

class MedicalSystem:
    SPECIALIZATIONS = {
        "Cardiologist": {
            "keywords": ["heart", "chest", "blood pressure", "lungs"],
            "description": "Heart and cardiovascular system specialist"
        },
        "Dermatologist": {
            "keywords": ["skin", "acne", "rash"],
            "description": "Skin, hair, and nail conditions specialist"
        },
        "Pediatrician": {
            "keywords": ["child", "infant", "pediatric"],
            "description": "Children's health specialist"
        },
        "Neurologist": {
            "keywords": ["brain", "headache", "nerve"],
            "description": "Brain, spinal cord, and nervous system specialist"
        },
        "Orthopaedic": {
            "keywords": ["bone", "joint", "muscle", "fracture", "broken", "sprain", "strain"],
            "description": "Bone and joint specialist"
        },
        "Psychiatrist": {
            "keywords": ["anxiety", "depression", "mental"],
            "description": "Mental health specialist"
        },
        "General Medicine": {
            "keywords": ["fever", "cold", "cough"],
            "description": "Primary care and general health conditions"
        }
    }

    def __init__(self):
        try:
            global gemini_model_name
            if gemini_model_name:
                self.model = genai.GenerativeModel(gemini_model_name)
                logger.info(f"Medical system initialized with model: {gemini_model_name}")
            else:
                logger.error("No valid Gemini model name available")
                self.model = None
        except Exception as e:
            logger.error(f"Gemini model initialization error: {str(e)}")
            self.model = None

    @staticmethod
    def extract_text_from_pdf(pdf_path: str) -> str:
        """Extract text from PDF file."""
        text = []
        try:
            with open(pdf_path, "rb") as file:
                reader = PyPDF2.PdfReader(file)
                for page in reader.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text.append(page_text)
            return ' '.join(text)
        except Exception as e:
            raise Exception(f"Error reading PDF: {str(e)}")

    @staticmethod
    def clean_json_response(response_text: str) -> Dict[str, Any]:
        """Clean and parse JSON response."""
        try:
            return json.loads(response_text)
        except json.JSONDecodeError:
            # Try to extract JSON from text
            match = re.search(r'\{.*\}', response_text, re.DOTALL)
            if match:
                try:
                    return json.loads(match.group(0))
                except json.JSONDecodeError:
                    pass
            
            # Try to handle single quotes instead of double quotes
            try:
                fixed_text = response_text.replace("'", '"')
                return json.loads(fixed_text)
            except json.JSONDecodeError:
                pass
                
        return {"error": "Failed to parse AI response", "raw_response": response_text}

    def get_precautions_and_recommendations(self, symptoms: str, language: str = "en-US") -> Dict[str, Any]:
        """Generate precautions and recommendations based on symptoms using Gemini."""
        if self.model is None:
            logger.error("Model is not initialized, returning fallback response")
            return {
                "error": "AI model not initialized",
                "initial_assessment": {
                    "severity": "unknown",
                    "immediate_action_required": False,
                    "seek_emergency": False
                },
                "precautions": [
                    {
                        "category": "General Advice",
                        "measures": ["Please consult with a healthcare professional for proper evaluation"],
                        "priority": "high"
                    }
                ]
            }
            
        # Determine language for the response
        language_prompt = ""
        if language != "en-US":
            language_prompt = f"Respond in {language} language. "
            
        prompt = f"""
        {language_prompt}Analyze these symptoms and provide detailed precautions and recommendations in JSON format:

        Required JSON structure:
        {{
            "initial_assessment": {{
                "severity": "mild/moderate/severe",
                "immediate_action_required": true/false,
                "seek_emergency": true/false
            }},
            "precautions": [
                {{
                    "category": "category name",
                    "measures": ["detailed precautionary measures"],
                    "priority": "high/medium/low"
                }}
            ],
            "lifestyle_recommendations": [
                {{
                    "area": "area of focus",
                    "suggestions": ["specific actionable suggestions"],
                    "duration": "temporary/long-term"
                }}
            ],
            "home_remedies": [
                {{
                    "remedy": "remedy name",
                    "instructions": "how to apply/use",
                    "caution": "any warnings or contraindications"
                }}
            ],
            "when_to_seek_emergency": ["list of warning signs that require immediate medical attention"]
        }}

        Symptoms:
        {symptoms}

        Ensure the response is ONLY the JSON object with no additional text.
        """

        try:
            logger.info(f"Sending prompt to Gemini for symptoms: {symptoms[:50]}...")
            response = self.model.generate_content(prompt)
            logger.info("Successfully received response from Gemini")
            return self.clean_json_response(response.text)
        except Exception as e:
            logger.error(f"Precautions generation error: {str(e)}")
            return {
                "error": f"Precautions generation failed: {str(e)}",
                "initial_assessment": {
                    "severity": "unknown",
                    "immediate_action_required": False,
                    "seek_emergency": False
                },
                "precautions": [
                    {
                        "category": "General Advice",
                        "measures": ["Please consult with a healthcare professional for proper evaluation"],
                        "priority": "high"
                    }
                ]
            }

    @staticmethod
    def find_best_specialty(symptoms: str) -> str:
        """Find best matching specialty based on symptoms."""
        symptoms_lower = symptoms.lower()
        for specialty, info in MedicalSystem.SPECIALIZATIONS.items():
            for keyword in info["keywords"]:
                if keyword in symptoms_lower:
                    return specialty
        return "General Medicine"

    @staticmethod
    def get_doctors_for_specialty(specialty: str) -> list:
        """Get available doctors for a specialty."""
        if doctors_collection is None or users_collection is None:
            # Return empty list if database is not available
            logger.warning("Database connection not available, returning empty doctors list")
            return []
            
        try:
            doctor_cursor = doctors_collection.find(
                {"specialization": specialty, "isAvailable": True},
                {"userId": 1, "degree": 1, "experience": 1}
            ).limit(5)
            print(doctor_cursor)
            doctors = []
            for doctor in doctor_cursor:
                user = users_collection.find_one(
                    {"_id": doctor.get("userId")},
                    {"firstName": 1, "lastName": 1, "address.city": 1}
                )
                
                if user:
                    doctors.append({
                        "doctorId": str(user["_id"]),
                        "name": f"{user.get('firstName', '')} {user.get('lastName', '')}",
                        "degree": doctor.get("degree", ""),
                        "experience": doctor.get("experience", ""),
                        "location": user.get("address", {}).get("city", "")
                    })
            
            # Return the actual doctors found, which may be an empty list if none are available
            return doctors
        except Exception as e:
            logger.error(f"Database error: {str(e)}")
            return []

    def analyze_medical_report(self, text: str, language: str = "en-US") -> Dict[str, Any]:
        """Analyze medical report using Google's Gemini model."""
        if self.model is None:
            logger.error("Model is not initialized, returning fallback response")
            return {"error": "AI model not initialized"}
            
        # Determine language for the response
        language_prompt = ""
        if language != "en-US":
            language_prompt = f"Respond in {language} language. "
            
        prompt = f"""
        {language_prompt}Analyze this medical report as a specialized medical AI. Provide a detailed analysis in JSON format:

        Guidelines:
        1. Extract ALL symptoms mentioned, even mild ones
        2. List ALL possible diseases that match the symptoms
        3. Consider test results and vital signs if present
        4. Recommend specialists based on symptoms and possible conditions
        5. Provide a comprehensive summary of the findings
        6. Include severity assessment of the overall condition

        Required JSON structure:
        {{
            "summary": {{
                "overview": "Brief overview of the case how diagnostic it and need to be reviewed by a specialist",
                "severity_assessment": "mild/moderate/severe",
                "key_findings": ["list of important findings"],
                "urgent_attention": "yes/no",
                "follow_up_timeline": "immediate/within week/routine"
            }},
            "symptoms": [
                {{
                    "symptom": "detailed symptom",
                    "severity": "mild/moderate/severe",
                    "duration": "duration if mentioned",
                    "related_conditions": ["possible related conditions"]
                }}
            ],
            "possible_diseases": [
                {{
                    "disease": "disease name",
                    "confidence": "high/medium/low",
                    "reasoning": "brief explanation",
                    "common_complications": ["possible complications"]
                }}
            ],
            "recommended_doctor": {{
                "primary": {{
                    "specialist": "main specialist needed",
                    "specialty_area": "specific area of expertise",
                    "urgency": "immediate/soon/routine"
                }},
                "secondary": {{
                    "specialist": "additional specialist if needed",
                    "specialty_area": "specific area of expertise",
                    "urgency": "immediate/soon/routine"
                }},
                "reasoning": "explanation for specialist choices"
            }},
            "precautions": [
                {{
                    "precaution": "specific precaution",
                    "importance": "critical/important/recommended",
                    "duration": "how long to follow",
                    "details": "additional details"
                }}
            ],
            "additional_tests": [
                {{
                    "test": "test name",
                    "purpose": "why it's needed",
                    "urgency": "immediate/soon/routine"
                }}
            ],
            "lifestyle_recommendations": [
                {{
                    "category": "diet/exercise/sleep/etc",
                    "recommendation": "specific advice",
                    "importance": "high/medium/low"
                }}
            ]
        }}

        Medical Report:
        {text}

        Ensure the response is ONLY the JSON object with no additional text.
        """

        try:
            response = self.model.generate_content(prompt)
            result = self.clean_json_response(response.text)
            
            # Validate and provide defaults for missing fields
            default_response = {
                "summary": {
                    "overview": "Unable to generate summary due to insufficient information",
                    "severity_assessment": "unknown",
                    "key_findings": ["No significant findings detected"],
                    "urgent_attention": "unknown",
                    "follow_up_timeline": "routine"
                },
                "symptoms": [{"symptom": "No symptoms detected", "severity": "unknown", "duration": "unknown", "related_conditions": []}],
                "possible_diseases": [{"disease": "Unable to determine", "confidence": "low", "reasoning": "Insufficient information", "common_complications": []}],
                "recommended_doctor": {
                    "primary": {
                        "specialist": "General Medicine",
                        "specialty_area": "General health assessment",
                        "urgency": "routine"
                    },
                    "secondary": None,
                    "reasoning": "Default recommendation due to insufficient information"
                },
                "precautions": [{"precaution": "Consult a healthcare provider", "importance": "critical", "duration": "until medical consultation", "details": "Seek professional medical advice"}],
                "additional_tests": [{"test": "General health assessment", "purpose": "Baseline health evaluation", "urgency": "routine"}],
                "lifestyle_recommendations": [{"category": "general", "recommendation": "Maintain healthy lifestyle", "importance": "high"}]
            }
            
            # Merge with defaults for any missing fields
            for key in default_response:
                if key not in result or not result[key]:
                    result[key] = default_response[key]

            # Add specialization details
            if "recommended_doctor" in result:
                primary_specialist = result["recommended_doctor"]["primary"]["specialist"]
                if primary_specialist in self.SPECIALIZATIONS:
                    result["recommended_doctor"]["primary"]["specialty_description"] = self.SPECIALIZATIONS[primary_specialist]
                
                if result["recommended_doctor"]["secondary"] is not None:
                    secondary_specialist = result["recommended_doctor"]["secondary"]["specialist"]
                    if secondary_specialist in self.SPECIALIZATIONS:
                        result["recommended_doctor"]["secondary"]["specialty_description"] = self.SPECIALIZATIONS[secondary_specialist]
                    
            return result
        except Exception as e:
            logger.error(f"Analysis failed: {str(e)}")
            return {
                "error": f"Analysis failed: {str(e)}",
                "raw_response": None
            }

@app.route('/health', methods=['GET'])
def health_check():
    """Simple health check endpoint."""
    return jsonify({"status": "ok", "message": "Service is running"}), 200

@app.route('/analyze', methods=['POST', 'OPTIONS'])
def analyze():
    """Handle medical report analysis requests."""
    if request.method == 'OPTIONS':
        return '', 204
        
    if 'file' not in request.files:
        return jsonify({"error": "No file provided"}), 400
    
    file = request.files['file']
    if file.filename == '' or not file.filename.lower().endswith('.pdf'):
        return jsonify({"error": "Invalid or no file selected"}), 400
    
    # Get language from request
    data = request.form.to_dict()
    language = data.get("language", "en-US")
    
    medical_system = MedicalSystem()
    pdf_path = f"temp_{file.filename}"
    
    try:
        file.save(pdf_path)
        text = medical_system.extract_text_from_pdf(pdf_path)
        result = medical_system.analyze_medical_report(text, language)
        return jsonify(result)
    except Exception as e:
        logger.error(f"Analysis error: {str(e)}")
        return jsonify({"error": str(e)}), 500
    finally:
        if os.path.exists(pdf_path):
            os.remove(pdf_path)

@app.route("/recommend", methods=["POST", "OPTIONS"])
def recommend():
    """Handle symptom-based doctor recommendations with dynamic precautions."""
    if request.method == 'OPTIONS':
        return '', 204
        
    try:
        data = request.get_json()
        logger.info(f"Received request data: {data}")
        
        if not data:
            logger.warning("No JSON data received in request")
            return jsonify({"error": "No data provided in request"}), 400
            
        symptoms = data.get("symptoms", "")
        language = data.get("language", "en-US")
        
        if not symptoms:
            return jsonify({"error": "Symptoms are required."}), 400

        medical_system = MedicalSystem()
        
        # Get specialty and doctors
        specialty = medical_system.find_best_specialty(symptoms)
        doctors = medical_system.get_doctors_for_specialty(specialty)
        
        # Get dynamic precautions and recommendations
        precautions_data = medical_system.get_precautions_and_recommendations(symptoms, language)
        
        response = {
            "recommended_specialty": specialty,
            "specialty_description": medical_system.SPECIALIZATIONS[specialty]["description"],
            "available_doctors": doctors,
            "doctors_available": len(doctors) > 0,  # Flag indicating whether doctors are available
            "precautions_and_recommendations": precautions_data
        }
        
        # Add a message when no doctors are available
        if not doctors:
            response["doctor_availability_message"] = f"No {specialty} doctors are currently available."
        
        return jsonify(response)
            
    except Exception as e:
        logger.error(f"Request error: {str(e)}")
        return jsonify({"error": f"An unexpected error occurred: {str(e)}"}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080, debug=True)