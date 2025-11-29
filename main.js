// main.js - 개별 모델 위치 및 회전 기능 최종 버전 (배경 흰색, Z축 0 고정)

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// --- 전역 변수 선언 ---
let intersectedObject = null; // 현재 마우스로 잡고 있는(선택된) 모델
let isDragging = false;       // 마우스 드래그 상태
let previousMousePosition = { x: 0, y: 0 }; // 이전 마우스 위치 저장
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();


// 1. 기본 3요소 설정
const scene = new THREE.Scene();
// 배경색을 순수한 흰색(0xffffff)으로 설정
scene.background = new THREE.Color(0xffffff); 

const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
// 전체 모델이 잘 보이도록 카메라 위치를 조정
camera.position.set(0, 5, 15); 

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement); 

// 2. 조명 설정
const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
directionalLight.position.set(5, 10, 7).normalize();
scene.add(directionalLight);

// 3. 컨트롤 설정 
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.target.set(0, 0, 0);   // 카메라가 원점(0,0,0)을 바라보게 고정
controls.enablePan = false;     
controls.enableRotate = false;  
controls.maxDistance = 20;      
controls.minDistance = 5;       


// 4. GLB 파일 로드!
const loader = new GLTFLoader(); 

// 🌟🌟🌟 개별 위치 조절 목록 (Z축 값을 모두 0.0으로 고정했습니다.) 🌟🌟🌟
const modelsToLoad = [
    // [이름]          [크기]  [X축(좌우)] [Y축(높이)] [Z축(앞뒤)=0.0]
    { name: 'shoes.glb',    scale: 10, positionX: -6.0, positionY: 1, positionZ: 0.0 }, 
    { name: 'bag.glb',      scale: 7, positionX: -4.0, positionY: -4, positionZ: 0.0 },
    { name: 'ball.glb',     scale: 5, positionX: -5.0, positionY: 2, positionZ: 0.0 },
    { name: 'book.glb',     scale: 10, positionX: -3.0,  positionY: -1, positionZ: 0.0 }, 
    { name: 'close.glb',    scale: 5, positionX: 4.0,  positionY: -5, positionZ: 0.0 },
    { name: 'glasses.glb',  scale: 20, positionX: 6.0,  positionY: -1, positionZ: 0.0 }, // 이전 0.5에서 0.0으로 수정
    { name: 'guard.glb',    scale: 10, positionX: 5.0,  positionY: -3, positionZ: 0.0 },
    { name: 'persimmon.glb',scale: 20, positionX: 5.0,  positionY: 2, positionZ: 0.0 },
];
// 🌟 X축과 Y축 값만 조정하여 원하는 배치와 높이를 설정할 수 있습니다. 🌟

// 각 모델을 순회하며 로드하고 개별 위치에 배치합니다.
modelsToLoad.forEach((modelInfo, index) => {
    loader.load(
        modelInfo.name,
        function (gltf) {
            const model = gltf.scene;

            // **개별 위치 설정**
            model.position.x = modelInfo.positionX; 
            model.position.y = modelInfo.positionY; 
            model.position.z = modelInfo.positionZ; // Z축 0.0 고정
            
            // 모델 크기 및 userData 설정
            model.scale.set(modelInfo.scale, modelInfo.scale, modelInfo.scale);
            model.userData.modelName = modelInfo.name; 

            scene.add(model);
        },
        undefined, 
        function (error) {
            console.error(`모델 로드 중 에러 발생: ${modelInfo.name}`, error);
        }
    );
});


// 5. 마우스 이벤트 리스너 추가 (개별 회전을 위한 핵심 로직)
renderer.domElement.addEventListener('mousedown', onMouseDown, false);
renderer.domElement.addEventListener('mousemove', onMouseMove, false);
renderer.domElement.addEventListener('mouseup', onMouseUp, false);

function onMouseDown(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children, true); 

    if (intersects.length > 0) {
        let target = intersects[0].object;
        while (target.parent && target.parent !== scene) {
            target = target.parent;
        }

        if (target.parent === scene) {
            intersectedObject = target;
            isDragging = true;
            previousMousePosition.x = event.clientX;
            previousMousePosition.y = event.clientY;
        }
    }
}

function onMouseMove(event) {
    if (!isDragging || !intersectedObject) return;

    const deltaX = event.clientX - previousMousePosition.x;
    
    // Y축 회전 적용
    intersectedObject.rotation.y += deltaX * 0.01; 

    previousMousePosition.x = event.clientX;
    previousMousePosition.y = event.clientY;
}

function onMouseUp(event) {
    isDragging = false;
    intersectedObject = null;
}


// 6. 렌더링 루프 (애니메이션)
function animate() {
    requestAnimationFrame(animate); 
    
    controls.update(); 
    
    renderer.render(scene, camera); 
}

animate();

// 7. 창 크기 변경 시 화면 비율 유지
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
