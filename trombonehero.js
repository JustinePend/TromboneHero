import {defs, tiny} from './examples/common.js';

const {
    Vector, Vector3, vec, vec3, vec4, color, hex_color, Shader, Matrix, Mat4, Light, Shape, Material, Scene,
} = tiny;
function Note(pitch, time) {
    this.noteNum = pitch;
    this.playTime = time;
    this.currColor="none";
  }
export class TromboneHero extends Scene {
    constructor() {
        // constructor(): Scenes begin by populating initial values like the Shapes and Materials they'll need.
        super();
        
        // At the beginning of our program, load one of each of these shape definitions onto the GPU.
        this.shapes = {
            finishLine: new defs.Square(),
            noteBlock: new defs.Square(),
            guideLines: new defs.Square(),
            torus: new defs.Torus(15, 15),
            torus2: new defs.Torus(3, 15),
            planet1: new (defs.Subdivision_Sphere.prototype.make_flat_shaded_version() )(2),
            planet2: new defs.Subdivision_Sphere(3),
            planet3: new defs.Subdivision_Sphere(4),
            planet4: new defs.Subdivision_Sphere(4),
            moon: new (defs.Subdivision_Sphere.prototype.make_flat_shaded_version() )(1),
            sun: new defs.Subdivision_Sphere(4),
            circle: new defs.Regular_2D_Polygon(1, 15),
            trombone_bell: new defs.Trombone_Bell(5, 10, [[0, 2], [0, 1]]),
            curved_tube: new defs.Curved_Tube(9, 15, [[0, 2], [0, 1]]),
            tube: new defs.Cylindrical_Tube(2, 8, [[0, 2], [0, 1]]),
            mouthpiece: new defs.Mouthpiece(5, 8, [[0, 2], [0, 1]]),
        };

        // *** Materials
        this.materials = {
            test: new Material(new defs.Phong_Shader(),
                {ambient: .4, diffusivity: .6, color: hex_color("#ffffff")}),
            test2: new Material(new Gouraud_Shader(),
                {ambient: .4, diffusivity: .6, color: hex_color("#992828")}),
            ring: new Material(new Ring_Shader()),
            sun: new Material(new defs.Phong_Shader(),
                {ambient: 1.0, diffusivity: .6, color: hex_color("#ffffff")}),
            planet1: new Material(new defs.Phong_Shader(), 
                {ambient: 0, diffusivity: .8, color: hex_color("#222222")}),
            planet2gouraud: new Material(new Gouraud_Shader(), 
                {ambient: 0, diffusivity: .2, specularity: 1, color: hex_color("#80FFFF")}),
            planet2phong: new Material(new defs.Phong_Shader(),
                {ambient: 0, diffusivity: .2, specularity: 1, color: hex_color("#80FFFF")}),
            planet3: new Material(new defs.Phong_Shader(),
                {ambient: 0, diffusivity: 1, specularity: 1, color: hex_color("#B08040")}),
            planet4: new Material(new defs.Phong_Shader(), 
                {ambient: 0, diffusivity: 0.6, specularity: .9, color: hex_color("#90cee4")}),
            moon: new Material(new defs.Phong_Shader(), 
                {ambient: 0.2, diffusivity: 0.7, specularity: 1, color: hex_color("#ffffff")}),
            brass: new Material(new defs.Phong_Shader(),
                {ambient: .7, diffusivity: 0.5, specularity: 1, color: hex_color("#ebb23a")}),
            // TODO:  Fill in as many additional material objects as needed in this key/value table.
            //        (Requirement 4)
        }

        this.initial_camera_location = Mat4.look_at(vec3(10, 1, 20), vec3(10, 0, 0), vec3(0, 1, 0));
        this.currSong;
        this.mary1= [new Note(3,0),new Note(2,0.5),new Note(1,1),new Note(2,1.5),new Note(3,2),new Note(3,2.5),new Note(3,3),new Note(2,4),new Note(2,4.5),new Note(2,5),new Note(3,6),new Note(3,6.5),new Note(3,7),new Note(3,8),new Note(2,8.5),new Note(1,9),new Note(2,9.5),new Note(3,10),new Note(3,10.5),new Note(3,11),new Note(3,11.5),new Note(2,12),new Note(2,12.5),new Note(3,13),new Note(2,13.5),new Note(1,14)];
        this.indexInSong=-1;
        this.note;
        this.currNote;
        this.filename = "";
        this.noteNum=0;
        this.prevNoteNum = 0;
        
        this.startTime=-1;
        this.shouldStart=false;
        this.position = 0;
        this.setpoint = 0;
        this.error = 0;
        this.lastNote = 1;
        this.initialize = true;

        this.mouseX = 0;
        this.mouseY = 0;

        this.pitch = 0;
        this.pitcherror = 0;
        this.pitchsetpoint = 0;

        this.click = false;
    }
    playnote(path, num){
        if(this.note==null){
            this.note= new Audio(path);
            this.note.play();
            this.currNote=path;
            this.noteNum=num;
        }
    }
    stopnote(path){
        //pass in src as param and check with the currentNote thing I will make
        if(this.currNote==path){
            this.note.pause();
            this.note=null;
            this.currNote=null;
            this.noteNum=0;
        }
    }
    startSong(songName){
        this.shouldStart=true;
        this.indexInSong=0;
        console.log('start button hit');
        switch (songName) {
            case 1:
                this.currSong=this.mary1;
                break;
            case 2:
                break;
            case 3:
                break;
            default:
                break;
        }
        for(let i=0;i<this.currSong.length;i++){
            this.currSong[i].color="none";
        }
    }
    make_control_panel() {
        // Draw the scene's buttons, setup their actions and keyboard shortcuts, and monitor live measurements.
        this.key_triggered_button("Play C3", [ "1" ], ()=> this.playnote("ordinario/Tbn-ord-C3-ff-N-T25d.wav",1),undefined,()=> this.stopnote("ordinario/Tbn-ord-C3-ff-N-T25d.wav"));
        this.key_triggered_button("Play D3", [ "2" ], ()=> this.playnote("ordinario/Tbn-ord-D3-ff-N-N.wav",2), undefined,() => this.stopnote("ordinario/Tbn-ord-D3-ff-N-N.wav"));
        this.key_triggered_button("Play E3", [ "3" ], ()=> this.playnote("ordinario/Tbn-ord-E3-ff-N-N.wav",3), undefined,() => this.stopnote("ordinario/Tbn-ord-E3-ff-N-N.wav"));
        this.key_triggered_button("Play F3", [ "4" ], ()=> this.playnote("ordinario/Tbn-ord-F3-ff-N-N.wav",4), undefined,() => this.stopnote("ordinario/Tbn-ord-F3-ff-N-N.wav"));
        this.key_triggered_button("Play G3", [ "5" ], ()=> this.playnote("ordinario/Tbn-ord-G3-ff-N-N.wav",5), undefined,() => this.stopnote("ordinario/Tbn-ord-G3-ff-N-N.wav"));
        this.key_triggered_button("Play A4", [ "6" ], ()=> this.playnote("ordinario/Tbn-ord-A3-ff-N-N.wav",6), undefined,() => this.stopnote("ordinario/Tbn-ord-A3-ff-N-N.wav"));
        this.key_triggered_button("Play B4", [ "7" ], ()=> this.playnote("ordinario/Tbn-ord-B3-ff-N-N.wav",7), undefined,() => this.stopnote("ordinario/Tbn-ord-B3-ff-N-N.wav"));
        this.key_triggered_button("Play C4", [ "8" ], ()=> this.playnote("ordinario/Tbn-ord-C4-ff-N-N.wav",8), undefined,() => this.stopnote("ordinario/Tbn-ord-C4-ff-N-N.wav"));
        this.key_triggered_button("Play Mary Had a Little Lamb", [ "q" ], ()=> this.startSong(1));

    }
    draw_cubes(t, context, program_state){1
        let time = t-this.startTime;
        for(let i=0;i<this.currSong.length;i++){

            if(time-this.currSong[i].playTime<3&&time-this.currSong[i].playTime>0){
                let note_transform = Mat4.identity();
                note_transform=note_transform
                .times(Mat4.translation(22.5-5*(time-this.currSong[i].playTime),this.currSong[i].noteNum-3,0))
                .times(Mat4.scale(0.5, 0.5, 0.5));
                if(this.currSong[i].color=="green"){
                    this.shapes.noteBlock.draw(context, program_state, note_transform, this.materials.test.override({color:color(0,1,0,1)}));
                }else if(this.currSong[i].color=="red"){
                    this.shapes.noteBlock.draw(context, program_state, note_transform, this.materials.test.override({color:color(1,0,0,1)}));
                }else if(time-this.currSong[i].playTime>2 && time-this.currSong[i].playTime<2.2 && this.currSong[i].noteNum==this.noteNum){
                    this.shapes.noteBlock.draw(context, program_state, note_transform, this.materials.test.override({color:color(0,1,0,1)}));
                    this.currSong[i].color="green";
                }else if(time-this.currSong[i].playTime>2.2){
                    this.shapes.noteBlock.draw(context, program_state, note_transform, this.materials.test.override({color:color(1,0,0,1)}));
                    this.currSong[i].color="red";
                }else{
                    this.shapes.noteBlock.draw(context, program_state, note_transform, this.materials.test.override({color:color(1,1,1,1)}));
                }
            }else if(i==this.currSong.length-1&&time-this.currSong[i].playTime>3){
                console.log("finished song");
                this.startTime=-1;
                this.shouldStart=false;
            }
        }
    }

