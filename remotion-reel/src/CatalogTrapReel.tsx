import {
  AbsoluteFill,
  interpolate,
  Sequence,
  staticFile,
  useCurrentFrame,
  Audio,
} from "remotion";
import React from "react";

interface SceneProps {
  imageName: string;
  durationInFrames: number;
}

const Scene: React.FC<SceneProps> = ({ imageName, durationInFrames }) => {
  const frame = useCurrentFrame();

  // Smooth fade-in transition for the first 10 frames of the scene
  const opacity = interpolate(frame, [0, 10], [0, 1], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });

  // Ken Burns zoom effect (scales slowly from 1.0 to 1.08 over the duration of the scene)
  const scale = interpolate(frame, [0, durationInFrames], [1, 1.08], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: "#090A0F" }}>
      <div
        style={{
          width: "100%",
          height: "100%",
          opacity,
          transform: `scale(${scale})`,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <img
          src={staticFile(imageName)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
          alt={imageName}
        />
      </div>
    </AbsoluteFill>
  );
};

export const CatalogTrapReel: React.FC = () => {
  // Scene timings in frames (at 30 fps)
  const scene1Duration = 120; // 4 seconds
  const scene2Duration = 210; // 7 seconds
  const scene3Duration = 270; // 9 seconds
  const scene4Duration = 150; // 5 seconds
  const scene5Duration = 210; // 7 seconds

  return (
    <AbsoluteFill style={{ backgroundColor: "#090A0F" }}>
      <Audio src={staticFile("voiceover.mp3")} />
      {/* Scene 1: Hook */}
      <Sequence from={0} durationInFrames={scene1Duration}>
        <Scene imageName="scene1_hook.png" durationInFrames={scene1Duration} />
      </Sequence>

      {/* Scene 2: Problem */}
      <Sequence from={scene1Duration} durationInFrames={scene2Duration}>
        <Scene
          imageName="scene2_problem.png"
          durationInFrames={scene2Duration}
        />
      </Sequence>

      {/* Scene 3: Math */}
      <Sequence
        from={scene1Duration + scene2Duration}
        durationInFrames={scene3Duration}
      >
        <Scene imageName="scene3_math.png" durationInFrames={scene3Duration} />
      </Sequence>

      {/* Scene 4: App Promo */}
      <Sequence
        from={scene1Duration + scene2Duration + scene3Duration}
        durationInFrames={scene4Duration}
      >
        <Scene imageName="scene4_app.png" durationInFrames={scene4Duration} />
      </Sequence>

      {/* Scene 5: Outro/CTA */}
      <Sequence
        from={scene1Duration + scene2Duration + scene3Duration + scene4Duration}
        durationInFrames={scene5Duration}
      >
        <Scene
          imageName="scene5_branding.png"
          durationInFrames={scene5Duration}
        />
      </Sequence>
    </AbsoluteFill>
  );
};
