import { useRef, useEffect } from "react";

export function useHorizontalScroll () {
    const elRef = useRef();
    useEffect(() => {
      const el = elRef.current;
      if (el) {
          //@ts-ignore
        const onWheel = (e) => {
          if (e.deltaY === 0) return;
          //@ts-ignore
          if (!(el.scrollLeft === 0 && e.deltaY < 0) && !(el.scrollWidth - el.clientWidth - Math.round(el.scrollLeft) === 0 && e.deltaY > 0)) {
            e.preventDefault();
          }
          //@ts-ignore
          el.scrollTo({
              //@ts-ignore
            left: el.scrollLeft + e.deltaY,
            behavior: 'smooth'
          });
        };
        //@ts-ignore
        el.addEventListener('wheel', onWheel);
        //@ts-ignore
        return () => el.removeEventListener('wheel', onWheel);
      }
    }, []);
    return elRef;
  }