    display(context, program_state) {
        if (!context.scratchpad.controls) {
            //this.children.push(context.scratchpad.controls = new defs.Movement_Controls());
            // Define the global camera and projection matrices, which are stored in program_state.
            program_state.set_camera(this.initial_camera_location);
        }
        program_state.projection_transform = Mat4.perspective(
            Math.PI / 4, context.width / context.height, .1, 1000);

        if(this.attached) {
            let attached_cam = Mat4.translation(0,0,-22.36);

            if(this.attached() != null) {
                attached_cam = Mat4.inverse(this.attached().times(Mat4.translation(0, 0, 5)));
            }
            //a
            let blending_factor = 0.1;
            let blended_cam = attached_cam.map((x,i) => Vector.from(program_state.camera_inverse[i]).mix(x, blending_factor));
            program_state.set_camera(blended_cam);
        }



        const rect = context.canvas.getBoundingClientRect();

        if(this.click) {
            if(this.mouseY > rect.bottom * 7 / 8) {
                this.noteNum = 1;
                if(this.noteNum == this.prevNoteNum) {
                    this.filename = "ordinario/Tbn-ord-C3-ff-N-T25d.wav";
                } 
            } else if (this.mouseY <= rect.bottom * 7/ 8  && this.mouseY > rect.bottom * 6 / 8){
                this.noteNum = 2;
                if(this.noteNum == this.prevNoteNum) {
                    this.filename = "ordinario/Tbn-ord-D3-ff-N-N.wav";
                }
            } else if (this.mouseY <= rect.bottom * 6/ 8  && this.mouseY > rect.bottom * 5 / 8){
                this.noteNum = 3;
                if(this.noteNum == this.prevNoteNum) {
                    this.filename = "ordinario/Tbn-ord-E3-ff-N-N.wav";
                }
            }

            if(this.noteNum == this.prevNoteNum) {
                this.playnote(this.filename, this.noteNum);
            } else {
                this.stopnote(this.filename);
            }
        } else {
            this.stopnote(this.filename)
        }
        this.prevNoteNum = this.noteNum







        const t = program_state.animation_time / 1000, dt = program_state.animation_delta_time / 1000;

        this.lastNote = (this.noteNum != 0)? this.noteNum : this.lastNote;

        this.setpoint = (this.lastNote - 1)* 1.9;
        this.error = this.setpoint - this.position;
        
        this.position = this.position + 10.0 * this.error * dt;

        this.pitchsetpoint = (this.noteNum - 1) * - 0.05;
        this.pitcherror = this.pitchsetpoint - this.pitch;
        this.pitch = this.pitch + 5 * this.pitcherror * dt;

        let dance = Math.sin(2 * Math.PI * t);
        let model_transform = Mat4.identity().times(Mat4.translation(0, (dance / (0.5 * this.lastNote)) * this.pitch * 5, -10 + this.pitch * 10))
                                            .times(Mat4.rotation(Math.PI / 4, -dance/45, 1, 0))
                                            .times(Mat4.rotation(this.pitch, 1, 0.7, 1))
                                            .times(Mat4.scale(1, 1, 1));
    
        let light_position = vec4(0, 0, -9, 1);
        program_state.lights = [new Light(light_position, hex_color("#ffffff"), 10)];
         
        //MAIN BODY//
        //this.shapes.moon.draw(context, program_state, light_test, this.materials.test);

        this.shapes.trombone_bell.draw(context, program_state, model_transform, this.materials.brass);

        let curved_tube1_transform = model_transform.times(Mat4.rotation(Math.PI / 2, 0, 0, 1))
                                            .times(Mat4.translation(-2.5,0,-12))
                                            .times(Mat4.scale(0.7, 0.7, 0.7));
                                            
        this.shapes.curved_tube.draw(context, program_state, curved_tube1_transform, this.materials.brass);

        let tube1_transform = model_transform.times(Mat4.translation(0, -5, -7.5))
                                            .times(Mat4.scale(0.3, 0.3, 9));
        this.shapes.tube.draw(context, program_state, tube1_transform, (this.click)? this.materials.brass : this.materials.test);

        //INNER TUBES//

        let inner_tube2_transform = model_transform.times(Mat4.translation(0, -5, 4))
                                                    .times(Mat4.scale(0.2, 0.22, 14.5));
        this.shapes.tube.draw(context, program_state, inner_tube2_transform, this.materials.test);

        let inner_tube3_transform = model_transform.times(Mat4.translation(-3.9, -5, 4))
                                            .times(Mat4.scale(0.2, 0.2, 14.5));
        this.shapes.tube.draw(context, program_state, inner_tube3_transform, this.materials.test);

        let mouthpiece_transform = model_transform.times(Mat4.rotation(Math.PI, 1, 0, 0))
                                                     .times(Mat4.translation(-3.9, 5, 4));
        this.shapes.mouthpiece.draw(context, program_state, mouthpiece_transform, this.materials.test);


        //MOVING//2
        let tube2_transform = model_transform.times(Mat4.translation(0, -5, 4 + this.position))
                                            .times(Mat4.scale(0.24, 0.24, 14.5));
        this.shapes.tube.draw(context, program_state, tube2_transform, this.materials.brass);

        
        let curved_tube2_transform = model_transform.times(Mat4.rotation(Math.PI, 1, 0, 0))
                                            .times(Mat4.translation(-1.95,5,-11 - this.position))
                                            .times(Mat4.scale(0.55, 0.55, 0.6));
        this.shapes.curved_tube.draw(context, program_state, curved_tube2_transform, this.materials.brass);

        let tube3_transform = model_transform.times(Mat4.translation(-3.9, -5, 4 + this.position))
                                            .times(Mat4.scale(0.24, 0.24, 14.5));
        this.shapes.tube.draw(context, program_state, tube3_transform, this.materials.brass);


        if(this.shouldStart&&this.startTime==-1){
            this.startTime=t;
            
        }
        if(this.startTime!=-1){
            this.draw_cubes(t, context, program_state);
        }
        if(this.initialize) {
            this.initialize = false;

            context.context.canvas.addEventListener("mouseup", e => {
                this.click = false;
                
            });

            context.context.canvas.addEventListener("mousedown", e => {
                const rect = context.canvas.getBoundingClientRect();
        	    this.mouseX = e.clientX - rect.left;
        	    this.mouseY = e.clientY - rect.top;
                this.click = true;

            });
            context.context.canvas.addEventListener("mousemove", e => {
                const rect = context.canvas.getBoundingClientRect();
        	    this.mouseX = e.clientX - rect.left;
        	    this.mouseY = e.clientY - rect.top;
            });
            // canvas.addEventListener("mouseout", e => {
            //     if (!this.mouse.anchor) this.mouse.from_center.scale_by(0)
            // });
        }

        let line_trans= Mat4.identity();
        line_trans=line_trans.times(Mat4.translation(12,0,.1)).times(Mat4.scale(0.3, 20, .3));
        this.shapes.finishLine.draw(context,program_state,line_trans,this.materials.test.override({color: color(0,1,1,1)}));
        let guide_trans=Mat4.identity();
        guide_trans=guide_trans.times(Mat4.scale(5.2,.1,.1)).times(Mat4.translation(3.35,0,-.1));
        this.shapes.guideLines.draw(context,program_state,guide_trans.times(Mat4.translation(0,-20,0)),this.materials.test.override({color: color(0,1,1,1)}));
        this.shapes.guideLines.draw(context,program_state,guide_trans.times(Mat4.translation(0,-10,0)),this.materials.test.override({color: color(0,1,1,1)}));
        this.shapes.guideLines.draw(context,program_state,guide_trans,this.materials.test.override({color: color(0,1,1,1)}));
        this.shapes.guideLines.draw(context,program_state,guide_trans.times(Mat4.translation(0,10,0)),this.materials.test.override({color: color(0,1,1,1)}));
        this.shapes.guideLines.draw(context,program_state,guide_trans.times(Mat4.translation(0,20,0)),this.materials.test.override({color: color(0,1,1,1)}));
        this.shapes.guideLines.draw(context,program_state,guide_trans.times(Mat4.translation(0,30,0)),this.materials.test.override({color: color(0,1,1,1)}));
        this.shapes.guideLines.draw(context,program_state,guide_trans.times(Mat4.translation(0,40,0)),this.materials.test.override({color: color(0,1,1,1)}));
        this.shapes.guideLines.draw(context,program_state,guide_trans.times(Mat4.translation(0,50,0)),this.materials.test.override({color: color(0,1,1,1)}));

        this.shapes.circle.draw(context, program_state, Mat4.identity().times(Mat4.translation(11.9, 7 - this.mouseY / 40, 1))
                                                                        .times(Mat4.scale(0.7, 0.7, 0.7))
                                                                        , this.materials.test.override({color: color(0,0,1,1)}));
    }  
}

