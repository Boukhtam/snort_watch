const express = require('express')
const chokidar = require('chokidar');
const cwd = process.cwd()

const app = express()

const default_log_file = cwd

//middlewares
app.use(express.static('public'))

//routes
app.get('/', (req, res) => {
  //res.render('index')
  res.sendFile(__dirname + '/index.html');
})

//Listen on port 3000
server = app.listen(3000, (err) => {
  if (!err) console.log("Server started!")
})

//socket.io instantiation
const io = require("socket.io")(server)

//
const sockets_map = {}

//
let whatcher;

//listen on every connection
io.on('connection', (socket) => {
  console.log('New user connected', socket.id)

  // listen on start monitoring request
  socket.on("start monitoring", (file_path) => {
    console.log("start monitoring requested!")
    sockets_map[socket.id] = socket
    for (key in sockets_map) {
      console.log(key)
    }

    // monitor given file/dir if not monitor the defaafuault one
    const log_file_to_watch = file_path || default_log_file

    // One-liner for given file/directory, ignores .dotfiles
    whatcher = chokidar.watch(log_file_to_watch, {ignored: /(^|[\/\\])\../}).on('all', (event, path) => {
      //console.log(event, path);
      //io.emit('chat message', event, path);
      //[socketid].emit("chat message", event, path);
      for (key_id in sockets_map) {
        sockets_map[key_id].emit("change occured", event, path);
      }

    });
  })

  socket.on("stop monitoring", (file_path) => {
    console.log(`Stop monitoring req: ${socket.id}`)
    // unwatch related files/dirs

    // delete it from sockets_map
    delete sockets_map[socket.id]
  })

  socket.on('cmd request', function(cmd){
    console.log('command: ' + cmd);
  });

  socket.on('disconnect', function(){
    // stop watching files related to this socket
    // code...

    // delete socket 
    delete sockets_map[socket.id]

    // if there is no client, stop whatching all, shut down the service (snort)
    if (Object.keys(sockets_map).length === 0 && sockets_map.constructor === Object) {
      // code to stop watching and stop
    }
      
  });

})
