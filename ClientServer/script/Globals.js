
// The canvas element.
var g_canvasGUI = document.getElementById( "canvas2D" );
var g_canvasCurtain = document.getElementById( "canvasCurtain" );	
var g_canvasVideo = document.getElementById( "canvasVideo" );

// The context.
var g_ctxGUI = g_canvasGUI.getContext( "2d" );
var g_ctxCurtain = g_canvasCurtain.getContext( "2d" );
var g_ctxVideo = g_canvasVideo.getContext( "2d" );

// Set the inital size of the canvas' to the html window.
g_canvasCurtain.width = window.innerWidth;
g_canvasCurtain.height = window.innerHeight;	
g_canvasGUI.width = window.innerWidth;
g_canvasGUI.height = window.innerHeight;
g_canvasVideo.width = window.innerWidth;
g_canvasVideo.height = window.innerHeight;

var img = document.getElementById( 'loading' );
g_ctxCurtain.clearRect( 0,0, g_ctxCurtain.canvas.width, g_ctxCurtain.canvas.height);
g_ctxCurtain.drawImage( img ,0, 0, window.innerWidth, window.innerHeight );

// Global list of joint names.
var g_jointList = ['head', 'shouldercenter', 'shoulderleft', 'shoulderright', 'elbowleft', 'elbowright', 'handright', 'handleft', 'spine', 'hipright', 'hipleft',
 'kneeright', 'kneeleft', 'footleft', 'footright' ];

 // A default skeleton.
 var g_kinectDefaultData ={
     "elbowleft": {
         "x": -274.7901123046875,
         "y": 280.0702239990234,
         "z": 2308.780859375
     },
     "head": {
         "x": 241.60778045654297,
         "y": 523.9069396972657,
         "z": 2158.64599609375
     },
     "elbowright": {
         "x": 653.9172607421875,
         "y": 216.89061584472657,
         "z": 2262.339697265625
     },
     "kneeright": {
         "x": 281.5267761230469,
         "y": -634.7611511230468,
         "z": 2234.8218017578124
     },
     "device": "kinect",
     "shoulderleft": {
         "x": 8.228845655918121,
         "y": 304.7044708251953,
         "z": 2242.640625
     },
     "footleft": {
         "x": -78.25286865234375,
         "y": -1038.9497192382812,
         "z": 2347.7722412109374
     },
     "hipright": {
         "x": 255.50746459960936,
         "y": -175.0600601196289,
         "z": 2202.8742431640626
     },
     "footright": {
         "x": 280.81434020996096,
         "y": -1053.9205322265625,
         "z": 2347.6310791015626
     },
     "shoulderright": {
         "x": 388.03627624511716,
         "y": 263.89619903564454,
         "z": 2194.360546875
     },
     "handright": {
         "x": 997.0059692382813,
         "y": 280.8474090576172,
         "z": 2333.0134765625
     },
     "shouldercenter": {
         "x": 198.1325653076172,
         "y": 284.3003356933594,
         "z": 2218.5005615234377
     },
     "spine": {
         "x": 174.02362518310548,
         "y": 60.23494758605957,
         "z": 2217.4669189453125
     },
     "kneeleft": {
         "x": -30.573639106750488,
         "y": -610.0912719726563,
         "z": 2241.30546875
     },
     "handleft": {
         "x": -653.9635803222657,
         "y": 304.9511779785156,
         "z": 2292.358349609375
     },
     "hipleft": {
         "x": 44.321907424926756,
         "y": -152.60081939697267,
         "z": 2229.9922607421877
     }
 };
	
// A store of previous skeletons
var g_kinectStore = [];

// A list of limbs.
var g_limbs = [];

// Loading flags.
var g_modelsLoaded = false;
var g_imagesLoaded = false;
var g_playersLoaded = false;
var g_levelCreated = false;

// Video flags
var g_intro = document.getElementById( 'introVid' );
var g_introPlayed = true;
var g_introPlaying = false;
var g_levelOnePlayed = true;
var g_levelOnePlaying = false;
var g_levelTwoPlayed = true;
var g_levelTwoPlaying = false;
var g_levelThreePlayed = true;
var g_levelThreePlaying = false;
var g_levelFourPlayed = true;
var g_levelFourPlaying = false;

