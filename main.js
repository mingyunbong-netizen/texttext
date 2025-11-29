// main.js - 개별 모델 위치 및 회전 기능 최종 버전 (배경 흰색, 원형 배치)

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
// 배경색을 순수한 흰색(0xffffff)으로 설정했습니다.
scene.background = new THREE.Color(0xffffff); 

const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
// 원형 배치가 넓으므로 카메라를 약간 더 뒤로 빼서 잘 보이게 조정합니다.
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

// 🌟🌟🌟 모델 크기와 높이 정보는 사용자 설정 값을 그대로 유지합니다. 🌟🌟🌟
const modelsToLoad = [
    { name: 'shoes.glb',    scale: 10, positionY: 1 }, 
    { name: 'bag.glb',      scale: 7, positionY: -4 },
    { name: 'ball.glb',     scale: 5, positionY: 2 },
    { name: 'book.glb',     scale: 10, positionY: -1 }, 
    { name: 'close.glb',    scale: 5, positionY: -5 },
    { name: 'glasses.glb',  scale: 20, positionY: -1 }, 
    { name: 'guard.glb',    scale: 10, positionY: -3 },
    { name: 'persimmon.glb',scale: 20, positionY: 2 },
];

// --- 💡 원형 배치 계산 로직 ---
const radius = 7.0; // 원형 배치의 반지름 (원하는 크기로 조절 가능)
const modelCount = modelsToLoad.length;
const angleStep = (2 * Math.PI) / modelCount; // 각 모델 간의 각도 간격

modelsToLoad.forEach((modelInfo, index) => {
    // 0도부터 시작하여 각 모델의 각도를 계산
    const angle = index * angleStep;
    
    // 🌟 X, Z 위치를 원형으로 계산 (삼각 함수 사용)
    modelInfo.positionX = radius * Math.cos(angle); 
    modelInfo.positionZ = radius * Math.sin(angle); 
});
// ------------------------------------


// 각 모델을 순회하며 로드하고 계산된 위치에 배치합니다.
modelsToLoad.forEach((modelInfo, index) => {
    loader.load(
        modelInfo.name,
        function (gltf) {
            const model = gltf.scene;

            // **원형 배치 및 높이 설정**
            model.position.x = modelInfo.positionX; 
            model.position.y = modelInfo.positionY; 
            model.position.z = modelInfo.positionZ; 
            
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
