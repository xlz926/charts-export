(function(){
	var config = {
			JQUERY: 'jquery.1.9.1.min.js',
			TIMEOUT: 2000 /* 2 seconds timout for loading images */
		},
		mapCLArguments,
		render,
		startServer = false,
		args,
		pick,
		dpiCorrection = 1.4,
		system = require('system'),
		fs = require('fs');
		
	    console.log(system.args);
	
		pick = function () {
			var args = arguments, i, arg, length = args.length;
			for (i = 0; i < length; i += 1) {
				arg = args[i];
				if (arg !== undefined && arg !== null && arg !== 'null' && arg != '0') {
					return arg;
				}
			}
		};
	    
		mapCLArguments = function () {
			var map = {},
				i,
				key;

			if (system.args.length < 1) {
				console.log('Commandline Usage: charts-convert.js -infile URL -outfile filename -scale 2.5 -width 300 -constr Chart -callback callback.js');
				console.log(', or run PhantomJS as server: charts-convert.js -host 127.0.0.1 -port 7777');
			}

			for (i = 0; i < system.args.length; i += 1) {
				if (system.args[i].charAt(0) === '-') {
					key = system.args[i].substr(1, i.length);
					if (key === 'infile' || key === 'callback' || key === 'dataoptions' || key === 'globaloptions' || key === 'customcode') {
						// get string from file
						try {
							map[key] = fs.read(system.args[i + 1]);
						} catch (e) {
							console.log('Error: cannot find file, ' + system.args[i + 1]);
							phantom.exit();
						}
					} else {
						map[key] = system.args[i + 1];
					}
				}
			}
			return map;
		};
	
		
		
		render = function (params, runsAsServer, exitCallback) {

			var page = require('webpage').create(),
				messages = {},
				loadChart,
				input,
				constr,
				callback,
				width,
				output,
				outputExtension,
				timer,
				convert,
				exit,
				interval;

			messages.imagesLoaded = 'Highcharts.images.loaded';
			messages.optionsParsed = 'Highcharts.options.parsed';
			messages.callbackParsed = 'Highcharts.cb.parsed';
			window.imagesLoaded = false;
			window.optionsParsed = false;
			window.callbackParsed = false;

			page.onConsoleMessage = function (msg) {
				//console.log(msg);

				/*
				 * Ugly hack, but only way to get messages out of the 'page.evaluate()'
				 * sandbox. If any, please contribute with improvements on this!
				 */

				if (msg === messages.imagesLoaded) {
					window.imagesLoaded = true;
				}
				/* more ugly hacks, to check options or callback are properly parsed */
				if (msg === messages.optionsParsed) {
					window.optionsParsed = true;
				}

				if (msg === messages.callbackParsed) {
					window.callbackParsed = true;
				}
			};

			page.onAlert = function (msg) {
				console.log(msg);
			};

	

			exit = function (result) {
				if (runsAsServer) {
					//Calling page.close(), may stop the increasing heap allocation
					page.close();
				}
				exitCallback(result);
			};

			convert = function () {
					if (!window.imagesLoaded) {
						// render with interval, waiting for all images loaded
						interval = window.setInterval(function () {
							console.log('waiting');
							if (window.imagesLoaded) {
								clearTimeout(timer);
								clearInterval(interval);
								if (outputExtension === 'pdf' || !runsAsServer) {
									page.render(output);
									exit(output);
								} else {
									base64 = page.renderBase64(outputExtension);
									exit(base64);
								}
							}
						}, 50);

						// we have a 3 second timeframe..
						timer = window.setTimeout(function () {
							clearInterval(interval);
							exitCallback('ERROR: While rendering, there\'s is a timeout reached');
						}, config.TIMEOUT);
					} else {
						if (outputExtension === 'pdf' || !runsAsServer) {
							page.render(output);
							exit(output);
						} else {
							base64 = page.renderBase64(outputExtension);
							exit(base64);
						}
					}
				
				
				
				
				
			};

		

			loadChart = function (input, outputFormat, messages) {
				var nodeIter, nodes, elem, opacity, counter, svgElem;

				document.body.style.margin = '0px';
				document.body.innerHTML = input;

				function loadingImage() {
					console.log('Loading image ' + counter);
					counter -= 1;
					if (counter < 1) {
						console.log(messages.imagesLoaded);
					}
				}

				function loadImages() {
					var images = document.getElementsByTagName('image'), i, img;

					if (images.length > 0) {

						counter = images.length;

						for (i = 0; i < images.length; i += 1) {
							img = new Image();
							img.onload = loadingImage;
							/* force loading of images by setting the src attr.*/
							img.src = images[i].href.baseVal;
						}
					} else {
						// no images set property to:imagesLoaded = true
						console.log(messages.imagesLoaded);
					}
				}

				if (outputFormat === 'jpeg') {
					document.body.style.backgroundColor = 'white';
				}


				nodes = document.querySelectorAll('*[stroke-opacity]');

				for (nodeIter = 0; nodeIter < nodes.length; nodeIter += 1) {
					elem = nodes[nodeIter];
					opacity = elem.getAttribute('stroke-opacity');
					elem.removeAttribute('stroke-opacity');
					elem.setAttribute('opacity', opacity);
				}

				// ensure all image are loaded
				loadImages();



				return {
				    html: document.body.innerHTML
				};
			};


			if (params.length < 1) {
				// TODO: log when using as server
				exit("Error: Insuficient parameters");
			} else {
				input = params.infile;
				output = pick(params.outfile, "chart.png");
				constr = pick(params.constr, 'Chart');
				callback = params.callback;
				width = params.width;

				if (input === undefined || input.lenght === 0) {
					exit('Error: Insuficient or wrong parameters for rendering');
				}

				outputExtension = output.split('.').pop();

			

				page.open('about:blank', function(){
				      
					  page.injectJs(config.JQUERY);
					  
					  page.evaluate(loadChart, input, outputExtension, messages);
					 
					 if (!window.optionsParsed) {
							exit('ERROR: the options variable was not available, contains the infile an syntax error? see' + input);
					 }

					 if (callback !== undefined && !window.callbackParsed) {
						exit('ERROR: the callback variable was not available, contains the callbackfile an syntax error? see' + callback);
				  	}
			    });
			
			}
		};
		
		
		
		
		startServer = function (host, port) {
			var server = require('webserver').create(),
				service = server.listen(host + ':' + port,
					function (request, response) {
					
					     console.log(request)
						var jsonStr = request.post,
							params,
							msg;
						try {
							params = JSON.parse(jsonStr);
							if (params.status) {
								// for server health validation
								response.statusCode = 200;
								response.write('OK');
								response.close();
							} else {
								render(params, true, function (result) {
									// TODO: set response headers?
									response.statusCode = 200;
									response.write(result);
									response.close();
								});
							}
						} catch (e) {
							msg = "Failed rendering: \n" + e;
							response.statusCode = 500;
							response.setHeader('Content-Type', 'text/plain');
							response.setHeader('Content-Length', msg.length);
							response.write(msg);
							response.close();
						}
					});

			console.log("OK, PhantomJS is ready.");
		};
    
	
		args = mapCLArguments();
       
		
		if (args.port !== undefined) {
			startServer(args.host, args.port);
		} else {
			// presume commandline usage
			render(args, false, function (msg) {
				console.log(msg);
				phantom.exit();
			});
		}

	
	
})();