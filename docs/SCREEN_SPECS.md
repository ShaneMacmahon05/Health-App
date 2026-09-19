# Screen Specifications – MVP

_Companion document to `PRODUCT_BRIEF.md`, `MVP_SCOPE.md`, `USER_FLOWS.md`, and `DESIGN_SYSTEM.md`. Structural spec – layout regions, content, and behaviour. See `DESIGN_SYSTEM.md` for colours, fonts, and visual styling._

_Updated from the previous version: Home is replaced by a three-tab structure (Plan / Check-in / Progress), Settings is reached via a header icon, Scoped Q&A and richer weekly-plan actions have been added, Daily Check-in and Weekly Reflection have been revised, and onboarding is now an adaptive intake built around one primary outcome, up to three focus areas, existing habits, practical constraints, and focus-area-specific follow-up questions. `USER_FLOWS.md` still describes the pre-tabs single-Home structure and needs a follow-up pass to match this version._

---

## Decisions Log

Original decisions (1–7) preserved below; new decisions from this session appended (8+).

| # | Item | Decision |
|---|---|---|
| 1 | "First Plan" screen | Not a separate screen – it's the Plan tab's loading state, reused every time a plan is generated. |
| 2 | Progress view entry point | ~~Small "Past weeks" link in Home's header~~ **Superseded by #8.** |
| 3 | Onboarding free-text | Structured questions use preset answers first; selected questions include a **Something else** option that reveals a short text field only when needed. A dedicated constraints/context screen and the final optional open-text screen provide broader context without forcing typing on every screen. |
| 4 | Login, onboarding incomplete | Routes back into Onboarding Intake at her last unanswered question, not to Home/Plan. |
| 5 | Forgot password | Minimal, emailed-link based reset. See Screens 13–14. |
| 6 | Terms/Privacy consent | Checkbox on Account Creation, required for app store compliance. |
| 7 | Home checkbox save failure | Retried quietly in the background; a small inline "tap to retry" note appears only if it keeps failing. Applies to the Plan tab now. |
| 8 | Navigation structure | Three tabs – Plan, Check-in, Progress – replacing the single Home hub. Reversed from the original no-tab-bar decision, to give the app a stronger sense of depth. Accepted trade-off: check-in is no longer automatically surfaced on open; mitigated by a dot indicator on the Check-in tab icon. |
| 9 | Settings entry point | A small icon in the Plan tab's header, not a fourth tab – settings is low-frequency compared to the other three tabs, which all deliver changing content. |
| 10 | Progress tab layout | Most recent week shown expanded with full action detail; older weeks as compact rows. A dot/streak-style visual (filled/hollow dots per week) was tried and rejected – it read as gamified habit-tracker iconography. |
| 11 | Onboarding final screen | A final optional open-text screen ("Anything else about your life right now?") follows the adaptive structured/context intake and comes immediately before first-plan generation. |
| 12 | Scoped Q&A | A bounded, one-shot question attached to a specific plan action, with hard-coded redirects for health-adjacent questions. Distinct from, and not a reopening of, the "no open-ended chat" exclusion in `MVP_SCOPE.md`. |
| 13 | Check-in acknowledgment | AI-generated, reflects her actual note content, one-way with no reply option, auto-returns to the app after a moment. |
| 14 | Onboarding personalisation | Every onboarding question must provide information that can materially change the first plan. The app should favour real-life constraints, preferences, timing and barriers over demographic questions that do not affect the plan. |
| 15 | Onboarding branching | **Superseded by #20–23.** The old single goal-specific branch is replaced by focus-area-driven adaptive follow-ups. |
| 16 | Personalisation safety | Generated actions may use known personal context to become more specific, but must never invent schedule details, preferences, limitations or circumstances the user did not provide. |
| 17 | Weekly plan depth | A weekly plan contains 3–5 actions (normally 4), but each action is richer than a one-line tip: title, target, practical instructions, personalised reason, easier fallback, and a clear definition of success. |
| 18 | Plan quality bar | If an action could be given unchanged to almost any user, it is not personalised enough. Actions must use available context to shape the choice, difficulty, frequency, timing or fallback without inventing unsupported details. |
| 19 | Plan evolution | From Week 2 onward, the generator should deliberately keep, modify or replace prior actions based on completion, check-ins, notes and weekly reflection rather than generating an unrelated plan from scratch. |
| 20 | Onboarding structure v2 | One primary outcome + 1–3 focus areas + existing habits + practical context + one adaptive question for each selected focus area. This replaces the former single goal-specific Question 7 structure. |
| 21 | Focus areas | Focus areas are permissions for what the coach may consider, not quotas. Selecting Food/Sleep/Movement/etc. never forces an action from that category. Maximum 3; **I'm not sure – help me decide** is exclusive. |
| 22 | Existing habits | Onboarding explicitly asks what is already working so the plan can build on existing habits rather than recommending them as if they are new. **I'm just getting started / nothing feels consistent yet** is exclusive; **Something else** supports short custom text. |
| 23 | Adaptive onboarding | Only selected focus areas receive a follow-up question. Each branch asks about a concrete problem the plan can solve; users are not asked irrelevant food/sleep/exercise questions. |
| 24 | Generation after onboarding | The onboarding batch is saved successfully before first-plan generation begins. A generation failure never rolls back or loses onboarding answers. |

