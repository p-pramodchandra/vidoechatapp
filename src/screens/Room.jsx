import React,{useEffect,useCallback,useState} from "react";
import { useSocket } from "../context/SocketProvider";

import ReactPlayer from 'react-player'
import peer from "../service/peer";


const RoomPage = () =>{
    const socket = useSocket();
    const [remoteSocketId,setRemoteSocketId] = useState(null);
    const [myStream, setMyStream]= useState(); 
    const [remotestream, setRemoteStream] = useState();
    const handleUserJoined = useCallback(({email,id})=>{
        console.log(`Email: ${email} joined the room`);
        setRemoteSocketId(id);
    },[])
    const handleCallUser = useCallback(async()=> {
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: true,
        });
        const offer = await peer.getOffer();
        socket.emit("user:call",{ to: remoteSocketId,offer});
        setMyStream(stream);
        
    },[remoteSocketId,socket]);
    
    const handleIncomingCall = useCallback(async({from, offer})=>{
        setRemoteSocketId(from);
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: true,
        });
        setMyStream(stream);
        console.log(`incoming:call`, from, offer);
        const ans = await peer.getAnswer(offer)
        socket.emit('call:accepted',{to: from,ans})

    },[socket])
     
    const sendStreams = useCallback(() =>{
        for (const track of myStream.getTracks()){
            peer.peer.addTrack(track,myStream)
        }
    },[myStream]);
    const handleCallAccepted = useCallback(async({from,ans})=>{
        peer.setLocalDescription(ans);
        console.log('call accepted')
        sendStreams()
        

    },[sendStreams])

    const handleNegoNeeded = useCallback(async()=>{
        const offer = await peer.getOffer();
        socket.emit('peer:nego:needed',{offer,to:remoteSocketId})
    },[remoteSocketId, socket]);
    
    const handleNegoNeededIncoming = useCallback(async({from,offer})=>{
        const ans = await peer.getAnswer(offer);
        socket.emit('peer:nego:done',{to: from, ans});
    },[socket])

    const handleNegoNeedFinal = useCallback(async({ans})=>{
        await peer.setLocalDescription(ans);
    },[])

    useEffect(()=>{
        peer.peer.addEventListener('negotiationneeded',handleNegoNeeded);
        return()=>{
            peer.peer.removeEventListener('negotiationneeded',handleNegoNeeded);

        }
    },[handleNegoNeeded])

    useEffect(()=>{
        peer.peer.addEventListener('track',async ev =>{
            const remotestream = ev.streams;
            console.log('GOT TRACKS')
            setRemoteStream(remotestream[0]);
        });
    },[]);

    useEffect(()=>{
        socket.on('user:joined', handleUserJoined);
        socket.on('incoming:call', handleIncomingCall);
        socket.on('call:accepted',handleCallAccepted);
        socket.on('peer:nego:needed',handleNegoNeededIncoming);
        socket.on('peer:nego:final',handleNegoNeedFinal);
        return ()=>{
            socket.off('user:joined', handleUserJoined);
            socket.off('incoming:call', handleIncomingCall);
            socket.off('call:accepted',handleCallAccepted);
            socket.off('peer:nego:needed',handleNegoNeededIncoming);
            socket.off('peer:nego:final',handleNegoNeedFinal);
        }
    },[socket,handleUserJoined,handleIncomingCall,handleCallAccepted,handleNegoNeededIncoming,handleNegoNeedFinal])
    return( 
<div style={{ maxWidth: '800px', margin: 'auto', padding: '30px', backgroundColor: '#f9f9f9', borderRadius: '10px', textAlign: 'center', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}>
    <h1 style={{ fontSize: '2em', marginBottom: '20px', color: '#333' }}>Room Page</h1>
    <h4 style={{ fontSize: '1.2em', color: '#555', marginBottom: '20px' }}>{remoteSocketId ? 'Connected' : 'No one in room'}</h4>
    {myStream && <button style={{ padding: '10px 20px', fontSize: '1em', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', margin: '10px', transition: 'background-color 0.3s' }} onClick={sendStreams}>Send Stream</button>}
    {remoteSocketId && <button style={{ padding: '10px 20px', fontSize: '1em', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', margin: '10px', transition: 'background-color 0.3s' }} onClick={handleCallUser}>Call</button>}
    <br />
    {myStream && (
        <div style={{ margin: '20px 0' }}>
            <h2 style={{ fontSize: '1.5em', color: '#333', marginBottom: '10px' }}>My Stream</h2>
            <ReactPlayer
                playing
                muted
                height="200px"
                width="400px"
                url={myStream}
            />
        </div>
    )}
    {remotestream && (
        <div style={{ margin: '20px 0' }}>
            <h2 style={{ fontSize: '1.5em', color: '#333', marginBottom: '10px' }}>Remote Stream</h2>
            <ReactPlayer
                playing
                muted
                height="200px"
                width="400px"
                url={remotestream}
            />
        </div>
    )}
</div>

    
    )
        
}
export default RoomPage;