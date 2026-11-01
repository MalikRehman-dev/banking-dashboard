import { useRef, useState } from "react";

// Double click se bachne ke liye: jab tak kaam chal raha hai dobara chalne nahi dega
export default function useBusy() {
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);

  function run(work) {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setTimeout(async () => {
      try {
        await work();
      } finally {
        lock.current = false;
        setBusy(false);
      }
    }, 600);
  }

  return [busy, run];
}