class Gouraud_Shader extends Shader {
    // This is a Shader using Phong_Shader as template
    // TODO: Modify the glsl coder here to create a Gouraud Shader (Planet 2)

    constructor(num_lights = 2) {
        super();
        this.num_lights = num_lights;
    }

    shared_glsl_code() {
        // ********* SHARED CODE, INCLUDED IN BOTH SHADERS *********
        return `
        precision mediump float;
        const int N_LIGHTS = ` + this.num_lights + `;
        uniform float ambient, diffusivity, specularity, smoothness;
        uniform vec4 light_positions_or_vectors[N_LIGHTS], light_colors[N_LIGHTS];
        uniform float light_attenuation_factors[N_LIGHTS];
        uniform vec4 shape_color;
        uniform vec3 squared_scale, camera_center;

        // Specifier "varying" means a variable's final value will be passed from the vertex shader
        // on to the next phase (fragment shader), then interpolated per-fragment, weighted by the
        // pixel fragment's proximity to each of the 3 vertices (barycentric interpolation).
        varying vec3 N, vertex_worldspace;
        varying vec4 gouraud_color;
        // ***** PHONG SHADING HAPPENS HERE: *****                                       
        vec3 phong_model_lights( vec3 N, vec3 vertex_worldspace ){                                        
            // phong_model_lights():  Add up the lights' contributions.
            vec3 E = normalize( camera_center - vertex_worldspace );
            vec3 result = vec3( 0.0 );
            for(int i = 0; i < N_LIGHTS; i++){
                // Lights store homogeneous coords - either a position or vector.  If w is 0, the 
                // light will appear directional (uniform direction from all points), and we 
                // simply obtain a vector towards the light by directly using the stored value.
                // Otherwise if w is 1 it will appear as a point light -- compute the vector to 
                // the point light's location from the current surface point.  In either case, 
                // fade (attenuate) the light as the vector needed to reach it gets longer.  
                vec3 surface_to_light_vector = light_positions_or_vectors[i].xyz - 
                                               light_positions_or_vectors[i].w * vertex_worldspace;                                             
                float distance_to_light = length( surface_to_light_vector );

                vec3 L = normalize( surface_to_light_vector );
                vec3 H = normalize( L + E );
                // Compute the diffuse and specular components from the Phong
                // Reflection Model, using Blinn's "halfway vector" method:
                float diffuse  =      max( dot( N, L ), 0.0 );
                float specular = pow( max( dot( N, H ), 0.0 ), smoothness );
                float attenuation = 1.0 / (1.0 + light_attenuation_factors[i] * distance_to_light * distance_to_light );
                
                vec3 light_contribution = shape_color.xyz * light_colors[i].xyz * diffusivity * diffuse
                                                          + light_colors[i].xyz * specularity * specular;
                result += attenuation * light_contribution;
            }
            return result;
        } `;
    }

