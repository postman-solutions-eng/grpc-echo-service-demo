var grpc = require('@grpc/grpc-js')
var protoLoader = require('@grpc/proto-loader')
var packageDefinition = protoLoader.loadSync(
  __dirname + '/../protos/echoservice.proto',
  {}
)

var echo_proto = grpc.loadPackageDefinition(packageDefinition)

var echoPackage = echo_proto.echo

/**
 * Implements the SayHello RPC method.
 */
function sayHello (call, callback) {
  console.log('Called with: ', call.request.firstname)
  callback(null, { message: 'Hello ' + call.request.firstname })
}

/**
 * Implements the SayHelloStream RPC method.
 */
function sayHelloStream (call, callback) {
  console.log('Stream function called with: ', call.request.firstname)
  //Lets stream each letter back to the client
  let str = call.request.firstname;
  call.write({"message": "Streaming back the firstname, one letter at a time."})
  for (var i = 0; i < str.length; i++) {
    console.log("streaming back:",str.charAt(i))
    call.write({ "message": str.charAt(i) })
  }
  call.end()
}

/**
 * Starts an RPC server that receives requests for the Greeter service at the
 * sample server port
 */
function main () {
  var server = new grpc.Server()
  server.addService(echoPackage.EchoServer.service, {
    SayHello: sayHello,
    SayHelloStream: sayHelloStream
  })
  server.bindAsync(
    '0.0.0.0:50051',
    grpc.ServerCredentials.createInsecure(),
    () => {
      server.start()
      console.log('server started')
    }
  )
}

main()
