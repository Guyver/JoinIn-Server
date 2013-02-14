JoinIn-Server
=============

This is a collection of files that are hosted. The server technologies are mongodb and a node server.
The game files are writen in a combination of HTML5/Three.js. 

###Software Requirements

* Google's Chrome

* Windows 7/8

* Microsoft Kinect SDK Beta


###Hardware Requirements

* 32 bit (x86) or 64 bit (x64) processor

* Dual-core 2.66-GHz or faster processor

* Nvidia 240 or better

* A retail Kinect __for Xbox 360� sensor__, which includes special USB/power cabling


###Instalation

1. Install [mongodb](http://www.mongodb.org/downloads)   
You must spcufy whic version 32 bit or 64 bit and which commands, for which windows version etc....
I see that there is a CreateDB javascrip that you have mad to make some initial db entries?
But this script is not a part of the server installation instruses?
Also mongod need to connect to a server, which server?

2. Copy the data folder from the files and place where mongo looks by default. 

3. Install [Node.js](http://nodejs.org/download/)

4. Change the variable "var socket = io.connect("IPADDRESS:PORT");" in ClientServer/script/main.js to whatever your server ip address is and open the port you desire.


####Start up the Server
1. start mongod : mongo repair; and then mongod

2. Run ClientServer\server.js __Note:__ In windows shell "node server"

The server is now ready and waiting for a connection. The rest is done client side.

* Run the client Kinect application

* Open chrome and enter the ip address:port __example__ http://149.153.4.24:8000 of the server to connect to the game.

* Choose a user from the database and hit enter.

* Play the game.

###Known bugs

* There isnt a development branch yet so the master is the development branch and not stable.

* The networking is still in development and is full of bugs.

* Clients sometimes timeout of the session.

* If clients connect at different times there are some latency issues and can be in different levels at once.

* There is no integration with the Join-In portal presently.

* The server is not user proof yet as it is in test.

* There is a test level currently that is infinite.


