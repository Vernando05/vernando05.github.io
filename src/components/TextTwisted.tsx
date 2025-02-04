import type { Mesh, ShaderMaterial } from 'three';
import { Canvas, extend, useFrame, useLoader } from '@react-three/fiber';
import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import useWindowSize from 'react-use/lib/useWindowSize';
import { FontLoader, TextGeometry } from 'three-stdlib';

extend({ TextGeometry });

function TwistedTextMesh(props: { containerWidth: number }) {
  const { containerWidth } = props;
  const config = useMemo(() => ({
    text: 'VERNANDOSIMBOLON',
    fontSize: 0.5,
    fontDepth: 0.2,
    uRadius: 2,
    uTwists: 0,
    uTwistSpeed: 7.9,
    uRotateSpeed: 1,
  }), []);

  const refMesh = useRef<Mesh>(null!);
  const refMaterial = useRef<ShaderMaterial>(null!);
  const font = useLoader(FontLoader, '/svg/Outfit_Bold.json');

  const geo = new TextGeometry(config.text, { font, size: config.fontSize, height: config.fontDepth, curveSegments: 100, bevelEnabled: false });
  geo.center();
  geo.computeBoundingBox();
  const refUniforms = {
    uTime: { value: 0 },
    uTwistSpeed: { value: config.uTwistSpeed },
    uRotateSpeed: { value: config.uRotateSpeed },
    uTwists: { value: config.uTwists },
    uRadius: { value: config.uRadius },
    uMin: { value: { x: 0, y: 0, z: 0 } },
    uMax: { value: { x: 0, y: 0, z: 0 } },
  };

  useEffect(
    () => {
      if (refMaterial.current.userData.shader) {
        refMaterial.current.userData.shader.uniforms.uRadius.value = config.uRadius;
        refMaterial.current.userData.shader.uniforms.uTwists.value = config.uTwists;

        refMaterial.current.userData.shader.uniforms.uTwistSpeed.value = config.uTwistSpeed;
        refMaterial.current.userData.shader.uniforms.uRotateSpeed.value = config.uRotateSpeed;
      }
    },
    [config, containerWidth],
  );

  useFrame((_, delta) => {
    if (refMaterial.current.userData.shader) {
      refMaterial.current.userData.shader.uniforms.uTime.value += delta;
    }
  });

  useLayoutEffect(() => {
    refMesh.current.geometry = geo;
    geo.computeBoundingBox();
    const shader = refMaterial.current.userData.shader;
    if (shader) {
      shader.uniforms.uMin.value = geo.boundingBox?.min;
      shader.uniforms.uMax.value = geo.boundingBox?.max;
      shader.uniforms.uMax.value.x += config.fontSize / 6;
    }
    refUniforms.uMin.value = geo.boundingBox?.min || { x: 0, y: 0, z: 0 };
    refUniforms.uMax.value = geo.boundingBox?.max || { x: 0, y: 0, z: 0 };
    // space after text
    refUniforms.uMax.value.x += config.fontSize / 6;
  });

  const onBeforeCompile = (shader: ShaderMaterial) => {
    shader.uniforms = { ...refUniforms, ...shader.uniforms };

    shader.vertexShader = `
    uniform float uTwistSpeed;
      uniform float uRotateSpeed;
      uniform float uTwists;
      uniform float uRadius;
      uniform vec3 uMin;
      uniform vec3 uMax;
      uniform float uTime;
      float PI = 3.141592653589793238;
    mat4 rotationMatrix(vec3 axis, float angle) {
      axis = normalize(axis);
      float s = sin(angle);
      float c = cos(angle);
      float oc = 1.0 - c;

      return mat4(oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,  0.0,
                  oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,  0.0,
                  oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c,           0.0,
                  0.0,                                0.0,                                0.0,                                1.0);
  }

  vec3 rotate(vec3 v, vec3 axis, float angle) {
    mat4 m = rotationMatrix(axis, angle);
    return (m * vec4(v, 1.0)).xyz;
  }
  float mapRange(float value, float min1, float max1, float min2, float max2) {
    // return min2 + (value - min1) * (max2 - min2) / (max1 - min1);
    return clamp( min2 + (value - min1) * (max2 - min2) / (max1 - min1), min2, max2 );
  }

    ${shader.vertexShader}`;

    shader.vertexShader = shader.vertexShader.replace(
      '#include <beginnormal_vertex>',
      '#include <beginnormal_vertex>'
      + `
          float xx = mapRange(position.x, uMin.x, uMax.x, -1., 1.0);
          // twistnormal
          objectNormal = rotate(objectNormal, vec3(1.,0.,0.), 0.5*PI*uTwists*xx + 0.01*uTime*uTwistSpeed);

          // circled normal
          objectNormal = rotate(objectNormal, vec3(0.,0.,1.), (xx + 0.01*uTime*uRotateSpeed)*PI);

      `,
    );

    shader.vertexShader = shader.vertexShader.replace(
      '#include <begin_vertex>',
      '#include <begin_vertex>'
      + `
        vec3 pos = transformed;
        float theta = (xx + 0.01*uTime*uRotateSpeed)*PI;
        pos = rotate(pos,vec3(1.,0.,0.), 0.5*PI*uTwists*xx + 0.01*uTime*uTwistSpeed);



        vec3 dir = vec3(sin(theta), cos(theta),pos.z);
        vec3 circled = vec3(dir.xy*uRadius,pos.z) + vec3(pos.y*dir.x,pos.y*dir.y,0.);

        transformed = circled;

      `,
    );

    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <output_fragment>',
      '#include <output_fragment>'
      + `
      //  gl_FragColor = vec4(1.,0.,0.,1.);
    `,
    );
    refMaterial.current.userData.shader = shader;
  };

  return (
    <mesh ref={refMesh} castShadow>
      <bufferGeometry attach="geometry" />
      <meshPhongMaterial
        onBeforeCompile={onBeforeCompile}
        ref={refMaterial}
        attach="material"
        color={0xEBEBEB}
        specular={0xFFFFFF}
        shininess={100}
        reflectivity={1}
        refractionRatio={0.98}
        emissive={0x000000}
      />
    </mesh>
  );
}
export default function TwistedText() {
  const refCanvas = useRef(null!);
  const refContainer = useRef(null!);
  // const resize = () => {
  //   refCanvas.current.width = refContainer.current.offsetWidth;
  //   refCanvas.current.height = refContainer.current.offsetHeight;
  //   config.ctx.a.drawImage(refCanvasB.current, 0, 0);
  //   width = container.offsetWidth;
  //   height = container.offsetHeight;
  //   renderer.setSize(width, height);
  //   camera.aspect = width / height;
  //   camera.updateProjectionMatrix();
  // }

  const { width } = useWindowSize();

  return (
    <div
      ref={refContainer}
      className="h-[400px] lg:h-[600px] xl:h-lvh"
    >
      <Canvas
        shadows
        camera={{ position: [0, 0, 4], zoom: width < 768 ? 0.9 : 1 }}
        gl={{ preserveDrawingBuffer: true }}
        ref={refCanvas}
      >
        <TwistedTextMesh containerWidth={width} />
        <ambientLight color={0x000000} />
        <pointLight color={0xFFFFFF} position={[0, 0, -1]} decay={0} />
      </Canvas>
    </div>
  );
}
