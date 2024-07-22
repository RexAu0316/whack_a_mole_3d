window.initGame = (React, assetsUrl) => {
  const { useState, useEffect, useRef, Suspense, useMemo } = React;
  const { useFrame, useLoader, useThree } = window.ReactThreeFiber;
  const THREE = window.THREE;
  const { GLTFLoader } = window.THREE;

  // ... (MoleModel and Mole components remain unchanged)

  const HammerModel = React.memo(function HammerModel({ url, scale = [1, 1, 1], position = [0, 0, 0], rotation = [0, 0, 0] }) {
    const gltf = useLoader(GLTFLoader, url);
    const copiedScene = useMemo(() => gltf.scene.clone(), [gltf]);
    
    useEffect(() => {
      copiedScene.scale.set(...scale);
      copiedScene.position.set(...position);
      copiedScene.rotation.set(...rotation);
    }, [copiedScene, scale, position, rotation]);

    return React.createElement('primitive', { object: copiedScene });
  });

  function Hammer() {
    const hammerRef = useRef();
    const { camera, mouse } = useThree();
    const [isHitting, setIsHitting] = useState(false);
    const hitStartTime = useRef(0);

    useFrame((state, delta) => {
      if (hammerRef.current) {
        const vector = new THREE.Vector3(mouse.x, mouse.y, 0.5);
        vector.unproject(camera);
        const dir = vector.sub(camera.position).normalize();
        const distance = -camera.position.z / dir.z;
        const pos = camera.position.clone().add(dir.multiplyScalar(distance));
        hammerRef.current.position.copy(pos);

        // Hitting animation
        if (isHitting) {
          const elapsedTime = state.clock.getElapsedTime() - hitStartTime.current;
          if (elapsedTime < 0.2) {
            hammerRef.current.rotation.x = Math.PI / 2 * (elapsedTime / 0.2);
          } else {
            setIsHitting(false);
            hammerRef.current.rotation.x = 0;
          }
        }
      }
    });

    const handleClick = () => {
      setIsHitting(true);
      hitStartTime.current = THREE.MathUtils.clamp(THREE.MathUtils.randFloat(0, 1), 0, 1);
    };

    return React.createElement(
      'group',
      { ref: hammerRef, onClick: handleClick },
      React.createElement(HammerModel, { 
        url: `${assetsUrl}/hammer.glb`,
        scale: [50, 50, 50],
        position: [0, 0, -2],
        rotation: [-Math.PI / 2, 0, 0]  // Rotate hammer to be vertical
      })
    );
  }

  // ... (Camera component remains unchanged)

  function WhackAMole3D() {
    // ... (WhackAMole3D logic remains mostly unchanged)

    const whackMole = (index) => {
      if (moles[index]) {
        setScore(prevScore => prevScore + 1);
        setMoles(prevMoles => {
          const newMoles = [...prevMoles];
          newMoles[index] = false;
          return newMoles;
        });
      }
    };

    return React.createElement(
      React.Fragment,
      null,
      React.createElement(Camera),
      React.createElement('ambientLight', { intensity: 0.5 }),
      React.createElement('pointLight', { position: [10, 10, 10] }),
      moles.map((isActive, index) => 
        React.createElement(Mole, {
          key: index,
          position: [
            (index % 3 - 1) * 4,
            0,
            (Math.floor(index / 3) - 1) * 4
          ],
          isActive: isActive,
          onWhack: () => whackMole(index)
        })
      ),
      React.createElement(Hammer)
    );
  }

  return WhackAMole3D;
};

console.log('3D Whack-a-Mole game script loaded');