// Level flags
var g_gotKey = false;
var g_objectsCollected = false;
var g_reachedMazeGoal = false;
var g_timesUp = false;
var g_waiting = false;
var g_level = 0;
var g_currentLevelFinished = true;

var g_spawnPoints = [];
g_spawnPointsById = {};
var g_goalPoint = new THREE.Vector3( 0,0,0 );
var g_AntiquePoints = [];
var g_keyPoint = THREE.Vector3( 0,0,0 );

// Level objects.
var g_key;
var g_keyImage = new Image();

// Timing flags
var g_deltaTime = new Date();
var g_currentTime = new Date();
var g_lastTime = new Date();
var g_fps = 0;
var g_beginTime;
var g_endTime;
var g_totalTime;

// The scene
var scene = new THREE.Scene();	
scene.fog = new THREE.FogExp2( 0x000000, 0.000035 );

// The id for the game interval.
var g_gameLoop;


/**
	@AUTHOR: James Browne.
	@DESCRIPTION: mesh_loader
	This code is to take all the mesh urls of the models to be loaded
	and process them all sequentially.
	All the models in the scene will be loaded in here and our objects
	will request the model it needs at upon creation.
	
	@TODO:
	Considering there are multiple players in the game all using the limb
	models. I'll add code in here to duplicate models to save reading from
	file again.

*/
var mesh_loader = {	
	
	_meshUrls : 	[],								// Array of maps. key : name, value : url
	_loadedMesh : 	[],								// Array of maps. key : name, value : mesh
	_loaded : 		false,							// Bool to tell if the loading is finished.
	_loader :		new THREE.ColladaLoader(),		// The Three.js loader for collada files.
		
	addMesh : function does( name , url )
	{		
		// Add url to _meshUrls. Increment _numMeshes.
		this._meshUrls.push( { url : url, name : name, loaded : false } );
	},
	
	beginLoading : function it( )
	{		
		// Set off the loading cycle.	
		this.loadItem( );		
	},

	loadItem : function matter( )
	{		
		if( this._meshUrls[ 0 ] != undefined || this._meshUrls[ 0 ] != null )
		{		
			// Set the name of the loading object..
			this._currMeshName = this._meshUrls[ 0 ].name;
			// Get the url of the loading object..
			this._currUrl = this._meshUrls[ 0 ].url;
			// Begin the loading of the object..
			this._loader.load( this._currUrl, this.callback );
		}
		else
		{		
			console.log( "The mesh urls structure is empty. Loading should be finished." );
			g_modelsLoaded = true;
		}
	},
	
	callback : function test( collada )
	{		
		// Store a reference to ourselves, assuming the 'this' is a reference to the window.
		var _self = mesh_loader;
		// Store the model data with a name in the loaded mesh structure.
		if ( _self._currUrl.search( /limbs/i ) != -1 )g_limbs.push( { name : _self._currMeshName, mesh : collada.scene } );
		else _self._loadedMesh.push( { name : _self._currMeshName, mesh : collada.scene } );	
		
		// Pop off the loaded mesh and call the next load.
		_self._meshUrls.shift( );
		_self.loadItem( );
	},
	
	clone : function( object )
	{	
		return ( THREE.SceneUtils.cloneObject( object ) );
	},
	
	cloneLimbs : function() // player.limbs = mesh_loader.cloneLimbs();
	{	
		var newLimbs = {};
		for( i in g_limbs )
		{	
			// Create the mesh.
			newLimbs[ g_limbs[ i ].name ] = this.clone( g_limbs[ i ].mesh );
			// Prepare it and add it to the scene.
			newLimbs[ g_limbs[ i ].name ].updateMatrix();
			scene.add( newLimbs[ g_limbs[ i ].name ] );
			newLimbs[ g_limbs[ i ].name ].name = g_limbs[ i ].name;
			if( g_limbs[ i ].name == 'head')newLimbs[ g_limbs[ i ].name ].scale.set(30,30,30);
			else if  ( g_limbs[ i ].name == 'torso' )newLimbs[ g_limbs[ i ].name ].scale.set(25,25,25);
			else newLimbs[ g_limbs[ i ].name ].scale.set(50,50,50);
		}
		return newLimbs;
	},
	
	getModel : function( name )
	{
		for( i in this._loadedMesh )
		{
			if( name == this._loadedMesh[ i ].name)
			{
				return { name : name, mesh : this.clone( this._loadedMesh[ i ].mesh ) } ;
			}	
		}	
	}
};


