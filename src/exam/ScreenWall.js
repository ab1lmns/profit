import { createPeer } from './Proctor.js';

// One peer per participant for the entire teacher room. Tiles and the enlarged
// view reuse its MediaStream; opening a participant never interrupts other feeds.
export class ScreenWall {
  constructor({ iceServers, send, update, peerFactory = createPeer, now = Date.now }) {
    Object.assign(this, { iceServers, send, update, peerFactory, now });
    this.entries = new Map();
    this.closed = false;
  }
  publish(entry, change) {
    if (!this.closed && this.entries.get(entry.id) === entry) {
      entry.view = { ...entry.view, ...change };
      this.update(entry.participantId, entry.view);
    }
  }
  remove(entry) {
    this.entries.delete(entry.id);
    entry.peer.close();
    Promise.resolve(this.send(entry.id, 'stop')).catch(() => {});
    if (!this.closed) this.update(entry.participantId, { stream: null, status: 'offline' });
  }
  async sync(participants, connections) {
    if (this.closed) return;
    const ready = new Set(participants.filter(p => p.online && p.screen && !p.submittedAt).map(p => p.id));
    const wanted = connections.filter(c => ready.has(c.participantId));
    for (const entry of this.entries.values()) {
      const stale = !wanted.some(c => c.id === entry.id && c.participantId === entry.participantId);
      const retry = entry.view.status === 'failed' || (entry.view.status !== 'connected' && this.now() - entry.since > 15_000);
      if (stale || retry) this.remove(entry);
    }
    await Promise.allSettled(wanted.map(async connection => {
      if (this.entries.has(connection.id)) return;
      const entry = { ...connection, since: this.now(), queue: Promise.resolve(), view: { stream: null, status: 'connecting' } };
      try {
        entry.peer = this.peerFactory(this.iceServers, (type, payload) => this.send(entry.id, type, payload), stream => this.publish(entry, { stream }), status => {
          if (status !== entry.view.status) entry.since = this.now();
          this.publish(entry, { status, ...(status === 'connected' ? { error: '' } : {}) });
        });
        this.entries.set(entry.id, entry);
        this.publish(entry, {});
        await this.send(entry.id, 'watch');
      } catch (error) {
        if (this.entries.get(entry.id) === entry) this.publish(entry, { status: 'failed', error: error.message });
        else if (!this.closed) this.update(entry.participantId, { stream: null, status: 'failed', error: error.message });
      }
    }));
  }
  receive(message) {
    const entry = this.entries.get(message.from);
    if (!entry) return Promise.resolve();
    if (message.type === 'peer_left') { this.remove(entry); return Promise.resolve(); }
    if (!['offer', 'ice'].includes(message.type)) return Promise.resolve();
    // Keep early ICE and the SDP offer in order even when SSE messages arrive together.
    entry.queue = entry.queue.then(async () => {
      if (this.entries.get(entry.id) === entry) await entry.peer.receive(message.type, message.payload);
    }).catch(error => this.publish(entry, { status: 'failed', error: error.message }));
    return entry.queue;
  }
  close() {
    this.closed = true;
    for (const entry of this.entries.values()) this.remove(entry);
  }
}
