
# Unity Integration Guide

This document outlines how to integrate the prototype's backend with a Unity frontend application.

## Overview

The current prototype uses a React frontend communicating with an Express.js backend via REST API endpoints. When porting to Unity, you'll replace the React frontend with Unity C# scripts while maintaining the same API structure.

## Architecture

The integration will follow this architecture:

```
+-------------+        REST API        +----------------+
|   Unity     |<---------------------->|    Backend     |
| (C# Client) |     JSON Requests      | (Express.js)   |
+-------------+                        +----------------+
```

## Integration Steps

### 1. Unity HTTP Client Setup

Create a C# HTTP client class in Unity to handle API communications:

```csharp
using System;
using System.Collections;
using UnityEngine;
using UnityEngine.Networking;
using System.Text;
using System.Threading.Tasks;

public class GameAPIClient : MonoBehaviour
{
    private readonly string baseUrl = "https://your-backend-url.com/api";
    
    // Get story options
    public IEnumerator GetStoryOptions(Action<StoryOptions> callback)
    {
        using (UnityWebRequest request = UnityWebRequest.Get($"{baseUrl}/story/options"))
        {
            yield return request.SendWebRequest();
            
            if (request.result == UnityWebRequest.Result.Success)
            {
                StoryOptions options = JsonUtility.FromJson<StoryOptions>(request.downloadHandler.text);
                callback(options);
            }
            else
            {
                Debug.LogError($"Error: {request.error}");
                callback(null);
            }
        }
    }
    
    // Generate story
    public IEnumerator GenerateStory(StoryParameters parameters, Action<StoryResponse> callback)
    {
        string jsonData = JsonUtility.ToJson(parameters);
        using (UnityWebRequest request = new UnityWebRequest($"{baseUrl}/story/generate", "POST"))
        {
            byte[] bodyRaw = Encoding.UTF8.GetBytes(jsonData);
            request.uploadHandler = new UploadHandlerRaw(bodyRaw);
            request.downloadHandler = new DownloadHandlerBuffer();
            request.SetRequestHeader("Content-Type", "application/json");
            
            yield return request.SendWebRequest();
            
            if (request.result == UnityWebRequest.Result.Success)
            {
                StoryResponse response = JsonUtility.FromJson<StoryResponse>(request.downloadHandler.text);
                callback(response);
            }
            else
            {
                Debug.LogError($"Error: {request.error}");
                callback(null);
            }
        }
    }
    
    // Make choice
    public IEnumerator MakeChoice(ChoiceParameters parameters, Action<StoryResponse> callback)
    {
        string jsonData = JsonUtility.ToJson(parameters);
        using (UnityWebRequest request = new UnityWebRequest($"{baseUrl}/story/choice", "POST"))
        {
            byte[] bodyRaw = Encoding.UTF8.GetBytes(jsonData);
            request.uploadHandler = new UploadHandlerRaw(bodyRaw);
            request.downloadHandler = new DownloadHandlerBuffer();
            request.SetRequestHeader("Content-Type", "application/json");
            
            yield return request.SendWebRequest();
            
            if (request.result == UnityWebRequest.Result.Success)
            {
                StoryResponse response = JsonUtility.FromJson<StoryResponse>(request.downloadHandler.text);
                callback(response);
            }
            else
            {
                Debug.LogError($"Error: {request.error}");
                callback(null);
            }
        }
    }
    
    // Get user progress
    public IEnumerator GetUserProgress(string userId, Action<UserProgress> callback)
    {
        using (UnityWebRequest request = UnityWebRequest.Get($"{baseUrl}/progress/{userId}"))
        {
            yield return request.SendWebRequest();
            
            if (request.result == UnityWebRequest.Result.Success)
            {
                UserProgress progress = JsonUtility.FromJson<UserProgress>(request.downloadHandler.text);
                callback(progress);
            }
            else
            {
                Debug.LogError($"Error: {request.error}");
                callback(null);
            }
        }
    }
    
    // Additional methods for other endpoints...
}
```

### 2. Data Models in Unity

Create C# classes to match JSON responses:

