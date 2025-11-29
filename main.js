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
camera.position.set(2, 2, 2); // 카메라를 적당한 위치에 배치

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
// **오류 수정 부분: GLTFLoader 인스턴스를 생성하여 loader 변수에 할당합니다.**
const loader = new GLTFLoader(); 

// **파일 경로 설정:** 새로운 파일 이름 'shoes.glb'를 사용합니다.
const modelPath = 'shoes.glb'; 

loader.load(
    modelPath,
    // 로드 성공 시
    function (gltf) {
        const model = gltf.scene;
        // 필요하다면 모델 크기를 여기서 조절하세요.
        // model.scale.set(0.1, 0.1, 0.1); 
        scene.add(model);
        console.log('3D 모델 로드 완료! (shoes.glb)');
    },
    // 로드 중 (선택 사항)
    undefined, 
    // 에러 발생 시
    function (error) {
        console.error('모델 로드 중 에러 발생:', error);
    }
);


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