---

## 1. Welcome

**Purpose:** Introduce the app in one line and get her into account creation or login within seconds.

**Layout (top to bottom):** App name · One-line promise: "A weekly plan built around your real life" · Primary button: "Get Started" · Secondary link: "Log in"

**Buttons:** Primary "Get Started" · Secondary "Log in"

**Information displayed:** App name, promise line. Nothing else. **Information entered:** None.

**Navigation:** "Get Started" – Account Creation · "Log in" – Login

**Loading state:** None. **Empty/Error state:** Not applicable.

**Accessibility:** Promise line as real text; buttons ≥44×44pt; sufficient colour contrast.

**Acceptance criteria:**
- [ ] Screen shows exactly the app name, promise line, and the two actions.
- [ ] Both buttons navigate correctly. No network call on this screen.

---

## 2. Login

**Purpose:** Let a returning user without an active session sign back in.

**Layout:** Title "Log in" · Email field · Password field · Primary "Log in" · "Forgot password?" · "Don't have an account? Create one"

**Navigation:** Success + onboarding complete – Plan tab · Success + onboarding incomplete – Onboarding Intake at last unanswered question · "Forgot password?" – Screen 13 · "Create one" – Account Creation

**Loading state:** Spinner on "Log in," fields disabled. **Error state:** Single generic inline error ("That email or password isn't right"), no lockout on first attempts.

**Accessibility:** Labelled fields, password show/hide toggle, error announced not just coloured.

**Acceptance criteria:**
- [ ] Valid credentials route correctly based on onboarding status.
- [ ] Invalid credentials show inline error, no navigation.
- [ ] No password shown in plain text by default.

---

## 3. Account Creation

**Purpose:** Create her account with minimum friction.

**Layout:** Title · Email field · Password field with rule stated inline · Consent checkbox with Terms/Privacy links · Primary "Create account" · "Already have an account? Log in"

**Navigation:** Success – Email Verification · "Log in" – Login

**Loading/Error states:** Spinner while creating; plain inline errors for duplicate email, weak password, no connection – no data lost.

**Accessibility:** Password rule always visible; consent checkbox has a real tappable label including links.

**Acceptance criteria:**
- [ ] Valid unused email + password ≥8 characters creates account, moves to Email Verification.
- [ ] Missing consent blocked with clear inline message.
- [ ] Duplicate email shows inline error without clearing typed data.

---

## 4. Email Verification

**Purpose:** Confirm email ownership before use, minimum friction.

**Layout:** "Check your email – we sent a 6-digit code to [email]" · Code input · Primary "Verify" · "Resend code"

**Navigation:** Correct code – Onboarding Intake, first question · "Resend code" – stays, new code, brief confirmation

**Error state:** Wrong/expired code – inline error, field clears, no lockout on first attempts.

**Accessibility:** Numeric keyboard; error and confirmation both announced.

**Acceptance criteria:**
- [ ] Correct code moves into Onboarding Intake.
- [ ] Incorrect code shows inline error, stays on screen.
- [ ] Resend available immediately.

---

## 5. Onboarding Intake (adaptive structured screens)

**Purpose:** Collect enough useful context for the first weekly plan to feel genuinely personal without turning onboarding into a long health questionnaire. The intake separates **what the user wants to improve** from **which parts of life they are willing to work on**, then asks only the follow-up questions relevant to those selected areas.

**Expected length:** 9–11 structured/context screens plus the final optional open-text screen. Most users therefore see 10–12 screens total. The exact count depends on whether they select 1, 2, or 3 focus areas. If **I'm not sure – help me decide** is selected, it replaces the normal focus-area branches with one discovery question.

**Shared layout:** Visual progress bar (do not rely on a fixed numeric total because the flow branches) · One question · Tap-to-select options · Conditional short text only where needed · Primary **Next** · Secondary **Back** (hidden on the first question).

**Shared behaviour:** Answers are held locally/in memory while onboarding is in progress. Moving between questions makes no network call. **Back** restores the previous answer exactly. The final screen saves the full onboarding batch first; only after that save succeeds does the app navigate to the Plan tab and request first-plan generation.

**Storage rule:** Store stable machine-readable values separately from custom text. Do not store display labels as the source of truth. Free-text values are `null` when unused so stale text from a previous selection cannot leak into generation context.

**Selection rules:** Single-select unless explicitly marked multi-select. **Something else** reveals a short text field and requires a non-empty short answer before Next. Mutually exclusive options clear incompatible selections and vice versa. Focus-area selection is limited to 3.

### Question 1 – Primary outcome

**Question:** "What would make the biggest difference to how you feel right now?"

**Type:** Single select.

**Options / stored values:**
- Have more energy – `more_energy`
- Feel stronger and fitter – `stronger_fitter`
- Eat better without overthinking it – `eat_better`
- Sleep better – `sleep_better`
- Feel more consistent and in control – `more_consistent`
- Feel better overall – `feel_better_overall`
- Something else – `other`

**Conditional text:** **Something else** reveals "What would you most like to improve?" – stored in `primary_goal_other`.

**Stored field:** `primary_goal` (+ nullable `primary_goal_other`).

**Plan effect:** Gives the week one clear overall purpose. This is an outcome, not a requirement that every weekly action use the same category.