var image_loader = {
	
	_successNum : 0,			// The number of load callbacks we get for the listener.
    _errorNum : 0,				// The number of error callbacks we recieved on loading.
    _cache :{},            		// Store them here so we can get them for use. Pass url as a key...sounds gay so might change after test!
    _downloadQueue : [],		// The queue of images to be processed.
    _imagesLoaded : false,		// Are all the images loaded?
	
	queueDownload : function( path )
	{
		this._downloadQueue.push( path );
	},
	
	downloadAll : function()
	{		
		// If there are no images pack it in.
		if ( this._downloadQueue.length === 0 ) 
		{	
			g_imagesLoaded = true;
		}		
		
		// Process all the image urls in the _downloadQueue.
		for ( i in this._downloadQueue ) 
		{	
			var path = this._downloadQueue[ i ];
			var img = new Image();
			
			var manager = this; 
			
			// Add an event listener for a load image. Could be somewhere else maybe.
			img.addEventListener( "load", function() 
			{			
				// Log that it was successfull for debugging.
				console.log( this.src + ' is loaded' );
				
				// Increment the success count.
				manager._successNum += 1;
				
				// Check to see if we're done loading.
				if ( manager.isDone() )
				{				
					g_imagesLoaded = true;
				}
				
			}, false);
			
			// For unsuccessfully loaded images!
			img.addEventListener( "error", function() 
			{		
				// Increment the error counter.
				manager._errorNum += 1;
				
				// Check to see if that was the last one.
				if (manager.isDone()) {
				
					// Call this to start the game or add in your own init()
					downloadCallback();
				}
			}, false);
			
			img.src = path;
			this._cache[ path ] = img;
		}
	
	},
	
	getAsset : function( path )
	{	
		return ( this._cache[ '../img/' + path ] );
	},
	
	isDone : function()
	{	
		// Have the amount of successes and failures so far equalled the total to be processed.
		return ( this._downloadQueue.length  == this._successNum + this._errorNum && this._errorNum == 0);
	}
};



var LEVEL_ONE = {

	_tutorialVideo : document.getElementById( 'tutVid1' ),
	_imageURL : '../img/loading.png',
	_image : new Image(),
	_loading : false,
	_loaded : false,
	_complete : false,
	_playingVid : false,
	_videoFinished : false,
	
	
	_init : function(){
	
		this._image.src = this._imageURL;
	},
	
	_playTutorial : function()
	{	
		if( !this._videoFinished )
		{
			if( !this._playingVid )
			{
				this._tutorialVideo.play();
				this._playingVid = true;
			}
			else
			{
				this._draw();
				this._checkVideoStatus();
			}
		}
		else
		{
			this._loaded = true; // TODO: ADD LEVEL INIT		
		}
		
	},
	
	_checkVideoStatus : function()
	{	
		if( this._tutorialVideo.ended )
		{
			this._videoFinished = true;
			g_levelOnePlayed = true;
			g_canvasVideo.width = window.innerWidth;
			g_canvasVideo.height = window.innerHeight;
		}
	},
	
	_draw : function()
	{		
		g_ctxVideo.drawImage( this._tutorialVideo, 0, 0 ,window.innerWidth, window.innerHeight );
	}
	
};LEVEL_ONE._init();



