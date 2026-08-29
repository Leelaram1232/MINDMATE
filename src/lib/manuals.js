import { Capacitor, registerPlugin } from '@capacitor/core';
import { jsPDF } from 'jspdf';

const FileDownload = registerPlugin('FileDownload');

export function getDetailedManual(role) {
  if (role === 'caregiver') return CAREGIVER_MANUAL;
  return USER_MANUAL;
}

const USER_MANUAL = {
  title: 'MINDMATE User Guide',
  subtitle: 'A clear, step-by-step handbook for people using MindMate every day.',
  filename: 'MINDMATE-User-Guide.pdf',
  sections: [
    {
      heading: '1. What MindMate is',
      intro: 'MindMate is a gentle companion for memory, daily routines, and staying connected. It is a wellness app, not a doctor and not a diagnosis tool.',
      steps: [
        'Use Home for games, reminders, progress, and talking with Mira.',
        'Open Settings (gear icon) to change language, theme, and Mira’s voice.',
        'A caregiver can link with an invite code if you want them to see your activity.',
      ],
      tip: 'Take your time. One short activity a day is enough.',
    },
    {
      heading: '2. Sign in and find your way',
      intro: 'After you create an account as “I am using MindMate”, Home is your starting place.',
      steps: [
        'The greeting at the top shows the time of day and your name.',
        'The bottom bar opens Home, Games, Reminders, and Progress.',
        'The microphone opens Talk with Mira. The gear opens Settings.',
        'Mira’s card on Home suggests a kind next game from your recent scores.',
      ],
    },
    {
      heading: '3. Settings: language, theme, and voice',
      intro: 'All personal choices live on Settings so Home stays simple.',
      steps: [
        'Language: choose English, Hindi, Telugu, or Tamil. New languages may download first. Mira then speaks in that language.',
        'Appearance: switch Light or Dark. On Android the status bar matches the theme.',
        'Voice: Mira defaults to a female voice. Turn Spoken replies Off if you only want to read answers. You can also pick Female or Male, and Slow, Normal, or Fast.',
        'Download this guide as a PDF. On a phone it is saved in Downloads.',
      ],
      tip: 'If Mira sounds like a man and you want a woman, keep Female selected and tap Test voice after the language pack is ready.',
    },
    {
      heading: '4. Play the games',
      intro: 'Each game is short. Mira may make the next round easier or a little brighter from your last scores.',
      steps: [
        'Memory Match: flip cards and find pairs. Remember where symbols were.',
        'Pattern Recall: watch shapes light up, then tap them in the same order.',
        'Object Recognition: look at a picture and tap the correct name.',
        'When you finish, Play Again or Back to Games. Your score is saved automatically.',
      ],
      tip: 'Play in a quiet place. If a round feels hard, stop and try again later. Mira will slow the pace.',
    },
    {
      heading: '5. Reminders and progress',
      intro: 'Reminders help with medicine, water, and daily activities. Progress shows how often you played.',
      steps: [
        'Open Reminders. First-time users get a starter list.',
        'When you finish a task, mark it done.',
        'Open My Progress for your streak, accuracy, and weekly bars.',
        'A caregiver who is linked can also add reminders for you.',
      ],
    },
    {
      heading: '6. Talk with Mira',
      intro: 'Mira is your companion. She answers in your Settings language, with the female voice unless you change it.',
      steps: [
        'Open Voice Assistance. Tap “Tap to hear Mira” if the phone is silent.',
        'Tap the microphone and speak, or type a message.',
        'Try: “What should I do now?”, “Start a game”, “Show my reminders”.',
        'Say “call my caregiver” if they saved a phone number in their Settings.',
      ],
      tip: 'Speak slowly and clearly. If the mic cannot hear you, type instead.',
    },
    {
      heading: '7. Connect with a caregiver',
      intro: 'A caregiver creates a one-time invite code. You enter it on Home.',
      steps: [
        'Ask them to open Patients and generate a code.',
        'On Home, open Connect with caregiver and type the code.',
        'After linking, they can see games, reminders, and activity. You stay in control of your daily use.',
      ],
    },
    {
      heading: '8. Helpful reminders',
      intro: 'Keep MindMate useful and safe.',
      steps: [
        'Do not use Mira for medical advice or medicine doses. Ask a clinician.',
        'Allow microphone permission only if you want to speak to Mira.',
        'If a language voice is missing on Android, Settings will offer to install it.',
        'Sign out from Settings when you finish on a shared phone.',
      ],
    },
  ],
};