### Question 2 – Focus areas

**Question:** "Which parts of your routine would you be open to working on?"

**Supporting text:** "Choose up to 3. You won't necessarily get a goal for every area – this just helps us understand what could work for you."

**Type:** Multi-select, minimum 1, maximum 3.

**Options / stored values:**
- Walking & everyday movement – `everyday_movement`
- Strength & exercise – `strength_exercise`
- Food – `food`
- Sleep – `sleep`
- Daily routine – `daily_routine`
- Stress & downtime – `stress_downtime`
- I'm not sure – help me decide – `not_sure`

**Required mapping from Question 1:** Where the mapping is obvious, the matching focus area is preselected, counts toward the maximum of 3, and cannot be removed unless the user goes back and changes the primary outcome: `eat_better` – Food; `sleep_better` – Sleep; `stronger_fitter` – Strength & exercise; `more_consistent` – Daily routine. `more_energy`, `feel_better_overall`, and `other` do not force a focus area.

**Exclusivity:** `not_sure` is exclusive. Selecting it clears all other focus areas; selecting any other focus area clears `not_sure`.

**Stored field:** `focus_areas text[]`.

**Plan effect:** Defines which areas the coach has permission to consider and determines which adaptive follow-up questions appear. It does **not** force one plan action per selected area.

### Question 3 – What's already working

**Question:** "What's already working for you, if anything?"

**Supporting text:** "Select anything that already feels manageable or fairly consistent."

**Type:** Multi-select, no minimum beyond choosing one answer (including the beginner option).

**Options / stored values:**
- Walking regularly – `walking_regularly`
- Going to the gym / strength training – `gym_strength`
- Home workouts – `home_workouts`
- Sport or exercise classes – `sport_classes`
- Preparing some meals ahead – `meal_prep`
- Eating fairly regular meals – `regular_meals`
- A sleep routine that usually works – `sleep_routine`
- Taking breaks / making time to unwind – `downtime_breaks`
- I'm just getting started / nothing feels consistent yet – `just_getting_started`
- Something else – `other`

**Conditional text:** **Something else** reveals "What's already working for you?" – stored in `existing_habits_other`.

**Exclusivity:** `just_getting_started` is exclusive with every other option, including **Something else**.

**Stored field:** `existing_habits text[]` (+ nullable `existing_habits_other`).

**Plan effect:** Prevents the coach from presenting an existing habit as if it were a new recommendation. Existing habits may instead be maintained, structured, progressed, or used as an anchor for another behaviour. `just_getting_started` signals that instructions should be lower-complexity and should not assume exercise/nutrition/habit knowledge.

### Question 4 – Current activity

**Question:** "How active are you most weeks?"

**Supporting text:** "Activity can include walking, workouts, sport, classes, or other intentional movement."

**Type:** Single select.

**Options / stored values:**
- Hardly at all – `hardly_at_all`
- 1–2 days – `one_to_two_days`
- 3–4 days – `three_to_four_days`
- 5+ days – `five_plus_days`
- It varies a lot – `varies_a_lot`

**Stored field:** `activity_level`.

**Plan effect:** Sets the starting volume and difficulty so the plan does not treat an already-active user like a beginner or overload an inactive user.

### Question 5 – Main barriers

**Question:** "What usually gets in the way most?"

**Type:** Multi-select, up to 2.

**Options / stored values:**
- Not enough time – `not_enough_time`
- Low energy – `low_energy`
- Motivation – `motivation`
- Work schedule – `work_schedule`
- Family/caring responsibilities – `caring_responsibilities`
- Not knowing what to do – `not_knowing_what_to_do`
- I start well but struggle to keep it going – `struggle_to_keep_going`
- Nothing in particular – `nothing_in_particular`
- Something else – `other`

**Conditional text:** **Something else** reveals "Tell us in a few words" – stored in `barrier_other`.

**Exclusivity:** `nothing_in_particular` is exclusive with all other options.

**Stored field:** `barriers text[]` (+ nullable `barrier_other`).

**Plan effect:** Tells the coach what friction the plan itself must reduce. Where safe and appropriate, the plan should solve the barrier rather than turn overcoming it into homework for the user.

### Question 6 – Realistic time

**Question:** "How much time could you realistically give yourself on a normal day?"

**Type:** Single select.

**Options / stored values:**
- 5–10 minutes – `five_to_ten_minutes`
- 15–20 minutes – `fifteen_to_twenty_minutes`
- Around 30 minutes – `around_thirty_minutes`
- 45+ minutes – `forty_five_plus_minutes`
- It depends on the day – `depends_on_day`

**Stored field:** `daily_time`.

**Plan effect:** Constrains action duration, complexity, and fallback difficulty.

### Question 7 – When habits fit

**Question:** "When would healthy habits realistically fit into your life?"

**Type:** Multi-select.

**Options / stored values:**
- Early morning – `early_morning`
- During the day / lunch – `day_lunch`
- After work – `after_work`
- Evening – `evening`
- Weekends – `weekends`
- It changes day to day – `changes_day_to_day`
- Something else – `other`

**Conditional text:** **Something else** reveals "Tell us in a few words" – stored in `habit_time_other`.

**Stored field:** `habit_times text[]` (+ nullable `habit_time_other`).

