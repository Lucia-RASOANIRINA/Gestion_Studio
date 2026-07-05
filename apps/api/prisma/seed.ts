import {
  BookingType,
  ClientSegment,
  Currency,
  PermissionAction,
  PermissionModule,
  PrismaClient,
  ProjectStatus,
  ServiceType,
  StudioRoom,
} from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const READ = PermissionAction.READ;
const CREATE = PermissionAction.CREATE;
const UPDATE = PermissionAction.UPDATE;
const DELETE = PermissionAction.DELETE;
const EXPORT = PermissionAction.EXPORT;
const VALIDATE = PermissionAction.VALIDATE;

interface RoleDefinition {
  name: string;
  description: string;
  isSystem: boolean;
  grants: Array<{ module: PermissionModule; actions: PermissionAction[] }>;
}

interface DemoUser {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  locale: "fr" | "en";
  roleName: string;
}

const ALL_MODULES = Object.values(PermissionModule);
const ALL_ACTIONS = Object.values(PermissionAction);

const ROLE_DEFINITIONS: RoleDefinition[] = [
  {
    name: "admin",
    description: "Administrateur — accès complet à tous les modules",
    isSystem: true,
    grants: ALL_MODULES.map((module) => ({ module, actions: ALL_ACTIONS })),
  },
  {
    name: "producer",
    description: "Producteur / Chef de projet — projets, planning, clients, facturation",
    isSystem: true,
    grants: [
      { module: PermissionModule.CLIENTS, actions: [READ, CREATE, UPDATE] },
      { module: PermissionModule.PROJECTS, actions: [READ, CREATE, UPDATE, VALIDATE] },
      { module: PermissionModule.PLANNING, actions: [READ, CREATE, UPDATE] },
      { module: PermissionModule.RESOURCES, actions: [READ] },
      { module: PermissionModule.BILLING, actions: [READ, CREATE] },
    ],
  },
  {
    name: "sound_engineer",
    description: "Ingénieur du son — sessions, planning, matériel, livrables",
    isSystem: true,
    grants: [
      { module: PermissionModule.PROJECTS, actions: [READ, UPDATE] },
      { module: PermissionModule.PLANNING, actions: [READ, UPDATE] },
      { module: PermissionModule.RESOURCES, actions: [READ, UPDATE] },
    ],
  },
  {
    name: "sales",
    description: "Commercial — clients, devis, contrats",
    isSystem: true,
    grants: [
      { module: PermissionModule.CLIENTS, actions: [READ, CREATE, UPDATE, EXPORT] },
      { module: PermissionModule.PROJECTS, actions: [READ, CREATE] },
    ],
  },
  {
    name: "accounting",
    description: "Comptabilité — facturation, paiements, rapports, export comptable",
    isSystem: true,
    grants: [
      { module: PermissionModule.BILLING, actions: [READ, CREATE, UPDATE, EXPORT, VALIDATE] },
      { module: PermissionModule.REPORTING, actions: [READ, EXPORT] },
    ],
  },
  {
    name: "client_portal",
    description: "Client externe — suivi de projet, validation de livrables, paiement",
    isSystem: true,
    grants: [
      { module: PermissionModule.PROJECTS, actions: [READ] },
      { module: PermissionModule.BILLING, actions: [READ] },
    ],
  },
  {
    name: "freelancer",
    description: "Freelance / Intervenant externe — ses sessions et paiements",
    isSystem: true,
    grants: [
      { module: PermissionModule.PLANNING, actions: [READ] },
      { module: PermissionModule.PROJECTS, actions: [READ] },
    ],
  },
];

