var grpc = require('@grpc/grpc-js')
var protoLoader = require('@grpc/proto-loader')
var packageDefinition = protoLoader.loadSync(
  __dirname + '/../protos/echoservice.proto',
  {}
)

var echo_proto = grpc.loadPackageDefinition(packageDefinition)

var echoPackage = echo_proto.echo

const host = '10.0.0.126' //0.0.0.0 for depoloyment

const client = new echoPackage.EchoServer(
  `${host}:50051`,
  grpc.credentials.createInsecure()
)

console.log("******* CALLING SAYHELLO METHOD *******");

client.sayHello({ firstname: "Jordan" }, function (err, response) {
  console.log(err)
  console.log('Greeting:', response.message)
})


console.log("******* CALLING SAYHELLOSTREAM METHOD *******");

let sayHelloStreamCall = client.sayHelloStream({ firstname: "Jordan" });

let sayHelloStreamResult = "";

sayHelloStreamCall.on('data', (response) => {
  //console.log(response)
  sayHelloStreamResult += response.message.length > 1 ? "" : response.message;
});

sayHelloStreamCall.on('end', () => {
  console.log("Received " + sayHelloStreamResult + " from sayHelloStream")
});


let name = "Jordan";

let sayHelloClientStreamCall = client.sayHelloClientStream(function (err, response) {
  err && console.log(err)
  console.log(response.message);
});

for(let i = 0; i < name.length; i++) {
  sayHelloClientStreamCall.write({firstname: name.charAt(i)});
}

console.log("******* CALLING SAYHELLOCLIENTSTREAM METHOD *******");
sayHelloClientStreamCall.end();






let sayHelloBiDiStreamCall = client.sayHelloBiDiStream(function (err, response) {
  err && console.log(err)
  console.log(response.message);
});

name = "Jordan";

for(let i = 0; i < name.length; i++) {
  sayHelloBiDiStreamCall.write({firstname: name.charAt(i)});
}

console.log("******* CALLING SAYHELLOBIDICLIENTSTREAM METHOD *******");
sayHelloBiDiStreamCall.end();


let sayHelloBiDiStreamCallResult = "";

sayHelloBiDiStreamCall.on('data', (response) => {
  //console.log(response)
  sayHelloBiDiStreamCallResult += response.message.length > 1 ? "" : response.message;
});

sayHelloBiDiStreamCall.on('end', () => {
  console.log("Received " + sayHelloBiDiStreamCallResult + " from sayHelloBiDiStream")
});
