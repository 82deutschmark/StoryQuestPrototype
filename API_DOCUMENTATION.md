
# Cyberpunk Story Game API Documentation

This document outlines the API endpoints for the story-based game prototype. The backend is built with Express.js and provides various endpoints for story generation, user progress tracking, and character evolution.

## Base URL

All API requests should be prefixed with `/api`.

## Authentication

Currently, the prototype uses a simplified authentication model with a `user_id` parameter in requests. In production, this will be replaced with proper authentication.

## API Endpoints

### Story Endpoints

#### Get Story Options

Retrieves available options for story generation (conflicts, settings, narrative styles, and moods).

- **URL**: `/story/options`
- **Method**: `GET`
- **Response**: JSON object containing story options
  ```json
  {
    "conflicts": ["Corporate War", "Street Gang Rivalry", ...],
    "settings": ["Night City", "Orbital Space Station", ...],
    "narrative_styles": ["Noir", "Action", ...],
    "moods": ["Dark", "Hopeful", ...]
  }
  ```

#### Generate Story

Creates a new story based on provided parameters.

- **URL**: `/story/generate`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "user_id": "default_user",
    "conflict": "Corporate War",
    "setting": "Night City",
    "narrative_style": "Noir",
    "mood": "Dark",
    "character_info": {},
    "custom_conflict": "Optional custom conflict",
    "custom_setting": "Optional custom setting",
    "custom_narrative": "Optional custom narrative style",
    "custom_mood": "Optional custom mood",
    "protagonist_name": "Optional character name",
    "protagonist_gender": "Optional character gender"
  }
  ```
- **Response**: JSON object containing the generated story
  ```json
  {
    "story_id": 123,
    "generated_story": {
      "title": "Story Title",
      "text": "Story narrative text...",
      "choices": [
        {
          "text": "Choice 1 text",
          "consequence": "Description of consequence",
          "currency_requirements": {"💎": 10}
        },
        {
          "text": "Choice 2 text",
          "consequence": "Description of consequence",
          "currency_requirements": {}
        }
      ],
      "characters": [
        {
          "name": "Character Name",
          "role": "Ally",
          "traits": ["Loyal", "Tech-savvy"],
          "relationshipLevel": 3
        }
      ],
      "mission": {
        "title": "Mission Title",
        "description": "Mission description",
        "reward": {
          "currency": "💎",
          "amount": 50
        }
      }
    }
  }
  ```

#### Get Current Story

Retrieves the current active story for a user.

- **URL**: `/story/current/:userId`
- **Method**: `GET`
- **URL Parameters**: `userId` - The ID of the user
- **Response**: JSON object containing story data and user progress
  ```json
  {
    "story_id": 123,
    "generated_story": {
      "title": "Story Title",
      "text": "Story narrative text...",
      "choices": [...],
      "characters": [...],
      "mission": {...}
    },
    "user_progress": {
      "level": 1,
      "experience_points": 0,
      "currency_balances": {
        "💎": 500,
        "💷": 5000,
        "💶": 5000,
        "💴": 5000,
        "💵": 5000
      },
      "active_missions": [],
      "completed_missions": [],
      "encountered_characters": {}
    }
  }
  ```

#### Make Choice

Processes a user's choice in the story.

- **URL**: `/story/choice`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "user_id": "default_user",
    "story_id": 123,
    "choice_text": "I'll take the high road",
    "choice_type": "predefined",
    "currency_requirements": {"💎": 10}
  }
  ```
- **Response**: Updated story state after choice
  ```json
  {
    "story_id": 123,
    "generated_story": {
      "title": "Story Title",
      "text": "New story text after choice...",
      "choices": [...],
      "characters": [...],
      "mission": {...}
    },
    "user_progress": {...}
  }
  ```

### User Progress Endpoints

#### Get User Progress

Retrieves progress data for a user.

- **URL**: `/progress/:userId`
- **Method**: `GET`
- **URL Parameters**: `userId` - The ID of the user
- **Response**: JSON object with user progress data
  ```json
  {
    "current_node_id": 456,
    "current_story_id": 123,
    "level": 2,
    "experience_points": 150,
    "currency_balances": {
      "💎": 450,
      "💷": 5500,
      "💶": 4800,
      "💴": 5000,
      "💵": 5200
    },
    "active_missions": [789],
    "completed_missions": [456, 457],
    "encountered_characters": {
      "101": {
        "name": "Raven",
        "relationship_level": 3,
        "first_encounter": "2023-09-10T14:22:10.123Z",
        "encounters_count": 3,
        "last_encounter": "2023-09-12T18:45:33.456Z",
        "relationship_history": [
          {
            "change": 1,
            "reason": "Helped on mission",
            "timestamp": "2023-09-11T10:22:10.789Z"
          }
        ]
      }
    },
    "choice_history": [
      {
        "choice_id": 111,
        "choice_text": "I'll help you",
        "node_id": 222,
        "story_id": 123,
        "timestamp": "2023-09-10T14:30:10.123Z"
      }
    ]
  }
  ```

