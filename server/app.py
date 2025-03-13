
from flask import Flask, request, jsonify
import json
import os
import logging
from flask_cors import CORS
import sys

# Add the parent directory to the path so we can import the modules
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import the modules from attached assets
from attached_assets.story_maker import generate_story, get_story_options
from attached_assets.mission_generator import generate_mission, complete_mission, fail_mission
from attached_assets.character_evolution_service import evolve_character_traits, update_character_relationships

app = Flask(__name__)
CORS(app)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Check for OpenAI API key
api_key = os.environ.get("OPENAI_API_KEY")
if not api_key:
    logger.warning("OpenAI API key not found in environment variables")

# Mock database for prototyping (will be replaced with real DB later)
users = {}
stories = {}
story_nodes = {}
story_choices = {}
characters = {}

@app.route('/api/story/options', methods=['GET'])
def get_story_options_route():
    """Return available story options for UI display"""
    return jsonify(get_story_options())

@app.route('/api/story/generate', methods=['POST'])
def generate_story_route():
    """Generate a new story based on options"""
    data = request.json
    user_id = data.get('user_id', 'default_user')
    
    # Create user if not exists
    if user_id not in users:
        users[user_id] = {
            'current_node_id': None,
            'current_story_id': None,
            'level': 1,
            'experience_points': 0,
            'currency_balances': {
                "💎": 500,  # Diamonds
                "💷": 5000,  # Pounds
                "💶": 5000,  # Euros
                "💴": 5000,  # Yen
                "💵": 5000,  # Dollars
            },
            'active_missions': [],
            'completed_missions': [],
            'encountered_characters': {},
            'choice_history': []
        }
    
    try:
        # Extract parameters for story generation
        conflict = data.get('conflict', '')
        setting = data.get('setting', '')
        narrative_style = data.get('narrative_style', '')
        mood = data.get('mood', '')
        character_info = data.get('character_info', {})
        custom_conflict = data.get('custom_conflict')
        custom_setting = data.get('custom_setting')
        custom_narrative = data.get('custom_narrative')
        custom_mood = data.get('custom_mood')
        protagonist_name = data.get('protagonist_name')
        protagonist_gender = data.get('protagonist_gender')
        protagonist_level = users[user_id]['level']
        
        # Generate story
        story_result = generate_story(
            conflict=conflict,
            setting=setting,
            narrative_style=narrative_style,
            mood=mood,
            character_info=character_info,
            custom_conflict=custom_conflict,
            custom_setting=custom_setting,
            custom_narrative=custom_narrative,
            custom_mood=custom_mood,
            protagonist_name=protagonist_name,
            protagonist_gender=protagonist_gender,
            protagonist_level=protagonist_level
        )
        
        # Create story ID and save
        story_id = len(stories) + 1
        story_data = json.loads(story_result['story'])
        stories[story_id] = {
            'id': story_id,
            'user_id': user_id,
            'conflict': story_result['conflict'],
            'setting': story_result['setting'],
            'narrative_style': story_result['narrative_style'],
            'mood': story_result['mood'],
            'generated_story': story_data,
            'created_at': None  # Would be a timestamp in a real DB
        }
        
        # Create a mission if one in the story
        if 'mission' in story_data:
            mission_id = len(users[user_id]['active_missions']) + 1
            users[user_id]['active_missions'].append({
                'id': mission_id,
                'title': story_data.get('mission', {}).get('title', ''),
                'description': story_data.get('mission', {}).get('description', ''),
                'status': 'active',
                'reward_currency': story_data.get('mission', {}).get('reward_currency', '💵'),
                'reward_amount': story_data.get('mission', {}).get('reward_amount', 1000),
                'progress': 0,
                'story_id': story_id
            })
            
        # Update user's current story
        users[user_id]['current_story_id'] = story_id
        
        # Return the generated story
        return jsonify({
            'story_id': story_id,
            'generated_story': story_data,
            'user_progress': users[user_id]
        })
        
    except Exception as e:
        logger.error(f"Error generating story: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/story/choice', methods=['POST'])
def make_choice():
    """Record user's choice and return the next story node"""
    data = request.json
    user_id = data.get('user_id', 'default_user')
    story_id = data.get('story_id')
    choice_text = data.get('choice_text')
    choice_type = data.get('choice_type')
    currency_requirements = data.get('currency_requirements', {})
    
    # Check if user exists
    if user_id not in users:
        return jsonify({'error': 'User not found'}), 404
    
    # Check if story exists
    if story_id not in stories:
        return jsonify({'error': 'Story not found'}), 404
    
    # Check if user can afford the choice
    user_data = users[user_id]
    for currency, amount in currency_requirements.items():
        if user_data['currency_balances'].get(currency, 0) < amount:
            return jsonify({'error': f'Not enough {currency}'}), 400
    
    # Spend currency
    for currency, amount in currency_requirements.items():
        user_data['currency_balances'][currency] = user_data['currency_balances'].get(currency, 0) - amount
    
    # Record choice
    user_data['choice_history'].append({
        'choice_text': choice_text,
        'story_id': story_id,
        'timestamp': None  # Would be a timestamp in a real DB
    })
    
    # Generate next story segment
    try:
        # Get previous story data
        previous_story = stories[story_id]['generated_story']
        
        # Generate next story segment based on previous context and choice
        next_story_result = generate_story(
            conflict=stories[story_id]['conflict'],
            setting=stories[story_id]['setting'],
            narrative_style=stories[story_id]['narrative_style'],
            mood=stories[story_id]['mood'],
            previous_choice=choice_text,
            story_context=previous_story.get('story', '')
        )
        
        # Create new story ID and save
        new_story_id = len(stories) + 1
        next_story_data = json.loads(next_story_result['story'])
        stories[new_story_id] = {
            'id': new_story_id,
            'user_id': user_id,
            'conflict': next_story_result['conflict'],
            'setting': next_story_result['setting'],
            'narrative_style': next_story_result['narrative_style'],
            'mood': next_story_result['mood'],
            'generated_story': next_story_data,
            'created_at': None,  # Would be a timestamp in a real DB
            'parent_story_id': story_id  # Store reference to parent story
        }
        
        # Update user's current story
        users[user_id]['current_story_id'] = new_story_id
        
        # Return the next story segment
        return jsonify({
            'story_id': new_story_id,
            'generated_story': next_story_data,
            'user_progress': users[user_id]
        })
        
    except Exception as e:
        logger.error(f"Error generating next story segment: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/missions/complete', methods=['POST'])
def complete_mission_route():
    """Mark a mission as completed and award the reward"""
    data = request.json
    user_id = data.get('user_id', 'default_user')
    mission_id = data.get('mission_id')
    
    # Check if user exists
    if user_id not in users:
        return jsonify({'error': 'User not found'}), 404
    
    # Find mission in active missions
    user_data = users[user_id]
    mission = None
    for m in user_data['active_missions']:
        if m['id'] == mission_id:
            mission = m
            break
    
    if not mission:
        return jsonify({'error': 'Mission not found'}), 404
    
    # Mark mission as completed
    mission['status'] = 'completed'
    mission['progress'] = 100
    
    # Move to completed missions
    user_data['active_missions'].remove(mission)
    user_data['completed_missions'].append(mission)
    
    # Award reward
    currency = mission.get('reward_currency', '💵')
    amount = mission.get('reward_amount', 1000)
    user_data['currency_balances'][currency] = user_data['currency_balances'].get(currency, 0) + amount
    
    # Add experience points
    xp_reward = 100  # Base XP reward
    user_data['experience_points'] += xp_reward
    
    # Check for level up
    import math
    new_level = 1 + int(math.sqrt(user_data['experience_points'] / 100))
    level_up = new_level > user_data['level']
    if level_up:
        user_data['level'] = new_level
    
    return jsonify({
        'success': True,
        'user_progress': user_data,
        'level_up': level_up
    })

@app.route('/api/progress/:user_id', methods=['GET'])
def get_user_progress(user_id):
    """Get user progress data"""
    if user_id not in users:
        return jsonify({'error': 'User not found'}), 404
    
    return jsonify(users[user_id])

@app.route('/api/story/current/:user_id', methods=['GET'])
def get_current_story(user_id):
    """Get user's current story"""
    if user_id not in users:
        return jsonify({'error': 'User not found'}), 404
    
    current_story_id = users[user_id]['current_story_id']
    if not current_story_id or current_story_id not in stories:
        return jsonify({'error': 'No current story'}), 404
    
    return jsonify({
        'story_id': current_story_id,
        'generated_story': stories[current_story_id]['generated_story'],
        'user_progress': users[user_id]
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=3001, debug=True)
