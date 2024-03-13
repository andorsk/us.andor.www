import React, { useRef, useState, useEffect, lazy, Suspense } from "react";

const LazyThreeScene = lazy(() => import("./sim"));

const ThreeSceneWrapper = () => {
  const [isComponentVisible, setIsComponentVisible] = useState(false);

  useEffect(() => {
    setIsComponentVisible(true);
  }, []);

  return (
    <div style={{ width: "100%", height: "400px" }}>
      {isComponentVisible ? (
        <Suspense fallback={<div>Loading 3D Scene...</div>}>
          <LazyThreeScene />
        </Suspense>
      ) : (
        <div>Component is not visible yet</div>
      )}
    </div>
  );
};

export default ThreeSceneWrapper;
