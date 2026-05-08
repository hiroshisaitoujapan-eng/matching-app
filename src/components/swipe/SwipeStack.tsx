"use client";

import { useRef } from "react";
import { useSprings, animated } from "@react-spring/web";
import { useDrag } from "@use-gesture/react";
import { SwipeCard } from "./SwipeCard";
import type { Profile } from "@/types";

const SWIPE_THRESHOLD = 120;

interface SwipeStackProps {
  candidates: Profile[];
  onLike: (id: string) => void;
  onSkip: (id: string) => void;
}

export function SwipeStack({ candidates, onLike, onSkip }: SwipeStackProps) {
  const gone = useRef(new Set<number>());

  const [springs, api] = useSprings(candidates.length, (i) => ({
    x: 0,
    y: 0,
    rot: 0,
    scale: i === candidates.length - 1 ? 1 : 0.95,
    opacity: 1,
    config: { friction: 50, tension: 200 },
  }));

  const triggerSwipe = (index: number, direction: "left" | "right") => {
    gone.current.add(index);
    const xOut = direction === "right" ? 600 : -600;
    api.start((i) => {
      if (i !== index) return;
      return { x: xOut, rot: xOut / 10, opacity: 0 };
    });

    const profile = candidates[index];
    if (direction === "right") {
      onLike(profile.id);
    } else {
      onSkip(profile.id);
    }
  };

  const bind = useDrag(({ args: [index], active, movement: [mx], velocity: [vx], direction: [dx] }) => {
    const trigger = Math.abs(mx) > SWIPE_THRESHOLD || Math.abs(vx) > 0.5;

    if (!active && trigger) {
      triggerSwipe(index, dx > 0 ? "right" : "left");
      return;
    }

    api.start((i) => {
      if (i !== index) return;
      const isGone = gone.current.has(i);
      const x = isGone ? (dx > 0 ? 600 : -600) : active ? mx : 0;
      const rot = active ? mx / 20 : 0;
      const scale = active ? 1.05 : i === candidates.length - 1 - gone.current.size ? 1 : 0.95;
      return { x, rot, scale, config: { friction: 50, tension: active ? 800 : 200 } };
    });
  });

  const topIndex = candidates.length - 1 - gone.current.size;

  return (
    <div className="relative w-full" style={{ height: "min(480px, calc(100svh - 280px))" }}>
      {springs.map(({ x, y, rot, scale, opacity }, i) => (
        <animated.div
          key={candidates[i].id}
          style={{
            position: "absolute",
            inset: 0,
            x,
            y,
            rotate: rot,
            scale,
            opacity,
            zIndex: i,
          }}
        >
          <SwipeCard
            profile={candidates[i]}
            isTop={i === topIndex}
            bindGesture={bind(i)}
            onLike={() => triggerSwipe(i, "right")}
            onSkip={() => triggerSwipe(i, "left")}
          />
        </animated.div>
      ))}
    </div>
  );
}
