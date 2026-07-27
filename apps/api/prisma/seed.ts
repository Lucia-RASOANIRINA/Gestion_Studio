import {
  BookingType,
  ClientSegment,
  Currency,
  EmployeeStatus,
  EmployeeType,
  EquipmentCategory,
  EquipmentStatus,
  ExpenseCategory,
  InvoiceStatus,
  LeaveStatus,
  LeaveType,
  PaymentMethod,
  PermissionAction,
  PermissionModule,
  PrismaClient,
  ProjectStatus,
  ServiceType,
  StudioRoom,
  StudioStatus,
  StudioType,
} from "@prisma/client";
import crypto from "node:crypto";
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

interface DemoEquipment {
  name: string;
  category: EquipmentCategory;
  serialNumber: string;
  status: EquipmentStatus;
  studio?: StudioRoom;
  purchaseDate: string;
  purchasePrice: number;
  currentValue: number;
  notes?: string;
}

const DEMO_EQUIPMENT: DemoEquipment[] = [
  {
    name: "Neumann U87 Ai",
    category: EquipmentCategory.MICROPHONE,
    serialNumber: "NU87-000112",
    status: EquipmentStatus.AVAILABLE,
    studio: StudioRoom.STUDIO_A,
    purchaseDate: "2022-03-15",
    purchasePrice: 12000000,
    currentValue: 9500000,
    notes: "Micro de référence pour les voix lead.",
  },
  {
    name: "Shure SM7B",
    category: EquipmentCategory.MICROPHONE,
    serialNumber: "SM7B-004521",
    status: EquipmentStatus.IN_USE,
    studio: StudioRoom.STUDIO_B,
    purchaseDate: "2023-01-10",
    purchasePrice: 1800000,
    currentValue: 1500000,
    notes: "Voix off et podcasts.",
  },
  {
    name: "SSL SiX",
    category: EquipmentCategory.CONSOLE,
    serialNumber: "SSLSIX-00987",
    status: EquipmentStatus.AVAILABLE,
    studio: StudioRoom.STUDIO_A,
    purchaseDate: "2021-11-20",
    purchasePrice: 7500000,
    currentValue: 5800000,
    notes: "Console de mixage analogique compacte.",
  },
  {
    name: "Universal Audio Apollo x8",
    category: EquipmentCategory.INTERFACE,
    serialNumber: "UAX8-112233",
    status: EquipmentStatus.AVAILABLE,
    studio: StudioRoom.STUDIO_A,
    purchaseDate: "2022-06-05",
    purchasePrice: 9000000,
    currentValue: 7200000,
    notes: "Interface audio 8 entrées, DSP intégré.",
  },
  {
    name: "Yamaha HS8 (paire)",
    category: EquipmentCategory.MONITOR,
    serialNumber: "HS8-778812",
    status: EquipmentStatus.IN_USE,
    studio: StudioRoom.STUDIO_B,
    purchaseDate: "2020-09-12",
    purchasePrice: 2400000,
    currentValue: 1600000,
    notes: "Moniteurs de proximité, studio B.",
  },
  {
    name: "Fender Stratocaster",
    category: EquipmentCategory.INSTRUMENT,
    serialNumber: "FEND-556677",
    status: EquipmentStatus.AVAILABLE,
    studio: StudioRoom.STUDIO_C,
    purchaseDate: "2019-04-25",
    purchasePrice: 4200000,
    currentValue: 3000000,
    notes: "Guitare électrique pour sessions.",
  },
  {
    name: "Console live Allen & Heath SQ-6",
    category: EquipmentCategory.CONSOLE,
    serialNumber: "SQ6-443322",
    status: EquipmentStatus.MAINTENANCE,
    studio: StudioRoom.MOBILE,
    purchaseDate: "2021-02-18",
    purchasePrice: 11000000,
    currentValue: 8000000,
    notes: "En maintenance — révision des faders motorisés.",
  },
  {
    name: "Snake numérique 32 canaux",
    category: EquipmentCategory.CABLE,
    serialNumber: "SNK32-990011",
    status: EquipmentStatus.AVAILABLE,
    studio: StudioRoom.MOBILE,
    purchaseDate: "2020-07-30",
    purchasePrice: 1500000,
    currentValue: 900000,
    notes: "Sonorisation live et prestations mobiles.",
  },
];

interface DemoConsumable {
  name: string;
  unit: string;
  quantity: number;
  lowStockThreshold: number;
  notes?: string;
}

