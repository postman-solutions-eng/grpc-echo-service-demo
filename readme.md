# Example GRPC Service - Echo Service

This project has been built as a demonstration to show how GRPC services can be deployed to the SE EKS environment and demonstrate the GRPC capabilities in postman.

## Usage

The echoService.js file has the IP address `0.0.0.0` hard coded, however I noticed that in my local macbook pro this was causing issues.  Instead I had to use my actual internal IP address (currently `10.0.44.59`).  You may need to do the same if you are receiving `12 NOT IMPLEMENTED` errors.

To run this locally, run the following commands:

```
npm install
node services/echoService.js
```

You should see the message: `Server Started`.  This server is now ready to receive GRPC requests.

## Postman Setup

Note, you'll need to use the web version of postman as GRPC is in BETA and not available in the desktop app.

In a workspace, browse to APIs, and select 'New'. Click API and give it a name 'Echo GRPC API' and a version 1.0.0.  Select the Schema Type as Protobuf 3 and click 'Create API'.

Paste the contents of the `protos/echoservice.proto` into the definition section of this API.

Now create a new GRPC API Request, and you should see your schema available there. You can see the two methods available:

- SayHello
- SayHelloStream

You can choose either of these methods.

For the URL, if you're on your local machine you should either enter `0.0.0.0:50051` if it works or you may need to enter your machine IP (e.g. `10.0.44.59:50051`). 

If you're wanting to use the deployed version, the current URL (Subject to change) is: `a9f435a7685a74489affd7a1e20515a4-1133615186.us-east-2.elb.amazonaws.com:50051`

For the payload of the request, you can click the 'generate example' button to generate a sample payload, or enter something like:

```
{
   "firstname" : "John",
   "lastname" : "Smith"
}
```

The 'SayHello' method will simply return the firstname you provide with the message: "Hello <firstname>".  

The 'SayHelloStream' method will stream the contents of the firstname back to you letter by letter.

## Building/Updating

You can update this code, build new docker images and deploy to kubernetes.  There is some setup required though, so first install docker and then follow these guides:

- https://postmanlabs.atlassian.net/wiki/spaces/CS/pages/3743318211/AWS+Command+Line+Interface
- https://postmanlabs.atlassian.net/wiki/spaces/CS/pages/3743580423/Kubernetes

After this you _should_ have access to the kubernetes cluster via your CLI.

### Logging in to docker
Use the following command to log into docker:

```
okta-aws default ecr get-login-password --region us-east-2 | docker login --username AWS --password-stdin 005904641462.dkr.ecr.us-east-2.amazonaws.com
```

This will only work after you've got your okta aws working.  Also you might have some issues with your profile name (mine is called `default` - the 2nd parameter to the okta-aws command).  If yours isn't working, check your `.aws/credentials` file.  The profile name will be whatever is in between the [] on the first line.

### Build a new docker image
You can run the following command to build a new version of the image (once you've tested it thoroughly of course): 

```
docker build -t grpc-server .
```

### Tag the image
Run the following command to tag the image:

```
docker tag grpc-server:latest 005904641462.dkr.ecr.us-east-2.amazonaws.com/kubernetes-grpc-examples:latest
```

Note: I've used the `latest` tag in my example, but it's probably better if you use a specific version.  If you overwrite latest, then the easiest way to roll this out after pushing it is to simply delete the pods.  If you've used a specific tag, then you'll need to update the deployment.yaml file.

### Push the Image
Run the following command to push the image:

```
docker push 005904641462.dkr.ecr.us-east-2.amazonaws.com/kubernetes-grpc-examples:latest
```

Make sure you use the same tag that you used in the previous step.

### Roll out the pods
If you used the `latest` tag, then you can simply delete the pods.  This results in some downtime, but it will be back up pretty quickly:

```
kubectl get pods

NAME                                READY   STATUS    RESTARTS   AGE
grpc-server-demo-68f4b7dbb6-txq7n   1/1     Running   0          42s
quotable-5d7566996c-r946f           1/1     Running   0          20d

kubectl delete pods grpc-server-demo-68f4b7dbb6-txq7n

pod "grpc-server-demo-68f4b7dbb6-txq7n" deleted
```

If you used a specific tag, then you'll instead need to edit the `manifest/deployment.yaml` file and update to the latest tag version (line 17).

After this you can simply run:

```
kubectl apply -f manifest/deployment.yaml
```

This will apply the changes and cycle the pods to the latest version.

## Questions / Comments

Please contact jordan.walsh@postman.com for any questions/comments/queries on the above code.
