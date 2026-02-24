import { db } from './firebase';
import { collection, onSnapshot, query, where, orderBy } from 'firebase/firestore';

// Client-side real-time contribution updates for all teachers
export interface ContributionUpdate {
  type: 'contribution_added' | 'contribution_updated' | 'contribution_deleted';
  contribution?: any;
  teacherId?: string;
  timestamp: string;
}

class RealtimeContributionService {
  private listeners: Map<string, (update: ContributionUpdate) => void> = new Map();
  private isInitialized = false;
  private unsubscribe: (() => void) | null = null;

  // Initialize real-time listener for contributions
  initialize() {
    if (this.isInitialized) return;
    
    const contributionsRef = collection(db, 'contributions_payments');
    const q = query(contributionsRef, orderBy('paymentDate', 'desc'));
    
    // Listen for new contributions
    this.unsubscribe = onSnapshot(q, (snapshot) => {
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
    console.log('Real-time contributions listener initialized (client-side)');
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

  // Cleanup
  destroy() {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
    this.listeners.clear();
    this.isInitialized = false;
  }
}

export const realtimeContributionService = new RealtimeContributionService();
