import { db } from './firebase-admin';
import admin from 'firebase-admin';

// Real-time contribution updates for all teachers
export interface ContributionUpdate {
  type: 'contribution_added' | 'contribution_updated' | 'contribution_deleted';
  contribution?: any;
  teacherId?: string;
  timestamp: string;
}

class RealtimeContributionService {
  private listeners: Map<string, (update: ContributionUpdate) => void> = new Map();
  private isInitialized = false;

  // Initialize real-time listener for contributions
  initialize() {
    if (this.isInitialized) return;
    
    const contributionsRef = db.collection('contributions_payments');
    
    // Listen for new contributions
    contributionsRef.onSnapshot((snapshot) => {
      snapshot.docChanges().forEach((change) => {
        const update: ContributionUpdate = {
          type: 'contribution_added',
          timestamp: new Date().toISOString(),
        };

        switch (change.type) {
          case 'added':
            update.type = 'contribution_added';
            update.contribution = {
              id: change.doc.id,
              ...change.doc.data()
            };
            break;
            
          case 'modified':
            update.type = 'contribution_updated';
            update.contribution = {
              id: change.doc.id,
              ...change.doc.data()
            };
            break;
            
          case 'removed':
            update.type = 'contribution_deleted';
            update.contribution = {
              id: change.doc.id,
              ...change.doc.data()
            };
            break;
        }

        // Notify all connected teachers
        this.notifyAllListeners(update);
      });
    });

    this.isInitialized = true;
    console.log('Real-time contributions listener initialized');
  }

  // Subscribe to contribution updates
  subscribe(teacherId: string, callback: (update: ContributionUpdate) => void) {
    const key = `teacher_${teacherId}`;
    this.listeners.set(key, callback);
    
    console.log(`Teacher ${teacherId} subscribed to contribution updates`);
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(key);
      console.log(`Teacher ${teacherId} unsubscribed from contribution updates`);
    };
  }

  // Notify all listeners
  private notifyAllListeners(update: ContributionUpdate) {
    this.listeners.forEach((callback, key) => {
      try {
        callback(update);
      } catch (error) {
        console.error(`Error notifying listener ${key}:`, error);
      }
    });
  }

  // Broadcast manual update (for when API routes modify data)
  broadcastUpdate(update: Omit<ContributionUpdate, 'timestamp'>) {
    const fullUpdate: ContributionUpdate = {
      ...update,
      timestamp: new Date().toISOString(),
    };
    
    this.notifyAllListeners(fullUpdate);
  }

  // Get current contribution count for a teacher
  async getContributionCount(teacherId: string, filters?: {
    month?: string;
    year?: string;
    gradeLevel?: string;
  }): Promise<number> {
    try {
      let queryRef: any = db.collection('contributions_payments');
      
      if (filters?.month) queryRef = queryRef.where('month', '==', filters.month);
      if (filters?.year) queryRef = queryRef.where('year', '==', filters.year);
      if (filters?.gradeLevel) queryRef = queryRef.where('gradeLevel', '==', filters.gradeLevel);
      
      const snap = await queryRef.get();
      return snap.size;
    } catch (error) {
      console.error('Error getting contribution count:', error);
      return 0;
    }
  }
}

export const realtimeContributionService = new RealtimeContributionService();
