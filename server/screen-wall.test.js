import test from 'node:test';
import assert from 'node:assert/strict';
import { ScreenWall } from '../src/exam/ScreenWall.js';

function fixture(sendOverride) {
  const sends = [], peers = [], updates = new Map(); let clock = 1000;
  const wall = new ScreenWall({ iceServers: [], now: () => clock,
    send: async (...args) => { sends.push(args); await sendOverride?.(...args); },
    update: (id, data) => updates.set(id, data),
    peerFactory: (_ice, send, onStream, onState) => {
      const peer = { send, onStream, onState, closed: false, messages: [], async receive(...args) { this.messages.push(args); }, close() { this.closed = true; } };
      peers.push(peer); return peer;
    },
  });
  return { wall, sends, peers, updates, advance: ms => { clock += ms; } };
}
const roster = [ { id: 'a', online: true, screen: true }, { id: 'b', online: true, screen: true } ];
const connections = [{ id: 'connection-a', participantId: 'a' }, { id: 'connection-b', participantId: 'b' }];

test('wall watches every participant and routes offers/ICE to independent peers', async () => {
  const f = fixture(); await f.wall.sync(roster, connections);
  assert.equal(f.peers.length, 2); assert.deepEqual(f.sends.map(s=>s.slice(0,2)), [['connection-a','watch'],['connection-b','watch']]);
  await Promise.all([f.wall.receive({ from: 'connection-b', type: 'ice', payload: 'early-ice' }), f.wall.receive({ from: 'connection-a', type: 'offer', payload: 'offer-a' }), f.wall.receive({ from: 'connection-b', type: 'offer', payload: 'offer-b' })]);
  assert.deepEqual(f.peers[0].messages, [['offer','offer-a']]); assert.deepEqual(f.peers[1].messages, [['ice','early-ice'],['offer','offer-b']]);
  const streamA = { id: 'stream-a' }, streamB = { id: 'stream-b' };
  f.peers[0].onStream(streamA); f.peers[0].onState('connected'); f.peers[1].onStream(streamB); f.peers[1].onState('connected');
  assert.equal(f.updates.get('a').stream, streamA); assert.equal(f.updates.get('b').stream, streamB);
  // Repeated room updates (including opening a detail view) retain the same streams.
  await f.wall.sync(roster, connections); assert.equal(f.peers.length, 2); assert.equal(f.sends.length, 2);
  f.wall.close(); assert.ok(f.peers.every(p => p.closed));
});

test('replacing one participant preserves the other feed and ignores stale messages', async () => {
  const f = fixture(); await f.wall.sync(roster, connections);
  await f.wall.sync(roster, [{ id: 'connection-a-new', participantId: 'a' }, connections[1]]);
  assert.equal(f.peers[0].closed, true); assert.equal(f.peers[1].closed, false); assert.equal(f.peers.length, 3);
  await f.wall.receive({ from: 'connection-a', type: 'offer', payload: 'stale' });
  f.peers[0].onStream({ id: 'stale-stream' }); assert.equal(f.updates.get('a').stream, null);
  await f.wall.sync([{ ...roster[0], screen: false }, roster[1]], connections);
  assert.equal(f.peers[2].closed, true); assert.equal(f.peers[1].closed, false);
  f.wall.close();
});

test('failed or timed out feeds reconnect independently; submission closes its feed', async () => {
  const f = fixture(); await f.wall.sync(roster, connections);
  f.peers[1].onState('connected'); f.advance(16_000);
  await f.wall.sync(roster, connections); assert.equal(f.peers.length, 3); assert.equal(f.peers[0].closed, true); assert.equal(f.peers[1].closed, false);
  f.peers[2].onState('connected');
  await f.wall.sync([{ ...roster[0], submittedAt: 10 }, roster[1]], connections);
  assert.equal(f.peers[2].closed, true); assert.equal(f.peers[1].closed, false);
  f.wall.close(); await f.wall.sync(roster, connections); assert.equal(f.peers.length, 3);
});

test('a watch failure cannot prevent the rest of the classroom from connecting', async () => {
  const f = fixture((id, type) => { if (id === 'connection-a' && type === 'watch') throw new Error('offline'); });
  await f.wall.sync(roster, connections);
  assert.equal(f.updates.get('a').status, 'failed'); assert.equal(f.updates.get('b').status, 'connecting');
  f.wall.close();
});