    vertex_glsl_code() {
        // ********* VERTEX SHADER *********
        return this.shared_glsl_code() + `
            attribute vec3 position, normal;                            
            // Position is expressed in object coordinates.
            
            uniform mat4 model_transform;
            uniform mat4 projection_camera_model_transform;
    
            void main(){                                                                   
                // The vertex's final resting place (in NDCS):
                gl_Position = projection_camera_model_transform * vec4( position, 1.0 );
                // The final normal vector in screen space.
                N = normalize( mat3( model_transform ) * normal / squared_scale);
                vertex_worldspace = ( model_transform * vec4( position, 1.0 ) ).xyz;

                gouraud_color = vec4(shape_color.xyz * ambient, shape_color.w);
                gouraud_color.xyz += phong_model_lights( normalize( N ), vertex_worldspace );
                
            } `;
    }

    fragment_glsl_code() {
        // ********* FRAGMENT SHADER *********
        // A fragment is a pixel that's overlapped by the current triangle.
        // Fragments affect the final image or get discarded due to depth.
        return this.shared_glsl_code() + `
            void main(){                                                           
                // Compute an initial (ambient) color:
                //gl_FragColor = vec4( shape_color.xyz * ambient, shape_color.w );
                // Compute the final color with contributions from lights:
                //gl_FragColor.xyz += phong_model_lights( normalize( N ), vertex_worldspace );
                gl_FragColor = gouraud_color;
                
            } `;
    }