**Plan effect:** Lets actions use realistic dayparts or flexible timing strategies without inventing exact times or weekdays.

### Adaptive focus-area questions

**Behaviour:** After Question 7, show exactly one follow-up question for each selected focus area, in this fixed order: Everyday movement – Strength & exercise – Food – Sleep – Daily routine – Stress & downtime. If only one focus area was selected, only one follow-up is shown. If `not_sure` was selected, skip all six normal branches and show the discovery branch instead.

#### Branch A – Walking & everyday movement

**Question:** "What would make it easiest to move more?"

**Type:** Multi-select, up to 2.

**Options / stored values:**
- Short walks – `short_walks`
- Longer walks – `longer_walks`
- Short movement breaks – `movement_breaks`
- Moving more during things I'm already doing – `existing_routine`
- Doing something with someone else – `with_someone`
- Something more structured – `more_structured`
- I'm not sure yet – `not_sure`
- Something else – `other`

**Conditional text:** **Something else** reveals "Tell us in a few words" – `movement_fit_other`.

**Exclusivity:** `not_sure` is exclusive.

**Stored field:** `movement_fit text[]` (+ nullable `movement_fit_other`).

**Plan effect:** Identifies which form of everyday movement is most likely to fit rather than assuming walking, gym, or another activity.

#### Branch B – Strength & exercise

**Question:** "Which best describes your current exercise setup?"

**Type:** Single select.

**Options / stored values:**
- I want to start and need a simple starting point – `want_to_start`
- I exercise at home with no equipment – `home_no_equipment`
- I exercise at home with some equipment – `home_with_equipment`
- I use a gym but don't have much structure – `gym_no_structure`
- I use a gym and already follow a programme – `gym_with_programme`
- Classes or sport are my main exercise – `classes_sport`
- A mix of these – `mixed_setup`
- Something else – `other`

**Conditional text:** `home_with_equipment` reveals optional "What do you have access to? e.g. dumbbells, resistance bands" – `strength_equipment_detail`. **Something else** reveals "Tell us in a few words" – `strength_setup_other`.

**Stored field:** `strength_setup` (+ nullable `strength_equipment_detail`, `strength_setup_other`).

**Plan effect:** Gives the coach enough context to provide an actual usable starting routine or useful progression instead of asking a confused user to design the solution themselves.

#### Branch C – Food

**Question:** "Where does eating well tend to get hardest?"

**Type:** Multi-select, up to 2.

**Options / stored values:**
- Busy mornings – `busy_mornings`
- Lunch during work / the day – `lunch_during_day`
- Afternoon snacking – `afternoon_snacking`
- Planning what to eat – `planning`
- Takeaways or convenience food – `takeaway_convenience`
- Evening eating – `evening_eating`
- Meals don't keep me full – `meals_not_filling`
- I don't really know what to choose – `not_sure_what_to_choose`
- I'm not sure – `not_sure`
- Something else – `other`

**Conditional text:** **Something else** reveals "Tell us in a few words" – `food_challenge_other`.

**Exclusivity:** `not_sure` is exclusive.

**Stored field:** `food_challenges text[]` (+ nullable `food_challenge_other`).

**Plan effect:** Identifies the actual food friction so advice can reduce planning/decision/preparation problems rather than defaulting to generic nutrition tips.

#### Branch D – Sleep

**Question:** "What usually gets in the way of sleep going how you'd like?"

**Type:** Multi-select, up to 2.

**Options / stored values:**
- I don't get to bed when I mean to – `bedtime_delay`
- Phone or TV keeps me up – `phone_tv`
- I struggle to fall asleep – `falling_asleep`
- I wake during the night – `waking_during_night`
- My sleep schedule changes a lot – `schedule_changes`
- I don't give myself enough time to sleep – `not_enough_sleep_time`
- I'm not sure what's getting in the way – `not_sure`
- Something else – `other`

**Conditional text:** **Something else** reveals "Tell us in a few words" – `sleep_challenge_other`.

**Exclusivity:** `not_sure` is exclusive.

**Stored field:** `sleep_challenges text[]` (+ nullable `sleep_challenge_other`).

**Plan effect:** Prevents the coach from inferring an unstated cause. For example, phone restriction is justified only when phone/TV use was actually selected or described.

#### Branch E – Daily routine

**Question:** "What usually makes routines fall apart for you?"

**Type:** Multi-select, up to 2.

**Options / stored values:**
- Getting started – `getting_started`
- Remembering to do it – `remembering`
- Finding the time – `finding_time`
- My days change too much – `days_change_too_much`
- Motivation – `motivation`
- I try to change too much at once – `too_much_at_once`
- I miss one day and fall out of it – `one_miss_derails`
- I'm not sure – `not_sure`
- Something else – `other`

**Conditional text:** **Something else** reveals "Tell us in a few words" – `routine_challenge_other`.

**Exclusivity:** `not_sure` is exclusive.

**Stored field:** `routine_challenges text[]` (+ nullable `routine_challenge_other`).

**Plan effect:** Distinguishes problems such as starting, remembering, time pressure, variable schedules, and all-or-nothing consistency so the plan can use the right implementation strategy.

#### Branch F – Stress & downtime

**Question:** "What tends to feel hardest on busy weeks?"

**Type:** Multi-select, up to 2.

