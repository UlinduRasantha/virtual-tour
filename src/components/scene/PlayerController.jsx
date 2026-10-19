import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { CapsuleCollider, RigidBody, useBeforePhysicsStep, useRapier } from '@react-three/rapier';
import { Euler, Vector3 } from 'three';
import useMovementInput, { isTextInput } from '../../hooks/useMovementInput.js';
import { movementVector } from '../../utils/geometryUtils.js';

export default function PlayerController({ config, active, touch, resetVersion, telemetry }) {
  const body = useRef(), collider = useRef(), controller = useRef();
  const { world } = useRapier();
  const { camera } = useThree();
  const keys = useMovementInput(active, touch);
  const forward = useRef(new Vector3());
  const angles = useRef(new Euler(0, 0, 0, 'YXZ'));
  const player = config.player;
  useEffect(() => {
    const motor = world.createCharacterController(0.02);
    motor.setSlideEnabled(true);
    if (player.grounded) { motor.enableAutostep(player.stepHeight, 0.05, false); motor.enableSnapToGround(0.3); }
    else { motor.disableAutostep(); motor.disableSnapToGround(); }
    controller.current = motor;
    return () => { controller.current = null; world.removeCharacterController(motor); };
  }, [world, player.grounded, player.stepHeight]);
  useEffect(() => {
    const [x, y, z] = player.spawn;
    body.current?.setTranslation({ x, y, z }, true);
    body.current?.setNextKinematicTranslation({ x, y, z });
    camera.position.set(x, y + player.eyeOffsetY, z);
    camera.rotation.set(0, player.initialYaw, 0, 'YXZ');
    touch.current.lookX = 0; touch.current.lookY = 0;
  }, [resetVersion, player, camera, touch]);
  useBeforePhysicsStep(() => {
    if (!body.current || !collider.current || !controller.current) return;
    const p = body.current.translation();
    // Hold the pending kinematic target too, so opening a dialog never leaves a stale move.
    if (!active || isTextInput(document.activeElement)) { body.current.setNextKinematicTranslation(p); return; }
    const held = (...codes) => codes.some(code => keys.current.has(code)) ? 1 : 0;
    const x = held('KeyD', 'ArrowRight') - held('KeyA', 'ArrowLeft') + touch.current.x;
    const z = held('KeyW', 'ArrowUp') - held('KeyS', 'ArrowDown') + touch.current.z;
    camera.getWorldDirection(forward.current);
    const yaw = Math.atan2(-forward.current.x, -forward.current.z);
    const desired = movementVector(x, z, yaw, player.speed);
    // Small downward bias maintains ground contact without overpowering
    // horizontal autostep at this demo's threshold (0.3 m/s at 60 Hz).
    if (player.grounded) desired.y = -0.005;
    controller.current.computeColliderMovement(collider.current, desired);
    const move = controller.current.computedMovement();
    // Office demos remain flat; house mode follows the two threshold floor levels.
    body.current.setNextKinematicTranslation({ x: p.x + move.x, y: player.grounded ? p.y + move.y : player.spawn[1], z: p.z + move.z });
  });
  useFrame(() => {
    if (!body.current) return;
    if (active && (touch.current.lookX || touch.current.lookY)) {
      angles.current.setFromQuaternion(camera.quaternion);
      angles.current.y -= touch.current.lookX * 0.003;
      angles.current.x = Math.max(-1.35, Math.min(1.35, angles.current.x - touch.current.lookY * 0.003));
      camera.quaternion.setFromEuler(angles.current);
    }
    touch.current.lookX = 0; touch.current.lookY = 0;
    const p = body.current.translation();
    camera.position.set(p.x, p.y + player.eyeOffsetY, p.z);
    telemetry.current = { position: [p.x, p.y, p.z], yaw: camera.rotation.y, pitch: camera.rotation.x };
  });
  return <RigidBody ref={body} type="kinematicPosition" colliders={false} position={player.spawn} enabledRotations={[false, false, false]}><CapsuleCollider ref={collider} args={[player.capsuleHalfHeight, player.radius]} /></RigidBody>;
}
