function sanitizeGeminiHistory(history) {
  let validHistory = Array.isArray(history) ? history.map(item => {
    const role = (item.role === "user" || item.role === "human") ? "user" : "model";
    let text = "";
    if (item.parts && Array.isArray(item.parts) && item.parts[0]) {
      text = item.parts[0].text || "";
    } else {
      text = item.text || item.content || "";
    }
    return { role, parts: [{ text: String(text).trim() }] };
  }).filter(item => item.parts[0].text !== "") : [];

  // 1. First content MUST be with role 'user' -> Shift leading 'model' messages
  while (validHistory.length > 0 && validHistory[0].role !== "user") {
    validHistory.shift();
  }

  // 2. Ensure strictly alternating roles (user -> model -> user -> model)
  const sanitizedHistory = [];
  validHistory.forEach(item => {
    if (sanitizedHistory.length === 0) {
      if (item.role === "user") sanitizedHistory.push(item);
    } else {
      const lastRole = sanitizedHistory[sanitizedHistory.length - 1].role;
      if (item.role !== lastRole) {
        sanitizedHistory.push(item);
      }
    }
  });

  // 3. If last item is 'user', pop it because current new message will be sent via sendMessage()
  if (sanitizedHistory.length > 0 && sanitizedHistory[sanitizedHistory.length - 1].role === "user") {
    sanitizedHistory.pop();
  }

  return sanitizedHistory;
}

// Test case 1: Started with model greeting
const test1 = [{ role: 'model', text: 'Chào bạn! Mình là AI WINNOTech' }];
console.log("Test 1 Result:", sanitizeGeminiHistory(test1));

// Test case 2: Model greeting -> User question -> Model answer
const test2 = [
  { role: 'model', text: 'Chào bạn!' },
  { role: 'user', text: 'Tư vấn PC 15 triệu' },
  { role: 'model', text: 'Dạ với 15 triệu...' }
];
console.log("Test 2 Result:", sanitizeGeminiHistory(test2));

// Test case 3: User duplicate messages
const test3 = [
  { role: 'user', text: 'Alo' },
  { role: 'user', text: 'Shop ơi' },
  { role: 'model', text: 'Dạ shop đây ạ' }
];
console.log("Test 3 Result:", sanitizeGeminiHistory(test3));
