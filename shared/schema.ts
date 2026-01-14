import { z } from "zod";

/*
  This schema represents the API response,
  not a database table.
*/

// -------- ADI SCORE --------
export const adiScoreSchema = z.object({
  state: z.string(),
  district: z.string(),
  pincode: z.string(),
  adiScore: z.number(),
  enrolmentDev: z.number(),
  demographicDev: z.number(),
  biometricDev: z.number(),
  ageShift: z.number(),
});

export type AdiScore = z.infer<typeof adiScoreSchema>;

// -------- REGION --------
export const regionSchema = z.object({
  state: z.string(),
  district: z.string(),
  pincode: z.string(),
});
export type Region = z.infer<typeof regionSchema>;

// -------- TIMELINE --------
export const timelinePointSchema = z.object({
  date: z.string(),
  value: z.number(),
  metric: z.string(),
});
export type TimelinePoint = z.infer<typeof timelinePointSchema>;

// -------- PATTERN --------
export const patternSchema = z.object({
  type: z.enum(["migration", "transition", "instability"]),
  region: regionSchema,
  confidence: z.number(),
  description: z.string(),
});
export type Pattern = z.infer<typeof patternSchema>;

// -------- PAGED RESPONSE (optional) --------
export type AdiResponse = {
  results: AdiScore[];
  total: number;
};
