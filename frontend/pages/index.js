const simulateMatch = async () => {
  const res = await fetch("https://ipl-simulator-tb8n.onrender.com/simulate", {
    method: "POST"
  });

  const data = await res.json();
  setResult(data);
};
