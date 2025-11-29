// main.js - 개별 모델 위치 및 회전 기능 최종 버전 (X축 일렬, Y/Z축 0 고정)

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
// 모델이 일렬로 길게 배치되므로, X축을 중심으로 넓게 볼 수 있도록 카메라 위치 조정
camera.position.set(0, 0, 15); 

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

// 🌟🌟🌟 모델 크기 정보만 유지합니다. 위치는 코드가 자동으로 계산합니다. 🌟🌟🌟
const modelsToLoad = [
    { name: 'shoes.glb',    scale: 10 }, 
    { name: 'bag.glb',      scale: 7 },
    { name: 'ball.glb',     scale: 5 },
    { name: 'book.glb',     scale: 10 }, 
    { name: 'close.glb',    scale: 5 },
    { name: 'glasses.glb',  scale: 20 }, 
    { name: 'guard.glb',    scale: 10 },
    { name: 'persimmon.glb',scale: 20 },
];

// --- 💡 X축 일렬 배치 계산 로직 ---
const spacing = 2.0; // 모델 간의 간격 (조절 가능)
const modelCount = modelsToLoad.length;
// 모델들을 중앙(0)을 중심으로 좌우로 배치하기 위한 시작점 계산
const startX = -((modelCount - 1) * spacing) / 2; 

modelsToLoad.forEach((modelInfo, index) => {
    // X축 위치 계산: 시작점 + (인덱스 * 간격)
    modelInfo.positionX = startX + (index * spacing); 
    
    // 🌟 Y축 (높이) = 0.0 고정
    modelInfo.positionY = 0.0; 
    
    // 🌟 Z축 (깊이) = 0.0 고정 (평면 배치)
    modelInfo.positionZ = 0.0;
});
// ------------------------------------


// 각 모델을 순회하며 로드하고 계산된 위치에 배치합니다.
modelsToLoad.forEach((modelInfo, index) => {
    loader.load(
        modelInfo.name,
        function (gltf) {
            const model = gltf.scene;

            // **계산된 X축 일렬 위치 및 Y/Z축 0 고정**
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
