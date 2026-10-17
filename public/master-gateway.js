/**
 * ============================================================================
 * BS E-Learning & IT Zone - Master Gateway Integration Script (Lightweight)
 * ============================================================================
 * 
 * Embeddable script for 100% Real-Time Synchronized Admin-to-Client propagation.
 * Free, zero-maintenance, works worldwide with sub-second latency.
 */

(function (window) {
  'use strict';

  var MasterGatewayClient = {
    version: '2.0.0',
    status: {
      connected: false,
      sse: false,
      channel: false,
      lastUpdate: null
    },
    subscribers: [],

    init: function (options) {
      options = options || {};
      var self = this;
      console.log('[MasterGateway] Initializing Real-Time Gateway Layer...');

      // 1. Setup Cross-Tab Broadcast Channel (0ms)
      if (typeof BroadcastChannel !== 'undefined') {
        try {
          var bc = new BroadcastChannel('bs_master_gateway');
          bc.onmessage = function (e) {
            if (e.data && e.data.key) {
              self.status.lastUpdate = new Date().toISOString();
              self.notify(e.data.key, e.data.value, 'broadcast');
            }
          };
          self.status.channel = true;
        } catch (e) {
          console.warn('[MasterGateway] BroadcastChannel fallback');
        }
      }

      // 2. Setup Server-Sent Events (SSE) Live Feed
      if (typeof EventSource !== 'undefined') {
        try {
          var sse = new EventSource('/api/live-sync');
          sse.onopen = function () {
            self.status.connected = true;
            self.status.sse = true;
            console.log('[MasterGateway] Live SSE Stream Active');
          };
          sse.onmessage = function (e) {
            try {
              var payload = JSON.parse(e.data);
              if (payload.type === 'SYNC_UPDATE' && payload.key) {
                self.status.lastUpdate = new Date().toISOString();
                self.notify(payload.key, payload.value, 'sse');
              }
            } catch (err) {}
          };
          sse.onerror = function () {
            self.status.sse = false;
          };
        } catch (e) {
          console.warn('[MasterGateway] SSE setup fallback');
        }
      }

      // 3. Listen to DOM storage / bs_sync Custom Events
      window.addEventListener('bs_sync', function (e) {
        var detail = e.detail || {};
        if (detail.key) {
          self.status.lastUpdate = new Date().toISOString();
          self.notify(detail.key, detail.value, 'dom');
        }
      });

      return this;
    },

    onSync: function (callback) {
      if (typeof callback === 'function') {
        this.subscribers.push(callback);
      }
      return this;
    },

    notify: function (key, value, source) {
      for (var i = 0; i < this.subscribers.length; i++) {
        try {
          this.subscribers[i](key, value, source);
        } catch (e) {
          console.warn('[MasterGateway] Subscriber callback error:', e);
        }
      }
    },

    pushUpdate: function (key, value) {
      // Send to server gateway endpoint
      return fetch('/api/sync/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: key, value: value })
      }).then(function (res) {
        return res.json();
      });
    }
  };

  // Expose globally
  window.MasterGateway = MasterGatewayClient;

  // Auto-init on load
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    MasterGatewayClient.init();
  } else {
    document.addEventListener('DOMContentLoaded', function () {
      MasterGatewayClient.init();
    });
  }
})(typeof window !== 'undefined' ? window : this);