    send_material(gl, gpu, material) {
        // send_material(): Send the desired shape-wide material qualities to the
        // graphics card, where they will tweak the Phong lighting formula.
        gl.uniform4fv(gpu.shape_color, material.color);
        gl.uniform1f(gpu.ambient, material.ambient);
        gl.uniform1f(gpu.diffusivity, material.diffusivity);
        gl.uniform1f(gpu.specularity, material.specularity);
        gl.uniform1f(gpu.smoothness, material.smoothness);
    }

    send_gpu_state(gl, gpu, gpu_state, model_transform) {
        // send_gpu_state():  Send the state of our whole drawing context to the GPU.
        const O = vec4(0, 0, 0, 1), camera_center = gpu_state.camera_transform.times(O).to3();
        gl.uniform3fv(gpu.camera_center, camera_center);
        // Use the squared scale trick from "Eric's blog" instead of inverse transpose matrix:
        const squared_scale = model_transform.reduce(
            (acc, r) => {
                return acc.plus(vec4(...r).times_pairwise(r))
            }, vec4(0, 0, 0, 0)).to3();
        gl.uniform3fv(gpu.squared_scale, squared_scale);
        // Send the current matrices to the shader.  Go ahead and pre-compute
        // the products we'll need of the of the three special matrices and just
        // cache and send those.  They will be the same throughout this draw
        // call, and thus across each instance of the vertex shader.
        // Transpose them since the GPU expects matrices as column-major arrays.
        const PCM = gpu_state.projection_transform.times(gpu_state.camera_inverse).times(model_transform);
        gl.uniformMatrix4fv(gpu.model_transform, false, Matrix.flatten_2D_to_1D(model_transform.transposed()));
        gl.uniformMatrix4fv(gpu.projection_camera_model_transform, false, Matrix.flatten_2D_to_1D(PCM.transposed()));

        // Omitting lights will show only the material color, scaled by the ambient term:
        if (!gpu_state.lights.length)
            return;

        const light_positions_flattened = [], light_colors_flattened = [];
        for (let i = 0; i < 4 * gpu_state.lights.length; i++) {
            light_positions_flattened.push(gpu_state.lights[Math.floor(i / 4)].position[i % 4]);
            light_colors_flattened.push(gpu_state.lights[Math.floor(i / 4)].color[i % 4]);
        }
        gl.uniform4fv(gpu.light_positions_or_vectors, light_positions_flattened);
        gl.uniform4fv(gpu.light_colors, light_colors_flattened);
        gl.uniform1fv(gpu.light_attenuation_factors, gpu_state.lights.map(l => l.attenuation));
    }

