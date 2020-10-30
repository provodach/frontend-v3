var eastangle = 30,
	mainradiinumber = 6,
	spacingdeviation = 10,
	lengthPreferenceEast = (0.33),
	lengthPreferenceWest = (0.33),
	lengthPreferenceNorth = (0.33),
	lengthPreferenceSouth = (0.33),
	interpolationFactor = 0.5,
	eastSubradiiPref = 20,
	southSubradiiPref = 20,
	westSubradiiPref = 20,
	northSubradiiPref = 20,
	initialspiraldistance = 5,
	endspiraldistance = 50,
	distanceproductFactor = 1.008,
	meshdeviationFactor = 0.2,
	reverseDistanceFactor = 5,
	genes = [
        eastangle,
        mainradiinumber,
        spacingdeviation,
        lengthPreferenceEast,
        lengthPreferenceWest,
        lengthPreferenceNorth,
        lengthPreferenceSouth,
        interpolationFactor,
        eastSubradiiPref,
        southSubradiiPref,
        westSubradiiPref,
        northSubradiiPref,
        initialspiraldistance,
        endspiraldistance,
        distanceproductFactor,
        meshdeviationFactor,
        reverseDistanceFactor
    ];
		
webthickness = 1.5
webcolor = 'rgba(81, 6, 92, 0.95)'