**Options / stored values:**
- Finding any time for myself – `time_for_self`
- Switching off at the end of the day – `switching_off`
- Remembering to take breaks – `taking_breaks`
- Feeling like everything piles up – `everything_piles_up`
- Keeping healthy habits going – `healthy_habits_drop`
- I'm not sure – `not_sure`
- Something else – `other`

**Conditional text:** **Something else** reveals "Tell us in a few words" – `stress_challenge_other`.

**Exclusivity:** `not_sure` is exclusive.

**Stored field:** `stress_challenges text[]` (+ nullable `stress_challenge_other`).

**Plan effect:** Gives explicit support for practical downtime/wellbeing actions instead of inferring that a busy or tired user needs meditation, journaling, or stress-management advice.

#### Discovery branch – I'm not sure / help me decide

**Question:** "If you're not sure where to start, what sounds most like you right now?"

**Supporting text:** "Choose up to 2. It's fine if you're still not sure."

**Type:** Multi-select, up to 2.

**Options / stored values:**
- I feel low on energy – `low_energy`
- I want to move more but don't know what I'd enjoy – `movement_uncertain`
- Food feels more complicated than it should – `food_complicated`
- My sleep or routine feels inconsistent – `sleep_routine_inconsistent`
- My days feel hard to organise – `days_hard_to_organise`
- I could use more downtime – `needs_downtime`
- None of these / I'm still not sure – `still_not_sure`

**Exclusivity:** `still_not_sure` is exclusive.

**Stored field:** `focus_discovery_signals text[]`.

**Plan effect:** Gives the first plan a small amount of direction without forcing the user to diagnose which wellness category they need.

### Final structured screen – Constraints and real-life context

**Question:** "Anything your plan should work around?"

**Type:** Multi-select.

**Options / stored values:**
- Nothing right now – `nothing_right_now`
- Injury/pain or mobility issue – `physical_constraint`
- Food allergy/intolerance – `food_allergy_intolerance`
- Dietary preference – `dietary_preference`
- Work/shift schedule – `work_shift_schedule`
- Family/caring responsibilities – `caring_responsibilities`
- Something else – `other`

**Conditional text:** If any option other than **Nothing right now** is selected, reveal "Tell us anything that would help us plan around this." – stored in `constraints_detail`. This text is optional because the selected constraint itself can be useful even if the user does not want to elaborate.

**Exclusivity:** `nothing_right_now` is exclusive with all other options.

**Stored field:** `constraints text[]` (+ nullable `constraints_detail`).

**Plan effect:** Prevents inappropriate or unrealistic suggestions. Do not ask for diagnoses or detailed medical history; collect only what the plan needs to work around.

**Navigation:** Next advances through the common questions, then the relevant adaptive branches, then Constraints, then **Screen 5b, Onboarding: Anything Else**. Back always returns to the actual previous screen in that user's branch path with answers preserved.

**Loading state:** Instant between questions – no network call. **Error state:** None between questions. Batch-save errors occur only on Screen 5b and must preserve all answers.

**Accessibility:** Radio/checkbox semantics as appropriate; selection never communicated by colour alone; conditional fields labelled; tap targets ≥44×44pt; progress bar has an accessible progress label.

**Acceptance criteria:**
- [ ] Question 2 requires 1–3 focus areas unless `not_sure` is selected exclusively.
- [ ] Obvious main-outcome mappings are preselected and required; changing the primary outcome updates that required focus area without leaving stale branch answers.
- [ ] Question 3 supports both an explicit beginner state and a custom existing habit.
- [ ] `just_getting_started`, `nothing_in_particular`, `not_sure` branch options, and `nothing_right_now` obey their exclusivity rules.
- [ ] Only selected focus areas produce adaptive follow-up questions.
- [ ] A user selecting 3 focus areas sees exactly 3 focus-area follow-ups; a user selecting `not_sure` sees only the discovery branch.
- [ ] Back restores exact structured and custom answers across branch changes.
- [ ] Changing focus-area selections removes/clears stored answers for branches that are no longer selected before final save.
- [ ] Every `Something else` field appears only when selected and stores custom text separately from the stable option value.
- [ ] No question is collected unless its answer can materially change the generated plan, its difficulty, its implementation strategy, or its safety constraints.

### Proposed onboarding storage contract

The exact migration is an implementation detail, but the persisted source-of-truth row should be able to represent these fields cleanly:

`primary_goal`, `primary_goal_other`, `focus_areas`, `existing_habits`, `existing_habits_other`, `activity_level`, `barriers`, `barrier_other`, `daily_time`, `habit_times`, `habit_time_other`, `movement_fit`, `movement_fit_other`, `strength_setup`, `strength_equipment_detail`, `strength_setup_other`, `food_challenges`, `food_challenge_other`, `sleep_challenges`, `sleep_challenge_other`, `routine_challenges`, `routine_challenge_other`, `stress_challenges`, `stress_challenge_other`, `focus_discovery_signals`, `constraints`, `constraints_detail`, `additional_context`, `completed_at`, `created_at`, `updated_at`.

Fields for unselected adaptive branches must be `NULL` (or an empty array only where the database contract explicitly uses arrays) rather than retaining stale values.

---

## 5b. Onboarding: Anything Else

