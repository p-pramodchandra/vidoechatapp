const http = require('http');
const { Server } = require('socket.io');

const server = http.createServer((req, res) => {
  
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

 
  res.end('Hello World!');
});

const io = new Server(server, {
  cors: true,
});
const emailToSocketIdmap = new Map();
const socketidtoemailmap = new Map();

io.on('connection', (socket) => {
  console.log('Socket connected', socket.id);

  socket.on('room:join', (data) => {
    const {email, room} = data 
    emailToSocketIdmap.set(email,socket.id);
    socketidtoemailmap.set(socket.id,email);
    io.to(room).emit("user:joined",{email,id:socket.id})
    socket.join(room);
    io.to(socket.id).emit("room:join",data);
  });
  socket.on('user:call',({to, offer})=>{
    io.to(to).emit('incoming:call',{from: socket.id, offer})
});
    socket.on('call:accepted',({to,ans})=>{
    io.to(to).emit('call:accepted',{from: socket.id, ans})
    })

    socket.on('peer:nego:needed',({to,offer})=>{
    console.log('peer:nego:needed',offer);
    io.to(to).emit('peer:nego:needed',{from: socket.id, offer})

    })
    socket.on('peer:nego:done',({to,ans})=>{
        console.log('peer:nego:done',ans);
        io.to(to).emit('peer:nego:final',{from: socket.id, ans})
    
        })
});

const PORT = 8000;

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
