// main.js - 개별 모델 회전 기능 추가

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
scene.background = new THREE.Color(0xeeeeee);

const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
// 카메라 위치를 뒤로 충분히 빼서 일렬로 정렬된 모델 전체가 보이게 합니다.
camera.position.set(0, 2, 8); 

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement); 

// 2. 조명 설정
const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
directionalLight.position.set(5, 10, 7).normalize();
scene.add(directionalLight);

// 3. 컨트롤 설정 (카메라는 전체 씬의 중심(0,0,0)을 바라보게 고정)
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.target.set(0, 0, 0); // **카메라가 원점(0,0,0)을 바라보게 타겟을 고정**
controls.enablePan = false;   // 카메라 이동 방지
controls.enableRotate = false; // **카메라 회전 방지** (전체 씬 회전 방지)
controls.maxDistance = 10;
controls.minDistance = 2;


// 4. GLB 파일 로드!
const loader = new GLTFLoader(); 
const modelsToLoad = [
    { name: 'shose.glb', scale: 1.5 },
    { name: 'bag.glb', scale: 1.5 },
    { name: 'ball.glb', scale: 1.5 },
    { name: 'book.glb', scale: 1.5 },
    { name: 'close.glb', scale: 1.5 },
    { name: 'glasses.glb', scale: 5.0 }, 
    { name: 'guard.glb', scale: 1.5 },
    { name: 'persimmon.glb', scale: 1.5 },
];

const spacing = 2.5; // 모델 간의 간격
const startX = -((modelsToLoad.length - 1) * spacing) / 2; // 중앙 정렬 시작점 계산

modelsToLoad.forEach((modelInfo, index) => {
    loader.load(
        modelInfo.name,
        function (gltf) {
            const model = gltf.scene;

            // **일렬 배치:** X축 위치를 간격에 맞춰 순차적으로 설정합니다.
            model.position.x = startX + index * spacing; 
            model.position.y = 0; 
            model.position.z = 0; 

            // 모델 크기 조절 및 이름 태그 설정 (나중에 감지하기 위함)
            model.scale.set(modelInfo.scale, modelInfo.scale, modelInfo.scale);
            model.userData.modelName = modelInfo.name; // 모델 고유 이름 저장

            scene.add(model);
        },
        undefined, 
        function (error) {
            console.error(`모델 로드 중 에러 발생: ${modelInfo.name}`, error);
        }
    );
});


// 5. 마우스 이벤트 리스너 추가
renderer.domElement.addEventListener('mousedown', onMouseDown, false);
renderer.domElement.addEventListener('mousemove', onMouseMove, false);
renderer.domElement.addEventListener('mouseup', onMouseUp, false);

function onMouseDown(event) {
    // 캔버스 내 마우스 좌표를 Three.js 좌표계(-1에서 1)로 변환
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    // 씬에 있는 모든 모델을 검사합니다.
    const intersects = raycaster.intersectObjects(scene.children, true); 

    if (intersects.length > 0) {
        // 교차된 객체 중 가장 가까운 객체의 최상위 부모(gltf.scene)를 찾습니다.
        let target = intersects[0].object;
        while (target.parent && target.parent !== scene) {
            target = target.parent;
        }

        // 씬에 직접 추가된 모델인 경우에만 선택합니다.
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

    // 마우스 이동 거리 계산
    const deltaX = event.clientX - previousMousePosition.x;
    // const deltaY = event.clientY - previousMousePosition.y; // Y축 회전만 필요

    // **Y축 회전 적용** (마우스를 좌우로 움직이면 모델이 Y축으로 회전)
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
    
    controls.update(); // 카메라 상태 업데이트 (여전히 필요)
    
    renderer.render(scene, camera); 
}

animate();

// 7. 창 크기 변경 시 화면 비율 유지
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
