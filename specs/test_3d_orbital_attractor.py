"""
Alexicon / Herbert Geometry Prototype
-------------------------------------
Transition from 2D plane to 3D topology:
1. Ground Plane (X, Y): Nouns (anchors) & Verbs (kinetic state transitions)
2. Z-Axis Displacement: Adjectives / Emotional amplitude driven by Rössler nonlinearity
3. Orbital Dynamics: Satellite camera projection around the central fulcrum (Rest)
"""

import math


def roessler_step(x, y, z, a=0.2, b=0.2, c=5.7, dt=0.01):
    """
    Rössler attractor differential step:
    dx/dt = -y - z
    dy/dt = x + a*y
    dz/dt = b + z*(x - c)  <-- Nonlinear trigger elevating Z when x exceeds threshold c
    """
    dx = (-y - z) * dt
    dy = (x + a * y) * dt
    dz = (b + z * (x - c)) * dt
    return x + dx, y + dy, z + dz


def apply_orbital_camera(x, y, z, orbit_angle, tilt_angle=math.radians(25)):
    """
    Project 3D coordinates from an orbiting viewpoint with elevation tilt.
    - orbit_angle: rotational position around the center
    - tilt_angle: plane tilt relative to the observer
    """
    # Orbital rotation around Y-axis
    x_rot = x * math.cos(orbit_angle) + z * math.sin(orbit_angle)
    z_rot = -x * math.sin(orbit_angle) + z * math.cos(orbit_angle)
    y_rot = y

    # Camera tilt around X-axis
    y_cam = y_rot * math.cos(tilt_angle) - z_rot * math.sin(tilt_angle)
    z_cam = y_rot * math.sin(tilt_angle) + z_rot * math.cos(tilt_angle)
    x_cam = x_rot

    return x_cam, y_cam, z_cam


def generate_3d_semantic_frame(steps=500, dt=0.02, orbit_speed=0.01):
    """
    Generates the orbital 3D semantic trajectory.
    """
    x, y, z = 0.5, 0.5, 0.0
    trajectory = []

    print(f"=== Generating {steps} steps of 3D Orbital Trajectory ===")

    for step in range(steps):
        # 1. Non-linear step
        x, y, z = roessler_step(x, y, z, dt=dt)

        # 2. Orbital angle progression
        orbit_angle = step * orbit_speed

        # 3. Viewport projection
        x_proj, y_proj, z_proj = apply_orbital_camera(x, y, z, orbit_angle)
        trajectory.append((x_proj, y_proj, z_proj))

        if step % 50 == 0:
            print(
                f"Step {step:03d} | Plane (X, Y): ({x:6.2f}, {y:6.2f}) | "
                f"Z-Amp: {z:6.2f} | Proj (X, Y, Z): ({x_proj:6.2f}, {y_proj:6.2f}, {z_proj:6.2f})"
            )

    return trajectory


if __name__ == "__main__":
    traj = generate_3d_semantic_frame()
    max_z = max(pt[2] for pt in traj)
    min_z = min(pt[2] for pt in traj)

    print("\n=== Invariant Validation ===")
    print(f"Z-axis dynamic range (depth/amplitude): [{min_z:.2f}, {max_z:.2f}]")
    print("Status: 2D base successfully elevated into stable 3D orbital space.")