const DEMO_USERS: DemoUser[] = [
  {
    email: "admin@gestion-studio.mg",
    firstName: "Admin",
    lastName: "Gestion Studio",
    phone: "+261340000001",
    locale: "fr",
    roleName: "admin",
  },
  {
    email: "producteur@gestion-studio.mg",
    firstName: "Hery",
    lastName: "Rakoto",
    phone: "+261340000002",
    locale: "fr",
    roleName: "producer",
  },
  {
    email: "ingenieur@gestion-studio.mg",
    firstName: "Tojo",
    lastName: "Andrianina",
    phone: "+261340000003",
    locale: "fr",
    roleName: "sound_engineer",
  },
  {
    email: "commercial@gestion-studio.mg",
    firstName: "Fara",
    lastName: "Razafindrakoto",
    phone: "+261340000004",
    locale: "fr",
    roleName: "sales",
  },
  {
    email: "comptable@gestion-studio.mg",
    firstName: "Nirina",
    lastName: "Rasolofo",
    phone: "+261340000005",
    locale: "fr",
    roleName: "accounting",
  },
  {
    email: "client@gestion-studio.mg",
    firstName: "Client",
    lastName: "Démo",
    phone: "+261340000006",
    locale: "en",
    roleName: "client_portal",
  },
  {
    email: "freelance@gestion-studio.mg",
    firstName: "Mialy",
    lastName: "Ravelojaona",
    phone: "+261340000007",
    locale: "fr",
    roleName: "freelancer",
  },
];

const DEMO_PASSWORD = "ChangeMe123!";

interface DemoClient {
  key: string;
  name: string;
  segment: ClientSegment;
  email: string;
  phone: string;
  address: string;
  notes: string;
  reliabilityScore: number;
}

const DEMO_CLIENTS: DemoClient[] = [
  {
    key: "tolotra",
    name: "Tolotra Andriamahefa",
    segment: ClientSegment.ARTIST,
    email: "tolotra.andriamahefa@example.mg",
    phone: "+261320000011",
    address: "Lot II M 12 Ambatobe, Antananarivo",
    notes: "Artiste solo, style acoustique. Préfère le studio A.",
    reliabilityScore: 95,
  },
  {
    key: "zaza_orkestra",
    name: "Zaza Orkestra",
    segment: ClientSegment.ARTIST,
    email: "contact@zazaorkestra.mg",
    phone: "+261320000012",
    address: "Rue Rainandriamampandry, Antsahavola, Antananarivo",
    notes: "Groupe de 7 musiciens, sessions live fréquentes.",
    reliabilityScore: 88,
  },
  {
    key: "mikea_records",
    name: "Mikea Records",
    segment: ClientSegment.LABEL,
    email: "production@mikearecords.mg",
    phone: "+261320000013",
    address: "Ankorondrano, Antananarivo",
    notes: "Label indépendant, plusieurs artistes en coproduction.",
    reliabilityScore: 92,
  },
  {
    key: "sakay_prod",
    name: "Sakay Prod",
    segment: ClientSegment.LABEL,
    email: "hello@sakayprod.mg",
    phone: "+261320000014",
    address: "Analakely, Antananarivo",
    notes: "Label spécialisé slam et hip-hop malgache.",
    reliabilityScore: 79,
  },
  {
    key: "saha_communication",
    name: "Saha Communication",
    segment: ClientSegment.ADVERTISING_AGENCY,
    email: "studio@sahacommunication.mg",
    phone: "+261320000015",
    address: "Zone Galaxy Andraharo, Antananarivo",
    notes: "Agence de publicité, commandes de voix off régulières.",
    reliabilityScore: 85,
  },
  {
    key: "jovena",
    name: "Jovena Madagascar",
    segment: ClientSegment.COMPANY,
    email: "communication@jovena.mg",
    phone: "+261320000016",
    address: "Route des Hydrocarbures, Antananarivo",
    notes: "Entreprise, prestations événementielles annuelles.",
    reliabilityScore: 97,
  },
  {
    key: "ministere_culture",
    name: "Ministère de la Culture",
    segment: ClientSegment.INSTITUTION,
    email: "communication@culture.gov.mg",
    phone: "+261320000017",
    address: "Anosy, Antananarivo",
    notes: "Institution publique, appels d'offres pour événements culturels.",
    reliabilityScore: 90,
  },
  {
    key: "dj_rado",
    name: "DJ Rado",
    segment: ClientSegment.ARTIST,
    email: "djrado@example.mg",
    phone: "+261320000018",
    address: "Ivandry, Antananarivo",
    notes: "DJ événementiel, location de matériel fréquente.",
    reliabilityScore: 70,
  },
];