var LEVEL_TWO = {

	_tutorialVideo : document.getElementById( 'tutVid2' ),
	_imageURL : '../img/loading.png',
	_image : new Image(),
	_loading : false,
	_loaded : false,
	_complete : false,
	_playingVid : false,
	_videoFinished : false,
	
	
	_init : function(){
	
		this._image.src = this._imageURL;
	},
	
	_playTutorial : function()
	{	
		if( !this._videoFinished )
		{
			if( !this._playingVid )
			{
				this._tutorialVideo.play();
				this._playingVid = true;
			}
			else
			{
				this._draw();
				this._checkVideoStatus();
			}
		}
		else
		{
			this._loaded = true; // TODO: ADD LEVEL INIT		
		}
		
	},
	
	_checkVideoStatus : function()
	{	
		if( this._tutorialVideo.ended )
		{
			this._videoFinished = true;
			g_levelTwoPlayed = true;
			g_canvasVideo.width = window.innerWidth;
			g_canvasVideo.height = window.innerHeight;
		}
	},
	
	_draw : function()
	{		
		g_ctxVideo.drawImage( this._tutorialVideo, 0, 0 ,window.innerWidth, window.innerHeight );
	}
	
};



var LEVEL_THREE= {

	_tutorialVideo : document.getElementById( 'tutVid3' ),
	_imageURL : '../img/loading.png',
	_image : new Image(),
	_loading : false,
	_loaded : false,
	_complete : false,
	_playingVid : false,
	_videoFinished : false,
	
	
	_init : function(){
	
		this._image.src = this._imageURL;
	},
	
	_playTutorial : function()
	{	
		if( !this._videoFinished )
		{
			if( !this._playingVid )
			{
				this._tutorialVideo.play();
				this._playingVid = true;
			}
			else
			{
				this._draw();
				this._checkVideoStatus();
			}
		}
		else
		{
			this._loaded = true; // TODO: ADD LEVEL INIT		
		}
		
	},
	
	_checkVideoStatus : function()
	{	
		if( this._tutorialVideo.ended )
		{
			this._videoFinished = true;
			g_levelThreePlayed = true;
			g_canvasVideo.width = window.innerWidth;
			g_canvasVideo.height = window.innerHeight;
		}
	},
	
	_draw : function()
	{		
		g_ctxVideo.drawImage( this._tutorialVideo, 0, 0 ,window.innerWidth, window.innerHeight );
	}
	
};



function loadImages()
{
	// Add images to be downloaded by the manager!
	image_loader.queueDownload( '../img/grassTile01.png' );
	image_loader.queueDownload( '../img/wallTexture.png' );
	image_loader.queueDownload( '../img/ground_plane.png' );
	image_loader.queueDownload( '../img/floor.png' );
	image_loader.queueDownload( '../img/Tree1.png' );
	image_loader.queueDownload( '../img/popcornCeiling.png' );
	image_loader.queueDownload( '../img/wallPaper.png' );
	image_loader.queueDownload( '../img/loading.png' );
	image_loader.queueDownload( '../img/seamlessWall.png' );
	image_loader.queueDownload( '../img/key.png' );
	image_loader.queueDownload( '../img/ming.jpg' );
	image_loader.queueDownload( '../img/congrats.png' );
	image_loader.queueDownload( '../img/floor.jpg' );
	image_loader.queueDownload( '../img/wallpaper1.jpg' );
	image_loader.queueDownload( '../img/wallpaper2.jpg' );
	image_loader.queueDownload( '../img/wallpaper3.jpg' );
	image_loader.queueDownload( '../img/Maze.png' );
	
	image_loader.downloadAll( );
	
};loadImages();



