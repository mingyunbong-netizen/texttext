// main.js

import * as THREE from 'three';
// GLB 파일 로드를 위한 모듈을 불러옵니다.
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
// 마우스 조작을 위한 컨트롤러 모듈을 불러옵니다.
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';


// 1. 기본 3요소 설정: 장면(Scene), 카메라(Camera), 렌더러(Renderer)
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xeeeeee); // 배경색을 밝은 회색으로 설정

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(4, 4, 4); // 카메라 위치를 더 넓게 조정하여 여러 모델을 담습니다.

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement); // 렌더링 결과를 HTML에 추가

// 2. 조명 설정 (3D 모델을 보이게 하려면 빛이 필수입니다!)
const ambientLight = new THREE.AmbientLight(0xffffff, 0.8); // 은은한 주변광
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5); // 방향성 광원
directionalLight.position.set(5, 10, 7).normalize();
scene.add(directionalLight);

// 3. 컨트롤 설정 (마우스 조작)
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // 움직임을 부드럽게 합니다.


// 4. GLB 파일 로드!
const loader = new GLTFLoader(); 

// 💡 헬퍼 함수: min부터 max 사이의 랜덤 값을 반환합니다.
function getRandomPosition(min, max) {
    return Math.random() * (max - min) + min;
}

// 로드할 파일 목록을 정의합니다. (shose.glb로 파일명이 확인되어 수정했습니다.)
const modelsToLoad = [
    { name: 'shose.glb', scale: 1.5 },   // 크기를 조금 키워봤습니다.
    { name: 'bag.glb', scale: 1.5 },
    { name: 'ball.glb', scale: 1.5 },
    { name: 'book.glb', scale: 1.5 },
    { name: 'close.glb', scale: 1.5 },
    { name: 'glasses.glb', scale: 5.0 }, // 안경은 작을 수 있어 더 크게 키워봤습니다.
    { name: 'guard.glb', scale: 1.5 },
    { name: 'persimmon.glb', scale: 1.5 },
];

// 각 모델을 순회하며 로드하고 랜덤 위치에 배치합니다.
modelsToLoad.forEach(modelInfo => {
    loader.load(
        modelInfo.name,
        function (gltf) {
            const model = gltf.scene;

            // **랜덤 위치 설정:** (X, Y, Z 모두 -3에서 3 사이의 랜덤한 위치)
            model.position.x = getRandomPosition(-3.0, 3.0); 
            model.position.y = getRandomPosition(0.0, 1.0); // Y축은 0에서 1.0 사이 (바닥 위)
            model.position.z = getRandomPosition(-3.0, 3.0); 

            // 모델 크기 조절
            model.scale.set(modelInfo.scale, modelInfo.scale, modelInfo.scale);

            scene.add(model);
            console.log(`${modelInfo.name} 로드 완료!`);
        },
        undefined, 
        function (error) {
            console.error(`모델 로드 중 에러 발생: ${modelInfo.name}`, error);
        }
    );
});


// 5. 렌더링 루프 (애니메이션)
function animate() {
    requestAnimationFrame(animate); 
    
    controls.update(); // 카메라 상태를 계속 업데이트 (마우스 조작 반영)
    
    renderer.render(scene, camera); // 장면을 다시 그립니다.
}

animate();

// 6. 창 크기 변경 시 화면 비율 유지
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
