import { type Brand, brand } from "@bruff/utils";

import type { TileCoordinate } from "../model/tile-map-data.ts";

/**
 * Branded map entity identifier.
 */
export type EntityId = Brand<string, "EntityId">;

/**
 * Door metadata component.
 */
export type DoorComponent = Readonly<{
  type: "door";
  isOpen: boolean;
}>;

/**
 * Spawn point metadata component.
 */
export type SpawnComponent = Readonly<{
  type: "spawn";
  faction: string;
}>;

/**
 * Script hook metadata component.
 */
export type ScriptComponent = Readonly<{
  type: "script";
  scriptId: string;
}>;

/**
 * Loot table metadata component.
 */
export type LootTableComponent = Readonly<{
  type: "lootTable";
  lootTableId: string;
}>;

/**
 * Map entity component variants.
 */
export type EntityComponent =
  DoorComponent | SpawnComponent | ScriptComponent | LootTableComponent;

/**
 * Map entity component map keys.
 */
export type ComponentType = EntityComponent["type"];

/**
 * Semantic metadata entity stored outside tile layers.
 */
export type MapEntity = Readonly<{
  id: EntityId;
  position: TileCoordinate;
  components: ReadonlyMap<ComponentType, EntityComponent>;
}>;

/**
 * Input for creating a map entity.
 */
export type CreateMapEntityInput = Readonly<{
  id: EntityId;
  position: TileCoordinate;
  components: ReadonlyMap<ComponentType, EntityComponent>;
}>;

/**
 * Map entity collection keyed by entity ID.
 */
export type MapEntityCollection = ReadonlyMap<EntityId, MapEntity>;

/**
 * Creates a branded entity ID.
 */
export const createEntityId = (entityId: string): EntityId =>
  brand<"EntityId", string>(entityId);

/**
 * Creates a map entity record.
 */
export const createMapEntity = (input: CreateMapEntityInput): MapEntity => ({
  components: input.components,
  id: input.id,
  position: input.position,
});

/**
 * Returns a collection with the entity stored by ID.
 */
export const putMapEntity = (
  entities: MapEntityCollection,
  mapEntity: MapEntity,
): MapEntityCollection => {
  const updatedEntities = new Map(entities);
  updatedEntities.set(mapEntity.id, mapEntity);
  return updatedEntities;
};

/**
 * Gets every entity positioned on the requested tile.
 */
export const getEntitiesAtTile = (
  entities: MapEntityCollection,
  tileCoordinate: TileCoordinate,
): ReadonlyArray<MapEntity> =>
  entities
    .values()
    .filter(
      (mapEntity) =>
        mapEntity.position.tileX === tileCoordinate.tileX &&
        mapEntity.position.tileY === tileCoordinate.tileY,
    )
    .toArray();