**Purpose:** Give the user one genuine, optional chance to describe anything the structured questions missed before the first plan is generated.

**Layout:** Progress bar at completion · Question: "Anything else about your life right now?" · Supporting line: "Totally optional, but this can help make your first plan feel more like yours." · Multiline text box · Secondary **Back** · **Skip** and **Build my plan** buttons with equal visual weight.

**Information entered:** Free text, optional – `additional_context`.

**Navigation / save order:** **Back** returns to the immediately previous screen in the user's current dynamic onboarding path (the last structured/adaptive question shown, i.e. Constraints in the common case) with any text already typed into `additional_context` preserved, and makes no network call and no save – identical in kind to the Back control on every structured onboarding screen. Either **Skip** or **Build my plan** first saves the complete onboarding batch to Supabase. Only after that save succeeds: navigate to the Plan tab's first-plan loading state – invoke first-plan generation from the saved onboarding row. A generation failure must not undo or lose onboarding.

**Loading state:** Loading state while the onboarding batch saves. Once saved, the Plan tab owns the separate generation loading state. **Error state:** Batch-save failure – inline retry; every onboarding answer and final text remain preserved.

**Accessibility:** Text box properly labelled; **Back** styled and sized consistently with the Back control used on the structured onboarding screens; **Skip** and **Build my plan** equal size/visual weight; neither implies that leaving the box blank is wrong.

**Acceptance criteria:**
- [ ] Skipping the optional text never blocks onboarding completion.
- [ ] Text entered here is stored and included in first-plan generation context.
- [ ] The user is never required to type free text except when actively selecting a **Something else** option that needs clarification.
- [ ] A failed onboarding save never loses previously entered answers.
- [ ] A failed AI generation never rolls back the successfully saved onboarding row.
- [ ] **Back** is available on this screen, returns to the immediately previous question in the user's current dynamic path, makes no network call, and does not submit onboarding.
- [ ] Any text already entered into `additional_context` is preserved when navigating Back and then forward again to this screen.

### Onboarding-to-plan personalisation rules

- Treat `primary_goal` as the overall outcome for the week, not as a requirement that every action address the same behaviour domain.
- Treat `focus_areas` as permission to consider those areas, **not** as quotas. Never force one action per selected focus area.
- `existing_habits` must materially affect recommendations: do not present an existing habit as a brand-new behaviour unless the action adds useful structure, progression, resilience, or a genuinely new purpose.
- If `just_getting_started` is selected, favour lower-complexity instructions and do not assume exercise, nutrition, or habit-building knowledge.
- Adaptive branch answers should determine the specific problem being solved within each focus area. Do not infer an unstated cause where the branch did not support it.
- Barrier answers should change how the plan is implemented. Where safe and appropriate, reduce the barrier itself rather than asking the user to solve it separately.
- Use known personal context to shape action choice, difficulty, duration, frequency, timing strategy, examples, or fallback.
- Never invent exact days, clock times, equipment, foods the user likes, family circumstances, work arrangements, medical details, or causes the user did not provide.
- If structured answers and free text conflict, treat the user's explicit free-text context as the more specific signal while still respecting safety constraints.
- The first plan may be less precise than later plans; check-ins and weekly reflections should continue learning what actually works for the user.


---

## 6. Plan (tab)

**Purpose:** The main hub of the Plan tab – a genuinely personalised, practical weekly plan that feels worth following, explains why each action fits the user's real life, and provides an easier version for difficult days.

**Layout (top to bottom):** Header: "This week's plan" + settings icon (top right) · personalised introduction (2–3 short sentences explaining the thinking behind this week's plan using real user context) · 3–5 action cards, normally 4 · "Ready for next week?" (secondary before ~7 days, primary after) · tab bar: Plan / Check-in (with dot indicator if today's check-in is outstanding) / Progress.

**Action card – collapsed state:** Checkbox · category tag (`Movement`, `Nutrition`, or `Wellbeing`) · short title · clear target/frequency · concise action instruction · tap-to-reveal chevron. The user should be able to understand what to do without expanding the card.

**Action card – expanded state:** Everything in the collapsed state plus **Why this is in your plan** (a personalised explanation tied to supplied context) and **If it's a hectic day** (an easier fallback that preserves the intent of the action). The backend also stores a clear `success_definition`, even when it does not need a separate visible label in the UI.

**Buttons:** Checkbox per action · chevron per action (expand/collapse detail) · tappable action/card to open **Screen 8, Ask About This** where appropriate · "Ready for next week?" · settings icon.

**Information displayed:** Personalised introduction · 3–5 actions · category · target · practical instructions · done/not-done state · expanded personalised reason · easier fallback.

**Information entered:** Checkbox taps, expand/collapse taps.

**Navigation:** Checkbox tap – stays, updates state · Chevron tap – expands/collapses detail inline · Tapping an action opens **Screen 8, Ask About This** · "Ready for next week?" – Weekly Reflection · Settings icon – Settings screen · Check-in tab – Check-in · Progress tab – Progress.

**Loading state:** Full-screen "Building your plan for this week–¦" shown after onboarding and after weekly reflection (or skip). Do not display a partial plan while generation/storage is incomplete.

**Empty state:** Not reachable – a plan must exist before the normal Plan tab state is shown.

