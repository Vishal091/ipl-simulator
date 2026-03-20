const simulateMatch = async () => {
  const res = await fetch("https://YOUR-RENDER-URL/simulate", {
    method: "POST"
  });

  const data = await res.json();
  setResult(data);
};