const CAREGIVER_MANUAL = {
  title: 'MINDMATE Caregiver Guide',
  subtitle: 'How to support a loved one: linking, progress, reminders, and staying reachable.',
  filename: 'MINDMATE-Caregiver-Guide.pdf',
  sections: [
    {
      heading: '1. Your role in MindMate',
      intro: 'The caregiver portal helps you stay informed. It does not replace medical care.',
      steps: [
        'Sign up as a caregiver and save your call-back number.',
        'Link one or more people with an invite code.',
        'Use Overview, Activity, Cognitive Progress, Reminders, and Settings.',
      ],
    },
    {
      heading: '2. Account and Settings',
      intro: 'Settings holds appearance, language, Mira-related voice for the app, your phone number, and this guide.',
      steps: [
        'Theme: Light or Dark. Android bars follow the choice.',
        'Language: English, Hindi, Telugu, or Tamil for the portal and insights.',
        'Voice: spoken replies default on, with a female voice. Turn them off to read only, or change gender and speed.',
        'Call-back number: when they say “call my caregiver”, MindMate opens this number.',
      ],
      tip: 'Keep the phone number current so a call from their phone can reach you.',
    },
    {
      heading: '3. Link a patient',
      intro: 'Linking is required before the dashboard shows live data.',
      steps: [
        'Open Patients and tap to generate an invite code.',
        'Share the code. They enter it under Connect with caregiver on Home.',
        'When linked, select their name on Overview.',
        'Generate a new code if someone else needs to join later.',
      ],
    },
    {
      heading: '4. Read the dashboard',
      intro: 'Overview summarises this week: games played, average accuracy, memory trend, and reminders done.',
      steps: [
        'Games Completed is activity this week, not a medical score.',
        'Accuracy is the average of saved game sessions.',
        'Memory Trend compares recent sessions with earlier ones.',
        'Insights are short AI notes from the same data. They are not a diagnosis.',
      ],
    },
    {
      heading: '5. Activity, progress, and reminders',
      intro: 'Use the other tabs for detail.',
      steps: [
        'Activity: a timeline of games and reminder events.',
        'Cognitive Progress: weekly charts and trend language.',
        'Reminders: add or review items. They appear on their phone.',
        'Encourage a short morning game if participation drops. Do not pressure long sessions.',
      ],
    },
    {
      heading: '6. Download this guide',
      intro: 'You can read the guide in the app or save a PDF.',
      steps: [
        'Tap Download. The file is a formatted PDF.',
        'On Android it is stored in the phone Downloads folder.',
        'On a computer it downloads through the browser.',
        'Print the PDF if you want a paper copy.',
      ],
    },
    {
      heading: '7. Safety notes',
      intro: 'MindMate supports wellbeing. It does not treat illness.',
      steps: [
        'Do not change medicine from anything you see in the app.',
        'Contact a clinician if you notice sudden confusion, falls, or distress.',
        'Protect the invite code like a household password.',
      ],
    },
  ],
};

export function manualSections(role) {
  return getDetailedManual(role).sections;
}

function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = String(reader.result || '');
      const comma = result.indexOf(',');
      resolve(comma >= 0 ? result.slice(comma + 1) : result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export function buildManualPdf(role) {
  const manual = getDetailedManual(role);
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const left = 18;
  const right = pageWidth - 18;
  const width = right - left;
  let y = 22;

  const ensureSpace = (need) => {
    if (y + need < pageHeight - 16) return;
    doc.addPage();
    y = 20;
  };

  doc.setFillColor(47, 93, 80);
  doc.rect(0, 0, pageWidth, 28, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('MINDMATE NER', left, 12);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(manual.title, left, 20);
  y = 40;

  doc.setTextColor(47, 93, 80);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text(manual.title, left, y);
  y += 8;
  doc.setTextColor(70, 80, 74);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  const subLines = doc.splitTextToSize(manual.subtitle, width);
  doc.text(subLines, left, y);
  y += subLines.length * 5 + 6;

  doc.setDrawColor(201, 120, 93);
  doc.setLineWidth(0.6);
  doc.line(left, y, left + 36, y);
  y += 8;

  manual.sections.forEach((section) => {
    ensureSpace(28);
    doc.setTextColor(47, 93, 80);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    const head = doc.splitTextToSize(section.heading, width);
    doc.text(head, left, y);
    y += head.length * 6 + 2;

    if (section.intro) {
      doc.setTextColor(44, 44, 42);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      const intro = doc.splitTextToSize(section.intro, width);
      ensureSpace(intro.length * 5 + 6);
      doc.text(intro, left, y);
      y += intro.length * 5 + 3;
    }

    (section.steps || []).forEach((step, index) => {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      const body = doc.splitTextToSize(`${index + 1}. ${step}`, width - 4);
      ensureSpace(body.length * 5 + 4);
      doc.setTextColor(44, 44, 42);
      doc.text(body, left + 2, y);
      y += body.length * 5 + 2;
    });

    if (section.tip) {
      const tip = doc.splitTextToSize(`Tip: ${section.tip}`, width - 6);
      ensureSpace(tip.length * 5 + 10);
      doc.setFillColor(239, 245, 241);
      doc.roundedRect(left, y - 3, width, tip.length * 5 + 8, 2, 2, 'F');
      doc.setTextColor(47, 93, 80);
      doc.setFont('helvetica', 'italic');
      doc.text(tip, left + 3, y + 3);
      y += tip.length * 5 + 10;
    }
    y += 4;
  });

  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i += 1) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(122, 122, 116);
    doc.text('Made with care for everyday memory and wellbeing.', left, pageHeight - 8);
    doc.text(`${i} / ${pages}`, right, pageHeight - 8, { align: 'right' });
  }

  const blob = doc.output('blob');
  return { blob, filename: manual.filename, title: manual.title };
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1500);
}

export async function downloadManualFile({ role }) {
  const { blob, filename } = buildManualPdf(role);
  if (Capacitor.isNativePlatform()) {
    const data = await blobToBase64(blob);
    await FileDownload.savePdf({ filename, data });
    return { filename, folder: 'Downloads' };
  }
  downloadBlob(blob, filename);
  return { filename, folder: 'Downloads' };
}