**Error state:** Plan generation or validation failed – full-screen retry message. Never silently substitute a generic fallback plan. Checkbox save failure – retried quietly in background; persistent failure shows a small inline "tap to retry" note.

**Accessibility:** Done/not-done conveyed with icon and text, not colour alone; checkboxes individually labelled; expand/collapse state announced; tap targets ≥44×44pt.

### Weekly plan generation rules

- Generate **3–5 actions, normally 4**. Prefer 3 when the user's time, energy, activity level or barriers suggest a smaller plan is more realistic; use 5 only when capacity clearly supports it.
- The combined plan must be achievable as a whole. If one action is demanding, the remaining actions should generally be lighter.
- Every action must contain: `category`, `title`, `target`, `instructions`, `why`, `fallback`, and `success_definition`.
- Allowed categories are exactly `movement`, `nutrition`, and `wellbeing`. Do not force every plan to contain all three categories.
- Actions must be concrete, realistic for this week, understandable without expert knowledge, and measurable enough that the user knows whether they completed them.
- Avoid vague advice such as "exercise more", "eat healthier", "prioritise self-care", "get more sleep", or "reduce stress" unless converted into a specific behaviour.
- Use onboarding/check-in/reflection context to shape **what** is recommended, **how difficult** it is, **how often** it happens, **when** it may fit, or **what fallback** is offered.
- If an action could be given unchanged to almost any user, it is not personalised enough and should be revised.
- Never invent exact days, clock times, equipment, food preferences, family circumstances, work arrangements, injuries, medical conditions or other details the user did not provide.
- Movement actions may contain practical exercise instructions or a simple workout when needed to make the action usable, while respecting stated activity level, time, preferences, equipment and constraints. Do not prescribe rehabilitation or treatment.
- Nutrition actions should focus on practical behaviours, additions, substitutions and preparation habits. Examples can be used to make the action useful, but do not create rigid meal plans, prescribe supplements, or set aggressive calorie/weight-loss targets in V1.
- Wellbeing actions must also be behavioural and specific rather than vague motivational advice.
- Every action must include an easier fallback that meaningfully reduces effort while preserving the same intent.
- The personalised introduction must demonstrate personalisation by referencing meaningful supplied context; do not merely claim that the plan is personalised.
- The generator must return structured output only; invalid, incomplete or unsafe output is rejected and retried rather than shown to the user.
- From Week 2 onward, each previous action should be deliberately **kept, modified, or replaced** based on completion, daily check-ins/notes and the weekly reflection. Do not generate each week as an unrelated fresh plan.

**Acceptance criteria:**
- [ ] Shows exactly one week's plan, never more than one at a time.
- [ ] Plan contains 3–5 actions and normally 4 unless user capacity suggests otherwise.
- [ ] Every action has a clear target, useful instructions, personalised reason, easier fallback and stored success definition.
- [ ] At least the action choice, difficulty, frequency, timing or fallback is meaningfully influenced by supplied user context; the app never invents unsupported personal details.
- [ ] Expanded cards provide real additional usefulness, not just a generic one-line explanation.
- [ ] "Ready for next week?" is visually secondary before day 7, primary from day 7 onward.
- [ ] Failed generation/validation never falls back to generic content.
- [ ] No streak counts, "days missed," or similar messaging anywhere on this screen.

---

## 7. Check-in (tab)

**Purpose:** Capture one quick daily signal – deliberately not a conversation, but framed as a genuine invitation rather than an afterthought.

**Layout:** "How'd today go?" · Three tap options: Great / Okay / Rough · Prompt line above the note field: "Anything going on I should know about? Busy week, feeling off, something worth planning around?" · Optional free-text note, placeholder: "Totally optional, but this is what actually shapes next week..." · Primary "Submit" · Tab bar

**Information entered:** One mood selection (required), free-text note (optional).

**Navigation:** "Submit" – **Screen 7b, Check-in Acknowledgment** – back to Check-in tab (or Plan, if she came from the dot indicator)

**Loading state:** Spinner on "Submit." **Error state:** No connection – plain inline error, retry once connected – not saved locally or auto-synced in V1.

**Accessibility:** Each mood option has a text label, not just colour or emoji.

**Acceptance criteria:**
- [ ] "Submit" disabled until a mood is selected.
- [ ] This screen never displays a message thread or previous check-in history.
- [ ] The note field's placeholder and prompt line make clear this content shapes next week's plan.

---

## 7b. Check-in Acknowledgment (new)

**Purpose:** Close the loop on a check-in with a short, specific, one-way response – proof the app is paying attention, without becoming a chat.

**Layout:** Check icon · A single AI-generated line reflecting what she actually wrote (e.g. "Sounds like today was a bit steadier than yesterday. That afternoon walk seems to be helping.") · Small caption: "Logged for this week"

**Information displayed:** The AI-generated acknowledgment. **Information entered:** None – no reply option, no input of any kind.

**Navigation:** Auto-returns to the Check-in tab after a few seconds. No button required.

**Loading state:** Brief spinner while the acknowledgment generates. **Error state:** If generation fails, the check-in is still saved; show a plain "Thanks, that's saved" fallback rather than blocking on the AI call.

**Accessibility:** Message announced to screen readers; auto-dismiss timing should be generous enough for screen reader users to finish hearing it, or dismissible early with a tap.