```csharp
[Serializable]
public class StoryOptions
{
    public string[] conflicts;
    public string[] settings;
    public string[] narrative_styles;
    public string[] moods;
}

[Serializable]
public class StoryParameters
{
    public string user_id = "default_user";
    public string conflict;
    public string setting;
    public string narrative_style;
    public string mood;
    public string custom_conflict;
    public string custom_setting;
    public string custom_narrative;
    public string custom_mood;
    public string protagonist_name;
    public string protagonist_gender;
}

[Serializable]
public class StoryResponse
{
    public int story_id;
    public GeneratedStory generated_story;
    public UserProgress user_progress;
}

[Serializable]
public class GeneratedStory
{
    public string title;
    public string text;
    public Choice[] choices;
    public Character[] characters;
    public Mission mission;
}

[Serializable]
public class Choice
{
    public string text;
    public string consequence;
    public CurrencyRequirement currency_requirements;
}

[Serializable]
public class CurrencyRequirement
{
    // Use Dictionary-like representation for currencies
    // Unity's JsonUtility doesn't natively support dictionaries
    // You may need a custom JSON parser for complex objects
}

[Serializable]
public class Character
{
    public string name;
    public string role;
    public string[] traits;
    public int relationshipLevel;
}

[Serializable]
public class Mission
{
    public string title;
    public string description;
    public Reward reward;
}

[Serializable]
public class Reward
{
    public string currency;
    public int amount;
}

[Serializable]
public class UserProgress
{
    public int level;
    public int experience_points;
    public CurrencyBalance currency_balances;
    public int[] active_missions;
    public int[] completed_missions;
    public CharacterRelationships encountered_characters;
}

// Other required class definitions...
```

### 3. Unity UI Components

Create UI components that render based on the data:

```csharp
public class StoryUIManager : MonoBehaviour
{
    public Text storyTitleText;
    public Text storyContentText;
    public Transform choicesContainer;
    public Button choiceButtonPrefab;
    public GameAPIClient apiClient;
    
    private StoryResponse currentStory;
    
    private void Start()
    {
        // Get current story on start
        StartCoroutine(apiClient.GetCurrentStory("default_user", OnStoryLoaded));
    }
    
    private void OnStoryLoaded(StoryResponse story)
    {
        if (story == null) return;
        
        currentStory = story;
        
        // Update UI
        storyTitleText.text = story.generated_story.title;
        storyContentText.text = story.generated_story.text;
        
        // Clear existing choices
        foreach (Transform child in choicesContainer)
        {
            Destroy(child.gameObject);
        }
        
        // Create choice buttons
        foreach (Choice choice in story.generated_story.choices)
        {
            Button choiceButton = Instantiate(choiceButtonPrefab, choicesContainer);
            choiceButton.GetComponentInChildren<Text>().text = choice.text;
            
            // Set up click handler
            Choice choiceCopy = choice;
            choiceButton.onClick.AddListener(() => OnChoiceSelected(choiceCopy));
        }
    }
    
    private void OnChoiceSelected(Choice choice)
    {
        ChoiceParameters parameters = new ChoiceParameters
        {
            user_id = "default_user",
            story_id = currentStory.story_id,
            choice_text = choice.text,
            choice_type = "predefined",
            currency_requirements = choice.currency_requirements
        };
        
        StartCoroutine(apiClient.MakeChoice(parameters, OnStoryLoaded));
    }
}
```

### 4. Authentication and User Management

For initial prototyping, you can use a fixed `user_id`. For production:

```csharp
public class AuthenticationManager : MonoBehaviour
{
    private string currentUserId = "default_user";
    
    // In a real implementation, this would validate credentials against the backend
    public IEnumerator Login(string username, string password, Action<bool> callback)
    {
        // Mock successful login for prototype
        currentUserId = username;
        callback(true);
        yield return null;
    }
    
    public string GetCurrentUserId()
    {
        return currentUserId;
    }
}
```

## Handling JSON Serialization

Unity's JsonUtility has limitations with dictionaries. For complex JSON structures, consider using:

1. Newtonsoft.Json for Unity (from Unity Asset Store)
2. SimpleJSON library
3. Custom serialization/deserialization logic

## Testing the Integration

1. Deploy your backend to a publicly accessible endpoint
2. Configure your Unity client to use this endpoint
3. Implement logging for all API calls to debug issues
4. Test all major user flows:
   - Creating a new story
   - Making choices
   - Viewing user progress
   - Completing missions

## Performance Considerations

1. Cache responses where appropriate to reduce API calls
2. Implement connection error handling and retry logic
3. Consider using async/await with Tasks for modern C# code
4. Add loading indicators during API calls
5. Implement offline mode for basic functionality

## Security Considerations

1. Use HTTPS for all API communications
2. Implement proper authentication in production
3. Validate all server responses before processing
4. Don't store sensitive information in PlayerPrefs
