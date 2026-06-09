import { describe, expect, test } from "vitest";
import {
  createEntityId,
  createMapEntity,
  getEntitiesAtTile,
  putMapEntity,
  type MapEntityCollection,
} from "./map-entity.ts";

const entityCoordinate = { tileX: 2, tileY: 3 };
const otherCoordinate = { tileX: 3, tileY: 3 };

describe("map entity", () => {
  test("creates branded map entities with component records", () => {
    const entityId = createEntityId("door-1");
    const mapEntity = createMapEntity({
      components: new Map([["door", { isOpen: false, type: "door" }]]),
      id: entityId,
      position: entityCoordinate,
    });

    expect(mapEntity).toStrictEqual({
      components: new Map([["door", { isOpen: false, type: "door" }]]),
      id: entityId,
      position: entityCoordinate,
    });
  });

  test("stores and queries multiple entities at a tile", () => {
    const firstEntity = createMapEntity({
      components: new Map([["spawn", { faction: "enemy", type: "spawn" }]]),
      id: createEntityId("spawn-1"),
      position: entityCoordinate,
    });
    const secondEntity = createMapEntity({
      components: new Map([["script", { scriptId: "intro", type: "script" }]]),
      id: createEntityId("script-1"),
      position: entityCoordinate,
    });
    const otherEntity = createMapEntity({
      components: new Map([
        ["lootTable", { lootTableId: "chest", type: "lootTable" }],
      ]),
      id: createEntityId("loot-1"),
      position: otherCoordinate,
    });
    const entities = [
      firstEntity,
      secondEntity,
      otherEntity,
    ].reduce<MapEntityCollection>(
      (entityCollection, mapEntity) =>
        putMapEntity(entityCollection, mapEntity),
      new Map(),
    );

    expect(getEntitiesAtTile(entities, entityCoordinate)).toStrictEqual([
      firstEntity,
      secondEntity,
    ]);
  });
});
