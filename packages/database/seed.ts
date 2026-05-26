import "dotenv/config";
import { db } from "./index";
import {
  usersTable,
  formsTable,
  formFieldsTable,
  formResponsesTable,
  themesTable,
} from "./schema";
import * as bcrypt from "bcrypt";

const SALT_ROUNDS = 10;

async function seed() {
  console.log("🌱 Starting database seed...");

  try {
    // Clear existing data (in order due to foreign keys)
    console.log("🧹 Clearing existing data...");
    await db.delete(formResponsesTable);
    await db.delete(formFieldsTable);
    await db.delete(formsTable);
    await db.delete(themesTable);
    await db.delete(usersTable);

    // ============================================
    // 1. CREATE DEMO USER
    // ============================================
    console.log("👤 Creating demo user...");
    const passwordHash = await bcrypt.hash("Demo@1234", SALT_ROUNDS);

    const [demoUser] = await db
      .insert(usersTable)
      .values({
        email: "demo@formcraft.io",
        fullName: "Demo Creator",
        passwordHash,
        role: "creator",
        emailVerified: true,
      })
      .returning();

    console.log(`✅ Demo user created: ${demoUser.email}`);

    // ============================================
    // 2. CREATE THEMES
    // ============================================
    console.log("🎨 Creating themes...");

    const themesData = [
      {
        name: "Hogwarts",
        slug: "hogwarts",
        category: "movie" as const,
        config: {
          primaryColor: "#740001",
          backgroundColor: "#1a1a1a",
          cardColor: "#2d2d2d",
          textColor: "#f5f5f5",
          accentColor: "#d3a625",
          fontFamily: "Georgia, serif",
          borderRadius: "4px",
        },
        isDefault: false,
      },
      {
        name: "Cyberpunk 2077",
        slug: "cyberpunk-2077",
        category: "game" as const,
        config: {
          primaryColor: "#fcee09",
          backgroundColor: "#0a0a0a",
          cardColor: "#1a1a1a",
          textColor: "#fcee09",
          accentColor: "#00f0ff",
          fontFamily: "Courier New, monospace",
          borderRadius: "0px",
        },
        isDefault: false,
      },
      {
        name: "Silicon Valley",
        slug: "silicon-valley",
        category: "startup" as const,
        config: {
          primaryColor: "#4F46E5",
          backgroundColor: "#ffffff",
          cardColor: "#f9fafb",
          textColor: "#111827",
          accentColor: "#06b6d4",
          fontFamily: "Inter, sans-serif",
          borderRadius: "8px",
        },
        isDefault: true,
      },
      {
        name: "Tokyo Nights",
        slug: "tokyo-nights",
        category: "anime" as const,
        config: {
          primaryColor: "#ff007f",
          backgroundColor: "#1a1b26",
          cardColor: "#24283b",
          textColor: "#c0caf5",
          accentColor: "#7aa2f7",
          fontFamily: "Poppins, sans-serif",
          borderRadius: "12px",
        },
        isDefault: false,
      },
      {
        name: "Arch Linux",
        slug: "arch-linux",
        category: "os" as const,
        config: {
          primaryColor: "#1793d1",
          backgroundColor: "#000000",
          cardColor: "#0d1117",
          textColor: "#ffffff",
          accentColor: "#1793d1",
          fontFamily: "JetBrains Mono, monospace",
          borderRadius: "0px",
        },
        isDefault: false,
      },
      {
        name: "Matrix",
        slug: "matrix",
        category: "movie" as const,
        config: {
          primaryColor: "#00ff00",
          backgroundColor: "#000000",
          cardColor: "#0a0a0a",
          textColor: "#00ff00",
          accentColor: "#00cc00",
          fontFamily: "Courier New, monospace",
          borderRadius: "0px",
        },
        isDefault: false,
      },
      {
        name: "Indie Dev",
        slug: "indie-dev",
        category: "community" as const,
        config: {
          primaryColor: "#ff6b35",
          backgroundColor: "#fef6e4",
          cardColor: "#ffffff",
          textColor: "#001858",
          accentColor: "#f582ae",
          fontFamily: "Quicksand, sans-serif",
          borderRadius: "16px",
        },
        isDefault: false,
      },
      {
        name: "Neon Arcade",
        slug: "neon-arcade",
        category: "game" as const,
        config: {
          primaryColor: "#ff00ff",
          backgroundColor: "#0d0221",
          cardColor: "#1b0638",
          textColor: "#ffffff",
          accentColor: "#00ffff",
          fontFamily: "Press Start 2P, monospace",
          borderRadius: "0px",
        },
        isDefault: false,
      },
    ];

    const themes = await db.insert(themesTable).values(themesData).returning();
    console.log(`✅ Created ${themes.length} themes`);

    // ============================================
    // 3. CREATE FORMS WITH FIELDS
    // ============================================
    console.log("📝 Creating forms...");

    // FORM 1: Hogwarts Enrollment
    const [hogwartsForm] = await db
      .insert(formsTable)
      .values({
        userId: demoUser.id,
        title: "Hogwarts Enrollment Form",
        description:
          "Join the most prestigious school of witchcraft and wizardry",
        slug: "hogwarts-enrollment",
        status: "published",
        visibility: "public",
        theme: { themeId: themes.find((t) => t.slug === "hogwarts")?.id },
      })
      .returning();

    const hogwartsFields = await db.insert(formFieldsTable).values([
      {
        formId: hogwartsForm.id,
        type: "short_text",
        label: "Full Name",
        placeholder: "Enter your full name",
        required: true,
        order: 0,
      },
      {
        formId: hogwartsForm.id,
        type: "single_select",
        label: "House Preference",
        description: "Which house do you wish to be sorted into?",
        required: true,
        order: 1,
        options: [
          { label: "Gryffindor", value: "gryffindor" },
          { label: "Hufflepuff", value: "hufflepuff" },
          { label: "Ravenclaw", value: "ravenclaw" },
          { label: "Slytherin", value: "slytherin" },
        ],
      },
      {
        formId: hogwartsForm.id,
        type: "multi_select",
        label: "Magic Specialties",
        description: "Select areas you're interested in",
        required: false,
        order: 2,
        options: [
          { label: "Potions", value: "potions" },
          { label: "Charms", value: "charms" },
          { label: "Defense Against Dark Arts", value: "defense" },
          { label: "Transfiguration", value: "transfiguration" },
          { label: "Herbology", value: "herbology" },
        ],
      },
      {
        formId: hogwartsForm.id,
        type: "number",
        label: "Years of Magic Experience",
        placeholder: "0",
        required: false,
        order: 3,
        validations: { min: 0, max: 50 },
      },
      {
        formId: hogwartsForm.id,
        type: "long_text",
        label: "Personal Statement",
        placeholder: "Tell us why you want to join Hogwarts...",
        required: true,
        order: 4,
        validations: { minLength: 50, maxLength: 1000 },
      },
      {
        formId: hogwartsForm.id,
        type: "date",
        label: "Preferred Start Date",
        required: true,
        order: 5,
      },
    ]).returning();

    // Generate 50 responses for Hogwarts form
    const houses = ["gryffindor", "hufflepuff", "ravenclaw", "slytherin"];
    const names = [
      "Harry Potter",
      "Hermione Granger",
      "Ron Weasley",
      "Draco Malfoy",
      "Luna Lovegood",
      "Neville Longbottom",
      "Ginny Weasley",
      "Fred Weasley",
      "George Weasley",
      "Cho Chang",
    ];
    
    for (let i = 0; i < 50; i++) {
      const randomHouse = houses[Math.floor(Math.random() * houses.length)];
      const randomName = names[Math.floor(Math.random() * names.length)] + ` ${i}`;
      
      await db.insert(formResponsesTable).values({
        formId: hogwartsForm.id,
        respondentEmail: `student${i}@hogwarts.edu`,
        respondentIp: `192.168.1.${i}`,
        userAgent: "Mozilla/5.0",
        answers: [
          { fieldId: hogwartsFields[0]!.id, value: randomName },
          { fieldId: hogwartsFields[1]!.id, value: randomHouse },
          { fieldId: hogwartsFields[2]!.id, value: ["potions", "charms"] },
          { fieldId: hogwartsFields[3]!.id, value: Math.floor(Math.random() * 10) },
          { fieldId: hogwartsFields[4]!.id, value: "I have always dreamed of learning magic..." },
          { fieldId: hogwartsFields[5]!.id, value: "2024-09-01" },
        ],
        submittedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      });
    }

    console.log(`✅ Created Hogwarts Enrollment form with 50 responses`);

    // FORM 2: Startup Pitch Application
    const [startupForm] = await db
      .insert(formsTable)
      .values({
        userId: demoUser.id,
        title: "Startup Pitch Application",
        description: "Apply to pitch your startup at our next demo day",
        slug: "startup-pitch-application",
        status: "published",
        visibility: "public",
        theme: { themeId: themes.find((t) => t.slug === "silicon-valley")?.id },
      })
      .returning();

    const startupFields = await db.insert(formFieldsTable).values([
      {
        formId: startupForm.id,
        type: "short_text",
        label: "Startup Name",
        placeholder: "YourStartup Inc.",
        required: true,
        order: 0,
      },
      {
        formId: startupForm.id,
        type: "email",
        label: "Founder Email",
        placeholder: "founder@startup.com",
        required: true,
        order: 1,
      },
      {
        formId: startupForm.id,
        type: "single_select",
        label: "Stage",
        required: true,
        order: 2,
        options: [
          { label: "Idea", value: "idea" },
          { label: "MVP", value: "mvp" },
          { label: "Growth", value: "growth" },
          { label: "Scale", value: "scale" },
        ],
      },
      {
        formId: startupForm.id,
        type: "number",
        label: "Funding Needed ($)",
        placeholder: "100000",
        required: true,
        order: 3,
        validations: { min: 0 },
      },
      {
        formId: startupForm.id,
        type: "long_text",
        label: "Problem Statement",
        placeholder: "What problem are you solving?",
        required: true,
        order: 4,
        validations: { minLength: 100 },
      },
      {
        formId: startupForm.id,
        type: "number",
        label: "Team Size",
        required: true,
        order: 5,
        validations: { min: 1, max: 100 },
      },
      {
        formId: startupForm.id,
        type: "short_text",
        label: "Demo URL",
        placeholder: "https://demo.yourstartup.com",
        required: false,
        order: 6,
      },
      {
        formId: startupForm.id,
        type: "rating",
        label: "Confidence in Idea",
        description: "Rate your confidence from 1-10",
        required: true,
        order: 7,
        validations: { max: 10 },
      },
    ]).returning();

    // Generate 35 responses
    const stages = ["idea", "mvp", "growth", "scale"];
    for (let i = 0; i < 35; i++) {
      await db.insert(formResponsesTable).values({
        formId: startupForm.id,
        respondentEmail: `founder${i}@startup${i}.com`,
        respondentIp: `10.0.0.${i}`,
        userAgent: "Mozilla/5.0",
        answers: [
          { fieldId: startupFields[0]!.id, value: `Startup ${i}` },
          { fieldId: startupFields[1]!.id, value: `founder${i}@startup${i}.com` },
          { fieldId: startupFields[2]!.id, value: stages[Math.floor(Math.random() * stages.length)] },
          { fieldId: startupFields[3]!.id, value: Math.floor(Math.random() * 1000000) + 50000 },
          { fieldId: startupFields[4]!.id, value: "We are solving a major problem in the industry..." },
          { fieldId: startupFields[5]!.id, value: Math.floor(Math.random() * 20) + 1 },
          { fieldId: startupFields[6]!.id, value: `https://demo-startup${i}.com` },
          { fieldId: startupFields[7]!.id, value: Math.floor(Math.random() * 5) + 6 },
        ],
        submittedAt: new Date(Date.now() - Math.random() * 20 * 24 * 60 * 60 * 1000),
      });
    }

    console.log(`✅ Created Startup Pitch form with 35 responses`);

    // FORM 3: Anime Character Survey
    const [animeForm] = await db
      .insert(formsTable)
      .values({
        userId: demoUser.id,
        title: "Anime Character Survey",
        description: "Share your favorite anime characters and series with us!",
        slug: "anime-character-survey",
        status: "published",
        visibility: "public",
        theme: { themeId: themes.find((t) => t.slug === "tokyo-nights")?.id },
      })
      .returning();

    const animeFields = await db.insert(formFieldsTable).values([
      {
        formId: animeForm.id,
        type: "short_text",
        label: "Your Name",
        placeholder: "Enter your name",
        required: false,
        order: 0,
      },
      {
        formId: animeForm.id,
        type: "single_select",
        label: "Favorite Series",
        required: true,
        order: 1,
        options: [
          { label: "Naruto", value: "naruto" },
          { label: "One Piece", value: "one_piece" },
          { label: "Attack on Titan", value: "aot" },
          { label: "Demon Slayer", value: "demon_slayer" },
          { label: "Other", value: "other" },
        ],
      },
      {
        formId: animeForm.id,
        type: "multi_select",
        label: "Favorite Characters",
        description: "Select all that apply",
        required: false,
        order: 2,
        options: [
          { label: "Naruto Uzumaki", value: "naruto" },
          { label: "Monkey D. Luffy", value: "luffy" },
          { label: "Eren Yeager", value: "eren" },
          { label: "Tanjiro Kamado", value: "tanjiro" },
          { label: "Goku", value: "goku" },
        ],
      },
      {
        formId: animeForm.id,
        type: "rating",
        label: "Overall Rating",
        description: "Rate your love for anime (1-10)",
        required: true,
        order: 3,
        validations: { max: 10 },
      },
      {
        formId: animeForm.id,
        type: "long_text",
        label: "Why do you love anime?",
        placeholder: "Share your thoughts...",
        required: false,
        order: 4,
      },
      {
        formId: animeForm.id,
        type: "checkbox",
        label: "Would you recommend anime to friends?",
        required: false,
        order: 5,
      },
      {
        formId: animeForm.id,
        type: "email",
        label: "Contact Email",
        placeholder: "your@email.com",
        required: false,
        order: 6,
      },
    ]).returning();

    // Generate 60 responses
    const series = ["naruto", "one_piece", "aot", "demon_slayer", "other"];
    for (let i = 0; i < 60; i++) {
      await db.insert(formResponsesTable).values({
        formId: animeForm.id,
        respondentEmail: `anime-fan${i}@email.com`,
        respondentIp: `172.16.0.${i}`,
        userAgent: "Mozilla/5.0",
        answers: [
          { fieldId: animeFields[0]!.id, value: `Anime Fan ${i}` },
          { fieldId: animeFields[1]!.id, value: series[Math.floor(Math.random() * series.length)] },
          { fieldId: animeFields[2]!.id, value: ["naruto", "luffy"] },
          { fieldId: animeFields[3]!.id, value: Math.floor(Math.random() * 4) + 7 },
          { fieldId: animeFields[4]!.id, value: "Anime has amazing storytelling and character development!" },
          { fieldId: animeFields[5]!.id, value: true },
          { fieldId: animeFields[6]!.id, value: `anime-fan${i}@email.com` },
        ],
        submittedAt: new Date(Date.now() - Math.random() * 25 * 24 * 60 * 60 * 1000),
      });
    }

    console.log(`✅ Created Anime Survey form with 60 responses`);

    // FORM 4: Game Dev Feedback
    const [gameForm] = await db
      .insert(formsTable)
      .values({
        userId: demoUser.id,
        title: "Game Dev Feedback Form",
        description: "Help us improve our indie game with your feedback",
        slug: "game-dev-feedback",
        status: "published",
        visibility: "unlisted",
        theme: { themeId: themes.find((t) => t.slug === "neon-arcade")?.id },
      })
      .returning();

    const gameFields = await db.insert(formFieldsTable).values([
      {
        formId: gameForm.id,
        type: "short_text",
        label: "Game Name",
        placeholder: "What game did you test?",
        required: true,
        order: 0,
      },
      {
        formId: gameForm.id,
        type: "multi_select",
        label: "Platform",
        required: true,
        order: 1,
        options: [
          { label: "PC", value: "pc" },
          { label: "Console", value: "console" },
          { label: "Mobile", value: "mobile" },
        ],
      },
      {
        formId: gameForm.id,
        type: "rating",
        label: "Fun Rating",
        description: "How fun was the game? (1-10)",
        required: true,
        order: 2,
        validations: { max: 10 },
      },
      {
        formId: gameForm.id,
        type: "rating",
        label: "Difficulty Rating",
        description: "How difficult was the game? (1-10)",
        required: true,
        order: 3,
        validations: { max: 10 },
      },
      {
        formId: gameForm.id,
        type: "long_text",
        label: "Bugs Encountered",
        placeholder: "Describe any bugs you found...",
        required: false,
        order: 4,
      },
      {
        formId: gameForm.id,
        type: "long_text",
        label: "Feature Requests",
        placeholder: "What features would you like to see?",
        required: false,
        order: 5,
      },
      {
        formId: gameForm.id,
        type: "single_select",
        label: "Would you play again?",
        required: true,
        order: 6,
        options: [
          { label: "Yes", value: "yes" },
          { label: "No", value: "no" },
          { label: "Maybe", value: "maybe" },
        ],
      },
      {
        formId: gameForm.id,
        type: "email",
        label: "Tester Email",
        required: false,
        order: 7,
      },
    ]).returning();

    // Generate 25 responses
    for (let i = 0; i < 25; i++) {
      await db.insert(formResponsesTable).values({
        formId: gameForm.id,
        respondentEmail: `tester${i}@gamedev.com`,
        respondentIp: `192.168.100.${i}`,
        userAgent: "Mozilla/5.0",
        answers: [
          { fieldId: gameFields[0]!.id, value: "Cyber Quest 2077" },
          { fieldId: gameFields[1]!.id, value: ["pc", "console"] },
          { fieldId: gameFields[2]!.id, value: Math.floor(Math.random() * 3) + 7 },
          { fieldId: gameFields[3]!.id, value: Math.floor(Math.random() * 5) + 5 },
          { fieldId: gameFields[4]!.id, value: "Found a bug in level 3 where character gets stuck..." },
          { fieldId: gameFields[5]!.id, value: "Would love to see multiplayer mode!" },
          { fieldId: gameFields[6]!.id, value: ["yes", "maybe"][Math.floor(Math.random() * 2)] },
          { fieldId: gameFields[7]!.id, value: `tester${i}@gamedev.com` },
        ],
        submittedAt: new Date(Date.now() - Math.random() * 15 * 24 * 60 * 60 * 1000),
      });
    }

    console.log(`✅ Created Game Dev Feedback form with 25 responses`);

    // FORM 5: Linux Distro Poll
    const [linuxForm] = await db
      .insert(formsTable)
      .values({
        userId: demoUser.id,
        title: "Linux Distro Preference Poll",
        description: "Share your Linux distribution preferences and usage",
        slug: "linux-distro-poll",
        status: "published",
        visibility: "public",
        theme: { themeId: themes.find((t) => t.slug === "arch-linux")?.id },
      })
      .returning();

    const linuxFields = await db.insert(formFieldsTable).values([
      {
        formId: linuxForm.id,
        type: "short_text",
        label: "Name",
        placeholder: "Your name (optional)",
        required: false,
        order: 0,
      },
      {
        formId: linuxForm.id,
        type: "single_select",
        label: "Favorite Distribution",
        required: true,
        order: 1,
        options: [
          { label: "Ubuntu", value: "ubuntu" },
          { label: "Arch Linux", value: "arch" },
          { label: "Fedora", value: "fedora" },
          { label: "Debian", value: "debian" },
          { label: "NixOS", value: "nixos" },
          { label: "Other", value: "other" },
        ],
      },
      {
        formId: linuxForm.id,
        type: "single_select",
        label: "Desktop Environment",
        required: true,
        order: 2,
        options: [
          { label: "GNOME", value: "gnome" },
          { label: "KDE Plasma", value: "kde" },
          { label: "XFCE", value: "xfce" },
          { label: "i3/Sway", value: "i3" },
          { label: "Other", value: "other" },
        ],
      },
      {
        formId: linuxForm.id,
        type: "number",
        label: "Years Using Linux",
        required: true,
        order: 3,
        validations: { min: 0, max: 50 },
      },
      {
        formId: linuxForm.id,
        type: "multi_select",
        label: "Primary Use Cases",
        required: false,
        order: 4,
        options: [
          { label: "Development", value: "dev" },
          { label: "Gaming", value: "gaming" },
          { label: "Server", value: "server" },
          { label: "Daily Driver", value: "daily" },
          { label: "Learning", value: "learning" },
        ],
      },
      {
        formId: linuxForm.id,
        type: "long_text",
        label: "Hot Take",
        placeholder: "Share your controversial Linux opinion...",
        required: false,
        order: 5,
      },
      {
        formId: linuxForm.id,
        type: "rating",
        label: "Overall Linux Experience",
        description: "Rate your experience (1-10)",
        required: true,
        order: 6,
        validations: { max: 10 },
      },
    ]).returning();

    // Generate 40 responses
    const distros = ["ubuntu", "arch", "fedora", "debian", "nixos", "other"];
    const desktops = ["gnome", "kde", "xfce", "i3", "other"];
    for (let i = 0; i < 40; i++) {
      await db.insert(formResponsesTable).values({
        formId: linuxForm.id,
        respondentEmail: `linuxuser${i}@opensource.org`,
        respondentIp: `10.10.10.${i}`,
        userAgent: "Mozilla/5.0",
        answers: [
          { fieldId: linuxFields[0]!.id, value: `Linux User ${i}` },
          { fieldId: linuxFields[1]!.id, value: distros[Math.floor(Math.random() * distros.length)] },
          { fieldId: linuxFields[2]!.id, value: desktops[Math.floor(Math.random() * desktops.length)] },
          { fieldId: linuxFields[3]!.id, value: Math.floor(Math.random() * 15) + 1 },
          { fieldId: linuxFields[4]!.id, value: ["dev", "daily"] },
          { fieldId: linuxFields[5]!.id, value: "Vim is better than Emacs! Fight me!" },
          { fieldId: linuxFields[6]!.id, value: Math.floor(Math.random() * 3) + 8 },
        ],
        submittedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      });
    }

    console.log(`✅ Created Linux Distro Poll form with 40 responses`);

    console.log("\n🎉 Seed completed successfully!");
    console.log("\n📊 Summary:");
    console.log(`   - 1 demo user (demo@formcraft.io / Demo@1234)`);
    console.log(`   - 8 themes`);
    console.log(`   - 5 forms (4 public, 1 unlisted)`);
    console.log(`   - 210 total responses`);
    console.log("\n🚀 You can now start the app and explore!");

    process.exit(0);
  } catch (error) {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  }
}

seed();