interface DemoProject {
  key: string;
  clientKey: string;
  title: string;
  serviceType: ServiceType;
  status: ProjectStatus;
  description: string;
  budgetAmount: number;
  budgetCurrency: Currency;
}

const DEMO_PROJECTS: DemoProject[] = [
  {
    key: "tolotra_recording",
    clientKey: "tolotra",
    title: "Enregistrement album acoustique",
    serviceType: ServiceType.RECORDING,
    status: ProjectStatus.QUOTE,
    description: "Enregistrement de 8 titres en studio A.",
    budgetAmount: 3500000,
    budgetCurrency: Currency.MGA,
  },
  {
    key: "tolotra_mixing",
    clientKey: "tolotra",
    title: "Mixage single 'Fitiavana'",
    serviceType: ServiceType.MIXING,
    status: ProjectStatus.VALIDATED,
    description: "Mixage stéréo pour diffusion radio et streaming.",
    budgetAmount: 800000,
    budgetCurrency: Currency.MGA,
  },
  {
    key: "zaza_mastering_ep",
    clientKey: "zaza_orkestra",
    title: "Mastering EP live",
    serviceType: ServiceType.MASTERING,
    status: ProjectStatus.IN_PROGRESS,
    description: "Mastering de l'enregistrement du concert du 12 mai.",
    budgetAmount: 1200000,
    budgetCurrency: Currency.MGA,
  },
  {
    key: "mikea_postproduction",
    clientKey: "mikea_records",
    title: "Post-production clip 'Tanindrazana'",
    serviceType: ServiceType.POST_PRODUCTION,
    status: ProjectStatus.REVIEW,
    description: "Sound design et habillage sonore du clip vidéo.",
    budgetAmount: 2100000,
    budgetCurrency: Currency.MGA,
  },
  {
    key: "saha_voiceover",
    clientKey: "saha_communication",
    title: "Voix off campagne institutionnelle",
    serviceType: ServiceType.VOICE_OVER,
    status: ProjectStatus.DELIVERED,
    description: "Voix off FR/MG pour spot radio 30 secondes.",
    budgetAmount: 450000,
    budgetCurrency: Currency.MGA,
  },
  {
    key: "jovena_rental",
    clientKey: "jovena",
    title: "Location sonorisation séminaire annuel",
    serviceType: ServiceType.EQUIPMENT_RENTAL,
    status: ProjectStatus.INVOICED,
    description: "Location console + enceintes + micros HF pour 200 personnes.",
    budgetAmount: 1800000,
    budgetCurrency: Currency.MGA,
  },
  {
    key: "ministere_live",
    clientKey: "ministere_culture",
    title: "Prestation live Fête de la Musique",
    serviceType: ServiceType.LIVE_EVENT,
    status: ProjectStatus.ARCHIVED,
    description: "Sonorisation de la scène principale, place du 13 mai.",
    budgetAmount: 5000000,
    budgetCurrency: Currency.MGA,
  },
  {
    key: "sakay_recording",
    clientKey: "sakay_prod",
    title: "Enregistrement mixtape collective",
    serviceType: ServiceType.RECORDING,
    status: ProjectStatus.QUOTE,
    description: "Sessions d'enregistrement pour 6 artistes du label.",
    budgetAmount: 2600000,
    budgetCurrency: Currency.MGA,
  },
  {
    key: "djrado_mixing",
    clientKey: "dj_rado",
    title: "Mixage set enregistré",
    serviceType: ServiceType.MIXING,
    status: ProjectStatus.IN_PROGRESS,
    description: "Mixage d'un set live enregistré en discothèque.",
    budgetAmount: 600000,
    budgetCurrency: Currency.MGA,
  },
  {
    key: "zaza_mastering_album",
    clientKey: "zaza_orkestra",
    title: "Mastering album studio",
    serviceType: ServiceType.MASTERING,
    status: ProjectStatus.VALIDATED,
    description: "Mastering final avant distribution digitale.",
    budgetAmount: 1400000,
    budgetCurrency: Currency.MGA,
  },
];

