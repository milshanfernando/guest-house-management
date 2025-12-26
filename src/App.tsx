import { useState } from "react";
import { Toaster } from "react-hot-toast";
import AppRoutes from "./routes/AppRoutes";
import Intro from "./utility/Intro";

const App = () => {
  const [showIntro, setShowIntro] = useState(true);

  return (
    <div>
      {showIntro && <Intro onComplete={() => setShowIntro(false)} />}
      {!showIntro && (
        <>
          <Toaster position="top-right" reverseOrder={false} />
          <AppRoutes />
        </>
      )}
    </div>
  );
};

export default App;
