/** Shared picklists for admin “new profile” modals (align labels with what you store in Postgres). */

export const ENTITY_ACTIVE_INACTIVE_OPTIONS = ["Active", "Inactive"] as const;

export const PARTNER_TYPE_OPTIONS = [
  "Government",
  "NGO",
  "Corporate",
  "Faith-based",
  "School",
  "Individual",
  "International",
  "Other",
] as const;

export const PARTNER_ROLE_TYPE_OPTIONS = [
  "Funding partner",
  "Service provider",
  "Referral source",
  "Volunteer",
  "Advocacy",
  "Training",
  "In-kind donor",
  "Other",
] as const;

export const SUPPORTER_TYPE_OPTIONS = [
  "Individual",
  "Organization",
  "Foundation",
  "Church",
  "Corporate",
  "Anonymous",
  "Other",
] as const;

export const SUPPORTER_RELATIONSHIP_OPTIONS = [
  "Friend",
  "Family",
  "Alumni",
  "Community member",
  "Volunteer",
  "Staff referral",
  "Former resident",
  "Other",
] as const;

export const SUPPORTER_ACQUISITION_CHANNEL_OPTIONS = [
  "Website",
  "Social media",
  "Event",
  "Referral",
  "Direct mail",
  "Walk-in",
  "Phone",
  "Other",
] as const;