#### Update User Progress

Updates progress data for a user.

- **URL**: `/progress/:userId`
- **Method**: `POST`
- **URL Parameters**: `userId` - The ID of the user
- **Request Body**: JSON object with progress update data
- **Response**: Updated user progress data

### Character Endpoints

#### Get Character Evolution

Retrieves character evolution data.

- **URL**: `/character/:userId/:characterId`
- **Method**: `GET`
- **URL Parameters**: 
  - `userId` - The ID of the user
  - `characterId` - The ID of the character
- **Response**: JSON object with character evolution data
  ```json
  {
    "character_id": 101,
    "status": "active",
    "role": "ally",
    "evolved_traits": ["loyal", "resourceful"],
    "plot_contributions": [
      {
        "plot_point": "Saved protagonist from ambush",
        "importance": 4,
        "timestamp": "2023-09-11T10:22:10.789Z"
      }
    ],
    "relationship_network": {
      "102": {
        "type": "enemy",
        "strength": -7,
        "last_updated": "2023-09-11T10:22:10.789Z"
      }
    },
    "evolution_log": [
      {
        "type": "trait_added",
        "trait": "resourceful",
        "reason": "Found hidden entrance during mission",
        "timestamp": "2023-09-11T10:22:10.789Z"
      }
    ]
  }
  ```

#### Update Character Evolution

Updates a character's evolution.

- **URL**: `/character/:userId/:characterId`
- **Method**: `POST`
- **URL Parameters**: 
  - `userId` - The ID of the user
  - `characterId` - The ID of the character
- **Request Body**: JSON object with character evolution updates
- **Response**: Updated character evolution data

### Mission Endpoints

#### Complete Mission

Marks a mission as completed and awards rewards.

- **URL**: `/missions/complete`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "user_id": "default_user",
    "mission_id": 789
  }
  ```
- **Response**: Success message and updated user data

## Data Models

### Story Generation

```typescript
interface StoryGeneration {
  story_id: number;
  primary_conflict: string;
  setting: string;
  narrative_style: string;
  mood: string;
  generated_story: GeneratedStory;
  created_at: string;
}

interface GeneratedStory {
  title: string;
  text: string;
  choices: Choice[];
  characters: Character[];
  mission: Mission;
}
```

### User Progress

```typescript
interface UserProgress {
  user_id: string;
  current_node_id: number | null;
  current_story_id: number | null;
  level: number;
  experience_points: number;
  currency_balances: {
    [currency: string]: number;
  };
  active_missions: number[];
  completed_missions: number[];
  failed_missions: number[];
  encountered_characters: {
    [characterId: string]: CharacterRelationship;
  };
  choice_history: ChoiceHistoryEntry[];
}
```

### Character Evolution

```typescript
interface CharacterEvolution {
  id: number;
  user_id: string;
  character_id: number;
  story_id: number;
  status: string;
  role: string;
  evolved_traits: string[];
  plot_contributions: PlotContribution[];
  relationship_network: {
    [characterId: string]: Relationship;
  };
  evolution_log: EvolutionLogEntry[];
}
```

### Mission

```typescript
interface Mission {
  id: number;
  user_id: string;
  title: string;
  description: string;
  giver_id: number | null;
  target_id: number | null;
  objective: string;
  difficulty: "easy" | "medium" | "hard";
  reward_currency: string;
  reward_amount: number;
  deadline: string;
  status: "active" | "completed" | "failed";
  progress: number;
  progress_updates: ProgressUpdate[];
  story_id: number | null;
  created_at: string;
  completed_at: string | null;
}
```

## Notes for Frontend Integration

When integrating with the frontend:

1. Always handle error responses properly
2. Implement loading states for asynchronous operations
3. Keep in mind that the API might be extended in the future
4. All API requests should include error handling for both network issues and API errors

## Future API Extensions

The following endpoints are planned for future implementation:

1. User authentication system
2. Inventory management endpoints
3. Social features and sharing
4. Achievement tracking and rewards
