import { PermissionAction, PermissionModule, PrismaClient } from "@prisma/client";
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

  console.log("Seed terminé. Comptes de démonstration (mot de passe commun : ChangeMe123!) :");
  for (const demoUser of DEMO_USERS) {
    console.log(`  - ${demoUser.email} (${demoUser.roleName})`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