    update_GPU(context, gpu_addresses, gpu_state, model_transform, material) {
        // update_GPU(): Define how to synchronize our JavaScript's variables to the GPU's.  This is where the shader
        // recieves ALL of its inputs.  Every value the GPU wants is divided into two categories:  Values that belong
        // to individual objects being drawn (which we call "Material") and values belonging to the whole scene or
        // program (which we call the "Program_State").  Send both a material and a program state to the shaders
        // within this function, one data field at a time, to fully initialize the shader for a draw.

        // Fill in any missing fields in the Material object with custom defaults for this shader:
        const defaults = {color: color(0, 0, 0, 1), ambient: 0, diffusivity: 1, specularity: 1, smoothness: 40};
        material = Object.assign({}, defaults, material);

        this.send_material(context, gpu_addresses, material);
        this.send_gpu_state(context, gpu_addresses, gpu_state, model_transform);
    }
}

class Ring_Shader extends Shader {
    update_GPU(context, gpu_addresses, graphics_state, model_transform, material) {
        // update_GPU():  Defining how to synchronize our JavaScript's variables to the GPU's:
        const [P, C, M] = [graphics_state.projection_transform, graphics_state.camera_inverse, model_transform],
            PCM = P.times(C).times(M);
        context.uniformMatrix4fv(gpu_addresses.model_transform, false, Matrix.flatten_2D_to_1D(model_transform.transposed()));
        context.uniformMatrix4fv(gpu_addresses.projection_camera_model_transform, false,
            Matrix.flatten_2D_to_1D(PCM.transposed()));
    }

    shared_glsl_code() {
        // ********* SHARED CODE, INCLUDED IN BOTH SHADERS *********
        return `
        precision mediump float;
        varying vec4 point_position;
        varying vec4 center;
        `;
    }

    vertex_glsl_code() {
        // ********* VERTEX SHADER *********
        // TODO:  Complete the main function of the vertex shader (Extra Credit Part II).
        return this.shared_glsl_code() + `
        attribute vec3 position;
        uniform mat4 model_transform;
        uniform mat4 projection_camera_model_transform;

        
        void main(){
          gl_Position = projection_camera_model_transform * vec4(position, 1);
          point_position = model_transform * vec4(position, 1);
          center = model_transform * vec4(0,0,0,1);
        }`;
    }

    fragment_glsl_code() {
        // ********* FRAGMENT SHADER *********
        // TODO:  Complete the main function of the fragment shader (Extra Credit Part II).
        
        return this.shared_glsl_code() + `
        void main(){
          gl_FragColor = vec4(.69, .5, .25, sin(25.0 * distance(point_position, center)));
        }`;
    }
}