**Acceptance criteria:**
- [ ] The check-in record saves even if the acknowledgment generation fails.
- [ ] No reply field, thread, or history appears here or anywhere connected to it.
- [ ] The acknowledgment text is generated from her actual note that day, not generic boilerplate, whenever a note was provided.

---

## 8. Ask About This (new)

**Purpose:** Let her ask a specific, bounded question about a specific plan action and get a real, specific answer – without becoming open-ended chat.

**Layout:** The plan action in question (text + category tag) · Text input: "Ask about this..." + send icon · On send, a single answer card appears below (not a thread)

**Information entered:** One free-text question per action, sent one at a time.

**Navigation:** Reached by tapping an action on the Plan tab. Answer appears inline on the same screen/sheet. Closing returns to Plan. No navigation away from Plan tab context.

**Loading state:** Brief inline loading indicator on the answer card while the response generates.

**Error state:** Generation fails – inline retry, question text preserved.

**Behavioural rules (critical, not just visual):**
- Every response is constrained to the context of that one action – not a general-purpose assistant.
- No persistent thread or history; each question is a fresh, single exchange.
- Health-adjacent questions (symptoms, "is this normal," medication, pain) are never answered directly – always redirected toward a professional, and the redirect offers something in-scope instead (e.g. "want me to make this week lighter?") rather than a flat refusal.
- Never marketed or visually framed as a chatbot – no persistent input bar sitting open across the app, no "message" iconography.

**Accessibility:** Input clearly labelled; answer text readable by screen readers as a single block, not a chat bubble.

**Acceptance criteria:**
- [ ] A health-adjacent test question is reliably redirected, not answered, in QA testing before launch.
- [ ] No question-and-answer history persists after leaving the screen.
- [ ] The answer never introduces information unrelated to the specific action asked about.

---

## 9. Weekly Reflection

**Purpose:** Capture what happened and what's ahead, feeding the next plan.

**Layout:** Title "How was this week?" · Q1: "Overall, how did it go?" (Great/Okay/Rough) · Q2: "What got in the way, if anything?" (multi-select tags: Time, Energy, Motivation, Nothing really) · Q3 (new): "Anything you want to focus on next week?" (multi-select tags: More energy, Move more, Sleep better, Something specific – selecting "Something specific" reveals an optional short text field) · Primary "Continue" · Secondary "Skip," equal visual weight

**Information entered:** Choice-based answers to all three questions; optional free text under Q3.

**Navigation:** "Continue" or "Skip" – both lead to the Plan tab's "Building your plan for this week–¦" loading state, then the new plan.

**Loading state:** Button spinner while answers save. **Error state:** Save fails – inline retry, answers preserved.

**Accessibility:** "Skip" is a genuine same-size button; questions read clearly in isolation.

**Acceptance criteria:**
- [ ] Skipping never blocks or delays the next plan.
- [ ] "Skip" and "Continue" are visually equal.
- [ ] Q3 answers are included in the next plan-generation prompt.
- [ ] No language implies skipping, or leaving Q3 blank, is the "wrong" choice.

---

## 10. Progress (tab)

**Purpose:** Recent history and a sense of momentum, without becoming a tracking tool.

**Layout:** Title "Past weeks" · The most recent week displayed expanded: label, completion count, and full list of that week's actions with done/not-done marks · Older weeks (up to 3 more) as compact rows: label + completion count · Tab bar

**Information displayed:** Up to the last 4 weeks; full detail for the most recent, summary for the rest.

**Information entered:** None – read-only.

**Navigation:** Tab bar to switch to Plan or Check-in.

**Loading state:** Spinner while the last 4 weeks fetch. **Empty state:** "Your weekly plans will show up here" for a brand-new user. **Error state:** Fetch fails – plain error with retry.

**Accessibility:** Each week a clearly headed group; completion stated in text ("4 of 5 done"), not colour alone.

**Acceptance criteria:**
- [ ] Never shows more than the last 4 weeks.
- [ ] No graphs, streak-style dot indicators, numeric trends, weight fields, or photos anywhere on this screen.
- [ ] A new user with zero completed weeks sees the empty-state message.

---

## 11. Settings (new)

**Purpose:** Low-frequency account and app settings, reached via header icon rather than a tab.

**Layout:** Back arrow + "Settings" title · Account email (display only) · "Daily reminder" row with current time, tap to change · "Terms and privacy" row · "Change password" row · "Log out" button

**Navigation:** Back arrow – Plan tab · "Daily reminder" – time picker · "Terms and privacy" – static content · "Change password" – password change flow · "Log out" – Welcome

**Loading/Error states:** Standard inline errors for save failures on any setting.

**Accessibility:** Each row is a clearly labelled, tappable target ≥44×44pt.

**Acceptance criteria:**
- [ ] Reachable only via the header icon on Plan – not present in the tab bar.
- [ ] Log out clears session and returns to Welcome, not Login.
- [ ] Changing the reminder time updates the local notification, not a server schedule.

---

## 12. Forgot Password

_(Unchanged – see original spec: email field, "Send reset link," generic confirmation message regardless of whether the account exists, standard account-enumeration protection.)_

## 13. Set New Password

_(Unchanged – see original spec: new password + confirmation fields, mismatch and expired-link handling, always routes to Login on success rather than an authenticated session.)_
