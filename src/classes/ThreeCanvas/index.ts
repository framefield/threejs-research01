import * as THREE from 'three'
import { Mesh, Vector3, MathUtils } from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import theme from 'utils/theme'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'

import { vertex as basicVertex, fragment as basicFragment } from './shaders/basic'

interface IOptions {
  mountPoint: HTMLDivElement
  width: number
  height: number
}

class ThreeCanvas {
  private renderer: THREE.WebGLRenderer
  private composer: EffectComposer
  private camera: THREE.PerspectiveCamera
  private cubeGroup: THREE.Group
  private clock: THREE.Clock
  private group: THREE.Group
  private frameCount: number = 0

  constructor(options: IOptions) {
    const { mountPoint, width, height } = options

    // this is just here for reference. most of this file should be overwritten :)

    // basics
    const clock = (this.clock = new THREE.Clock())
    const scene = new THREE.Scene()
    const camera = (this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000))
    const renderer = (this.renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true
    }))

    scene.background = new THREE.Color(theme.colors.white)
    renderer.setSize(width, height)
    camera.position.z = 0

    // post processing support
    const composer = (this.composer = new EffectComposer(renderer))

    const renderPass = new RenderPass(scene, camera)
    renderPass.clear = false
    composer.addPass(renderPass)

    // mount to DOM
    mountPoint.appendChild(renderer.domElement)
    // VR support
    // renderer.xr.enabled = true;
    // mountPoint.appendChild( VRButton.createButton( renderer ) );

    this.addMeshes(scene)
  }

  addLines(scene: THREE.Scene) {
    const material = new THREE.LineBasicMaterial({ color: 0x0000ff })
  }

  addMeshes(scene: THREE.Scene) {
    this.group = this.cubeGroup = new THREE.Group()
    const cubeInitialPositions = [
      {
        rotation: new Vector3(35, 35, 0),
        position: new Vector3(0, -0.5, 0)
      },
      {
        rotation: new Vector3(-35, -95, 0),
        position: new Vector3(0, 1, 0)
      }
    ]

    // some standard material or ShaderMaterial
    // const material = new THREE.MeshBasicMaterial( { color: theme.baseFontColor } );
    const material = new THREE.ShaderMaterial({
      // transparent: true,
      side: THREE.DoubleSide,
      vertexShader: basicVertex,
      fragmentShader: basicFragment,
      uniforms: {
        time: { value: 0 }
      }
    })

    const boxGeo = new THREE.BoxGeometry()
    for (let i = 0; i < 20; i++) {
      const boxMesh = new Mesh(boxGeo, material)
      this.group.add(boxMesh)
      boxMesh.position.y = i * 0.2
      boxMesh.rotation.x = i * 1
      boxMesh.rotation.y = i * 2
    }

    this.group.position.z = -7 // push 7 meters back
    scene.add(this.group)
    this.clock.start()
  }

  resizeRendererToDisplaySize(renderer: THREE.WebGLRenderer) {
    const canvas = renderer.domElement
    const width = canvas.clientWidth
    const height = canvas.clientHeight

    const needResize = canvas.width !== width || canvas.height !== height

    if (needResize) {
      renderer.setSize(width, height, false)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)) // use 2x pixel ratio at max
    }

    return needResize
  }

  render() {
    this.frameCount = this.frameCount + 1
    this.group.rotation.y = this.frameCount / 360
    //console.log(this.frameCount);

    // check if we need to resize the canvas and re-setup the cameras
    if (this.resizeRendererToDisplaySize(this.renderer)) {
      const canvas = this.renderer.domElement
      this.camera.aspect = canvas.clientWidth / canvas.clientHeight
      this.camera.updateProjectionMatrix()
      //this.camera.up
    }

    this.composer.render()
  }

  startAnimationLoop() {
    this.renderer.setAnimationLoop(() => {
      this.render()
    })
  }

  stopAnimationLoop() {
    this.renderer.setAnimationLoop(() => {})
  }
}

export default ThreeCanvas
