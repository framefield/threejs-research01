import * as THREE from 'three'
import { Mesh, Vector3, MathUtils, BufferAttribute } from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import theme from 'utils/theme'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { vertex as basicVertex, fragment as basicFragment } from './shaders/basic'
import { CSS3DRenderer, CSS3DSprite, CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer'

interface IOptions {
  mountPoint: HTMLDivElement
  width: number
  height: number
}

class ThreeCanvas {
  private renderer: THREE.WebGLRenderer
  private css3dRenderer: CSS3DRenderer

  private composer: EffectComposer
  private camera: THREE.PerspectiveCamera
  private scene: THREE.Scene
  private cubeGroup: THREE.Group
  private clock: THREE.Clock
  private group: THREE.Group
  private frameCount: number = 0

  private orbitControls: OrbitControls

  line: THREE.Line<THREE.BufferGeometry, THREE.LineBasicMaterial>

  constructor(options: IOptions) {
    const { mountPoint, width, height } = options

    const clock = (this.clock = new THREE.Clock())
    this.scene = new THREE.Scene()
    const camera = (this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000))
    const renderer = (this.renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true
    }))

    this.scene.background = new THREE.Color(theme.colors.white)
    renderer.setSize(width, height)
    camera.position.z = 0

    const composer = (this.composer = new EffectComposer(renderer))
    const renderPass = new RenderPass(this.scene, camera)
    renderPass.clear = false

    this.css3dRenderer = new CSS3DRenderer()
    this.css3dRenderer.domElement.className = 'css3dRenderer'
    mountPoint.appendChild(this.css3dRenderer.domElement)

    composer.addPass(renderPass)
    mountPoint.appendChild(renderer.domElement)

    this.orbitControls = new OrbitControls(this.camera, renderer.domElement)
    this.orbitControls.addEventListener('change', this.render2)
    this.orbitControls.minDistance = 5
    this.orbitControls.maxDistance = 600
    this.orbitControls.enableDamping = true

    this.addLines(this.scene)
    this.addBoxes(this.scene)
    this.addCssObjects(this.scene)

    const size = 100
    const divisions = 100
    const gridHelper = new THREE.GridHelper(size, divisions, 0x888888, 0xdddddd)
    this.scene.add(gridHelper)
  }

  render2() {
    console.log('here ')
  }

  updateLineBuffer() {
    const positions = this.line.geometry.attributes['position']
    for (let pointsIndex = 0; pointsIndex < positions.count; pointsIndex++) {
      positions.setXYZ(
        pointsIndex,
        Math.sin((this.frameCount + pointsIndex * 10) / 100),
        Math.cos((this.frameCount + pointsIndex * 10) / 100),
        1
      )
    }
    this.line.geometry.attributes.position.needsUpdate = true
  }

  addCssObjects(scene: THREE.Scene) {
    const objectDOM = document.createElement('span')
    objectDOM.className = 'sprite'
    objectDOM.style.backgroundColor = 'rgba(0,127,127,' + (Math.random() * 0.5 + 0.25) + ')'

    const subObject = document.createElement('span')
    subObject.textContent = 'hello'
    objectDOM.appendChild(subObject)
    const objectCSS = new CSS3DObject(objectDOM)

    objectCSS.position.z = 0
    objectCSS.scale.multiplyScalar(0.04)
    scene.add(objectCSS)
  }

  addLines(scene: THREE.Scene) {
    const material = new THREE.LineBasicMaterial({ color: 0x000000, opacity: 0.5, transparent: true, linewidth: 10 })
    const points: Vector3[] = []
    const count = 10
    const radius = 2
    for (let i = 0; i < count; i++) {
      const f = i / count
      points.push(new THREE.Vector3(Math.cos(f * Math.PI * 2), Math.sin(f * Math.PI * 2), 0).multiplyScalar(radius))
    }

    const geometry = new THREE.BufferGeometry().setFromPoints(points)
    this.line = new THREE.Line(geometry, material)
    scene.add(this.line)
  }

  addBoxes(scene: THREE.Scene) {
    this.group = this.cubeGroup = new THREE.Group()

    const material = new THREE.ShaderMaterial({
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

  resizeRendererToDisplaySize() {
    const canvas = this.renderer.domElement
    const width = canvas.clientWidth
    const height = canvas.clientHeight

    const needResize = canvas.width !== width || canvas.height !== height

    if (needResize) {
      this.renderer.setSize(width, height, false)
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)) // use 2x pixel ratio at max

      this.css3dRenderer.setSize(width, height)
    }

    return needResize
  }

  updateCamera() {
    if (this.resizeRendererToDisplaySize()) {
      const canvas = this.renderer.domElement
      this.camera.aspect = canvas.clientWidth / canvas.clientHeight
      this.camera.position.z = 20
      this.camera.updateProjectionMatrix()
    }
  }

  render() {
    this.frameCount = this.frameCount + 1
    this.orbitControls.update()

    // check if we need to resize the canvas and re-setup the cameras
    this.updateCamera()
    this.updateLineBuffer()

    this.composer.render()
    this.css3dRenderer.render(this.scene, this.camera)
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