function inside(point, vs) {
    // ray-casting algorithm based on
    // http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html
    var x = point[0],
    	y = point[1];
    var inside = false;
    for (var i = 0, j = vs.length - 1; i < vs.length; j = i++) {
        var xi = vs[i][0],
        	yi = vs[i][1];
        var xj = vs[j][0],
        	yj = vs[j][1];
        var intersect = ((yi > y) != (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }
    return inside;
};

function getIntersection(from, thread) {
    x1 = from[0][0]
    y1 = from[0][1]
    x2 = from[1][0]
    y2 = from[1][1]
    x3 = thread[0][0]
    y3 = thread[0][1]
    x4 = thread[1][0]
    y4 = thread[1][1]
    x43 = x4 - x3
    y31 = y3 - y1
    x31 = x3 - x1
    y43 = y4 - y3
    y21 = y2 - y1
    x21 = x2 - x1
    t = ((x43 * y31) - (x31 * y43)) / ((x43 * y21) - (x21 * y43))
    intersectionpoint = [x1 + (x2 - x1) * t, y1 + (y2 - y1) * t]
    return intersectionpoint
}

function CreateWeb() {
    Physics({
        timestep: 8,
        sleepDisabled: true
    }, function (world) {
        // bounds of the window
        var viewportBounds = Physics.aabb(0, 0, window.innerWidth, window.innerHeight),
        	edgeBounce, renderer;
			
        // create a renderer
        renderer = Physics.renderer('canvas', {
            el: 'viewport'
        });
        // add the renderer
        world.add(renderer);
		
        // render on each step
        world.on('step', function () {
            world.render();
        });
		
        // constrain objects to these bounds
        edgeBounce = Physics.behavior('edge-collision-detection', {
            aabb: viewportBounds,
            restitution: 0.2,
            cof: 0.2
        });
        world.add(edgeBounce)
        // resize events
        window.addEventListener('resize', function () {
            // as of 0.7.0 the renderer will auto resize... so we just take the values from the renderer
            viewportBounds = Physics.aabb(0, 0, renderer.width, renderer.height);
            // update the boundaries
            edgeBounce.setAABB(viewportBounds);
        }, true);
        // for constraints
        var rigidConstraints = Physics.behavior('verlet-constraints', {
            iterations: 1
        });
        allPoints = []
        allPointsConnections = {}
        connections = []
        // Getting the centre
        centredeviation = 10
        centerX = renderer.width / 2 + 2 * (Math.random() - 0.5) * centredeviation
        centerY = renderer.height / 2 + 2 * (Math.random() - 0.5) * centredeviation
        centrepoint = [centerX, centerY]
        allPointsConnections[centrepoint[0] + '-' + centrepoint[1]] = []
        allPoints.push(centrepoint)
        radiiAngles = []
        radiiArm = []
        anglespacing = 360 / genes[1]
        angleiter = genes[0]
        lengthPreferenceEast = genes[3] * renderer.width
        lengthPreferenceWest = genes[4] * renderer.width
        lengthPreferenceNorth = genes[5] * renderer.height
        lengthPreferenceSouth = genes[6] * renderer.height
        interpolationFactor = genes[7]
        avgprefLength = (lengthPreferenceEast + lengthPreferenceSouth + lengthPreferenceNorth + lengthPreferenceWest) / 4
        mainradiilengths = []
        while (angleiter < 360) {
            radiiAngles.push(angleiter)
            if (angleiter <= 90 && angleiter > 0) {
                y = ((lengthPreferenceSouth - lengthPreferenceEast - 90 * interpolationFactor) / (90 * 90)) * (angleiter * angleiter) + (interpolationFactor * angleiter) + lengthPreferenceEast
                mainradiilengths.push(y)
            } else if (angleiter <= 180 && angleiter > 90) {
                anglecompensate = angleiter - 90
                y = ((lengthPreferenceWest - lengthPreferenceSouth - 90 * interpolationFactor) / (90 * 90)) * (anglecompensate * anglecompensate) + (interpolationFactor * anglecompensate) + lengthPreferenceSouth
                mainradiilengths.push(y)
            } else if (angleiter <= 270 && angleiter > 180) {
                anglecompensate = angleiter - 180
                y = ((lengthPreferenceNorth - lengthPreferenceWest - 90 * interpolationFactor) / (90 * 90)) * (anglecompensate * anglecompensate) + (interpolationFactor * anglecompensate) + lengthPreferenceWest
                mainradiilengths.push(y)
            } else if (angleiter <= 360 && angleiter > 270) {
                anglecompensate = angleiter - 270
                y = ((lengthPreferenceEast - lengthPreferenceNorth - 90 * interpolationFactor) / (90 * 90)) * (anglecompensate * anglecompensate) + (interpolationFactor * anglecompensate) + lengthPreferenceNorth
                mainradiilengths.push(y)
            }
            angleiter = angleiter + anglespacing + (genes[2] * 2 * (Math.random() - 0.5))
        }
        mainradiiPoints = []
        for (i = 0; i < mainradiilengths.length; i++) {
            mainradiiPoints.push([centerX + Math.cos(Math.PI * radiiAngles[i] / 180) * mainradiilengths[i], centerY + Math.sin(Math.PI * radiiAngles[i] / 180) * mainradiilengths[i]])
        }
        for (i = 0; i < mainradiiPoints.length; i++) {
            allPointsConnections[mainradiiPoints[i][0] + '-' + mainradiiPoints[i][1]] = []
            allPoints.push(mainradiiPoints[i])
        }
        possibleborders = [[[0, 0], [renderer.width, 0]], [[renderer.width, 0], [renderer.width, renderer.height]], [[renderer.width, renderer.height], [0, renderer.height]], [[0, renderer.height], [0, 0]]]
        frameHolders = []
        for (k = 0; k < mainradiiPoints.length; k++) {
            nearestindex = 0
            nearestindexdist = 0
            chosenintersect = []
            for (i = 0; i < possibleborders.length; i++) {
                intersect = getIntersection([centrepoint, mainradiiPoints[k]], possibleborders[i])
                dist = Math.sqrt(Math.pow((intersect[0] - mainradiiPoints[k][0]), 2) + Math.pow((intersect[1] - mainradiiPoints[k][1]), 2))
                if (i == 0) {
                    nearestindexdist = dist
                    chosenintersect = intersect
                }
                if (i > 0 && dist < nearestindexdist) {
                    nearestindex = i
                    nearestindexdist = dist
                    chosenintersect = intersect
                }
            }
            allPointsConnections[chosenintersect[0] + '-' + chosenintersect[1]] = []
            allPoints.push(chosenintersect)
            frameHolders.push(chosenintersect)
            connections.push([chosenintersect, mainradiiPoints[k]])
        }
        eastSubradiiPref = genes[8]
        southSubradiiPref = genes[9]
        westSubradiiPref = genes[10]
        northSubradiiPref = genes[11]
        avgpref = (eastSubradiiPref + westSubradiiPref + northSubradiiPref + southSubradiiPref) / 4
        subradiiAngles = []
        allRadii = []
        for (i = 0; i < radiiAngles.length; i++) {
            currentMradii = radiiAngles[i]
            nextMradii = radiiAngles[(i + 1) % radiiAngles.length]
            if (i == radiiAngles.length - 1) {
                nextMradii = nextMradii + 360
            }
            angleiter = currentMradii
            subangles = []
            while (angleiter < nextMradii - avgpref / 2) {
                if (angleiter >= 315 && angleiter < 405) {
                    angleiter = angleiter + eastSubradiiPref
                } else if (angleiter < 45) {
                    angleiter = angleiter + eastSubradiiPref
                } else if (angleiter >= 45 && angleiter < 135) {
                    angleiter = angleiter + southSubradiiPref
                } else if (angleiter >= 135 && angleiter < 225) {
                    angleiter = angleiter + westSubradiiPref
                } else if (angleiter >= 225 && angleiter < 315) {
                    angleiter = angleiter + northSubradiiPref
                }
                subangles.push(angleiter % 360)
            }
            subangles.splice(subangles.length - 1, 1)
            subradiiAngles.push(subangles)
        }
        allRadiiAngles = []
        subradiiPoints = []
        for (i = 0; i < subradiiAngles.length; i++) {
            angleset = subradiiAngles[i]
            subpoints = []
            allRadii.push(mainradiiPoints[i])
            arm = []
            allRadiiAngles.push(radiiAngles[i])
            radiiArm.push(arm)
            for (k = 0; k < angleset.length; k++) {
                arm = []
                scale = 200
                angledirection = [centerX + scale * Math.cos(Math.PI * angleset[k] / 180), centerY + scale * Math.sin(Math.PI * angleset[k] / 180)]
                intersect = getIntersection([centrepoint, angledirection], [mainradiiPoints[i], mainradiiPoints[(i + 1) % mainradiiPoints.length]])
                subpoints.push(intersect)
                allPointsConnections[intersect[0] + '-' + intersect[1]] = []
                allPoints.push(intersect)
                allRadii.push(intersect)
                allRadiiAngles.push(angleset[k])
                radiiArm.push(arm)
            }
            subradiiPoints.push(subpoints)
        }
        endspiraldistance = genes[13]
        if (endspiraldistance > avgprefLength) {
            endspiraldistance = avgprefLength / 6
        }
        initialspiraldistance = genes[12]
        distance = initialspiraldistance
        lastdistance = distance
        spiralincrement = (endspiraldistance - initialspiraldistance) / allRadii.length
        initRadiiAnglesIndex = Math.floor(Math.random() * allRadiiAngles.length)
        initRadiiAngles = allRadiiAngles[initRadiiAnglesIndex]
        currentIndex = initRadiiAnglesIndex
        lastRadiiIndex = currentIndex
        onRadiiPoints = []
        spiralPoints = []
        previouspoint = centrepoint
        for (i = 0; i < allRadiiAngles.length; i++) {
            currentRadiiAngle = allRadiiAngles[(currentIndex + i) % allRadiiAngles.length]
            point = [centerX + (Math.cos(currentRadiiAngle * Math.PI / 180) * distance), centerY + (Math.sin(currentRadiiAngle * Math.PI / 180) * (distance))]
            connections.push([previouspoint, point])
            allPointsConnections[point[0] + '-' + point[1]] = []
            allPoints.push(point)
            allPointsConnections[centrepoint[0] + '-' + centrepoint[1]].push(point)
            allPointsConnections[point[0] + '-' + point[1]].push(centrepoint)
            connections.push([centrepoint, point])
            lastdistance = distance
            distance = distance + spiralincrement
            onRadiiPoints.push(point)
            spiralPoints.push(point)
            lastRadiiIndex = (currentIndex + i) % allRadiiAngles.length
            previouspoint = point
            radiiArm[(currentIndex + i) % allRadiiAngles.length].push(point)
        }
        webFrame = mainradiiPoints
        nextPointStatus = 1
        radiiIter = 1
        distance = lastdistance
        iterdirection = 1
        distanceproductFactor = genes[14]
        distance = distance * distanceproductFactor
        noRoomDoubleCheck = 0
        meshdeviationFactor = genes[15]
        reverseDistanceFactor = genes[16]
        while (nextPointStatus == 1) {
            currentIndex = (lastRadiiIndex + radiiIter) % allRadiiAngles.length
            currentRadiiAngle = allRadiiAngles[currentIndex]
            pointchosen = [centerX + (Math.cos(currentRadiiAngle * Math.PI / 180) * distance), centerY + (Math.sin(currentRadiiAngle * Math.PI / 180) * (distance))]
            if (inside(pointchosen, webFrame) == false) {
                iterdirection = (-1) * iterdirection
                radiiIter = radiiIter + 2 * iterdirection
                distance = (distance * Math.pow((distanceproductFactor), (reverseDistanceFactor))) + (meshdeviationFactor * (Math.random() - 0.5) * 2)
                noRoomDoubleCheck = noRoomDoubleCheck + 1
                if (noRoomDoubleCheck >= 2) {
                    break
                }
            } else {
                radiiIter = radiiIter + iterdirection
                connections.push([previouspoint, pointchosen])
                allPointsConnections[pointchosen[0] + '-' + pointchosen[1]] = []
                allPoints.push(pointchosen)
                // connections.push([pointchosen, onRadiiPoints[onRadiiPoints.length - allRadiiAngles.length]])
                onRadiiPoints.push(pointchosen)
                radiiArm[currentIndex].push(pointchosen)
                previouspoint = pointchosen
                distance = distance * distanceproductFactor + (meshdeviationFactor * (Math.random() - 0.5) * 2)
                noRoomDoubleCheck = 0
            }
        }
        for (i = 0; i < radiiArm.length; i++) {
            arm = radiiArm[i]
            for (k = 0; k < arm.length - 1; k++) {
                connections.push([arm[k], arm[k + 1]])
            }
            connections.push([arm[arm.length - 1], allRadii[i]])
        }
        for (i = 0; i < allRadii.length; i++) {
            connections.push([allRadii[(i + 1) % allRadii.length], allRadii[i]])
        }
        allPointsEntities = []
        allPointsEntitiesIDs = {}
        for (i = 0; i < allPoints.length; i++) {
            entity = Physics.body('circle', {
                x: allPoints[i][0],
                y: allPoints[i][1],
                radius: 8,
                hidden: true
            })
            allPointsEntities.push(entity);
            allPointsEntitiesIDs[allPoints[i][0] + '-' + allPoints[i][1]] = entity
        }
        for (i = 0; i < connections.length; i++) {
            p1 = connections[i][0]
            p2 = connections[i][1]
            rigidConstraints.distanceConstraint(allPointsEntitiesIDs[p1[0] + '-' + p1[1]], allPointsEntitiesIDs[p2[0] + '-' + p2[1]], 0.5);
        }
        for (i = 0; i < frameHolders.length; i++) {
            allPointsEntitiesIDs[frameHolders[i][0] + '-' + frameHolders[i][1]].treatment = 'static'
        }
        world.on('integrate:positions', function () {
            var constraints = rigidConstraints.getConstraints().distanceConstraints,
            	c, threshold = 60,
            	scratch = Physics.scratchpad(),
            	v = scratch.vector(),
            	len;
            for (var i = 0, l = constraints.length; i < l; ++i) {
                c = constraints[i];
                len = v.clone(c.bodyB.state.pos).vsub(c.bodyA.state.pos).norm();
                // break the constraint if above threshold
                if ((c.bodyA.treatment !== 'static' && c.bodyB.treatment !== 'static') && (len - c.targetLength) > threshold) {
                    rigidConstraints.remove(c);
                } else if ((c.bodyA.treatment === 'static' && c.bodyB.treatment === 'static') && (len - c.targetLength) > 100) {
                    rigidConstraints.remove(c);
                }
            }
            scratch.done();
            // higher priority than constraint resolution
        }, null, 100);
        // render
        var webStyles = {
            strokeStyle: webcolor,
            lineWidth: webthickness
        };
        world.on('render', function (data) {
            var renderer = data.renderer,
            	constraints = rigidConstraints.getConstraints().distanceConstraints,
            	c, ctx = renderer.ctx,
            	t = data.meta.interpolateTime || 0;
            // optimized line drawing
            ctx.beginPath();
            ctx.strokeStyle = webStyles.strokeStyle;
            ctx.lineWidth = webStyles.lineWidth;
            for (var i = 0, l = constraints.length; i < l; ++i) {
                c = constraints[i];
                ctx.moveTo(c.bodyA.state.pos.x + c.bodyA.state.vel.x * t, c.bodyA.state.pos.y + c.bodyA.state.vel.y * t);
                ctx.lineTo(c.bodyB.state.pos.x + c.bodyB.state.vel.x * t, c.bodyB.state.pos.y + c.bodyB.state.vel.y * t);
            }
            ctx.stroke();
        });
        // add things to world
        world.add(allPointsEntities);
        world.add(rigidConstraints);
        // add things to the world
        world.add([
            , Physics.behavior('body-impulse-response')
            , Physics.behavior('body-collision-detection')
            , Physics.behavior('sweep-prune')
            , edgeBounce
            ]);
        // add some fun interaction
        var attractor = Physics.behavior('attractor', {
            order: 0,
            strength: 0.005
        });
        world.on({
            'interact:poke': function (pos) {
                world.wakeUpAll();
                attractor.position(pos);
                world.add(attractor);
            },
            'interact:move': function (pos) {
                attractor.position(pos);
            },
            'interact:release': function () {
                world.wakeUpAll();
                world.remove(attractor);
            }
        });
        // add things to the world
        world.add([
            Physics.behavior('interactive', {
            el: renderer.container,
            moveThrottle: 5
        })
            , Physics.behavior('constant-acceleration', {
            acc: Physics.vector(0, 0.0000001)
        })
            ]);
        // subscribe to ticker to advance the simulation
        Physics.util.ticker.on(function (time) {
            world.step(time);
        });
    });
}

function web_init() {
	CreateWeb();
	var fragment = document.createDocumentFragment();
	fragment.appendChild(document.getElementById('viewport'));
	document.getElementById('halloween-web').appendChild(fragment);
}

