import { type User, type Story, type UserProgress, type CharacterEvolution } from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: User): Promise<User>;
  
  // Story operations
  createStory(story: Story): Promise<Story>;
  getStory(id: number): Promise<Story | undefined>;
  getUserStories(userId: number): Promise<Story[]>;
  
  // Progress operations
  getUserProgress(userId: number): Promise<UserProgress | undefined>;
  updateUserProgress(progress: UserProgress): Promise<UserProgress>;
  
  // Character operations
  getCharacterEvolution(userId: number, characterId: string): Promise<CharacterEvolution | undefined>;
  updateCharacterEvolution(evolution: CharacterEvolution): Promise<CharacterEvolution>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private stories: Map<number, Story>;
  private progress: Map<number, UserProgress>;
  private characters: Map<string, CharacterEvolution>;
  private currentId: number;

  constructor() {
    this.users = new Map();
    this.stories = new Map();
    this.progress = new Map();
    this.characters = new Map();
    this.currentId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(user: User): Promise<User> {
    const id = this.currentId++;
    const newUser = { ...user, id };
    this.users.set(id, newUser);
    return newUser;
  }

  async createStory(story: Story): Promise<Story> {
    const id = this.currentId++;
    const newStory = { ...story, id };
    this.stories.set(id, newStory);
    return newStory;
  }

  async getStory(id: number): Promise<Story | undefined> {
    return this.stories.get(id);
  }

  async getUserStories(userId: number): Promise<Story[]> {
    return Array.from(this.stories.values()).filter(story => story.userId === userId);
  }

  async getUserProgress(userId: number): Promise<UserProgress | undefined> {
    return this.progress.get(userId);
  }

  async updateUserProgress(progress: UserProgress): Promise<UserProgress> {
    this.progress.set(progress.userId, progress);
    return progress;
  }

  async getCharacterEvolution(userId: number, characterId: string): Promise<CharacterEvolution | undefined> {
    const key = `${userId}-${characterId}`;
    return this.characters.get(key);
  }

  async updateCharacterEvolution(evolution: CharacterEvolution): Promise<CharacterEvolution> {
    const key = `${evolution.userId}-${evolution.characterId}`;
    this.characters.set(key, evolution);
    return evolution;
  }
}

export const storage = new MemStorage();
