// Resources
import { RediSearchSchema, SCHEMA_FIELD_TYPE } from "redis";
import { client } from ".";
import { debug } from "./lib/Debug";

export default async function Structure() {
  await createSchema(
    "idx:users",
    {
      "$.id": {
        type: SCHEMA_FIELD_TYPE.TEXT,
        AS: "id",
      },
      "$.name": {
        type: SCHEMA_FIELD_TYPE.TEXT,
        AS: "name",
      },
    },
    { prefix: "user" }
  );

  await createSchema(
    "idx:rooms",
    {
      "$.id": {
        type: SCHEMA_FIELD_TYPE.TEXT,
        AS: "room",
      },
    },
    { prefix: "room" }
  );
}

async function createSchema(
  key: string,
  structure: RediSearchSchema,
  options?: { prefix: string }
) {
  try {
    await client.ft.info(key);
    debug.warn(
      `Structure with key of '${key}' already exists, skipping creation.`
    );
    return;
  } catch {
    debug.success(`Creating structure with key of '${key}'.`);
  }

  await client.ft.create(key, structure, {
    ON: "JSON",
    ...(options?.prefix && { PREFIX: options.prefix }),
  });
}
