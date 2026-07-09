import {
  pgTable,
  serial,
  varchar,
  text,
  integer,
  boolean,
  numeric,
  timestamp,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ── Sessions ──────────────────────────────────────────────────────────────────
export const sessions = pgTable("sessions", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description").default(""),
  category: varchar("category", { length: 255 }).default(""),
  image: text("image").default(""),
  featured: boolean("featured").default(false).notNull(),
  displayOrder: integer("display_order").default(0).notNull(),
  active: boolean("active").default(true).notNull(),
  deletedAt: timestamp("deleted_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const sessionsRelations = relations(sessions, ({ many }) => ({
  packages: many(packages),
}));

// ── Packages ──────────────────────────────────────────────────────────────────
export const packages = pgTable("packages", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id")
    .notNull()
    .references(() => sessions.id, { onDelete: "restrict" }),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description").default(""),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  duration: varchar("duration", { length: 100 }).notNull(),
  maxPeople: integer("max_people").default(1),
  editedPhotos: integer("edited_photos").default(0),
  outfitChanges: integer("outfit_changes").default(1),
  locations: integer("locations").default(1),
  deliveryTime: varchar("delivery_time", { length: 100 }).default("3 Days"),
  onlineGallery: boolean("online_gallery").default(false).notNull(),
  rawImages: boolean("raw_images").default(false).notNull(),
  printing: boolean("printing").default(false).notNull(),
  transportation: boolean("transportation").default(false).notNull(),
  droneCoverage: boolean("drone_coverage").default(false).notNull(),
  priorityEditing: boolean("priority_editing").default(false).notNull(),
  depositPercentage: integer("deposit_percentage").default(50).notNull(),
  rescheduleAllowed: boolean("reschedule_allowed").default(true).notNull(),
  rescheduleHours: integer("reschedule_hours").default(48),
  displayOrder: integer("display_order").default(0).notNull(),
  active: boolean("active").default(true).notNull(),
  deletedAt: timestamp("deleted_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const packagesRelations = relations(packages, ({ one, many }) => ({
  session: one(sessions, {
    fields: [packages.sessionId],
    references: [sessions.id],
  }),
  features: many(packageFeatures),
}));

// ── Package Features ──────────────────────────────────────────────────────────
export const packageFeatures = pgTable("package_features", {
  id: serial("id").primaryKey(),
  packageId: integer("package_id")
    .notNull()
    .references(() => packages.id, { onDelete: "cascade" }),
  feature: varchar("feature", { length: 255 }).notNull(),
  displayOrder: integer("display_order").default(0).notNull(),
});

export const packageFeaturesRelations = relations(
  packageFeatures,
  ({ one }) => ({
    package: one(packages, {
      fields: [packageFeatures.packageId],
      references: [packages.id],
    }),
  })
);
