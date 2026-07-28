import { sql } from "../db";

/**
 * Seeds the database with the 14 curriculum modules and 10 downloadable resources.
 * Run inside a createServerFn handler when DATABASE_URL is available.
 */
export async function seed() {
  const db = sql();

  // ── Modules ──────────────────────────────────────────────────────────
  // Idempotent: check if modules already exist; if so, just fetch IDs

  const modules = [
    {
      title: "The Turn-Off Ritual",
      description:
        "Build a repeatable end-of-day routine that tells your brain work is done — so you can be fully present at home.",
      category: "Foundation",
      sort_order: 1,
      icon_name: "power",
    },
    {
      title: "Boundary Architecture",
      description:
        "Design the physical, digital, and mental boundaries that keep work from leaking into family time.",
      category: "Foundation",
      sort_order: 2,
      icon_name: "shield",
    },
    {
      title: "Calendar Mastery",
      description:
        "Sync Apple or Google Calendar to block family time first — then fit work into the gaps, not the other way around.",
      category: "Work",
      sort_order: 3,
      icon_name: "calendar",
    },
    {
      title: "The Sunday Sync",
      description:
        "A weekly 15-minute ritual with your spouse or co-parent to align schedules and protect what matters.",
      category: "Work",
      sort_order: 4,
      icon_name: "refresh",
    },
    {
      title: "Tech That Serves Your Family",
      description:
        "Audit the apps, devices, and notifications competing for your attention — and redesign your tech stack around presence.",
      category: "Structure",
      sort_order: 5,
      icon_name: "smartphone",
    },
    {
      title: "Rhythms of Presence",
      description:
        "Establish daily, weekly, and seasonal rhythms that keep your family vision alive year-round.",
      category: "Structure",
      sort_order: 6,
      icon_name: "repeat",
    },
    {
      title: "Debt Payoff: Snowball Method",
      description:
        "Knock out smaller debts first for quick wins and momentum — a proven path to getting your family out of debt.",
      category: "Finances",
      sort_order: 7,
      icon_name: "snowflake",
    },
    {
      title: "Debt Payoff: Avalanche Method",
      description:
        "Attack high-interest debt first to save money long-term. Includes a custom calculator to model both methods.",
      category: "Finances",
      sort_order: 8,
      icon_name: "trending-down",
    },
    {
      title: "The Family Budget That Works",
      description:
        "A lightweight budgeting approach that doesn't feel like punishment — built for busy parents who hate spreadsheets.",
      category: "Finances",
      sort_order: 9,
      icon_name: "dollar-sign",
    },
    {
      title: "Career Pathing with AI",
      description:
        "Use your AI career assistant to map promotions, lateral moves, and skill gaps — then build a 12-month plan.",
      category: "Career",
      sort_order: 10,
      icon_name: "compass",
    },
    {
      title: "Resume & LinkedIn Overhaul",
      description:
        "Templates and frameworks to refresh your professional presence so you're always ready for the next opportunity.",
      category: "Career",
      sort_order: 11,
      icon_name: "file-text",
    },
    {
      title: "Interview Prep for Busy Dads",
      description:
        "A streamlined interview preparation system that fits into 20-minute pockets of time.",
      category: "Career",
      sort_order: 12,
      icon_name: "message-square",
    },
    {
      title: "Crafting Your Family Vision",
      description:
        "Write a family vision statement that captures your values, traditions, and the legacy you want to build — faith-based or secular.",
      category: "Vision",
      sort_order: 13,
      icon_name: "eye",
    },
    {
      title: "The Dad Playbook",
      description:
        "A living document of go-to activities, conversation starters, and traditions that strengthen your bond with each child.",
      category: "Family",
      sort_order: 14,
      icon_name: "heart",
    },
  ];

  const moduleIds: string[] = [];

  const moduleCount = await db`SELECT COUNT(*)::int as count FROM modules`;
  if (moduleCount[0].count > 0) {
    const existingModules = await db`SELECT id FROM modules ORDER BY sort_order`;
    moduleIds.push(...existingModules.map((r: { id: string }) => r.id));
  } else {
    for (const mod of modules) {
      const result = await db`
        INSERT INTO modules (title, description, category, sort_order, icon_name)
        VALUES (${mod.title}, ${mod.description}, ${mod.category}, ${mod.sort_order}, ${mod.icon_name})
        RETURNING id
      `;
      moduleIds.push(result[0].id);
    }
  }

  // ── Resources ────────────────────────────────────────────────────────
  // Idempotent: skip if resources already seeded

  const resources = [
    {
      title: "Turn-Off Ritual Checklist",
      description: "Printable daily checklist to walk through your shutdown routine step by step.",
      module_title: "The Turn-Off Ritual",
      file_type: "worksheet",
      download_url: "/downloads/turn-off-ritual-checklist.pdf",
    },
    {
      title: "Boundary Audit Worksheet",
      description: "Audit your physical, digital, and mental boundaries to identify work-life leaks.",
      module_title: "Boundary Architecture",
      file_type: "worksheet",
      download_url: "/downloads/boundary-audit-worksheet.pdf",
    },
    {
      title: "Family Time Blocking Template",
      description: "A spreadsheet template for planning your week with family time blocked first.",
      module_title: "Calendar Mastery",
      file_type: "spreadsheet",
      download_url: "/downloads/family-time-blocking.xlsx",
    },
    {
      title: "Sunday Sync Agenda",
      description: "A structured 15-minute agenda template for your weekly spouse sync.",
      module_title: "The Sunday Sync",
      file_type: "worksheet",
      download_url: "/downloads/sunday-sync-agenda.pdf",
    },
    {
      title: "Debt Snowball Calculator",
      description: "Interactive spreadsheet to model your debt payoff with the snowball method.",
      module_title: "Debt Payoff: Snowball Method",
      file_type: "spreadsheet",
      download_url: "/downloads/debt-snowball-calculator.xlsx",
    },
    {
      title: "Debt Avalanche Calculator",
      description: "Interactive spreadsheet to model your debt payoff with the avalanche method.",
      module_title: "Debt Payoff: Avalanche Method",
      file_type: "spreadsheet",
      download_url: "/downloads/debt-avalanche-calculator.xlsx",
    },
    {
      title: "Family Budget Template",
      description: "A lightweight budget spreadsheet designed for busy parents who hate spreadsheets.",
      module_title: "The Family Budget That Works",
      file_type: "spreadsheet",
      download_url: "/downloads/family-budget-template.xlsx",
    },
    {
      title: "AI Career Prompt Library",
      description: "Curated prompts for your AI assistant to help map career paths, skill gaps, and promotion strategies.",
      module_title: "Career Pathing with AI",
      file_type: "prompt_library",
      download_url: "/downloads/ai-career-prompts.pdf",
    },
    {
      title: "Family Vision Statement Guide",
      description: "Step-by-step guide to crafting a family vision statement — includes faith-based and secular frameworks.",
      module_title: "Crafting Your Family Vision",
      file_type: "guide",
      download_url: "/downloads/family-vision-guide.pdf",
    },
    {
      title: "Dad Playbook Template",
      description: "A fillable template for building your personal dad playbook with activities, traditions, and conversation starters.",
      module_title: "The Dad Playbook",
      file_type: "guide",
      download_url: "/downloads/dad-playbook-template.pdf",
    },
  ];

  const resourceCount = await db`SELECT COUNT(*)::int as count FROM resources`;
  if (resourceCount[0].count === 0) {
    for (const res of resources) {
      const modResult = await db`
        SELECT id FROM modules WHERE title = ${res.module_title} LIMIT 1
      `;
      const moduleId = modResult.length > 0 ? modResult[0].id : null;

      await db`
        INSERT INTO resources (title, description, module_id, file_type, download_url)
        VALUES (${res.title}, ${res.description}, ${moduleId}, ${res.file_type}, ${res.download_url})
      `;
    }
  }

  // ── Lessons ──────────────────────────────────────────────────────────
  // Idempotent: skip if lessons already seeded

  const lessons = [
    // ── Module 1: The Turn-Off Ritual ────────────────────────────────
    {
      module_title: "The Turn-Off Ritual",
      title: "Why You Can't 'Just Switch Off'",
      content: "Here's the hard truth most dads won't admit: you've trained your brain to stay in work mode. Every time you check Slack at the dinner table, every 'quick reply' after the kids are in bed, every Sunday evening spent dreading Monday — you're reinforcing a neural pathway that says work never really ends.\n\nThat's not your fault. The modern workplace is engineered to keep you engaged. Notifications are designed by the same behavioural psychologists who build slot machines. Your phone buzzes, you get a dopamine hit, and the cycle continues. But here's what is your responsibility: deciding that it stops at your front door.\n\nThis lesson isn't about guilt. It's about awareness. Before we build your shutdown ritual, you need to see the pattern clearly. Over the next few days, I want you to notice every time work creeps into family time. Don't judge it — just notice it. Write it down. That data is the foundation of everything we're about to build.",
      reflection_prompts: JSON.stringify([
        "When was the last time you were fully present with your family — no phone, no mental to-do list?",
        "What's one work habit you've normalized that your kids have probably noticed?",
        "If you died tomorrow, would your employer replace you faster than your family would feel your absence?"
      ]),
      action_steps: JSON.stringify([
        "For the next 48 hours, keep a note on your phone and log every time work intrudes on family time.",
        "Identify the one notification or app that pulls you back in most often — we'll deal with it in the next lesson.",
        "Have a 5-minute conversation with your partner: ask them how your work boundaries feel from their side."
      ]),
      sort_order: 1,
    },
    {
      module_title: "The Turn-Off Ritual",
      title: "Your First Shutdown",
      content: "A shutdown ritual isn't a to-do list — it's a psychological transition. Just like you wouldn't walk off a construction site without putting your tools away, you shouldn't leave your desk without closing the mental loops that keep you tethered to work.\n\nThe simplest version has three steps: Review, Record, Release. First, review what you accomplished today (not what you didn't). Second, record the three things you'll tackle tomorrow — write them down somewhere your brain trusts. Third, perform a physical action that tells your nervous system 'work is done.' That might be closing your laptop lid with intention, changing your shirt, or stepping outside for 60 seconds of fresh air.\n\nHere's why this works: your brain has something called the Zeigarnik effect — it remembers incomplete tasks better than completed ones. By writing down what's unfinished and where you'll pick up tomorrow, you're essentially telling your brain 'I've got this handled, you can stand down.' It's not magic, it's neuroscience.",
      reflection_prompts: JSON.stringify([
        "What does your current 'end of workday' look like? Is there one at all, or does work just fade into evening?",
        "What physical action could serve as your 'off switch' — something your body would recognize as the transition?"
      ]),
      action_steps: JSON.stringify([
        "Set a 5:30 PM alarm on your phone labeled 'Shutdown — Go Home to Your Real Life.'",
        "Create a simple text file or notebook page called 'Tomorrow's Three' and populate it before you leave your desk.",
        "Try the three-step shutdown (Review → Record → Release) for three consecutive workdays and note the difference."
      ]),
      sort_order: 2,
    },
    {
      module_title: "The Turn-Off Ritual",
      title: "Building the Ritual That Sticks",
      content: "Most rituals fail because they're too ambitious. A 30-minute shutdown routine sounds noble, but when you're running on fumes at 5:45 PM with a hungry toddler pulling at your leg, noble goes out the window. The best ritual is the one you'll actually do.\n\nStart with a two-minute version. Seriously. Two minutes. Walk through Review, Record, Release in 120 seconds. Once that feels automatic — and it will, faster than you think — you can layer on extras. Maybe you add a one-minute gratitude practice. Maybe you walk around the block before walking through your front door. Maybe you have a specific playlist that only plays during shutdown.\n\nThe key is consistency over complexity. Your brain doesn't need an elaborate ceremony; it needs a consistent signal. Same sequence, same order, same feeling of closure. After two weeks, you'll notice something remarkable: you'll start unwinding before you even begin the ritual, because your brain has learned to anticipate the release.",
      reflection_prompts: JSON.stringify([
        "What's the smallest version of a shutdown ritual you could commit to — one you'd actually do even on your worst days?",
        "What's one 'ritual creep' signal that would tell you your ritual has become too complicated?",
        "What would your kids notice if your shutdown ritual became consistent?"
      ]),
      action_steps: JSON.stringify([
        "Design your two-minute shutdown — write down exactly what you'll do in those 120 seconds.",
        "Identify one environmental cue you can attach your ritual to (e.g., closing laptop, putting on a specific playlist, walking to a specific chair).",
        "Track your shutdown streak for 14 days using a simple checkbox — aim for 10 out of 14."
      ]),
      sort_order: 3,
    },
    {
      module_title: "The Turn-Off Ritual",
      title: "Troubleshooting: When Shutdown Fails",
      content: "Let's be honest: some days, shutdown feels impossible. You've got a deadline, a boss who emails at 9 PM, or a project that's genuinely on fire. This lesson isn't about pretending those days don't exist. It's about having a plan for them.\n\nFirst, distinguish between a genuine emergency and a perceived one. Ask yourself: will anyone die if this waits until morning? If the answer is no — and it almost always is — you have permission to defer. Second, create a 'break glass' version of your shutdown. It might be 30 seconds long: close the laptop, take one deep breath, and say out loud 'I'm done for now.' Even a compromised ritual is better than no ritual.\n\nThird, and this is crucial: never let a missed day become a missed week. The most dangerous thought in habit formation is 'well, I already blew it today, so I might as well keep working.' That's like saying 'well, I ate one donut, so I might as well eat the whole box.' One imperfect shutdown is a data point, not a failure. Learn from it and protect tomorrow's shutdown.",
      reflection_prompts: JSON.stringify([
        "What's the most common reason you skip your shutdown ritual? Is it external pressure or internal guilt?",
        "What would you tell a friend who missed a day of their routine? Can you offer yourself the same grace?"
      ]),
      action_steps: JSON.stringify([
        "Write down your 'break glass' 30-second shutdown — the absolute minimum you'll do no matter what.",
        "Identify your most common shutdown saboteur (e.g., Slack notifications, 'just one more thing' syndrome) and create a specific counter-measure.",
        "Share your shutdown commitment with one accountability partner who'll check in with you this week."
      ]),
      sort_order: 4,
    },

    // ── Module 2: Boundary Architecture ────────────────────────────────
    {
      module_title: "Boundary Architecture",
      title: "The Three Kinds of Boundaries",
      content: "Boundaries aren't just about saying no — they're about designing your environment so you don't have to. There are three kinds of boundaries every dad needs: physical, digital, and mental.\n\nPhysical boundaries are the easiest to understand but often the hardest to implement. If you work from home, do you have a door that closes? A space that's yours during work hours and becomes 'just home' after shutdown? Even a curtain, a bookshelf, or a consistent spot at the dining table can become a boundary if you use it intentionally.\n\nDigital boundaries are about access. Does your work email live on your personal phone? (It shouldn't.) Do you have separate browser profiles for work and personal? Are notifications segmented so work apps go silent after a certain hour? These aren't luxuries — they're infrastructure. Every notification that reaches you after hours is a tiny boundary violation. Mental boundaries are the hardest: the ability to stop thinking about work. That's what the shutdown ritual handles, and we'll reinforce it here.",
      reflection_prompts: JSON.stringify([
        "Look around your home: where does work 'live'? Is it contained, or has it colonized every room?",
        "If you deleted your work email from your phone tonight, what's the worst that would actually happen?"
      ]),
      action_steps: JSON.stringify([
        "Conduct a 'boundary audit' — walk through your home and identify where work physically and digitally intrudes.",
        "Remove work email and Slack from your personal phone. (Yes, really. Your IT team will survive.)",
        "Create a dedicated work-only browser profile or user account on your computer."
      ]),
      sort_order: 1,
    },
    {
      module_title: "Boundary Architecture",
      title: "The Boundary Conversation",
      content: "Setting boundaries is one thing. Communicating them to your boss, your team, and your clients is another. Most dads avoid this conversation because they're afraid of looking uncommitted. Here's the reframe: clear boundaries make you more reliable, not less.\n\nWhen you tell your team 'I'm unavailable after 6 PM but I'll respond first thing at 8 AM,' you're making a promise they can count on. When you set expectations upfront, nobody wonders where you are. The anxiety of being 'always on' actually makes you less present and more scattered — which hurts your work quality and your reputation.\n\nPractice the conversation. It doesn't need to be dramatic. 'Hey, I'm making a change to be more focused during work hours, which means I'll be offline evenings and weekends. If something is truly urgent, call me. Otherwise, I'll handle it first thing next business day.' Most people will respect it. The ones who don't are telling you something important about that relationship.",
      reflection_prompts: JSON.stringify([
        "Who in your professional life would most benefit from knowing your boundaries clearly?",
        "What's the worst response you're afraid of getting — and how likely is that, really?"
      ]),
      action_steps: JSON.stringify([
        "Draft a short, professional message communicating your availability to your manager or key collaborator.",
        "Set your working hours in Google Calendar or Outlook so they're visible to your team.",
        "Identify one relationship where boundary ambiguity is causing stress and schedule a conversation this week."
      ]),
      sort_order: 2,
    },
    {
      module_title: "Boundary Architecture",
      title: "Emergency Protocols",
      content: "Every boundary needs an escape hatch. If your kid is sick or your spouse needs you, work takes a back seat — that's non-negotiable. But the reverse also happens: genuine work emergencies that require after-hours attention. The difference between a boundary and a wall is that a boundary has a gate.\n\nDefine what constitutes an emergency. Write it down. 'Server is down and we're losing $10K an hour' — that's an emergency. 'Client wants a deck update by tomorrow morning' — probably not an emergency, unless you've trained them to expect same-day turnaround. The clearer your definition, the fewer 'emergencies' you'll have.\n\nThen define your response protocol. Who can reach you, and how? Maybe your boss has your personal number for true emergencies. Maybe there's a shared Slack channel you check once before bed. The key is that you choose the channel — it doesn't choose you. When you control access, you control your attention.",
      reflection_prompts: JSON.stringify([
        "What's the last 'work emergency' you handled after hours — was it truly urgent, or a failure of expectation-setting?",
        "If you could only be reached one way for genuine emergencies, what channel would serve your family best?"
      ]),
      action_steps: JSON.stringify([
        "Write your personal definition of a 'genuine work emergency' — be specific.",
        "Identify the one person at work who gets emergency access and tell them directly what qualifies.",
        "Create an auto-responder for after-hours emails that sets clear expectations for response time."
      ]),
      sort_order: 3,
    },

    // ── Module 3: Calendar Mastery ─────────────────────────────────────
    {
      module_title: "Calendar Mastery",
      title: "Family First: The Blocking Principle",
      content: "Most dads approach their calendar backwards. They fill it with meetings, deadlines, and work obligations, then try to squeeze family into the cracks. By Wednesday, the cracks have disappeared and family time is once again aspirational.\n\nHere's the rule: family time gets blocked first. Every Sunday evening — we'll cover this in The Sunday Sync module — you sit down and block the non-negotiables. Dinner together. Saturday morning pancakes. Your kid's soccer game. Date night. These go on the calendar before a single work meeting. They become immovable objects around which everything else must flow.\n\nThis isn't just logistics; it's philosophy. When you block family time first, you're making a statement: this is my real life, and work fits around it. The calendar doesn't lie. If you look at your week and see nothing but work blocks, your calendar is telling you something important about your priorities. Listen to it.",
      reflection_prompts: JSON.stringify([
        "Open your calendar right now: what percentage of your waking hours this week are blocked for family vs. work?",
        "What's one recurring family activity that deserves a recurring calendar block — but has never had one?"
      ]),
      action_steps: JSON.stringify([
        "Block out dinner time (at least 5 nights this week) as recurring events on your calendar.",
        "Add one non-negotiable weekend family block (3+ hours) to your calendar for the next 4 Saturdays.",
        "Create a 'Family Time' calendar color or label so those blocks are instantly visible."
      ]),
      sort_order: 1,
    },
    {
      module_title: "Calendar Mastery",
      title: "The Weekly Architecture",
      content: "A great week doesn't happen by accident — it happens by design. The weekly architecture is a simple framework for structuring your 168 hours so that the important things get space before the urgent things steal it.\n\nStart with the big rocks: sleep (aim for 7-8 hours nightly), family meals, and one-on-one time with each child. Block those first. Then add your shutdown ritual block at the end of each workday — yes, put it on the calendar. Then add your work blocks, your exercise, your commute. What's left is your margin — the white space that absorbs the unexpected. If your calendar has no margin, you're one flat tire away from missing bedtime.\n\nReview this architecture weekly. What worked? What got squeezed? Adjust. The goal isn't a perfect week — it's a week where the things you care about most got deliberate space. Over time, those weeks add up to a life.",
      reflection_prompts: JSON.stringify([
        "How much margin (unscheduled time) does your typical week have? Is it enough?",
        "What's the one activity that always gets sacrificed first when the week gets busy — and what does that tell you?"
      ]),
      action_steps: JSON.stringify([
        "Do a full 'big rocks first' calendar pass for next week: family blocks, sleep, meals, exercise, then work.",
        "Identify and protect at least 3 hours of margin (unscheduled time) in your coming week.",
        "Set a recurring Sunday evening calendar block titled 'Weekly Architecture Review' — 15 minutes."
      ]),
      sort_order: 2,
    },
    {
      module_title: "Calendar Mastery",
      title: "Google & Apple Calendar Sync",
      content: "Your calendar is only as good as its integration with real life. If your spouse can't see your schedule, you're not really coordinating — you're just documenting chaos in parallel. This lesson walks through the technical steps of syncing calendars across platforms.\n\nFor couples using different ecosystems (one on iPhone, one on Android), the key is creating a shared family calendar. Google Calendar lets you create a dedicated family calendar and share it with specific people. Apple's iCloud Family Sharing does the same. Pick one system, set it up once, and never play the 'I didn't know you had a thing' game again.\n\nAlso: put your shutdown time on the shared calendar. Let your spouse see when you intend to be done with work. That visibility creates accountability. When 5:30 PM says 'Dad's Shutdown' and your spouse can see it, you're more likely to honour it — and they're more likely to support it.",
      reflection_prompts: JSON.stringify([
        "Can your partner see your calendar right now? If not, what's stopping you from sharing it?",
        "What family events have been missed or double-booked because calendars weren't synced?"
      ]),
      action_steps: JSON.stringify([
        "Set up a shared family calendar (Google or iCloud) and invite your partner.",
        "Add all recurring family commitments (sports, appointments, school events) to the shared calendar.",
        "Create a 'Dad Shutdown' event at your target end time every weekday — make it visible to your partner."
      ]),
      sort_order: 3,
    },

    // ── Module 4: The Sunday Sync ──────────────────────────────────────
    {
      module_title: "The Sunday Sync",
      title: "The 15-Minute Marriage Meeting",
      content: "The Sunday Sync isn't a meeting — it's a standing date with the person who matters most. Fifteen minutes, same time every week, same place. You're not solving problems or debating decisions; you're getting aligned. That's it.\n\nHere's the agenda: (1) What's coming this week — appointments, deadlines, travel, kid stuff. (2) What do we each need — a night off, a workout block, a quiet hour. (3) What's one thing we're looking forward to. That's the whole thing. No spreadsheets, no project-management software, just two people looking at the same week and saying 'I've got you.'\n\nThe magic isn't in the format — it's in the consistency. When you do this every week, surprises become rare. Resentments (the kind that build when you assume your spouse should just know what you need) get surfaced before they fester. And honestly, it's hard to stay disconnected from someone you sit down with intentionally every single Sunday.",
      reflection_prompts: JSON.stringify([
        "When was the last time you and your partner sat down and intentionally planned a week together?",
        "What's one recurring source of scheduling friction in your relationship — and could a weekly sync prevent it?"
      ]),
      action_steps: JSON.stringify([
        "Set a recurring 15-minute calendar event for Sunday evening — invite your partner and give it a fun name.",
        "Create a simple shared note (Apple Notes, Google Keep, or a physical notebook) for your Sunday Sync agenda.",
        "Do your first Sunday Sync this week, even if it's messy. Focus on presence, not perfection."
      ]),
      sort_order: 1,
    },
    {
      module_title: "The Sunday Sync",
      title: "Handling Conflict in the Sync",
      content: "Sometimes the sync reveals conflict: you want to work late Wednesday, your spouse needs you home early. Neither of you is wrong, but the calendar says you can't both get what you want. This is where the Sunday Sync earns its keep.\n\nThe rule is simple: family needs default to winning. That doesn't mean your work isn't important — it means you committed to being a present father and husband, and presence requires being actually there. Before you push back, ask yourself: is this work obligation truly immovable, or am I prioritizing comfort over commitment?\n\nWhen there's genuine conflict, negotiate: 'I'll be late Wednesday, but I'll handle Thursday dinner and bedtime so you get a break.' The sync isn't about one person winning — it's about the family winning. And the family wins when both parents feel seen and supported.",
      reflection_prompts: JSON.stringify([
        "Think of your last scheduling conflict with your partner: did you treat it as you-vs-them or both-of-you-vs-the-problem?",
        "What would change if you approached every calendar conflict with the assumption that your partner's needs are as valid as yours?"
      ]),
      action_steps: JSON.stringify([
        "During your next sync, practice active listening: repeat back what your partner says before responding.",
        "Identify one recurring conflict and create a standing agreement to handle it (e.g., 'Tuesdays are your late night, Thursdays are mine').",
        "End every sync by expressing appreciation for one thing your partner did this week."
      ]),
      sort_order: 2,
    },

    // ── Module 5: Tech That Serves Your Family ─────────────────────────
    {
      module_title: "Tech That Serves Your Family",
      title: "The Tech Audit",
      content: "Every app on your phone wants something from you. Most of them want your attention, and they're very good at getting it. The first step to reclaiming your presence is understanding what's actually competing for it.\n\nOpen your phone and look at every app. Ask yourself one question: does this app make me a better father, husband, or man? If the answer is no — or if the answer is 'it could, but I'm using it wrong' — it goes on a list. Social media apps are the usual suspects, but don't overlook news apps, games, YouTube, or even email.\n\nNow look at your notifications. Go into Settings and count how many apps have permission to interrupt you. Every single one of those is a potential thief of a moment with your kids. The average person gets 60-80 notifications per day. That's 60-80 times your attention gets yanked away from whatever — and whoever — is in front of you.",
      reflection_prompts: JSON.stringify([
        "What app do you reach for when you have 30 seconds of downtime? Is it serving your family mission?",
        "If your kids described your phone habits, what words would they use?"
      ]),
      action_steps: JSON.stringify([
        "Delete one social media app from your phone for 7 days. Not 'check it less' — delete it.",
        "Turn off all notifications except phone calls, messages from your partner, and your calendar.",
        "Enable Screen Time or Digital Wellbeing limits for any app you aren't ready to delete."
      ]),
      sort_order: 1,
    },
    {
      module_title: "Tech That Serves Your Family",
      title: "Designing Your Attention Environment",
      content: "It's not enough to remove bad tech — you need to replace it with good tech. Technology isn't the enemy; mindless consumption is. The right tools can actually make you more present, not less.\n\nStart with your home screen. Move everything that isn't essential to a second page or folder. Your home screen should be a calm, intentional space — phone, messages, calendar, camera, maps, music. That's it. If you have to swipe to find Instagram, you'll open it less often. This isn't about willpower; it's about reducing friction for good choices and increasing friction for bad ones.\n\nThen add tools that serve your mission: a shared grocery list app so you and your spouse stay synced, a family photo-sharing app that doesn't algorithmically feed you ads, a meditation timer for 2-minute resets. Every app on your phone should earn its place by making you more available to the people you love.",
      reflection_prompts: JSON.stringify([
        "What would your ideal home screen look like — and how does it differ from what's there now?",
        "What's one app that genuinely makes your family life better? Are you using it enough?"
      ]),
      action_steps: JSON.stringify([
        "Redesign your phone's home screen: remove every non-essential app from the first page.",
        "Install one app that serves your family (shared lists, family calendar, etc.) and set it up with your partner.",
        "Create a 'phone parking spot' in your home — a place where phones live during family time."
      ]),
      sort_order: 2,
    },

    // ── Module 6: Rhythms of Presence ──────────────────────────────────
    {
      module_title: "Rhythms of Presence",
      title: "Daily, Weekly, and Seasonal Rhythms",
      content: "Presence isn't a one-time decision — it's a rhythm. Just like your body has circadian rhythms that govern sleep and energy, your family needs rhythms that govern connection and attention. Without them, presence becomes something you intend rather than something you do.\n\nDaily rhythms are the small anchors: morning eye contact with each kid before screens come on, a 10-minute undistracted check-in with your spouse after work, bedtime reading that you don't rush through. These aren't big gestures — they're reliable ones. Weekly rhythms include the Sunday Sync, a family dinner where phones don't exist, and one-on-one time with each child (even just 20 minutes). Seasonal rhythms are the traditions: annual camping trips, birthday rituals, holiday routines that your kids will tell their kids about.\n\nThe beauty of rhythms is that they compound. One good morning ritual doesn't change a life, but three hundred of them might change your kids' childhoods.",
      reflection_prompts: JSON.stringify([
        "What daily rhythm already exists in your family that you've never named or appreciated?",
        "If you could establish one new weekly rhythm, what would it be — and what's the smallest version that's doable?"
      ]),
      action_steps: JSON.stringify([
        "Write down your existing daily rhythms (even imperfect ones) — morning, after-work, bedtime.",
        "Pick one new daily rhythm to add this week (e.g., 5 minutes of undistracted greeting when you walk in the door).",
        "Identify one seasonal tradition you want to establish and put the first occurrence on your calendar."
      ]),
      sort_order: 1,
    },
    {
      module_title: "Rhythms of Presence",
      title: "One-on-One Time With Each Child",
      content: "Group family time is important, but one-on-one time is where the real connection happens. When you're alone with one child, there's no competition for attention, no sibling dynamics to manage, no performance to maintain. Just you and them.\n\nThe format doesn't matter: a walk, a donut run, building something, sitting on a bench. What matters is that it's regular and predictable. Your kid should be able to say 'Saturday morning is my time with Dad' — and believe it. Twenty minutes of undistracted attention beats two hours of distracted 'family time' every time.\n\nIf you have multiple kids, rotate. Create a simple system: first Saturday of the month is Child A, second Saturday is Child B, and so on. Involve them in choosing the activity. When a child knows they have a standing date with their dad, it becomes a cornerstone of their week — and yours.",
      reflection_prompts: JSON.stringify([
        "When was the last time you spent intentional one-on-one time with each of your children?",
        "What would each of your kids choose to do if they had 2 hours alone with you?"
      ]),
      action_steps: JSON.stringify([
        "Block a recurring 1-hour slot for each child on your calendar — same day/time each week or month.",
        "Ask each child what they'd like to do during their time with you (and actually do it).",
        "Create a simple rotation system if you have multiple kids — write it down somewhere visible."
      ]),
      sort_order: 2,
    },
    {
      module_title: "Rhythms of Presence",
      title: "Date Night as a Rhythm",
      content: "Your marriage is the foundation of your family. When it's strong, everything else works better. When it's neglected, even the best parenting can't fill the gap. Date night isn't a luxury — it's maintenance.\n\nBut date night doesn't have to mean dinner and a movie. It can be a walk after the kids are asleep, a board game, sitting on the porch with a drink. What matters is that it's intentional, regular, and screen-free. The goal isn't entertainment — it's reconnection. You're remembering why you chose each other in the first place.\n\nBudget and logistics are real constraints. If a babysitter isn't in the cards, have an at-home date after bedtime. If you're exhausted, keep it simple. The bar isn't high — it's consistent. A weekly 30-minute undistracted conversation will do more for your marriage than a fancy quarterly dinner ever could.",
      reflection_prompts: JSON.stringify([
        "When was your last real date — not just parallel existence in the same room?",
        "What's one thing you used to love doing together before kids that you could resurrect in a simpler form?"
      ]),
      action_steps: JSON.stringify([
        "Schedule the next 4 date nights on your calendar — even if you don't know what you'll do yet.",
        "Have a conversation with your spouse about what 'connection' looks like for each of you right now.",
        "Create a shared list of date ideas (free, cheap, and splurge options) so decision fatigue doesn't kill momentum."
      ]),
      sort_order: 3,
    },

    // ── Module 7: Debt Payoff: Snowball Method ────────────────────────
    {
      module_title: "Debt Payoff: Snowball Method",
      title: "The Psychology of the Snowball",
      content: "The debt snowball isn't mathematically optimal — and that's exactly why it works. If humans were spreadsheets, we'd all use the avalanche method and pay off the highest interest rate first. But humans aren't spreadsheets. We're emotional creatures who need momentum to sustain difficult behaviours.\n\nThe snowball method says: list your debts from smallest to largest, regardless of interest rate. Attack the smallest debt with everything you've got while making minimum payments on the rest. When that first debt dies, you take its payment and roll it into the next one. Each victory — each balance that hits zero — gives you a dopamine hit that fuels the next push.\n\nDave Ramsey popularized this approach for a reason: it keeps people in the game. When you're juggling kids, a mortgage, and the mental load of being a provider, you don't need a mathematically elegant plan — you need a plan you'll actually stick with. The snowball gives you quick wins that build confidence. And confidence is worth more than a few percentage points of interest.",
      reflection_prompts: JSON.stringify([
        "List your debts right now — all of them. How does seeing them all in one place feel?",
        "Which debt would give you the biggest emotional boost to eliminate first?"
      ]),
      action_steps: JSON.stringify([
        "Create a complete list of all your debts: creditor, balance, minimum payment, interest rate.",
        "Sort them smallest to largest and circle the smallest one — that's your first target.",
        "Find an extra $50-100 in your monthly budget (cut subscriptions, skip takeout) and direct it to that first debt."
      ]),
      sort_order: 1,
    },
    {
      module_title: "Debt Payoff: Snowball Method",
      title: "Building Momentum and Staying Motivated",
      content: "The first debt payoff is electric. You've been chipping away for weeks, and then suddenly — zero. You did it. The problem is, debt number two is usually bigger than debt number one, and the initial excitement fades. This is where most people quit.\n\nHere's how to stay in the game. First, visualize the finish line. Calculate your debt-free date and put it on the calendar. Print it out. Tell your kids: 'We're working on something big as a family.' Second, celebrate every victory. Not with spending — with recognition. A high-five, a special family dinner at home, a note on the fridge. Your brain needs rewards to stay motivated, and crossing off a debt is genuinely worth celebrating.\n\nThird, keep your 'why' front and centre. You're not doing this for a spreadsheet — you're doing it so you can take your family on vacation without guilt, so you can sleep through the night without money anxiety, so your kids learn what financial freedom looks like. Tape a picture of your why to your bathroom mirror.",
      reflection_prompts: JSON.stringify([
        "What will your life feel like when you're debt-free? Be specific — picture a Tuesday afternoon with zero debt.",
        "Who in your family is most affected by your financial stress, and what would freedom mean for them?"
      ]),
      action_steps: JSON.stringify([
        "Calculate your debt-free date using the snowball method and put it on your calendar.",
        "Create a visual tracker (whiteboard, chart, app) that shows your progress — update it every payday.",
        "Write down your 'why' in one sentence and put it somewhere you'll see it every morning."
      ]),
      sort_order: 2,
    },

    // ── Module 8: Debt Payoff: Avalanche Method ────────────────────────
    {
      module_title: "Debt Payoff: Avalanche Method",
      title: "The Math Behind the Avalanche",
      content: "If the snowball is about psychology, the avalanche is about math. And the math is compelling: by targeting your highest-interest debt first, you minimize the total interest you'll pay. Over the life of your debt, this can save thousands of dollars — money that could fund family vacations, college funds, or just breathing room.\n\nThe avalanche method works like this: list your debts by interest rate, highest to lowest. Make minimum payments on everything except the highest-rate debt, which gets every extra dollar you can throw at it. When that one dies, move to the next highest. It's the same rolling payment concept as the snowball, but ordered by interest rate instead of balance.\n\nThe catch? If your highest-rate debt is also your biggest balance, you might go months or years without a win. That's hard. That's why the avalanche works best for people who are motivated by numbers and can sustain effort without frequent rewards. Know yourself: if you need wins to stay engaged, the snowball might serve you better — even if it costs a bit more in interest.",
      reflection_prompts: JSON.stringify([
        "Calculate the difference: how much interest would you save with avalanche vs. snowball over your full payoff timeline?",
        "Are you more motivated by quick wins or long-term optimization? Be honest."
      ]),
      action_steps: JSON.stringify([
        "Sort your debts by interest rate, highest to lowest, and calculate your avalanche payoff order.",
        "Use the Present Provider debt calculator (in Resources) to model both methods side by side.",
        "Pick your method — snowball or avalanche — and commit to it for 90 days before reassessing."
      ]),
      sort_order: 1,
    },
    {
      module_title: "Debt Payoff: Avalanche Method",
      title: "Combining Both Methods",
      content: "Here's a secret the personal finance gurus don't always share: you don't have to pick one method. The smartest approach for many dads is a hybrid: start with the snowball for your first one or two wins to build momentum, then switch to the avalanche for the remaining debts to save on interest.\n\nThe first debt or two are usually small — credit cards, medical bills, a personal loan. Knock those out fast with the snowball. Feel what it's like to kill a debt. Let that energy carry you. Then, when you're facing the bigger debts (car loans, student loans), switch to avalanche. By that point, you've built the discipline muscle and you're ready to optimize for the long game.\n\nAnother option: snowball your non-mortgage debts and avalanche everything else. Or snowball until you've paid off half your debts, then switch. The point is: the best method is the one you'll actually follow. Don't let analysis paralysis keep you from starting. Pick something and adjust as you go.",
      reflection_prompts: JSON.stringify([
        "Would a hybrid approach work for your personality and your specific debt situation?",
        "What's the one debt that, if eliminated, would change your daily stress level the most?"
      ]),
      action_steps: JSON.stringify([
        "Identify which debts would be your snowball targets (smallest 2-3) and which would be avalanche targets (highest-rate).",
        "Create a hybrid payoff plan: snowball the first two, avalanche the rest.",
        "Set a 90-day checkpoint on your calendar to evaluate your progress and adjust your approach if needed."
      ]),
      sort_order: 2,
    },

    // ── Module 9: The Family Budget That Works ─────────────────────────
    {
      module_title: "The Family Budget That Works",
      title: "The Anti-Budget",
      content: "Most budgets fail because they feel like punishment. You're told to track every dollar, categorize every coffee, and feel guilty about every 'miscellaneous' purchase. For a busy dad, that's unsustainable — and honestly, insulting. You don't need a spreadsheet shaming you.\n\nEnter the anti-budget. Here's how it works: pay your essentials first (housing, utilities, food, minimum debt payments), set aside a manageable amount for guilt-free spending, and automate everything else toward your goals (debt payoff, emergency fund, investing). That's it. Three categories. No 47-line spreadsheet. No shame.\n\nThe anti-budget recognizes that your willpower is a finite resource and you've already spent most of it at work and with your kids. The system needs to run on autopilot. Automate what matters, give yourself permission to spend the rest, and focus your mental energy where it belongs — on your family, not your expense tracking.",
      reflection_prompts: JSON.stringify([
        "How much mental energy do you currently spend thinking about money — and is it productive energy or anxiety?",
        "If you could simplify your financial life to three numbers (essentials, fun, goals), what would they be?"
      ]),
      action_steps: JSON.stringify([
        "Calculate your monthly essentials number (housing, utilities, food, minimum payments, transportation).",
        "Set up automatic transfers: essentials to a bills account, debt/goal payments on payday.",
        "Give yourself a monthly 'guilt-free' number — money you can spend without tracking or justifying."
      ]),
      sort_order: 1,
    },
    {
      module_title: "The Family Budget That Works",
      title: "Budgeting as a Couple",
      content: "Money is the number one source of marital conflict, and it's usually not about the amount — it's about the communication. One spouse feels controlled, the other feels anxious. Neither feels heard. Sound familiar?\n\nThe anti-budget approach works especially well for couples because it reduces the number of decisions you have to make together. You agree on the big numbers — essentials, goals, and guilt-free spending — and then you each manage your own guilt-free money however you want. No permission needed, no judgment, no questions.\n\nBut the conversation still needs to happen. Schedule a monthly money check-in (separate from the Sunday Sync — don't contaminate your relationship meeting with spreadsheets). Fifteen minutes. Review the numbers, celebrate progress, adjust. The goal isn't to agree on everything — it's to be honest about where you are and aligned on where you're going. Two people rowing in the same direction, even imperfectly, will get further than two people rowing perfectly in opposite directions.",
      reflection_prompts: JSON.stringify([
        "How would you describe your current money dynamic with your partner — partners, parent/child, or roommates?",
        "What's one money conversation you've been avoiding with your spouse?"
      ]),
      action_steps: JSON.stringify([
        "Schedule your first monthly money check-in with your partner — 15 minutes, no kids, no distractions.",
        "Agree on your 'guilt-free' individual spending number per person.",
        "Create a shared view of your finances (app, spreadsheet, or physical notebook) that both of you can access."
      ]),
      sort_order: 2,
    },
    {
      module_title: "The Family Budget That Works",
      title: "The Emergency Fund Foundation",
      content: "Before you pay off another dollar of debt beyond the minimums, you need an emergency fund. Not because the math says so — because life says so. The car will break down. The water heater will leak. Someone will need a medical procedure. These aren't 'if' events; they're 'when' events.\n\nStart with $1,000. That's your first goal — a starter emergency fund that catches the small stuff. Once that's in place, attack your debt. After the debt is gone, build the full emergency fund: 3-6 months of essential expenses. That's the number that lets you sleep through the night.\n\nThe emergency fund isn't just money — it's margin. It's the difference between a flat tire being an inconvenience and a crisis. It's the ability to say 'we can handle this' instead of 'how are we going to handle this.' For a father, that peace of mind is worth more than any investment return.",
      reflection_prompts: JSON.stringify([
        "What's the largest unexpected expense your family has faced in the last 2 years — and how did you handle it?",
        "If you lost your job tomorrow, how many weeks could your family survive on current savings?"
      ]),
      action_steps: JSON.stringify([
        "Open a separate savings account (high-yield if possible) labeled 'Emergency Fund.'",
        "Set up an automatic weekly transfer of even $25 to this account — the amount matters less than the habit.",
        "Calculate your 3-month essential expenses number and write it down as your long-term emergency fund target."
      ]),
      sort_order: 3,
    },

    // ── Module 10: Career Pathing with AI ─────────────────────────────
    {
      module_title: "Career Pathing with AI",
      title: "The AI Career Co-Pilot",
      content: "You've got a career advisor in your pocket, and you're probably underusing it. AI tools like ChatGPT, Claude, and others can help you map career paths, identify skill gaps, and prepare for conversations you're nervous about — if you know how to prompt them effectively.\n\nStart with a simple prompt: 'I'm a [your role] with [X] years of experience. Based on my background, what are 5 potential career paths I could pursue in the next 3-5 years, and what skills would I need for each?' The AI will give you a structured starting point that would take hours of research to compile manually.\n\nThen go deeper: 'For each of those paths, what's the realistic salary trajectory, work-life balance trade-off, and geographic flexibility?' The AI doesn't know your life, but it knows industry patterns. It can surface options you haven't considered and flag risks you haven't seen. The key is treating it like a conversation, not a search engine — ask follow-ups, challenge its assumptions, refine until the output feels specific to you.",
      reflection_prompts: JSON.stringify([
        "If you could wave a magic wand and change one thing about your career, what would it be?",
        "When was the last time you intentionally invested in your own career development (not just doing your job well)?"
      ]),
      action_steps: JSON.stringify([
        "Open ChatGPT (or your preferred AI tool) and run the career path exploration prompt described above.",
        "Save the output and highlight 2-3 paths that genuinely interest you — even if they feel like stretches.",
        "Schedule a 30-minute block this week to research one of those paths more deeply."
      ]),
      sort_order: 1,
    },
    {
      module_title: "Career Pathing with AI",
      title: "Building Your 12-Month Plan",
      content: "A career plan doesn't need to be a 40-page document. It needs to answer three questions: Where do I want to be in 12 months? What skills or experiences do I need to get there? What's my first step this month?\n\nUse your AI assistant to draft the plan. Feed it your current role, your target role, and ask for a month-by-month breakdown of actions. Then pressure-test it: 'What's the weakest part of this plan? What am I not considering?' The AI will identify gaps you'd miss on your own.\n\nBut here's the critical part: the plan is worthless if it stays in a document. Share it with someone. Your spouse, a mentor, a trusted colleague. Put the milestones on your calendar. Block time each week for 'career development' — even 30 minutes. The dads who advance aren't the ones with the best plans; they're the ones who execute consistently on decent plans.",
      reflection_prompts: JSON.stringify([
        "Where do you honestly want to be in 12 months — not where you think you 'should' want to be?",
        "What's the one skill that, if you developed it, would most dramatically change your career options?"
      ]),
      action_steps: JSON.stringify([
        "Use AI to generate a draft 12-month career plan with monthly milestones.",
        "Identify the one action you can take this month — a course, a conversation, an application.",
        "Block a recurring weekly 30-minute slot on your calendar labeled 'Career Investment.'"
      ]),
      sort_order: 2,
    },
    {
      module_title: "Career Pathing with AI",
      title: "Negotiating for What You're Worth",
      content: "Most dads leave money on the table — not because they're bad at their jobs, but because they're uncomfortable asking. Negotiation feels aggressive, and 'provider' feels like it should be about giving, not taking. But here's the reframe: every dollar you don't negotiate for is a dollar your family doesn't get. That's not humility — that's a missed opportunity.\n\nUse AI to prepare. Feed it the job description, your experience, and market data. Ask: 'What's a reasonable salary range for this role in [city]? What's the strongest case I can make for the high end of that range?' Then practice the conversation. Have the AI role-play the hiring manager and push back. Get comfortable with the discomfort.\n\nThe best negotiators aren't aggressive — they're prepared. They know their number, they know their value, and they know that asking for fair compensation isn't greedy. It's responsible. Your family deserves a provider who advocates for himself.",
      reflection_prompts: JSON.stringify([
        "When was the last time you negotiated for something — and how did it go?",
        "What's the story you tell yourself about why you can't or shouldn't ask for more?"
      ]),
      action_steps: JSON.stringify([
        "Research salary ranges for your role and experience level using at least 3 sources.",
        "Use AI to role-play a salary negotiation — practice until you can state your number without flinching.",
        "Identify one upcoming opportunity to negotiate (salary, freelance rate, benefits) and prepare your case."
      ]),
      sort_order: 3,
    },

    // ── Module 11: Resume & LinkedIn Overhaul ──────────────────────────
    {
      module_title: "Resume & LinkedIn Overhaul",
      title: "The 45-Minute Resume Refresh",
      content: "Your resume is probably outdated. Not because you're lazy — because you're busy. But an outdated resume means you're not ready when opportunity knocks. And opportunity has a habit of knocking when you least expect it.\n\nHere's a framework for a 45-minute refresh: Spend 10 minutes updating your most recent role with 3-5 bullet points that describe impact, not responsibilities. 'Managed a team of 5' is a responsibility. 'Led a team of 5 to deliver a project 3 weeks ahead of schedule, saving $50K' is impact. Spend 10 minutes reviewing older roles — delete anything from more than 10 years ago unless it's directly relevant. Spend 15 minutes on formatting: clean, single-column, no photos, no graphs, save as PDF. Spend the final 10 minutes reading it out loud — if something sounds awkward, fix it.\n\nThen use AI to polish. Paste your draft and ask: 'Make this more concise and impactful. Identify any weak bullets.' The AI will catch things you've gone blind to. But don't let AI write it from scratch — your voice needs to come through. A human reading your resume should feel like they're meeting you, not a robot.",
      reflection_prompts: JSON.stringify([
        "If a recruiter read your current resume right now, would they understand what you actually do?",
        "What's the accomplishment you're most proud of that isn't currently on your resume?"
      ]),
      action_steps: JSON.stringify([
        "Open your resume and time yourself: spend exactly 45 minutes on a refresh using the framework above.",
        "Use AI to review your draft and suggest improvements — then pick the 3 best suggestions and apply them.",
        "Save your resume as a PDF named 'FirstName_LastName_Resume_2026.pdf' and store it somewhere accessible."
      ]),
      sort_order: 1,
    },
    {
      module_title: "Resume & LinkedIn Overhaul",
      title: "LinkedIn That Works for You",
      content: "LinkedIn isn't social media — it's a discovery platform. Recruiters, hiring managers, and potential clients use it to find people like you. If your profile is bare or outdated, you're invisible. If it's optimized, opportunities come to you.\n\nThe formula is simple: a professional photo (doesn't need to be a headshot — just look competent and approachable), a headline that says what you do and who you help (not just your job title), and an 'About' section that tells your story in 3 short paragraphs: who you are, what you've done, and what you're looking for. Add your skills, get a few recommendations, and you're 90% of the way there.\n\nThen use LinkedIn intentionally. Spend 10 minutes a week engaging with content in your field, connecting with people you admire, and sharing something you've learned. You're not building a personal brand — you're building a professional presence that works even when you're focused on your family.",
      reflection_prompts: JSON.stringify([
        "If a recruiter found your LinkedIn profile today, what impression would they form in the first 5 seconds?",
        "What's one thing you've learned in your career that would genuinely help someone else if you shared it?"
      ]),
      action_steps: JSON.stringify([
        "Update your LinkedIn headline to describe what you do and who you help (not just your title).",
        "Write or refresh your 'About' section using the 3-paragraph framework.",
        "Connect with 5 people in your industry this week — former colleagues, people you admire, or potential mentors."
      ]),
      sort_order: 2,
    },

    // ── Module 12: Interview Prep for Busy Dads ────────────────────────
    {
      module_title: "Interview Prep for Busy Dads",
      title: "The 20-Minute Interview Prep System",
      content: "You don't have hours to prep for interviews — you have stolen moments between bedtime and your own exhaustion. That's actually an advantage. Short, focused preparation sessions are more effective than marathon cramming. Your brain consolidates information between sessions, and you show up fresher.\n\nHere's the system: 5 minutes on the company (what do they do, what's their pain point, who's interviewing you), 5 minutes on your stories (3-5 go-to examples of problems you've solved), 5 minutes on your questions (prepare 3 thoughtful questions that show you've done your homework), and 5 minutes on logistics (tech check, outfit, route). Do this daily for 3-5 days before the interview instead of one long session.\n\nUse AI to generate likely questions based on the job description and practice answering them out loud. Not typing — speaking. The muscle memory of verbal answers is different from written ones. Record yourself if you're brave. You'll catch filler words, nervous habits, and places where your answer wanders.",
      reflection_prompts: JSON.stringify([
        "What's your biggest fear about interviewing right now — rejection, awkwardness, or something else?",
        "Think of your best professional moment. Can you tell that story in 90 seconds?"
      ]),
      action_steps: JSON.stringify([
        "Identify 3-5 'power stories' from your career that demonstrate problem-solving, leadership, and growth.",
        "Use AI to generate 10 likely interview questions for your target role and practice answering 3 of them out loud.",
        "Research your next interview's company for 5 focused minutes — mission, recent news, and the interviewer's background."
      ]),
      sort_order: 1,
    },
    {
      module_title: "Interview Prep for Busy Dads",
      title: "Owning the 'Tell Me About Yourself' Question",
      content: "'Tell me about yourself' isn't an invitation to recite your resume. It's a chance to frame your story. The interviewer is really asking: 'Why should I care about you? What's the arc of your career, and why does it lead here?'\n\nThe perfect answer has three parts: Present (what you do now, in one sentence), Past (the key experiences that brought you here, in 2-3 sentences), and Future (why this role is the natural next step, in 1-2 sentences). That's about 90 seconds total. Practice it until it feels conversational, not rehearsed.\n\nThe secret most candidates miss: connect your answer to the company's need. If you're interviewing at a company struggling with retention, mention your track record of building teams that stay. If they're launching a new product, highlight your launch experience. Your story isn't about you — it's about how you solve their problem.",
      reflection_prompts: JSON.stringify([
        "If you had to describe your career arc in 3 sentences, what would they be?",
        "What's the most interesting thing about your professional story that most people don't know?"
      ]),
      action_steps: JSON.stringify([
        "Draft your Present-Past-Future answer and practice it out loud 5 times.",
        "Time yourself — aim for 90 seconds, no more than 2 minutes.",
        "Tailor your answer to a specific company you're interested in by connecting your story to their needs."
      ]),
      sort_order: 2,
    },
    {
      module_title: "Interview Prep for Busy Dads",
      title: "The Dad Advantage",
      content: "Being a dad isn't a liability in interviews — it's an asset. But you have to frame it that way. Parenthood builds skills that corporations pay consultants to teach: prioritization under pressure, conflict resolution between irrational parties, patience in the face of chaos, and the ability to function on interrupted sleep.\n\nWhen an interviewer asks about your greatest strength, 'I'm a father' isn't an answer — but 'I've developed an ability to stay calm and focused under pressure, which I practice daily as a parent of two young kids' absolutely is. It's authentic, memorable, and signals emotional intelligence.\n\nDon't hide your family commitments — frame them as proof of your character. When you talk about leaving at 5:30 PM, don't apologize. Say: 'I'm highly efficient during work hours because I have a hard stop — my family is waiting.' That's not a weakness; it's a statement of values. The right employer will respect it. The wrong employer will reveal themselves — and that's valuable information too.",
      reflection_prompts: JSON.stringify([
        "What skills has fatherhood taught you that make you better at your job?",
        "Are you comfortable talking about being a dad in professional settings, or do you compartmentalize?"
      ]),
      action_steps: JSON.stringify([
        "Write down 3 professional skills that fatherhood has strengthened (e.g., patience, prioritization, empathy).",
        "Craft a 2-sentence answer that weaves your dad experience into a professional strength.",
        "Practice stating your work boundaries (e.g., leaving at 5:30) confidently — without apology or over-explanation."
      ]),
      sort_order: 3,
    },

    // ── Module 13: Crafting Your Family Vision ─────────────────────────
    {
      module_title: "Crafting Your Family Vision",
      title: "Why Your Family Needs a Vision Statement",
      content: "Companies have mission statements. Sports teams have game plans. But most families drift — reacting to whatever comes up, hoping things work out. A family vision statement changes that. It's a short document that captures what your family stands for, where you're headed, and how you'll treat each other along the way.\n\nThis isn't a corporate exercise. It's a conversation. What kind of home do you want your kids to remember? What values do you want them to absorb — not because you lectured about them, but because they saw you live them? What traditions matter? What's the legacy you're building, one Tuesday dinner at a time?\n\nThe vision statement is your compass. When you're facing a decision — a job change, a move, a conflict — you ask: does this move us closer to our vision or further from it? It's not about perfect adherence; it's about intentional direction. Even a family that's drifting with a map is more likely to end up somewhere worth being.",
      reflection_prompts: JSON.stringify([
        "If your kids described your family in one sentence to a friend, what would they say? Is that what you want them to say?",
        "What value do you most want your children to carry into adulthood?"
      ]),
      action_steps: JSON.stringify([
        "Schedule a family meeting (or couple's conversation) dedicated to discussing your family's core values.",
        "Write down 5 values that matter most to your family — not aspirational, but honest.",
        "Draft a one-sentence family vision and ask each family member for their reaction."
      ]),
      sort_order: 1,
    },
    {
      module_title: "Crafting Your Family Vision",
      title: "Faith-Based and Secular Frameworks",
      content: "Your family vision can be grounded in faith, philosophy, or simply shared values — there's no wrong foundation. What matters is that it's authentic to you. If your family is faith-based, scripture and spiritual practices will naturally anchor your vision. If you're secular, humanist principles and shared ethics do the same work.\n\nFor faith-based families: consider verses or teachings that resonate with your vision of family life. The biblical concept of 'stewardship' — caring for what's been entrusted to you — can frame everything from finances to time management. The idea of 'servant leadership' can shape how you parent and partner.\n\nFor secular families: values like kindness, curiosity, resilience, and generosity need no religious framework. You might draw from philosophy, literature, or simply the kind of people you admire. The question is the same: what kind of humans do we want to raise, and what kind of home produces them? The answer becomes your north star.",
      reflection_prompts: JSON.stringify([
        "What beliefs or principles most shape how you want to raise your children?",
        "If your vision is faith-based, which specific teachings resonate most? If secular, which thinkers or values guide you?"
      ]),
      action_steps: JSON.stringify([
        "Gather inspiration: collect quotes, verses, or principles that resonate with your family's values.",
        "Discuss with your partner: do you lean more toward a faith-based or values-based framework — or a blend?",
        "Write a rough draft of your family vision using the framework that feels most authentic to you."
      ]),
      sort_order: 2,
    },
    {
      module_title: "Crafting Your Family Vision",
      title: "Living Your Vision Daily",
      content: "A vision statement on the wall is wallpaper. A vision statement that shapes decisions is leadership. The gap between the two is daily practice. How do you take a sentence about 'kindness' or 'adventure' and make it real on a random Wednesday when everyone's tired and cranky?\n\nStart with a family mantra — a short phrase everyone can remember. 'We take care of each other.' 'Adventure starts at our front door.' 'Kind words, even when it's hard.' Say it at dinner, before school, when conflicts arise. Repetition embeds it.\n\nThen align your calendar with your vision. If your vision says 'adventure,' but your weekends are all screens and errands, something's off. If your vision says 'generosity,' find ways to practice it together — even small ones. A dollar in a donation jar, an afternoon volunteering, a meal dropped off for a neighbour. The vision isn't aspirational; it's instructional. Every day, you're either building toward it or away from it.",
      reflection_prompts: JSON.stringify([
        "Look at your last week: where did your actions align with your family values, and where didn't they?",
        "What's one small, daily practice that would make your family vision tangible for your kids?"
      ]),
      action_steps: JSON.stringify([
        "Create a family mantra — one sentence everyone can remember — and share it at dinner tonight.",
        "Identify one calendar change that would better align your weekly routine with your family vision.",
        "Plan one small activity this week that directly reflects a core family value (e.g., volunteering, exploring, creating together)."
      ]),
      sort_order: 3,
    },

    // ── Module 14: The Dad Playbook ────────────────────────────────────
    {
      module_title: "The Dad Playbook",
      title: "Building Your Playbook",
      content: "Every coach has a playbook — a set of go-to moves for common situations. As a dad, you need one too. Not because parenting is a sport, but because when you're tired, stressed, or out of ideas, you need something to reach for that isn't a screen.\n\nThe Dad Playbook is a living document of activities, conversation starters, and traditions that work for your specific kids. A 'boredom buster' list for rainy Saturdays. Five questions that actually get your teenager talking. Three ways to reconnect with a toddler after a long workday. It's not generic parenting advice — it's your personal collection of things that work in your family.\n\nStart by observing: what activities light your kids up? What questions spark real conversation? What traditions do they ask for again? Write them down. Over time, you'll build a playbook that's uniquely yours — and that your kids will one day steal for their own families.",
      reflection_prompts: JSON.stringify([
        "What activity does each of your children light up at the mention of?",
        "When was the last time you had a real conversation with your child — not logistics, but connection?"
      ]),
      action_steps: JSON.stringify([
        "Create a simple document (digital or physical) titled 'Dad Playbook' — start with 5 entries.",
        "Observe each child this week: what activity, question, or ritual makes them most engaged?",
        "Add one new activity, one conversation starter, and one tradition to your playbook each week."
      ]),
      sort_order: 1,
    },
    {
      module_title: "The Dad Playbook",
      title: "Conversation Starters That Actually Work",
      content: "'How was school?' is a terrible question. Kids give one-word answers because we ask one-dimensional questions. If you want real conversation, you need better prompts — questions that can't be answered with 'fine' or 'nothing.'\n\nTry these: 'What was the funniest thing that happened today?' 'If you could redo one moment from today, what would it be?' 'What's something you learned that surprised you?' Open-ended, specific, and genuinely curious. Your tone matters more than the words — if you're half-looking at your phone, no question will land.\n\nThe best conversations happen in the margins: the car ride to practice, the five minutes before bed, the walk to the mailbox. You don't need a formal 'talk' — you need to be available when they're ready. Keep a mental list of good questions and deploy them when the moment feels right. And when they actually open up, listen. Don't fix, don't lecture, don't teach. Just listen. That's the playbook's most important play.",
      reflection_prompts: JSON.stringify([
        "What's the last real conversation you had with each of your kids — what made it work?",
        "What question, if you asked it at dinner tonight, might spark an actual conversation?"
      ]),
      action_steps: JSON.stringify([
        "Write down 5 conversation starters that are specific to your kids' interests and ages.",
        "Try one new question at dinner tonight — notice the response without forcing it.",
        "Practice 'listening without fixing' — one conversation where you only ask questions and reflect, with no advice."
      ]),
      sort_order: 2,
    },
    {
      module_title: "The Dad Playbook",
      title: "Traditions That Stick",
      content: "Traditions are the scaffolding of childhood. They're the answer to 'what does our family do?' — and kids crave that answer more than they can articulate. The best traditions aren't elaborate or expensive; they're reliable. They happen whether you're tired or not, whether the week was good or bad, whether anyone feels like it or not.\n\nSome traditions are calendar-based: birthday breakfast where the birthday kid picks the menu, New Year's Day hike, summer solstice campout. Others are rhythm-based: Friday pizza night, Sunday morning pancakes, the song you sing at bedtime. The specific tradition matters less than its consistency. Kids don't remember the one amazing vacation as vividly as they remember the thousand ordinary Tuesday tuck-ins.\n\nBuild your own. Steal from your childhood, borrow from friends, invent from scratch. Start small — one new tradition this month. See what sticks, drop what doesn't. Over years, you'll have a collection of rituals that your kids will one day describe as 'what my family always did.'",
      reflection_prompts: JSON.stringify([
        "What traditions from your own childhood do you want to pass on — and which do you want to leave behind?",
        "If your kids described 'what our family always does' to a friend, what would they say?"
      ]),
      action_steps: JSON.stringify([
        "Write down every tradition your family currently has — even the small, accidental ones.",
        "Identify one tradition you want to start this month and put the first occurrence on the calendar.",
        "Ask your kids: 'What's one thing you wish we did as a family regularly?' and actually consider their answer."
      ]),
      sort_order: 3,
    },
  ];

  const lessonCount = await db`SELECT COUNT(*)::int as count FROM lessons`;
  if (lessonCount[0].count === 0) {
    for (const lesson of lessons) {
      const modResult = await db`
        SELECT id FROM modules WHERE title = ${lesson.module_title} LIMIT 1
      `;
      const moduleId = modResult.length > 0 ? modResult[0].id : null;

      if (moduleId) {
        await db`
          INSERT INTO lessons (module_id, title, content, reflection_prompts, action_steps, sort_order)
          VALUES (${moduleId}, ${lesson.title}, ${lesson.content}, ${lesson.reflection_prompts}::jsonb, ${lesson.action_steps}::jsonb, ${lesson.sort_order})
        `;
      }
    }
  }

  // ── Challenges ──────────────────────────────────────────────────────
  // Idempotent: skip if challenges already seeded

  const challenges = [
    {
      title: "7-Day Shutdown Streak",
      description:
        "Complete your work shutdown ritual every day for 7 straight days. Build the habit that protects your evenings.",
      category: "Ritual",
      duration_days: 7,
    },
    {
      title: "30-Day Family Dinner Challenge",
      description:
        "Sit down for dinner with your family — no phones, no TV — every night for 30 days. Reclaim the table.",
      category: "Family",
      duration_days: 30,
    },
    {
      title: "21-Day No-Phone Mornings",
      description:
        "Keep your phone out of reach for the first hour after you wake up. Be present before the world pulls you in.",
      category: "Tech",
      duration_days: 21,
    },
    {
      title: "14-Day Gratitude Practice",
      description:
        "Write down three things you're grateful for every day. Rewire your brain to see the good in your life.",
      category: "Mindset",
      duration_days: 14,
    },
    {
      title: "30-Day Debt Snowball Sprint",
      description:
        "Attack your smallest debt with intensity for 30 days. Build momentum and prove to yourself that progress is possible.",
      category: "Finances",
      duration_days: 30,
    },
    {
      title: "5-Day Work Boundary Bootcamp",
      description:
        "Set and hold one firm work boundary each day. No email after 6 PM. No Slack on weekends. Take back your time.",
      category: "Work",
      duration_days: 5,
    },
  ];

  const challengeCount = await db`SELECT COUNT(*)::int as count FROM challenges`;
  if (challengeCount[0].count === 0) {
    for (const challenge of challenges) {
      await db`
        INSERT INTO challenges (title, description, category, duration_days)
        VALUES (${challenge.title}, ${challenge.description}, ${challenge.category}, ${challenge.duration_days})
      `;
    }
  }

  return {
    modulesSeeded: moduleIds.length,
    resourcesSeeded: resources.length,
    lessonsSeeded: lessons.length,
    challengesSeeded: challenges.length,
  };
}
