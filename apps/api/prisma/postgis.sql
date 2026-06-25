-- Run once after `npx prisma migrate dev`:
--   psql "$DATABASE_URL" -f prisma/postgis.sql
--
-- Prisma doesn't model PostGIS geography columns natively, so the spatial
-- column + radius search function are managed here instead of in schema.prisma.

CREATE EXTENSION IF NOT EXISTS postgis;

ALTER TABLE warehouses
  ADD COLUMN IF NOT EXISTS geog geography(Point, 4326);

CREATE INDEX IF NOT EXISTS warehouses_geog_idx ON warehouses USING GIST (geog);

-- Keep geog in sync whenever latitude/longitude change.
CREATE OR REPLACE FUNCTION warehouses_sync_geog() RETURNS trigger AS $$
BEGIN
  NEW.geog := ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326)::geography;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS warehouses_geog_trigger ON warehouses;
CREATE TRIGGER warehouses_geog_trigger
  BEFORE INSERT OR UPDATE OF latitude, longitude ON warehouses
  FOR EACH ROW EXECUTE FUNCTION warehouses_sync_geog();

-- Backfill existing rows.
UPDATE warehouses SET geog = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography;

-- Example radius query used by WarehousesService.findWithinRadius():
--   SELECT id, name, ST_Distance(geog, ST_MakePoint($1, $2)::geography) / 1609.34 AS distance_miles
--   FROM warehouses
--   WHERE ST_DWithin(geog, ST_MakePoint($1, $2)::geography, $3 * 1609.34)
--   ORDER BY distance_miles ASC;
