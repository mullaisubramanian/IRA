Open this folder as the workspace. It is a working Vite + vanilla JavaScript npm project for IRA (Intelligent Recruitment Assessment), a recruitment platform that connects faculty members with colleges in Tamil Nadu. Recreate and run it exactly as it is, then keep improving it without changing its behaviour or design.

STEP 1: RUN IT
- Run `npm install`, then `npm run dev`, and open the local URL in the browser preview.
- Read README.md first. It explains every file in src/.
- Do not rewrite the project into another framework. Keep the folder structure: data/, core/, views/, logic/, app/, styles/.

STEP 2: KEEP THIS DESIGN EXACTLY
- Turquoise theme. Colour tokens live in src/styles/base.css: deep turquoise #06393C (top bar, sidebars, hero), turquoise #0C8F8B (buttons, selected chips), bright turquoise #1CC3BD (hover, highlights), marigold #F2A93B (accent), green #2F9E5E (match), coral #E8604C (mismatch). Never reintroduce blue.
- Fonts: Bricolage Grotesque for headings, Manrope for body text.
- The home page spells out IRA as "Intelligent Recruitment Assessment" (first letters highlighted), shows the headline "The right professor for every classroom.", a short explanation, an animated Tamil Nadu map that draws match lines, and two cards: faculty and institution.
- The layout must work from 390px mobile to desktop.

STEP 3: KEEP THESE RULES
Accounts
1. Nobody reaches a dashboard without an account. "For faculty" and "For institutions" each open Create account / Log in.
2. A faculty account cannot open the institution side, and an institution account cannot open the faculty side. They see a "You're signed in as…" screen and must sign out first.
3. A faculty email cannot log in on the institution side, and the reverse.

Faculty profile (13 steps, in order)
4. Steps are locked. The sidebar cannot jump ahead, and "Save and continue" only works when every required field in the step is filled.
5. Date of birth uses Day / Month / Year dropdowns.
6. Marital status: Married asks spouse name and children (count only if Yes). Single parent asks "Do you have children?" and the count only if Yes. Unmarried asks parents' names.
7. The district dropdown shows only the districts of the selected state (Tamil Nadu, Kerala, Karnataka, Andhra Pradesh, Telangana, Puducherry, Goa, Maharashtra). "Other" lets the user type their state and district.
8. Relocation: a split panel. Districts are typed on the left, and pins drop on the Tamil Nadu map on the right.
9. Commute: "Own vehicle" or "Both" shows the travel-time question. "College transport" hides it.
10. Education: UG and PG degree dropdowns with an "Other (type it)" option. If the UG year of passing is the current year, hide PG and PhD.
11. Freshers do not see current salary, notice period or reason for change.
12. If 0 papers are published, hide patents and book chapters.
13. Personality assessment: 10 scenarios drawn from a bank of 25. Each of the 4 answers on a root question opens a different follow-up question. The faculty member sees only "Your responses are submitted", never their scores or the radar chart.
14. Intro: Voice, Video or Both. At least one recording is required.

Institution
15. A chat interface builds the vacancy. It reads free text, asks only for what is missing, shows a live requirement panel, and ends with a short summary to confirm.
16. The chatbot only offers departments for the institution's type. An Arts & Science college sees English, Commerce, Computer Science and so on. If the user types a department from another type (for example "mechanical"), the bot replies that it is not a department in that institution type and asks again.
17. Results come in three tabs: Best fit, Similar and Worth a look (strong profile, 1–2 hard mismatches, with reasons). Names stay as initials until the college marks a profile Favourite or Interested. After that it can schedule an interview (mode, panel, 3 time slots), which appears on the Interviews page.

STEP 4: NEXT IMPROVEMENTS (only when I ask)
- Replace localStorage with a real backend (Firebase or Supabase): authentication, faculty profiles, vacancies, file storage for resumes and intro recordings.
- Send real emails for new matches and interview invites.
- Add an admin view.

After each change, run `npm run build` and click through both the faculty and institution flows in the browser preview to confirm nothing broke.
