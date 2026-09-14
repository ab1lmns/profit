// Screen-only adaptation of InterviewLab's candidate/viewer signaling model.
// Video travels peer-to-peer; server-authenticated SSE relays offers and ICE.
export function createPeer(iceServers, send, onStream, onState) {
  const pc = new RTCPeerConnection({ iceServers });
  let candidates = [];
  pc.onicecandidate = event => { if (event.candidate) send('ice', event.candidate.toJSON()).catch(() => {}); };
  pc.ontrack = event => onStream?.(event.streams[0]);
  pc.onconnectionstatechange = () => onState?.(pc.connectionState);
  return {
    pc,
    async receive(type, payload) {
      if (type === 'ice') {
        if (pc.remoteDescription) await pc.addIceCandidate(payload); else candidates.push(payload);
      } else {
        await pc.setRemoteDescription(payload);
        for (const c of candidates) await pc.addIceCandidate(c);
        candidates = [];
        if (type === 'offer') {
          await pc.setLocalDescription(await pc.createAnswer());
          await send('answer', pc.localDescription.toJSON());
        }
      }
    },
    close() { pc.close(); },
  };
}
