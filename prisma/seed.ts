import dotenvx from "@dotenvx/dotenvx";
dotenvx.config();

import { prisma } from "../app/config/db.ts";
import { generateHash } from "../app/util/hash.ts";

const auth = {
  username: "sbalke",
  password: generateHash("soerenbalke"),
  person: {
    create: {
      name: "Sören",
    },
  },
};

await prisma.auth.create({ data: auth });

await prisma.person.createMany({
  data: [
    { name: "Julia Weidenbrück" },
    { name: "Thyl Voss" },
    { name: "Janek Dann" },
  ],
});

const customer = await prisma.customer.create({
  data: {
    name: "Fokuspokus Media",
    location: {
      create: {
        name: "Büro",
        number: "24",
        postcode: "30161",
        street: "Spichernstraße",
        venue: "Hannover",
      },
    },
  },
});

const model = await prisma.model.create({
  data: {
    name: "Sören Balke",
    age: "31",
    agency: "Meine",
    sex: "male",
  },
});

const projectLocation = await prisma.location.create({
  data: {
    name: "Super Ort",
    number: "12b",
    postcode: "241278",
    street: "Fantasiestraße",
    venue: "Night City",
  },
});

const project = await prisma.project.create({
  data: {
    begin: "2025-04-07T14:25:35.174Z",
    title: "Projekt Management",
  },
});

await prisma.locationFromProject.create({
  data: {
    projectId: project.id,
    locationId: projectLocation.id,
  },
});

await prisma.dispo.createMany({
  data: [
    {
      start_time: "2025-04-07T08:00:00.000Z",
      end_time: "2025-04-07T08:15:00.000Z",
      what: "Ankunft Team",
      who: "FPM – Team Philipp Baumgartner",
      additions: "Sicherheitsschuh-Pflicht",
      projectId: project.id,
    },
    {
      start_time: "2025-04-07T08:15:00.000Z",
      end_time: "2025-04-07T08:45:00.000Z",
      what: "Vorbereitung der Dolly-Zoom Startszene",
      who: "FPM – Team, Philipp Baumgartner, Protagonist 1",
      additions: "Bitte den Arbeitsplatz sehr aufräumen und Kabel verstecken",
      projectId: project.id,
    },
    {
      start_time: "2025-04-07T08:45:00.000Z",
      end_time: "2025-04-07T09:30:00.000Z",
      what: "Dreh Dolly-Zoom-Szene, Fotoshooting Totalen",
      who: "FPM – Team, Philipp Baumgartner, Protagonist 1",
      additions:
        "Bitte Kleidung des Protagonisten vorher prüfen. Welches Bediener-Outfit ist gewünscht?, Geräuschkulisse aufnehmen!",
      projectId: project.id,
    },
    {
      start_time: "2025-04-07T09:30:00.000Z",
      end_time: "2025-04-07T12:00:00.000Z",
      what: "Dreh nach Storyboard, Fotos nach Shotlist",
      who: "FPM – Team, Philipp Baumgartner, Protagonist 1",
      additions: "Der Protagonist wird nur teilweise benötigt",
      projectId: project.id,
    },
    {
      start_time: "2025-04-07T12:00:00.000Z",
      end_time: "2025-04-07T13:00:00.000Z",
      what: "Mittagspause",
      who: "FPM – Team, Philipp Baumgartner, Protagonist 1",
      additions: "Pizza bestellen? Cafeteria?",
      projectId: project.id,
    },
  ],
});

await prisma.storyboard.createMany({
  data: [
    {
      duration: "",
      projectId: project.id,
      scene_description:
        "Night, moody. We see the laser line scanning that thumb. <BEEP>",
      speaker_text: "",
      production_infos: "ABENDS, Produktion, Büro",
      post_production_infos:
        "Scanner ist gekauft und wird an eine entsprechende Stelle geklebt und funktioniert nur als leuchtendes Objekt. Der Rest wird in der Post eingebaut.",
    },
    {
      duration: "",
      projectId: project.id,
      scene_description:
        " Male narrator, same voice as in the GBE and GBD image videos. Cam sinks down, opens. Later at the evening, the assembly hall is sleeping.",
      speaker_text:
        "»Well then… An image film about converting…« \n »What can we possibly tell that our… surveyable community of paper sack experts does not know already? «",
      production_infos: "ABENDS, Produktion",
      post_production_infos: "",
    },
    {
      duration: "",
      projectId: project.id,
      scene_description:
        "Our cam passes by multiple stations where machine are being assembled.",
      speaker_text:
        "»That we build the best, fastest and most reliable tubers and bottomers in the world? «",
      production_infos: "ABENDS, Produktion",
      post_production_infos: "",
    },
    {
      duration: "",
      projectId: project.id,
      scene_description: "",
      speaker_text:
        "»That the price tag is …<shyly>… as impressive as their productivity?«",
      production_infos: "ABENDS, Produktion",
      post_production_infos: "",
    },
    {
      duration: "",
      projectId: project.id,
      scene_description:
        "Cam finds person walking through a giant hall, W&H dress; we pass elements in the foreground.",
      speaker_text: "",
      production_infos: "ABENDS, Demo-Halle",
      post_production_infos: "",
    },
    {
      duration: "",
      projectId: project.id,
      scene_description:
        "Of course we see a bottomed or tuber machine in the background.",
      speaker_text: "»Maybe, we should…«",
      production_infos: "ABENDS, Demo-Halle",
      post_production_infos: "",
    },
    {
      duration: "",
      projectId: project.id,
      scene_description: "Puts a red tile in front of white dominos. ",
      speaker_text: "»… kick this off differently. «",
      production_infos: "ABENDS, Demo-Halle",
      post_production_infos: "",
    },
    {
      duration: "",
      projectId: project.id,
      scene_description:
        "Whoever our cast is quickly smirks towards the camera, very subtile",
      speaker_text: "",
      production_infos: "ABENDS, Demo-Halle",
      post_production_infos: "",
    },
    {
      duration: "",
      projectId: project.id,
      scene_description: "Puts a red tile in front of white dominos.",
      speaker_text: "»Fancy a tour? «",
      production_infos: "ABENDS, Demo-Halle",
      post_production_infos: "",
    },
    {
      duration: "",
      projectId: project.id,
      scene_description:
        "Cam races with the dominos falling, machine in the background, then swivels to a top down shot.",
      speaker_text: "",
      production_infos: "",
      post_production_infos: "",
    },
  ],
});
await prisma.projectboard.create({
  data: {
    title: "Moodboard",
    projectId: project.id,
    text: "Ipsum dolor reprehenderit voluptate voluptate eiusmod pariatur dolore sit sint.",
  },
});

await prisma.customerProject.create({
  data: {
    customerId: customer.id,
    projectId: project.id,
  },
});
await prisma.modelOnProject.create({
  data: {
    modelId: model.id,
    projectId: project.id,
  },
});
await prisma.personOnProject.createMany({
  data: [
    {
      personId: 2,
      projectId: 1,
      role: "Leitung",
    },
    {
      personId: 3,
      projectId: 1,
      role: "Kamera",
    },
    {
      personId: 4,
      projectId: 1,
      role: "Assistenz",
    },
  ],
});

console.log(`Seeding finished.`);
await prisma.$disconnect();
