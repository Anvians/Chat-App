# Socket.IO

## Importants:
* Connect the client on the server's PORT
* Connect the server on the client's PORT
*This will make them talk*

## Problem faced with the events
```js
socket.emit("event_name", data);
socket.on("event_name", callback);
```

then find out for both **client** and **server** need to know where to talk we need to define the same events for both
like `join_room` in both client and server

*Its on us to pick the name*

## There are some inbuild events
```js
connection     // server only
disconnect     // client & server
connect        // client only
error
connect_error
```


**example:**
```js
io.on("connection", (socket) => {
  console.log("Client connected");
});
```
we **cannot rename** these

## Rooms
To join the room
```js
socket.on('join_room', (data)=>{
        socket.join(data)
    })
```

```js
io.on('connection', (socket) => {
  // join the room named 'some room'
  socket.join('some room');
  
  // broadcast to all connected clients in the room
  io.to('some room').emit('hello', 'world');

  // broadcast to all connected clients except those in the room
  io.except('some room').emit('hello', 'world');

  // leave the room
  socket.leave('some room');
});
```
## Handling disconnection
**caution:**

*Even over a stable network, it is not possible to maintain a connection alive forever.*

**note**

The **Socket.IO client** will automatically try to reconnect after a small delay. However, any missed event during the disconnection period will effectively be **lost for this client**.

## Connection State Recovery

* Here We handle by pretending that there was no disconnection
* This feature temporarily store all the events that are sent by **server** and try to store the state of client when reconnects
    * restore its room
    * send any missed events

*It must be enabled on the server side*
```js
const io = new Server(server, {
  connectionStateRecovery: {}
});
```