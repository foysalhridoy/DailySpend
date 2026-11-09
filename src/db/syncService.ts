import { supabase, isSupabaseConfigured } from './supabase';
import { localDb, SyncQueueItem } from './dexie';
import { SyncStatus } from '@/types';

class SyncService {
  private statusListeners: Array<(status: SyncStatus) => void> = [];
  private currentStatus: SyncStatus = navigator.onLine ? 'synced' : 'offline';
  private isSyncing = false;

  constructor() {
    window.addEventListener('online', () => {
      this.updateStatus('syncing');
      this.processQueue();
    });

    window.addEventListener('offline', () => {
      this.updateStatus('offline');
    });
  }

  public getStatus(): SyncStatus {
    return this.currentStatus;
  }

  public subscribeStatus(listener: (status: SyncStatus) => void): () => void {
    this.statusListeners.push(listener);
    listener(this.currentStatus);
    return () => {
      this.statusListeners = this.statusListeners.filter(l => l !== listener);
    };
  }

  private updateStatus(status: SyncStatus) {
    this.currentStatus = status;
    for (const listener of this.statusListeners) {
      try {
        listener(status);
      } catch (err) {
        console.error('Error notifying sync listener', err);
      }
    }
  }

  /**
   * Enqueues a local change to be synced to Supabase
   */
  public async queueChange(
    entity: SyncQueueItem['entity'],
    action: SyncQueueItem['action'],
    recordId: string,
    payload: Record<string, unknown>
  ): Promise<void> {
    await localDb.sync_queue.add({
      entity,
      action,
      recordId,
      payload,
      timestamp: Date.now(),
      retries: 0,
    });

    if (navigator.onLine && isSupabaseConfigured) {
      this.processQueue();
    } else {
      this.updateStatus(navigator.onLine ? 'pending' : 'offline');
    }
  }

  /**
   * Processes all pending items in localDb.sync_queue
   */
  public async processQueue(): Promise<void> {
    if (this.isSyncing) return;
    if (!navigator.onLine) {
      this.updateStatus('offline');
      return;
    }
    if (!isSupabaseConfigured || !supabase) {
      // Local-only mode, mark as synced locally
      this.updateStatus('synced');
      return;
    }

    this.isSyncing = true;
    this.updateStatus('syncing');

    try {
      const items = await localDb.sync_queue.toArray();
      if (items.length === 0) {
        this.updateStatus('synced');
        this.isSyncing = false;
        return;
      }

      for (const item of items) {
        try {
          const tableName = item.entity === 'tracking_period'
            ? 'tracking_periods'
            : item.entity === 'daily_closing'
            ? 'daily_closings'
            : item.entity === 'category'
            ? 'categories'
            : `${item.entity}s`;

          if (item.action === 'create' || item.action === 'update') {
            const { error } = await supabase
              .from(tableName)
              .upsert(item.payload, { onConflict: 'id' });

            if (error) throw error;
          } else if (item.action === 'delete') {
            const { error } = await supabase
              .from(tableName)
              .delete()
              .eq('id', item.recordId);

            if (error) throw error;
          }

          if (item.id) {
            await localDb.sync_queue.delete(item.id);
          }
        } catch (itemErr: unknown) {
          console.error(`Sync error for item ${item.id}:`, itemErr);
          if (item.id) {
            await localDb.sync_queue.update(item.id, {
              retries: (item.retries || 0) + 1,
              error: itemErr instanceof Error ? itemErr.message : String(itemErr),
            });
          }
        }
      }

      const remaining = await localDb.sync_queue.count();
      if (remaining === 0) {
        this.updateStatus('synced');
      } else {
        this.updateStatus('failed');
      }
    } catch (err) {
      console.error('Failed to process sync queue:', err);
      this.updateStatus('failed');
    } finally {
      this.isSyncing = false;
    }
  }
}

export const syncService = new SyncService();

