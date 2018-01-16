var logo = function() {
    // Set up the scene, camera, and renderer as global variables.
    var scene, camera, renderer, logo_obj;
    var controls=false;
    
    var light_blue = new THREE.MeshBasicMaterial({color: 0x34CAE5, side: THREE.DoubleSide});
    var dark_blue = new THREE.MeshBasicMaterial({color: 0x0d3951, side: THREE.DoubleSide});
    var line_material = new MeshLineMaterial( {
        color: new THREE.Color(0x0d3951),
        dashArray: 0.15,
        dashRatio: 0.5,
        dashOffset: 0.1,
        lineWidth: 0.002,
        transparent: true,
    } );

    var window_width = $(window).width();
    var window_height = $(window).height();

    var MAX_B_HEIGHT = 360; // set to adjust height of b in pixels
    var MIN_B_HEIGHT = 300;
    var b_height = MAX_B_HEIGHT; // this doesn't actually change ever
    
    function deg_to_rad(d) {
        return d * Math.PI / 180.0;
    }

    var b_faces = [
        {
            // 0: front-face b
            axis: 'y',
            start: 3.45,
            direction: -1,
            color: light_blue,
        }, 
        {
            // 1: top of b bottom serif
            axis: 'x',
            start: 2,
            direction: -1,
            color: light_blue,
        },
        {
            // 2: bottom of b top serif
            axis: 'x',
            start: 2,
            direction: -1,
            color: light_blue,
        },
        {
            // 3: back-face b
            axis: 'y',
            start: -2,
            direction: 1,
            color: light_blue,
        },
        {
            // 4: top cap of b
            axis: 'z',
            start: -1,
            direction: 1,
            color: light_blue,
        },
        {
            // 5: back of b
            axis: '', // not animated
            color: light_blue,
        },
        {
            // 6: bottom cap of b
            axis: 'z',
            start: 2,
            direction: -1,
            color: light_blue,
        },
        {
            // 7: part above the b curve
            axis: 'y',
            start: 0, // need to fix location for some reason
            direction: 0, // not animated
            color: dark_blue,
        },
        {
            // 8: back wall of inner curve
            axis: '',
            color: dark_blue,
        },
        {
            // 9: back of b lower serif
            axis: 'x',
            start: 2,
            direction: -1,
            color: light_blue
        },
        {
            // 10: back of b top serif
            axis: 'x',
            start: 2,
            direction: -1,
            color: light_blue,
        },
        {
            // 11: outer curve of b
            axis: 'x',
            start: -2,
            direction: 1,
            color: dark_blue, 
        },
        {
            // 12: inner curve of b
            axis: '',
            color: light_blue,
        },
        {
            // 13: bottom b serif front
            axis: '',
            color: dark_blue,
        }
    ];

    var init = function(container) {
        // Create the scene and set the scene size.
        scene = new THREE.Scene();

        // Create a renderer and add it to the DOM.
        renderer = new THREE.WebGLRenderer({antialias:true, alpha:true});

        // Create an event listener that resizes the renderer with the browser window.
        window.addEventListener('resize', function() {
            window_width = $(window).width();
            window_height = $(window).height();
            renderer.setSize(window_width, window_height);

            // var visible_height = Math.min(HEIGHT - $('#explode-container').offset().top - 100, $('#explode-container').height());

            // // clamp height of b
            // b_height = visible_height > MAX_B_HEIGHT ? MAX_B_HEIGHT :
            //            visible_height < MIN_B_HEIGHT ? MIN_B_HEIGHT : 
            //            visible_height;

            $('#explode-container').height(b_height + 20);
            var h = bbox.getSize().y * window_height / b_height;
            camera.left = -(window_width / window_height * h) / 2;
            camera.right = (window_width / window_height * h) / 2;
            camera.top = h / 2;
            camera.bottom = -h / 2;
            
            camera.updateProjectionMatrix();
            animate();
        });
 
        // Create a light, set its position, and add it to the scene.
        var light = new THREE.PointLight(0xffffff);
        light.position.set(-100,200,100);
        scene.add(light);

        // Load in the mesh and add it to the scene.
        var loader = new THREE.ObjectLoader();
        loader.load( "assets/exploding-logo.json", function(object){
            for(var i=0; i<b_faces.length; i++) {
                var face = b_faces[i];
                object.children[i].position[face.axis] = face.start;
                if (i == 11)
                    object.children[i].material = new THREE.MeshBasicMaterial({
                         color: 0x0d3951, side: THREE.FrontSide});
                else
                    object.children[i].material = face.color;
            }

            var mesh = object.children[11].clone();
            mesh.material = new THREE.MeshBasicMaterial({color: 0x34CAE5, side: THREE.BackSide});
            mesh.position.set(0, 0, 0);
            object.children[11].add(mesh);

            // Thicc
            for (var thicc = 1.002; thicc < 1.004; thicc += 0.001) { 
                for (var i = 0; i < b_faces.length; i++) {
                    if (i == 11 || i == 12) continue; // skip the middle b curve thing

                    var geo = new THREE.EdgesGeometry( object.children[i].geometry );
                    var mat = new THREE.LineBasicMaterial( { color: 0x0d3951, linewidth: 1 } );
                    var outlineMesh = new THREE.LineSegments( geo, mat );

                    outlineMesh.position = object.children[i].position;
                    outlineMesh.scale.multiplyScalar(thicc);

                    object.children[i].add( outlineMesh );
                }
            }

            object.rotateX(deg_to_rad(35));
            object.rotateZ(deg_to_rad(-45));

            bbox = new THREE.Box3().setFromObject(object);
            // var box = new THREE.BoxHelper( object, 0x000 );
            // scene.add( box );

            // // -50 includes padding for text below b
            // var visible_height = Math.min(HEIGHT - $('#explode-container').offset().top, $('#explode-container').height());

            // // clamp height of b
            // b_height = visible_height > MAX_B_HEIGHT ? MAX_B_HEIGHT :
            //            visible_height < MIN_B_HEIGHT ? MIN_B_HEIGHT : 
            //            visible_height;

            $('#explode-container').height(b_height + 20);

            renderer.setSize(window_width, window_height);
            container.appendChild(renderer.domElement);

            var h = bbox.getSize().y * window_height / b_height;
            // Create a camera, zoom it out from the model a bit, and add it to the scene.
            camera = new THREE.OrthographicCamera(-(window_width / window_height * h) / 2, (window_width / window_height * h) / 2, h / 2, -h / 2, 1, 1000);
            scene.add(camera);
            
            // this mess aligns the top of the logo to the top of explode-container
            object.position.y = h/2 - bbox.getSize().y / 2 - ($('#explode-container').offset().top *  h / window_height);
            
            camera.position.x = bbox.getCenter().x;
            camera.position.y = bbox.getCenter().y;
            camera.position.z = 10;

            scene.add(object);
            logo_obj = object;
            animate();
        });
    }
    
    function animate() {
        // Read more about requestAnimationFrame at http://www.paulirish.com/2011/requestanimationframe-for-smart-animating/
        // site lags if we enable this
        if(controls)
            requestAnimationFrame(animate);

        var h = bbox.getSize().y * window_height / b_height;
        // this mess aligns the top of the logo to the top of explode-container
        logo_obj.position.y = h/2 - bbox.getSize().y / 2 - ($('#explode-container').offset().top *  h / window_height);

        // Render the scene.
        renderer.render(scene, camera);
        if(controls)
            controls.update();
    }

    var exploding = 1;
    var EXPLODE_DISTANCE = 1.5;
    function explode() {
        for(var i=0; i<b_faces.length; i++) {
            var face = b_faces[i];
            _obj.children[i].position[face.axis] += exploding * face.direction * 0.1;
        }
        var face = b_faces[3];
        if (_obj.children[3].position[face.axis] > face.start + EXPLODE_DISTANCE) {
            exploding = -1;
        }
        else if (_obj.children[3].position[face.axis] < face.start) {
            exploding = 1;
        }
    }

    /*
     *  set all faces of b to explode to certain distance from 0 to 100
     *  explode_to(0) returns b to initial state
     */
    var explode_to = function(dist) {
        if(!logo_obj)
            return;
        for(var i=0; i<b_faces.length; i++) {
            var face = b_faces[i];
            if (face.axis != '') 
                logo_obj.children[i].position[face.axis] 
                    = face.start + face.direction * Math.abs(face.start) / 100.0 * dist;
        }
        // refresh_lines();
        animate();
    }

    var lines = [];
    var refresh_lines = function() {
        for(var i = 0; i<lines.length; i++) {
            scene.remove(lines[i]);
        }

        // from/to order doesn't actually matter
        var line_map = [
            // from back to back of top serif
            [{geo: 2, v: 0}, {geo: 5, v: 1}],
            // to top of top serif
            [{geo: 4, v: 1}, {geo: 7, v: 4}],  
            // back-face b
            [{geo: 3, v: 83}, {geo: 7, v: 0}],
            [{geo: 3, v: 69}, {geo: 7, v: 5}],
            // front-face b
            [{geo: 0, v: 163}, {geo: 8, v: 1}],
            [{geo: 0, v: 87}, {geo: 8, v: 5}],
            // curve b from top
            [{geo: 11, v: 243}, {geo: 7, v: 1}],
            [{geo: 11, v: 245}, {geo: 7, v: 3}],
            // curve b from bottom
            [{geo: 11, v: 1}, {geo: 13, v: 0}],
            [{geo: 11, v: 2}, {geo: 13, v: 5}],
            // bottom camp of b
            [{geo: 6, v: 0}, {geo: 13, v: 3}],
            // from back to back of bottom serif
            [{geo: 1, v: 1}, {geo: 5, v: 0}],
        ];
        logo_obj.updateMatrixWorld();

        for (var i = 0; i<line_map.length; i++) {
            var p1 = line_map[i][0];
            var p2 = line_map[i][1];
            var p1_obj = logo.get_object().children[p1.geo];
            var p2_obj = logo.get_object().children[p2.geo];
        
            var g1 = 
                new THREE.Geometry().fromBufferGeometry(p1_obj.geometry);
            var v1 = g1.vertices[p1.v].clone().add(p1_obj.position);
            var g2 = 
                new THREE.Geometry().fromBufferGeometry(p2_obj.geometry );
            var v2 = g2.vertices[p2.v].clone().add(p2_obj.position);
            logo_obj.localToWorld(v1);
            logo_obj.localToWorld(v2);
            var geometry = new THREE.Geometry();
            geometry.vertices.push(v1);
            geometry.vertices.push(v2);
            geometry.computeLineDistances();

            var line = new MeshLine();
            line.setGeometry(geometry);
            var mesh = new THREE.Mesh(line.geometry, line_material);
            lines.push(mesh);
            scene.add(mesh);
        }
    }

    // call from debugger to enable orbital controls
    var enable_controls = function() {
        controls = new THREE.OrbitControls(camera, renderer.domElement);
        animate();
    }

    var get_object = function() {
        return logo_obj;
    }

    return {
        init: init,
        explode_to: explode_to,
        enable_controls: enable_controls,
        get_object: get_object,
    }
}();