function loadModels()
{
	mesh_loader.addMesh( 'house', '../model/Scene.dae' );			
	mesh_loader.addMesh( 'head', '../model/limbs/head.dae' );
	//mesh_loader.addMesh( 'torso', '../model/limbs/torso.dae' );
	mesh_loader.addMesh( 'torso', '../model/limbs/torso2.dae' );
	mesh_loader.addMesh( 'hand_l', '../model/limbs/hand_l.dae' );
	mesh_loader.addMesh( 'hand_r', '../model/limbs/hand_r.dae' );
	mesh_loader.addMesh( 'forearm_l', '../model/limbs/forearm_l.dae' );
	mesh_loader.addMesh( 'forearm_r', '../model/limbs/forearm_r.dae' );
	mesh_loader.addMesh( 'upperArm_l', '../model/limbs/armUpper_l.dae' );			
	mesh_loader.addMesh( 'upperArm_r', '../model/limbs/armUpper_r.dae' );			
	mesh_loader.addMesh( 'upperLeg_l', '../model/limbs/legUpper_l.dae' );			
	mesh_loader.addMesh( 'upperLeg_r', '../model/limbs/legUpper_r.dae' );			
	mesh_loader.addMesh( 'lowerLeg_l', '../model/limbs/legLower_l.dae' );
	mesh_loader.addMesh( 'lowerLeg_r', '../model/limbs/legLower_r.dae' );			
	mesh_loader.addMesh( 'foot_l', '../model/limbs/foot_l.dae' );
	mesh_loader.addMesh( 'foot_r', '../model/limbs/foot_r.dae' );	

	mesh_loader.addMesh( 'key', '../model/key.dae' );
	//mesh_loader.addMesh( 'lantern', '../model/Lantern.dae' );
	//mesh_loader.addMesh( 'foot_r', '../model/Record.dae' );	
	mesh_loader.addMesh( 'vase', '../model/vase.dae' );
	//mesh_loader.addMesh( 'urn', '../model/urn.dae' );
	//mesh_loader.addMesh( 'brass', '../model/BRASS.dae' );
	//mesh_loader.addMesh( 'tree', '../model/tree1.dae' );
	
	mesh_loader.beginLoading();

};loadModels();



var fadeIn = function()
{				
	// Kill the existing interval.
	clearInterval( g_gameLoop );
	g_ctxCurtain.globalAlpha += 0.005;
	var img = document.getElementById( 'loading' );
	g_ctxCurtain.clearRect( 0,0, g_ctxCurtain.canvas.width, g_ctxCurtain.canvas.height);
	g_ctxCurtain.drawImage( img ,0, 0, window.innerWidth, window.innerHeight );
				
	if( g_ctxCurtain.globalAlpha > 0.99 )
	{
		g_ctxCurtain.globalAlpha = 1;
		g_gameLoop = setInterval( 'gameLoop()', 1/60 );
		return;					
	}
	
	// Makes the fade in recursive to stop execution outside the fading in.
	fadeIn();
};
			
		
		
var fadeOut = function()
{
	//  Kill the existing interval.
	clearInterval( g_gameLoop );
	g_ctxCurtain.globalAlpha -= 0.005;
	var img = document.getElementById( 'loading' );
	g_ctxCurtain.clearRect( 0,0, g_ctxCurtain.canvas.width, g_ctxCurtain.canvas.height);
	g_ctxCurtain.drawImage( img ,0, 0, window.innerWidth, window.innerHeight );
				
	if( g_ctxCurtain.globalAlpha < 0.01 )
	{
		g_ctxCurtain.globalAlpha = 0.0;
		g_gameLoop = setInterval( 'gameLoop()', 1/60 );
		return;
	}
	
	// Doesnt need to be recursive. The level is loaded so it can be a gradual fade out.
	setTimeout( 'fadeOut()', 1/60 );
};



var g_draw = function()
{
	if( g_imagesLoaded )
	{
		g_ctxCurtain.clearRect( 0,0, g_ctxCurtain.canvas.width, g_ctxCurtain.canvas.height);
		g_ctxCurtain.drawImage( image_loader.getAsset( 'loading.png' ) ,0, 0, window.innerWidth, window.innerHeight );
	}	
};



var g_drawVideo = function()
{


};


/**	@Name:	Random Range
	@Brief:	A helper function to get a value between the arguments.
	@Arguments: int min, int max
	@Returns: int random value
*/
function randomRange( min, max ) 
{
	return Math.random()*(max-min) + min;
};


g_canvasCurtain.addEventListener( "webglcontextlost", function(event){

    event.preventDefault();
	
}, false);
