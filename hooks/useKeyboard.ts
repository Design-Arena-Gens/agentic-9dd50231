import { useEffect, useState } from "react";

export type ControlInputs = {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
  brake: boolean;
  boost: boolean;
  lookLeft: boolean;
  lookRight: boolean;
};

const initialInputs: ControlInputs = {
  forward: false,
  backward: false,
  left: false,
  right: false,
  brake: false,
  boost: false,
  lookLeft: false,
  lookRight: false
};

const keyMap: Record<string, keyof ControlInputs> = {
  KeyW: "forward",
  ArrowUp: "forward",
  KeyS: "backward",
  ArrowDown: "backward",
  KeyA: "left",
  ArrowLeft: "left",
  KeyD: "right",
  ArrowRight: "right",
  Space: "brake",
  ShiftLeft: "boost",
  ShiftRight: "boost",
  KeyQ: "lookLeft",
  KeyE: "lookRight"
};

export function useKeyboardControls(): ControlInputs {
  const [inputs, setInputs] = useState(initialInputs);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const control = keyMap[event.code];
      if (!control) return;
      setInputs(prev => ({ ...prev, [control]: true }));
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      const control = keyMap[event.code];
      if (!control) return;
      setInputs(prev => ({ ...prev, [control]: false }));
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  return inputs;
}