async function main() {
  const permissionByKey = new Map<string, { id: string }>();
  for (const module of ALL_MODULES) {
    for (const action of ALL_ACTIONS) {
      const permission = await prisma.permission.upsert({
        where: { module_action: { module, action } },
        update: {},
        create: { module, action },
      });
      permissionByKey.set(`${module}:${action}`, permission);
    }
  }

  const roleByName = new Map<string, { id: string }>();
  for (const definition of ROLE_DEFINITIONS) {
    const role = await prisma.role.upsert({
      where: { name: definition.name },
      update: { description: definition.description },
      create: {
        name: definition.name,
        description: definition.description,
        isSystem: definition.isSystem,
      },
    });
    roleByName.set(definition.name, role);

    for (const grant of definition.grants) {
      for (const action of grant.actions) {
        const permission = permissionByKey.get(`${grant.module}:${action}`);
        if (!permission) continue;
        await prisma.rolePermission.upsert({
          where: { roleId_permissionId: { roleId: role.id, permissionId: permission.id } },
          update: {},
          create: { roleId: role.id, permissionId: permission.id },
        });
      }
    }
  }

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  for (const demoUser of DEMO_USERS) {
    const user = await prisma.user.upsert({
      where: { email: demoUser.email },
      update: {},
      create: {
        email: demoUser.email,
        passwordHash,
        firstName: demoUser.firstName,
        lastName: demoUser.lastName,
        phone: demoUser.phone,
        locale: demoUser.locale,
      },
    });

    const role = roleByName.get(demoUser.roleName);
    if (!role) continue;

    await prisma.userRole.upsert({
      where: { userId_roleId: { userId: user.id, roleId: role.id } },
      update: {},
      create: { userId: user.id, roleId: role.id },
    });
  }

  const producer = await prisma.user.findUnique({ where: { email: "producteur@gestion-studio.mg" } });

  const clientByKey = new Map<string, { id: string }>();
  for (const demoClient of DEMO_CLIENTS) {
    const client =
      (await prisma.client.findFirst({ where: { email: demoClient.email } })) ??
      (await prisma.client.create({
        data: {
          name: demoClient.name,
          segment: demoClient.segment,
          email: demoClient.email,
          phone: demoClient.phone,
          address: demoClient.address,
          notes: demoClient.notes,
          reliabilityScore: demoClient.reliabilityScore,
          createdById: producer?.id,
        },
      }));
    clientByKey.set(demoClient.key, client);
  }

  const year = new Date().getFullYear();
  let projectSequence = 1;
  const projectByKey = new Map<string, { id: string }>();
  for (const demoProject of DEMO_PROJECTS) {
    const client = clientByKey.get(demoProject.clientKey);
    if (!client) continue;

    const reference = `PROD-${year}-${projectSequence.toString().padStart(3, "0")}`;
    projectSequence += 1;

    const project =
      (await prisma.project.findUnique({ where: { reference } })) ??
      (await prisma.project.create({
        data: {
          reference,
          title: demoProject.title,
          serviceType: demoProject.serviceType,
          status: demoProject.status,
          description: demoProject.description,
          budgetAmount: demoProject.budgetAmount,
          budgetCurrency: demoProject.budgetCurrency,
          clientId: client.id,
          createdById: producer?.id,
        },
      }));
    projectByKey.set(demoProject.key, project);
  }

  const engineer = await prisma.user.findUnique({ where: { email: "ingenieur@gestion-studio.mg" } });
  const freelancer = await prisma.user.findUnique({ where: { email: "freelance@gestion-studio.mg" } });

  function inDays(days: number, hour: number, minute = 0): Date {
    const date = new Date();
    date.setDate(date.getDate() + days);
    date.setHours(hour, minute, 0, 0);
    return date;
  }

  interface DemoBooking {
    studio: StudioRoom;
    type: BookingType;
    title: string;
    startAt: Date;
    endAt: Date;
    projectKey?: string;
    engineerId?: string;
    notes?: string;
  }

  const DEMO_BOOKINGS: DemoBooking[] = [
    {
      studio: StudioRoom.STUDIO_A,
      type: BookingType.SESSION,
      title: "Session enregistrement — Tolotra Andriamahefa",
      startAt: inDays(1, 10, 0),
      endAt: inDays(1, 12, 0),
      projectKey: "tolotra_recording",
      engineerId: engineer?.id,
    },
    {
      studio: StudioRoom.STUDIO_A,
      type: BookingType.SESSION,
      title: "Mixage single 'Fitiavana'",
      startAt: inDays(2, 14, 0),
      endAt: inDays(2, 15, 30),
      projectKey: "tolotra_mixing",
      engineerId: engineer?.id,
    },
    {
      studio: StudioRoom.STUDIO_B,
      type: BookingType.SESSION,
      title: "Mastering EP live — Zaza Orkestra",
      startAt: inDays(1, 9, 0),
      endAt: inDays(1, 10, 0),
      projectKey: "zaza_mastering_ep",
      engineerId: engineer?.id,
    },
    {
      studio: StudioRoom.STUDIO_B,
      type: BookingType.UNAVAILABILITY,
      title: "Maintenance console de mixage",
      startAt: inDays(2, 8, 0),
      endAt: inDays(2, 13, 0),
      notes: "Intervention technicien — console indisponible.",
    },
    {
      studio: StudioRoom.STUDIO_C,
      type: BookingType.SESSION,
      title: "Post-production clip 'Tanindrazana'",
      startAt: inDays(3, 16, 0),
      endAt: inDays(3, 17, 0),
      projectKey: "mikea_postproduction",
      engineerId: engineer?.id,
    },
    {
      studio: StudioRoom.MOBILE,
      type: BookingType.SESSION,
      title: "Sonorisation séminaire — Jovena Madagascar",
      startAt: inDays(4, 18, 0),
      endAt: inDays(4, 21, 0),
      projectKey: "jovena_rental",
      engineerId: engineer?.id,
    },
    {
      studio: StudioRoom.MOBILE,
      type: BookingType.SESSION,
      title: "Mixage set enregistré — DJ Rado",
      startAt: inDays(6, 15, 0),
      endAt: inDays(6, 16, 30),
      projectKey: "djrado_mixing",
      engineerId: freelancer?.id,
    },
  ];

  for (const demoBooking of DEMO_BOOKINGS) {
    const alreadyExists = await prisma.booking.findFirst({
      where: { title: demoBooking.title, startAt: demoBooking.startAt },
    });
    if (alreadyExists) continue;

    const project = demoBooking.projectKey ? projectByKey.get(demoBooking.projectKey) : undefined;

    await prisma.booking.create({
      data: {
        studio: demoBooking.studio,
        type: demoBooking.type,
        title: demoBooking.title,
        startAt: demoBooking.startAt,
        endAt: demoBooking.endAt,
        projectId: project?.id,
        engineerId: demoBooking.engineerId,
        notes: demoBooking.notes,
        createdById: producer?.id,
      },
    });
  }

  console.log("Seed terminé. Comptes de démonstration (mot de passe commun : ChangeMe123!) :");
  for (const demoUser of DEMO_USERS) {
    console.log(`  - ${demoUser.email} (${demoUser.roleName})`);
  }
  console.log(`Clients de démonstration : ${DEMO_CLIENTS.length}`);
  console.log(`Projets de démonstration : ${DEMO_PROJECTS.length}`);
  console.log(`Réservations de démonstration : ${DEMO_BOOKINGS.length}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
