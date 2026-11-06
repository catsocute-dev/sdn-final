/**
 * Automated test script to verify API logic against the SDN302 practical exam specification.
 * Usage: node scripts/test-api.mjs [baseUrl]
 * Default baseUrl: http://localhost:3000
 */

const BASE_URL = process.argv[2] || "http://localhost:3000";

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ ${message}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failed++;
  }
}

async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, options);
  let json = null;
  const text = await res.text();
  try {
    json = JSON.parse(text);
  } catch {
    json = text;
  }
  return { status: res.status, headers: res.headers, data: json };
}

async function runTests() {
  console.log(`Starting automated API test suite against ${BASE_URL}...\n`);

  // Test 1: Unauthenticated me
  console.log("1. Auth Security Check (Unauthenticated)");
  const meUnauth = await request("/api/auth/me");
  assert(meUnauth.status === 401, "GET /api/auth/me returns 401 without cookie");
  assert(meUnauth.data.error === "Unauthorized", "GET /api/auth/me returns error 'Unauthorized'");

  const readingLogsUnauth = await request("/api/reading-logs");
  assert(readingLogsUnauth.status === 401, "GET /api/reading-logs returns 401 without cookie");

  // Test 2: Register validation
  console.log("\n2. Registration Validations");
  const regNoEmail = await request("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "", password: "password123", confirmPassword: "password123" }),
  });
  assert(regNoEmail.status === 400, "POST /api/auth/register returns 400 when email is empty");
  assert(regNoEmail.data.error === "Email is required", "Exact error message 'Email is required'");

  const regBadEmail = await request("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "invalid-email", password: "password123", confirmPassword: "password123" }),
  });
  assert(regBadEmail.status === 400, "POST /api/auth/register returns 400 for bad email");
  assert(regBadEmail.data.error === "Please enter a valid email address", "Exact error message 'Please enter a valid email address'");

  const regShortPass = await request("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "test@example.com", password: "123", confirmPassword: "123" }),
  });
  assert(regShortPass.status === 400, "POST /api/auth/register returns 400 for short password");
  assert(regShortPass.data.error === "Password must be at least 6 characters", "Exact error message 'Password must be at least 6 characters'");

  const regMismatch = await request("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "test@example.com", password: "password123", confirmPassword: "different123" }),
  });
  assert(regMismatch.status === 400, "POST /api/auth/register returns 400 for password mismatch");
  assert(regMismatch.data.error === "Passwords do not match", "Exact error message 'Passwords do not match'");

  // Test 3: Successful Register & Duplicate check
  console.log("\n3. Registration Success & Duplicate");
  const testEmail = `testuser_${Date.now()}@example.com`;
  const regSuccess = await request("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: testEmail, password: "password123", confirmPassword: "password123" }),
  });
  assert(regSuccess.status === 201, "POST /api/auth/register returns 201 on success");
  assert(regSuccess.data.email === testEmail, "Registration returns user email");
  assert(typeof regSuccess.data.id === "string", "Registration returns user id");

  const regDuplicate = await request("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: testEmail, password: "password123", confirmPassword: "password123" }),
  });
  assert(regDuplicate.status === 400 || regDuplicate.status === 409, "Registering existing email returns 400/409");
  assert(Boolean(regDuplicate.data.error), "Returns error property for duplicate email");

  // Test 4: Login & Cookies
  console.log("\n4. Login & Session Token Cookie");
  const loginFail = await request("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: testEmail, password: "wrongpassword" }),
  });
  assert(loginFail.status === 401, "POST /api/auth/login returns 401 for wrong password");
  assert(loginFail.data.error === "Invalid email or password", "Exact error 'Invalid email or password'");

  const loginSuccess = await request("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: testEmail, password: "password123" }),
  });
  assert(loginSuccess.status === 200, "POST /api/auth/login returns 200 on success");
  assert(loginSuccess.data.email === testEmail, "Returns user email on login");

  const rawCookie = loginSuccess.headers.get("set-cookie") || "";
  assert(rawCookie.includes("session_token="), "Sets HttpOnly cookie named session_token");

  // Extract session_token cookie value
  const cookieMatch = rawCookie.match(/session_token=([^;]+)/);
  const sessionCookie = cookieMatch ? `session_token=${cookieMatch[1]}` : "";

  // Test 5: Authenticated /api/auth/me
  console.log("\n5. Authenticated /api/auth/me");
  const meAuth = await request("/api/auth/me", {
    headers: { Cookie: sessionCookie },
  });
  assert(meAuth.status === 200, "GET /api/auth/me returns 200 when authenticated");
  assert(meAuth.data.email === testEmail, "GET /api/auth/me returns correct email");

  // Test 6: Reading Log Validations
  console.log("\n6. Reading Log Validations (POST /api/reading-logs)");
  const emptyTitle = await request("/api/reading-logs", {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: sessionCookie },
    body: JSON.stringify({ bookTitle: "   ", minutesRead: 30, genre: "Fiction", readOn: "2026-10-01" }),
  });
  assert(emptyTitle.status === 400, "Empty bookTitle returns 400");
  assert(emptyTitle.data.error === "Book title is required", "Exact error 'Book title is required'");

  const longTitle = await request("/api/reading-logs", {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: sessionCookie },
    body: JSON.stringify({ bookTitle: "A".repeat(81), minutesRead: 30, genre: "Fiction", readOn: "2026-10-01" }),
  });
  assert(longTitle.status === 400, "Title > 80 chars returns 400");
  assert(longTitle.data.error === "Book title must be at most 80 characters", "Exact error 'Book title must be at most 80 characters'");

  const negMinutes = await request("/api/reading-logs", {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: sessionCookie },
    body: JSON.stringify({ bookTitle: "Clean Code", minutesRead: -15, genre: "Non-Fiction", readOn: "2026-10-01" }),
  });
  assert(negMinutes.status === 400, "Negative minutes returns 400");
  assert(negMinutes.data.error === "Minutes read must be a positive number", "Exact error 'Minutes read must be a positive number'");

  const badGenre = await request("/api/reading-logs", {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: sessionCookie },
    body: JSON.stringify({ bookTitle: "Clean Code", minutesRead: 30, genre: "Mystery", readOn: "2026-10-01" }),
  });
  assert(badGenre.status === 400, "Invalid genre returns 400");
  assert(badGenre.data.error === "Invalid genre", "Exact error 'Invalid genre'");

  const futureDate = await request("/api/reading-logs", {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: sessionCookie },
    body: JSON.stringify({ bookTitle: "Future Book", minutesRead: 30, genre: "Sci-Fi", readOn: "2099-12-31" }),
  });
  assert(futureDate.status === 400, "Future date returns 400");
  assert(futureDate.data.error === "Date cannot be in the future", "Exact error 'Date cannot be in the future'");

  // Test 7: Create & Duplicate Reading Log
  console.log("\n7. Create & Duplicate Reading Log");
  const create1 = await request("/api/reading-logs", {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: sessionCookie },
    body: JSON.stringify({ bookTitle: "Dune", minutesRead: 60, genre: "Sci-Fi", note: "Epic chapter", readOn: "2026-10-01" }),
  });
  assert(create1.status === 201, "POST /api/reading-logs returns 201");
  assert(create1.data.bookTitle === "Dune", "Returns bookTitle");
  assert(create1.data.minutesRead === 60, "Returns minutesRead");
  assert(create1.data.genre === "Sci-Fi", "Returns genre");
  assert(create1.data.note === "Epic chapter", "Returns note");
  assert(create1.data.favorite === false, "Returns favorite false by default");
  assert(create1.data.readOn === "2026-10-01", "Returns readOn 'YYYY-MM-DD'");

  const createDup = await request("/api/reading-logs", {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: sessionCookie },
    body: JSON.stringify({ bookTitle: "Dune", minutesRead: 60, genre: "Sci-Fi", readOn: "2026-10-01" }),
  });
  assert(createDup.status === 409, "Duplicate reading session returns 409");
  assert(
    createDup.data.error === "Duplicate reading session: a reading session with the same book title, minutes and date already exists",
    "Exact duplicate error message"
  );

  // Create second log
  const create2 = await request("/api/reading-logs", {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: sessionCookie },
    body: JSON.stringify({ bookTitle: "Atomic Habits", minutesRead: 45, genre: "Non-Fiction", note: "Habit loops", readOn: "2026-10-15" }),
  });
  assert(create2.status === 201, "Created second session");

  // Test 8: List & Sorting & Filter
  console.log("\n8. List, Sorting & Filters");
  const listAll = await request("/api/reading-logs", {
    headers: { Cookie: sessionCookie },
  });
  assert(listAll.status === 200, "GET /api/reading-logs returns 200");
  assert(Array.isArray(listAll.data), "Returns array of reading logs");
  assert(listAll.data[0].bookTitle === "Atomic Habits", "Ordered by readOn descending ('2026-10-15' first)");

  const filterGenre = await request("/api/reading-logs?genre=Sci-Fi", {
    headers: { Cookie: sessionCookie },
  });
  assert(filterGenre.data.length === 1 && filterGenre.data[0].bookTitle === "Dune", "Filter by ?genre=Sci-Fi works");

  const searchFilter = await request("/api/reading-logs?q=Habit", {
    headers: { Cookie: sessionCookie },
  });
  assert(searchFilter.data.length === 1 && searchFilter.data[0].bookTitle === "Atomic Habits", "Search by ?q= works");

  // Test 9: Summary & Breakdown
  console.log("\n9. Summary & Breakdown");
  const summary = await request("/api/reading-logs/summary", {
    headers: { Cookie: sessionCookie },
  });
  assert(summary.status === 200, "GET /api/reading-logs/summary returns 200");
  assert(summary.data.count === 2, "Summary count is 2");
  assert(summary.data.totalMinutes === 105, "Summary totalMinutes is 105 (60 + 45)");
  assert(summary.data.breakdown.length === 2, "Breakdown has 2 entries");
  assert(summary.data.breakdown[0].genre === "Sci-Fi" && summary.data.breakdown[0].total === 60, "Breakdown sorted by total minutes desc");

  // Test 10: PATCH & Favorite Toggle
  console.log("\n10. PATCH & Toggle Favorite");
  const duneId = create1.data.id;
  const patchFav = await request(`/api/reading-logs/${duneId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Cookie: sessionCookie },
    body: JSON.stringify({ favorite: true }),
  });
  assert(patchFav.status === 200, "PATCH favorite returns 200");
  assert(patchFav.data.favorite === true, "Favorite updated to true");

  const summaryAfterFav = await request("/api/reading-logs/summary", {
    headers: { Cookie: sessionCookie },
  });
  assert(summaryAfterFav.data.favoriteCount === 1, "favoriteCount updated to 1");

  // Test 11: DELETE & 404 check
  console.log("\n11. DELETE session");
  const delRes = await request(`/api/reading-logs/${duneId}`, {
    method: "DELETE",
    headers: { Cookie: sessionCookie },
  });
  assert(delRes.status === 200, "DELETE returns 200");
  assert(delRes.data.success === true, "Returns { success: true }");

  const delAgain = await request(`/api/reading-logs/${duneId}`, {
    method: "DELETE",
    headers: { Cookie: sessionCookie },
  });
  assert(delAgain.status === 404, "Deleting again returns 404");
  assert(delAgain.data.error === "Reading log not found", "Exact error 'Reading log not found'");

  // Test 12: Logout
  console.log("\n12. Logout");
  const logoutRes = await request("/api/auth/logout", {
    method: "POST",
    headers: { Cookie: sessionCookie },
  });
  assert(logoutRes.status === 200, "POST /api/auth/logout returns 200");

  const clearCookieHeader = logoutRes.headers.get("set-cookie") || "";
  assert(clearCookieHeader.includes("session_token="), "Clears session_token cookie");

  console.log(`\n========================================`);
  console.log(`Results: ${passed} passed, ${failed} failed`);
  console.log(`========================================\n`);

  if (failed > 0) process.exit(1);
}

runTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});

