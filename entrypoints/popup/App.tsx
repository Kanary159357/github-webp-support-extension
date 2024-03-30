import { useEffect, useState } from "react";

function App() {
  const [scriptInjected, setScriptInjected] = useState(false);

  useEffect(() => {
    async function init() {
      const initialValue = await browser.runtime.sendMessage({
        action: "getToggleState",
      });
      setScriptInjected(initialValue.isEnabled);
    }
    init();
  }, []);

  const toggleScriptInjection = () => {
    browser.runtime.sendMessage({
      action: "toggleState",
      isEnabled: !scriptInjected,
    });
    setScriptInjected(!scriptInjected);
  };

  return (
    <div>
      <button onClick={toggleScriptInjection}>
        {scriptInjected ? "Injected" : "Not Injected"}
      </button>
    </div>
  );
}

export default App;
