import React from "react";
import { useState, useCallback, useEffect } from "react";
import {useSocket} from "../context/SocketProvider"
import {useNavigate} from "react-router-dom"

const Lobbyscreen = () =>{
    const [email, setEmail]= useState("");
    const [room, setroom]= useState("");
    const socket= useSocket();
    const navigate = useNavigate();
    
    const handleSubmitForm = useCallback((e) => {
        e.preventDefault();
        socket.emit('room:join',{email, room});
    },
    [email,room, socket]
    );
    const handleJoinRoom = useCallback((data)=>{
        const {email, room} = data
        navigate(`/room/${room}`)
    },[navigate])
    useEffect(()=>
    {
        socket.on("room:join",handleJoinRoom);
        return () => {
            socket.off('room:join',handleJoinRoom)
        }
    },[socket,handleJoinRoom]);
    return(
<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', margin: '0' }}>
    <div style={{ maxWidth: '800px', width: '100%', padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '10px', textAlign: 'center', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}>
        <h1 style={{ fontSize: '2em', marginBottom: '20px', color: '#333' }}>Welcome to the Lobby</h1>
        <form onSubmit={handleSubmitForm} style={{ textAlign: 'center' }}>
            <div style={{ marginBottom: '20px' }}>
                <label htmlFor="email" style={{ fontSize: '1em', color: '#333', display: 'block', marginBottom: '5px' }}>Email Address</label>
                <input 
                    type="email" 
                    id="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)}
                    style={{ 
                        width: '100%', 
                        padding: '10px', 
                        border: '1px solid #ccc', 
                        borderRadius: '5px', 
                        fontSize: '1em', 
                        boxSizing: 'border-box',
                        maxWidth: '300px'
                    }}
                    placeholder="Enter your email"
                    required
                />
            </div>
            <div style={{ marginBottom: '20px' }}>
                <label htmlFor="room" style={{ fontSize: '1em', color: '#333', display: 'block', marginBottom: '5px' }}>Room Number</label>
                <input 
                    type="text" 
                    id="room" 
                    value={room} 
                    onChange={(e) => setroom(e.target.value)}
                    style={{ 
                        width: '100%', 
                        padding: '10px', 
                        border: '1px solid #ccc', 
                        borderRadius: '5px', 
                        fontSize: '1em', 
                        boxSizing: 'border-box', 
                        maxWidth: '300px'
                    }}
                    placeholder="Enter room number"
                    required
                />
            </div>
            <button 
                type="submit" 
                style={{ 
                    padding: '10px 20px', 
                    fontSize: '1em', 
                    backgroundColor: '#007bff', 
                    color: '#fff', 
                    border: 'none', 
                    borderRadius: '5px', 
                    cursor: 'pointer', 
                    transition: 'background-color 0.3s',
                    maxWidth: '300px'
                }}
                disabled={!email || !room}
            >
                Join Now
            </button>
        </form>
    </div>
</div>



    )
}

export default Lobbyscreen;