const DEMO_CONSUMABLES: DemoConsumable[] = [
  {
    name: "Câble XLR 3m",
    unit: "unité",
    quantity: 45,
    lowStockThreshold: 15,
    notes: "Câbles micro standard.",
  },
  {
    name: "Câble Jack 6.35mm 3m",
    unit: "unité",
    quantity: 30,
    lowStockThreshold: 10,
    notes: "Instruments et matériel.",
  },
  {
    name: "Piles AA (lot)",
    unit: "lot",
    quantity: 8,
    lowStockThreshold: 12,
    notes: "Micros HF — stock bas, à recommander.",
  },
  {
    name: "Piles 9V",
    unit: "unité",
    quantity: 6,
    lowStockThreshold: 10,
    notes: "Boîtiers DI actifs — stock bas.",
  },
  {
    name: "Bonnette anti-pop",
    unit: "unité",
    quantity: 20,
    lowStockThreshold: 5,
    notes: "Accessoires micro voix.",
  },
  {
    name: "Carte SD 128 Go",
    unit: "unité",
    quantity: 12,
    lowStockThreshold: 4,
    notes: "Enregistreurs portables.",
  },
  {
    name: "Ruban gaffer noir",
    unit: "rouleau",
    quantity: 25,
    lowStockThreshold: 8,
    notes: "Fixation câbles sur scène.",
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

  const soundEngineer = engineer;
  for (const demoEquipment of DEMO_EQUIPMENT) {
    const alreadyExists = await prisma.equipment.findFirst({
      where: { serialNumber: demoEquipment.serialNumber },
    });
    if (alreadyExists) continue;

    await prisma.equipment.create({
      data: {
        name: demoEquipment.name,
        category: demoEquipment.category,
        serialNumber: demoEquipment.serialNumber,
        status: demoEquipment.status,
        studio: demoEquipment.studio,
        purchaseDate: new Date(demoEquipment.purchaseDate),
        purchasePrice: demoEquipment.purchasePrice,
        currentValue: demoEquipment.currentValue,
        notes: demoEquipment.notes,
        createdById: soundEngineer?.id ?? producer?.id,
      },
    });
  }

  for (const demoConsumable of DEMO_CONSUMABLES) {
    const alreadyExists = await prisma.consumable.findFirst({
      where: { name: demoConsumable.name },
    });
    if (alreadyExists) continue;

    await prisma.consumable.create({
      data: {
        name: demoConsumable.name,
        unit: demoConsumable.unit,
        quantity: demoConsumable.quantity,
        lowStockThreshold: demoConsumable.lowStockThreshold,
        notes: demoConsumable.notes,
        createdById: soundEngineer?.id ?? producer?.id,
      },
    });
  }

  interface DemoInvoiceItem {
    description: string;
    quantity: number;
    unitPrice: number;
  }
  interface DemoInvoice {
    reference: string;
    clientKey: string;
    projectKey?: string;
    status: InvoiceStatus;
    taxRate: number;
    dueInDays: number;
    items: DemoInvoiceItem[];
    payment?: { amount: number; method: PaymentMethod };
  }

  const invoiceYear = new Date().getFullYear();
  const DEMO_INVOICES: DemoInvoice[] = [
    {
      reference: `FAC-${invoiceYear}-001`,
      clientKey: "tolotra",
      projectKey: "tolotra_mixing",
      status: InvoiceStatus.PAID,
      taxRate: 20,
      dueInDays: -10,
      items: [{ description: "Mixage single 'Fitiavana'", quantity: 1, unitPrice: 800000 }],
      payment: { amount: 960000, method: PaymentMethod.MOBILE_MONEY },
    },
    {
      reference: `FAC-${invoiceYear}-002`,
      clientKey: "saha_communication",
      projectKey: "saha_voiceover",
      status: InvoiceStatus.SENT,
      taxRate: 20,
      dueInDays: 15,
      items: [
        { description: "Voix off FR/MG spot radio 30s", quantity: 1, unitPrice: 450000 },
        { description: "Session studio (heures)", quantity: 3, unitPrice: 60000 },
      ],
    },
    {
      reference: `FAC-${invoiceYear}-003`,
      clientKey: "jovena",
      projectKey: "jovena_rental",
      status: InvoiceStatus.PARTIAL,
      taxRate: 20,
      dueInDays: 20,
      items: [
        { description: "Location console + enceintes", quantity: 1, unitPrice: 1200000 },
        { description: "Micros HF (unités)", quantity: 6, unitPrice: 100000 },
      ],
      payment: { amount: 1000000, method: PaymentMethod.BANK_TRANSFER },
    },
    {
      reference: `FAC-${invoiceYear}-004`,
      clientKey: "mikea_records",
      projectKey: "mikea_postproduction",
      status: InvoiceStatus.OVERDUE,
      taxRate: 20,
      dueInDays: -5,
      items: [{ description: "Post-production clip 'Tanindrazana'", quantity: 1, unitPrice: 2100000 }],
    },
    {
      reference: `FAC-${invoiceYear}-005`,
      clientKey: "zaza_orkestra",
      status: InvoiceStatus.DRAFT,
      taxRate: 20,
      dueInDays: 30,
      items: [{ description: "Mastering album studio", quantity: 1, unitPrice: 1400000 }],
    },
  ];

  for (const demoInvoice of DEMO_INVOICES) {
    const alreadyExists = await prisma.invoice.findUnique({ where: { reference: demoInvoice.reference } });
    if (alreadyExists) continue;

    const client = clientByKey.get(demoInvoice.clientKey);
    if (!client) continue;
    const project = demoInvoice.projectKey ? projectByKey.get(demoInvoice.projectKey) : undefined;

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + demoInvoice.dueInDays);

    const invoice = await prisma.invoice.create({
      data: {
        reference: demoInvoice.reference,
        clientId: client.id,
        projectId: project?.id,
        status: demoInvoice.status,
        taxRate: demoInvoice.taxRate,
        currency: Currency.MGA,
        dueDate,
        createdById: producer?.id,
        items: { create: demoInvoice.items },
      },
    });

    if (demoInvoice.payment) {
      await prisma.payment.create({
        data: {
          invoiceId: invoice.id,
          amount: demoInvoice.payment.amount,
          method: demoInvoice.payment.method,
          createdById: producer?.id,
        },
      });
    }
  }

  // Backfill idempotent des points de fidélité : 1 pt / 10 000 Ar effectivement payés.
  const allInvoices = await prisma.invoice.findMany({
    select: { clientId: true, payments: { select: { amount: true } } },
  });
  const paidByClient = new Map<string, number>();
  for (const inv of allInvoices) {
    const paid = inv.payments.reduce((sum, p) => sum + Number(p.amount), 0);
    paidByClient.set(inv.clientId, (paidByClient.get(inv.clientId) ?? 0) + paid);
  }
  for (const [clientId, paid] of paidByClient) {
    await prisma.client.update({
      where: { id: clientId },
      data: { loyaltyPoints: Math.floor(paid / 10000) },
    });
  }

  interface DemoExpense {
    label: string;
    category: ExpenseCategory;
    amount: number;
    monthsAgo: number;
  }
  const DEMO_EXPENSES: DemoExpense[] = [
    { label: "Salaires équipe (mensuel)", category: ExpenseCategory.SALARY, amount: 4500000, monthsAgo: 0 },
    { label: "Loyer studio", category: ExpenseCategory.RENT, amount: 1200000, monthsAgo: 0 },
    { label: "Électricité JIRAMA", category: ExpenseCategory.ELECTRICITY, amount: 350000, monthsAgo: 0 },
    { label: "Abonnement Internet fibre", category: ExpenseCategory.INTERNET, amount: 180000, monthsAgo: 0 },
    { label: "Maintenance console SQ-6", category: ExpenseCategory.MAINTENANCE, amount: 600000, monthsAgo: 1 },
    { label: "Salaires équipe (mensuel)", category: ExpenseCategory.SALARY, amount: 4500000, monthsAgo: 1 },
    { label: "Achat câbles & consommables", category: ExpenseCategory.SUPPLIES, amount: 250000, monthsAgo: 1 },
    { label: "Taxe professionnelle", category: ExpenseCategory.TAX, amount: 800000, monthsAgo: 2 },
  ];

  for (const demoExpense of DEMO_EXPENSES) {
    const incurredAt = new Date();
    incurredAt.setMonth(incurredAt.getMonth() - demoExpense.monthsAgo);
    const exists = await prisma.expense.findFirst({
      where: {
        label: demoExpense.label,
        category: demoExpense.category,
        incurredAt: {
          gte: new Date(incurredAt.getFullYear(), incurredAt.getMonth(), 1),
          lt: new Date(incurredAt.getFullYear(), incurredAt.getMonth() + 1, 1),
        },
      },
    });
    if (exists) continue;
    await prisma.expense.create({
      data: {
        label: demoExpense.label,
        category: demoExpense.category,
        amount: demoExpense.amount,
        incurredAt,
        createdById: producer?.id,
      },
    });
  }

  interface DemoStudio {
    name: string;
    type: StudioType;
    capacity: number;
    hourlyPrice: number;
    status: StudioStatus;
    description: string;
    equipmentSummary: string;
  }
  const DEMO_STUDIOS: DemoStudio[] = [
    { name: "Studio A", type: StudioType.RECORDING, capacity: 6, hourlyPrice: 80000, status: StudioStatus.AVAILABLE, description: "Grande cabine d'enregistrement, régie SSL.", equipmentSummary: "Neumann U87, SSL SiX, UA Apollo x8" },
    { name: "Studio B", type: StudioType.RECORDING, capacity: 3, hourlyPrice: 50000, status: StudioStatus.AVAILABLE, description: "Cabine voix / podcast.", equipmentSummary: "Shure SM7B, Yamaha HS8" },
    { name: "Studio C", type: StudioType.REHEARSAL, capacity: 8, hourlyPrice: 40000, status: StudioStatus.AVAILABLE, description: "Salle de répétition / prises live.", equipmentSummary: "Backline, Fender Stratocaster" },
    { name: "Studio Podcast", type: StudioType.PODCAST, capacity: 4, hourlyPrice: 45000, status: StudioStatus.AVAILABLE, description: "Plateau podcast 4 micros.", equipmentSummary: "4x micros dynamiques, table de mixage" },
    { name: "Régie Mobile", type: StudioType.LIVE, capacity: 20, hourlyPrice: 150000, status: StudioStatus.MAINTENANCE, description: "Sonorisation live et prestations extérieures.", equipmentSummary: "Console Allen & Heath SQ-6, snake 32 canaux" },
  ];

  for (const demoStudio of DEMO_STUDIOS) {
    const exists = await prisma.studio.findFirst({ where: { name: demoStudio.name } });
    if (exists) continue;
    await prisma.studio.create({ data: { ...demoStudio, createdById: producer?.id } });
  }

  // Planifie une maintenance imminente + historique sur la console live (démo alerte).
  const sqConsole = await prisma.equipment.findFirst({ where: { serialNumber: "SQ6-443322" } });
  if (sqConsole) {
    const soon = new Date();
    soon.setDate(soon.getDate() + 10);
    await prisma.equipment.update({
      where: { id: sqConsole.id },
      data: { nextMaintenanceAt: soon, brand: "Allen & Heath", model: "SQ-6", location: "Régie Mobile" },
    });
    const hasRecord = await prisma.maintenanceRecord.findFirst({ where: { equipmentId: sqConsole.id } });
    if (!hasRecord) {
      await prisma.maintenanceRecord.create({
        data: {
          equipmentId: sqConsole.id,
          description: "Révision des faders motorisés",
          cost: 350000,
          technician: "Rado Technicien",
          partsReplaced: "2 faders",
          createdById: producer?.id,
        },
      });
    }
  }

  interface DemoEmployee {
    firstName: string;
    lastName: string;
    position: string;
    type: EmployeeType;
    dailyRate: number;
    leave?: { type: LeaveType; startInDays: number; days: number; status: LeaveStatus; reason: string };
  }
  const DEMO_EMPLOYEES: DemoEmployee[] = [
    { firstName: "Tojo", lastName: "Andrianina", position: "Ingénieur du son", type: EmployeeType.EMPLOYEE, dailyRate: 120000, leave: { type: LeaveType.LEAVE, startInDays: 5, days: 3, status: LeaveStatus.APPROVED, reason: "Congés annuels" } },
    { firstName: "Mialy", lastName: "Ravelojaona", position: "Beatmaker freelance", type: EmployeeType.FREELANCE, dailyRate: 90000, leave: { type: LeaveType.OVERTIME, startInDays: -2, days: 1, status: LeaveStatus.PENDING, reason: "Session nocturne" } },
    { firstName: "Hery", lastName: "Rakoto", position: "Producteur", type: EmployeeType.EMPLOYEE, dailyRate: 150000 },
    { firstName: "Fara", lastName: "Razafindrakoto", position: "Chargée commerciale", type: EmployeeType.EMPLOYEE, dailyRate: 80000, leave: { type: LeaveType.SICK, startInDays: -1, days: 2, status: LeaveStatus.APPROVED, reason: "Maladie" } },
    { firstName: "Rado", lastName: "Technicien", position: "Technicien maintenance", type: EmployeeType.FREELANCE, dailyRate: 70000 },
  ];

  for (const demoEmployee of DEMO_EMPLOYEES) {
    const exists = await prisma.employee.findFirst({
      where: { firstName: demoEmployee.firstName, lastName: demoEmployee.lastName },
    });
    if (exists) continue;
    const employee = await prisma.employee.create({
      data: {
        firstName: demoEmployee.firstName,
        lastName: demoEmployee.lastName,
        position: demoEmployee.position,
        type: demoEmployee.type,
        dailyRate: demoEmployee.dailyRate,
        status: EmployeeStatus.ACTIVE,
        createdById: producer?.id,
      },
    });
    if (demoEmployee.leave) {
      const start = new Date();
      start.setDate(start.getDate() + demoEmployee.leave.startInDays);
      const end = new Date(start);
      end.setDate(end.getDate() + demoEmployee.leave.days);
      await prisma.leaveRequest.create({
        data: {
          employeeId: employee.id,
          type: demoEmployee.leave.type,
          startDate: start,
          endDate: end,
          status: demoEmployee.leave.status,
          reason: demoEmployee.leave.reason,
        },
      });
    }
  }

  // Backfill des badges clients et tickets de réservation (codes uniques).
  const randomCode = (prefix: string) =>
    `${prefix}${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
  const clientsWithoutBadge = await prisma.client.findMany({ where: { badgeCode: null }, select: { id: true } });
  for (const c of clientsWithoutBadge) {
    await prisma.client.update({ where: { id: c.id }, data: { badgeCode: randomCode("GS-C-") } });
  }
  const bookingsWithoutTicket = await prisma.booking.findMany({ where: { ticketCode: null }, select: { id: true } });
  for (const b of bookingsWithoutTicket) {
    await prisma.booking.update({ where: { id: b.id }, data: { ticketCode: randomCode("GS-T-") } });
  }

  // Fil de notifications de démonstration (si vide) : quelques événements récents.
  const notifCount = await prisma.notification.count();
  if (notifCount === 0) {
    const admin = await prisma.user.findUnique({ where: { email: "admin@gestion-studio.mg" } });
    const actorName = admin ? "Admin Gestion Studio" : null;
    const firstClient = await prisma.client.findFirst();
    const firstProject = await prisma.project.findFirst();
    const firstInvoice = await prisma.invoice.findFirst();
    const demoNotifs = [
      { action: "clients.create", entity: "Client", entityId: firstClient?.id },
      { action: "projects.create", entity: "Project", entityId: firstProject?.id },
      { action: "billing.invoice.create", entity: "Invoice", entityId: firstInvoice?.id },
      { action: "billing.payment.create", entity: "Invoice", entityId: firstInvoice?.id },
      { action: "auth.login", entity: "User", entityId: admin?.id },
    ];
    for (const n of demoNotifs) {
      await prisma.notification.create({
        data: { action: n.action, entity: n.entity, entityId: n.entityId ?? null, actorId: admin?.id, actorName },
      });
    }
  }

  console.log("Seed terminé. Comptes de démonstration (mot de passe commun : ChangeMe123!) :");
  for (const demoUser of DEMO_USERS) {
    console.log(`  - ${demoUser.email} (${demoUser.roleName})`);
  }
  console.log(`Clients de démonstration : ${DEMO_CLIENTS.length}`);
  console.log(`Projets de démonstration : ${DEMO_PROJECTS.length}`);
  console.log(`Réservations de démonstration : ${DEMO_BOOKINGS.length}`);
  console.log(`Matériel de démonstration : ${DEMO_EQUIPMENT.length}`);
  console.log(`Consommables de démonstration : ${DEMO_CONSUMABLES.length}`);
  console.log(`Factures de démonstration : ${DEMO_INVOICES.length}`);
  console.log(`Dépenses de démonstration : ${DEMO_EXPENSES.length}`);
  console.log(`Studios de démonstration : ${DEMO_STUDIOS.length}`);
  console.log(`Employés de démonstration : ${DEMO_EMPLOYEES.length}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
