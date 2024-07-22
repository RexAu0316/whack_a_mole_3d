window.initGame = (React, assetsUrl) => {
  const { useState, useEffect, useRef } = React;
  const { useFrame, useLoader, useThree } = window.ReactThreeFiber;
  const THREE = window.THREE;
  const { GLTFLoader } = window.THREE;

  function Mole({ position, isActive, onWhack }) {
    const moleRef = useRef();
    const { nodes, materials } = useLoader(GLTFLoader, `${assetsUrl}/mole.glb`);

    useEffect(() => {
      if (moleRef.current) {
        moleRef.current.position.y = isActive ? 0.5 : -0.5;
      }
    }, [isActive]);

    return React.createElement(
      'group',
      { 
        ref: moleRef,
        position: position,
        onClick: onWhack
      },
      React.createElement('primitive', {
        object: nodes.Mole,
        material: materials.MoleMaterial
      })
    );
  }

  function Hammer() {
    const hammerRef = useRef();
    const { camera, mouse } = useThree();
    const { nodes, materials } = useLoader(GLTFLoader, `${assetsUrl}/hammer.glb`);

    useFrame(() => {
      if (hammerRef.current) {
        const vector = new THREE.Vector3(mouse.x, mouse.y, 0.5);
        vector.unproject(camera);
        const dir = vector.sub(camera.position).normalize();
        const distance = -camera.position.z / dir.z;
        const pos = camera.position.clone().add(dir.multiplyScalar(distance));
        hammerRef.current.position.copy(pos);
      }
    });

    return React.createElement(
      'group',
      { ref: hammerRef },
      React.createElement('primitive', {
        object: nodes.Hammer,
        material: materials.HammerMaterial
      })
    );
  }

  function WhackAMole3D() {
    const [moles, setMoles] = useState(Array(9).fill(false));
    const [score, setScore] = useState(0);

    useEffect(() => {
      const interval = setInterval(() => {
        setMoles(prevMoles => {
          const newMoles = [...prevMoles];
          const inactiveIndices = newMoles.reduce((acc, mole, index) => mole ? acc : [...acc, index], []);
          if (inactiveIndices.length > 0) {
            const randomIndex = inactiveIndices[Math.floor(Math.random() * inactiveIndices.length)];
            newMoles[randomIndex] = true;
          }
          return newMoles;
        });
      }, 1000);

      return () => clearInterval(interval);
    }, []);

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
      React.createElement('ambientLight', { intensity: 0.5 }),
      React.createElement('pointLight', { position: [10, 10, 10] }),
      moles.map((isActive, index) => 
        React.createElement(Mole, {
          key: index,
          position: [
            (index % 3 - 1) * 2,
            0,
            (Math.floor(index / 3) - 1) * 2
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