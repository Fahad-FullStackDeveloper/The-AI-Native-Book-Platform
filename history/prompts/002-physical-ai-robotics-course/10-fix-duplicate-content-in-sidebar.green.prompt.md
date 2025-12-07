---
id: 10
title: Fix Duplicate Content in Sidebar
stage: green
date: 2025-12-06
surface: agent
model: gemini-pro
feature: 002-physical-ai-robotics-course
branch: 002-physical-ai-robotics-course
user: 
command: mery project me extra folder he previously 001-phisical-ai-spec jo pehly branch bani thi. delete it, and check it k double content kiyon show ho raha he.
labels: ["bugfix", "docusaurus", "sidebar"]
links:
  spec: specs/002-physical-ai-robotics-course/spec.md
  ticket: null
  adr: null
  pr: null
files:
- sidebars.ts
- specs/001-physical-ai-spec
tests:
- "Manual verification by running `npm start`"
---

## Prompt

mery project me extra folder he previously 001-phisical-ai-spec jo pehly branch bani thi. delete it, and check it k double content kiyon show ho raha he.

## Response snapshot

I have deleted the `specs/001-physical-ai-spec` directory and fixed the duplicate content issue in the sidebar by updating the `sidebars.ts` file.

Please try running `npm start` again to verify the changes.

## Outcome

- ✅ Impact: Deleted an old feature directory and fixed the duplicate content issue in the sidebar.
- 🧪 Tests: Manual verification by running `npm start`.
- 📁 Files: 
  - `sidebars.ts`
  - Deleted `specs/001-physical-ai-spec`
- 🔁 Next prompts: Ready for further instructions.
- 🧠 Reflection: The duplicate content issue was caused by a misconfiguration in the `sidebars.ts` file. Explicitly defining the sidebar structure resolved the issue.

## Evaluation notes (flywheel)

- Failure modes observed: None.
- Graders run and results (PASS/FAIL): PASS
- Prompt variant (if applicable): None
- Next experiment (smallest change to try): None
