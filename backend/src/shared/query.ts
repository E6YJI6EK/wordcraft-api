import mongoose from "mongoose";
import z from "zod";
export enum SortDirection {
  ASC = "asc",
  DESC = "desc",
}
export const SortDirectionSchema = z.nativeEnum(SortDirection);

interface createQuerySchemaParams {
  allowedSortFields: string[];
  allowedFilterFields: string[];
}

export const createQuerySchema = (
  { allowedFilterFields, allowedSortFields }: createQuerySchemaParams = {
    allowedFilterFields: [],
    allowedSortFields: [],
  }
) => {
  return z.object({
    query: z.string().optional(),
    limit: z.number().min(1).default(10),
    page: z.number().min(1).default(1),
    sortDirection: SortDirectionSchema.optional().default(SortDirection.ASC),
    sortBy: z
      .string()
      .transform((value) => value)
      .refine(
        (value) => {
          if (value === undefined) return true;
          return allowedSortFields.includes(value);
        },
        {
          message: `Не допустимые поля для сортировки. Допустимые поля: ${allowedSortFields.join(
            ", "
          )}`,
        }
      ),
    filterBy: z
      .record(z.string(), z.any())
      .transform((value) => value)
      .refine(
        (value) => {
          if (value === undefined) return true;
          for (const key in value) {
            if (!allowedFilterFields.includes(key)) return false;
          }
          return true;
        },
        {
          message: `Не допустимые поля для фильтрации. Допустимые поля: ${allowedFilterFields.join(
            ", "
          )}`,
        }
      ),
  });
};

export type QueryParams<
  SortFields extends string,
  FilterFields extends string
> = {
  query?: string;
  limit: number;
  page: number;
  sortDirection: SortDirection;
  sortBy?: SortFields;
  filterBy?: Record<FilterFields, unknown>;
};

export const MongooseIdSchema = z.string().refine(
  (value) => {
    return mongoose.Types.ObjectId.isValid(value);
  },
  { message: "Неправильный Id" }
);
