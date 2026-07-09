import type { sessions, packages, packageFeatures } from "@/db/schema";
import type { InferSelectModel, InferInsertModel } from "drizzle-orm";

export type Session = InferSelectModel<typeof sessions>;
export type NewSession = InferInsertModel<typeof sessions>;
export type Package = InferSelectModel<typeof packages>;
export type NewPackage = InferInsertModel<typeof packages>;
export type PackageFeature = InferSelectModel<typeof packageFeatures>;
export type NewPackageFeature = InferInsertModel<typeof packageFeatures>;

export type SessionWithPackageCount = Session & { packageCount: number };
export type PackageWithFeatures = Package & { features: PackageFeature[] };
export type SessionWithPackages = Session & { packages: PackageWithFeatures[] };
