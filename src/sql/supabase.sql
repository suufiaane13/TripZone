-- SQL Setup for TripZone 🚌 (Updated with smart triggers)

-- 1. Table: trips
CREATE TABLE IF NOT EXISTS trips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    price INTEGER NOT NULL,
    date DATE NOT NULL,
    departure_time TIME NOT NULL,
    places_total INTEGER NOT NULL DEFAULT 20,
    places_reserved INTEGER NOT NULL DEFAULT 0,
    image_url TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Table: destinations
CREATE TABLE IF NOT EXISTS destinations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    order_index INTEGER NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Table: reservations
CREATE TABLE IF NOT EXISTS reservations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    persons INTEGER NOT NULL CHECK (persons > 0),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE destinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;

-- 5. Policies
DROP POLICY IF EXISTS "Allow public read trips" ON trips;
CREATE POLICY "Allow public read trips" ON trips FOR SELECT USING (status = 'active');

DROP POLICY IF EXISTS "Allow public read destinations" ON destinations;
CREATE POLICY "Allow public read destinations" ON destinations FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow admin manage trips" ON trips;
CREATE POLICY "Allow admin manage trips" ON trips FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow admin manage destinations" ON destinations;
CREATE POLICY "Allow admin manage destinations" ON destinations FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow public insert reservations" ON reservations;
CREATE POLICY "Allow public insert reservations" ON reservations FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow admin read reservations" ON reservations;
CREATE POLICY "Allow admin read reservations" ON reservations FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow admin update reservations" ON reservations;
CREATE POLICY "Allow admin update reservations" ON reservations FOR UPDATE USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow admin delete reservations" ON reservations;
CREATE POLICY "Allow admin delete reservations" ON reservations FOR DELETE USING (auth.role() = 'authenticated');

-- Pas deux demandes actives (pending / confirmé) avec le même nom + téléphone sur un trajet.
-- Les lignes « annulé » ne bloquent pas une nouvelle réservation (index partiel).
DROP INDEX IF EXISTS reservations_unique_active_contact_per_trip;
DROP INDEX IF EXISTS reservations_unique_name_phone_per_trip;
CREATE UNIQUE INDEX reservations_unique_active_contact_per_trip
ON public.reservations (
  trip_id,
  lower(trim(full_name)),
  lower(trim(phone))
)
WHERE status IN ('pending', 'confirmed');

-- 6. Trigger pour mettre à jour les places intelligemment
-- SECURITY DEFINER: le trigger tourne sinon avec le rôle session (anon) et l'UPDATE sur
-- `trips` est bloqué par RLS — d'où l'erreur RLS au moment d'une réservation publique.
CREATE OR REPLACE FUNCTION update_trip_places_smart()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    old_contrib INTEGER;
    new_contrib INTEGER;
    delta INTEGER;
BEGIN
    -- Seules les réservations **confirmées** par l’admin comptent dans places_reserved.
    -- Une demande « en attente » (pending) ne réduit pas les places jusqu’à confirmation.

    IF (TG_OP = 'INSERT') THEN
        IF (NEW.status = 'confirmed') THEN
            UPDATE trips
            SET places_reserved = places_reserved + NEW.persons
            WHERE id = NEW.trip_id;
        END IF;

    ELSIF (TG_OP = 'UPDATE') THEN
        old_contrib := CASE WHEN OLD.status = 'confirmed' THEN OLD.persons ELSE 0 END;
        new_contrib := CASE WHEN NEW.status = 'confirmed' THEN NEW.persons ELSE 0 END;
        delta := new_contrib - old_contrib;
        IF delta != 0 THEN
            UPDATE trips
            SET places_reserved = places_reserved + delta
            WHERE id = NEW.trip_id;
        END IF;

    ELSIF (TG_OP = 'DELETE') THEN
        IF (OLD.status = 'confirmed') THEN
            UPDATE trips
            SET places_reserved = GREATEST(0, places_reserved - OLD.persons)
            WHERE id = OLD.trip_id;
        END IF;
    END IF;

    RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS on_reservation_change ON reservations;
CREATE TRIGGER on_reservation_change
AFTER INSERT OR UPDATE OR DELETE ON reservations
FOR EACH ROW
EXECUTE FUNCTION update_trip_places_smart();

-- Si les places doublent encore : vérifier qu'il n'y a qu'un trigger utilisateur sur reservations
-- (deux triggers identiques ajouteraient deux fois les places). Dans SQL Editor :
-- SELECT tgname FROM pg_trigger WHERE tgrelid = 'public.reservations'::regclass AND NOT tgisinternal;

-- Recalcul global : places_reserved = somme (persons) des réservations confirmées uniquement.
-- À exécuter après mise à jour du trigger si la base contenait déjà des données.
UPDATE trips t
SET places_reserved = COALESCE((
    SELECT SUM(r.persons)::integer
    FROM reservations r
    WHERE r.trip_id = t.id AND r.status = 'confirmed'
), 0);

-- 6b. Réservation publique : insert + retour de l'id sans exposer SELECT sur toute la table
-- (INSERT ... RETURNING avec RLS exige une politique SELECT pour anon — ce RPC évite ça.)
DROP FUNCTION IF EXISTS public.create_public_reservation(uuid, text, text, integer);
CREATE OR REPLACE FUNCTION public.create_public_reservation(
  p_trip_id uuid,
  p_full_name text,
  p_phone text,
  p_persons integer
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_id uuid;
BEGIN
  IF p_persons IS NULL OR p_persons < 1 THEN
    RAISE EXCEPTION 'persons must be >= 1';
  END IF;

  BEGIN
    INSERT INTO reservations (trip_id, full_name, phone, persons)
    VALUES (p_trip_id, trim(p_full_name), trim(p_phone), p_persons)
    RETURNING id INTO new_id;
  EXCEPTION
    WHEN unique_violation THEN
      RAISE EXCEPTION 'Une réservation existe déjà pour ce trajet avec ce nom et ce numéro.';
  END;

  RETURN new_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_public_reservation(uuid, text, text, integer) TO anon;
GRANT EXECUTE ON FUNCTION public.create_public_reservation(uuid, text, text, integer) TO authenticated;

-- Totaux affichés : uniquement réservations confirmées (aligné sur places_reserved / trigger).
DROP FUNCTION IF EXISTS public.get_reserved_places_by_trip();
CREATE OR REPLACE FUNCTION public.get_reserved_places_by_trip()
RETURNS TABLE (trip_id uuid, places_reserved integer)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT r.trip_id, COALESCE(SUM(r.persons), 0)::integer AS places_reserved
  FROM reservations r
  WHERE r.status = 'confirmed'
  GROUP BY r.trip_id;
$$;

GRANT EXECUTE ON FUNCTION public.get_reserved_places_by_trip() TO anon;
GRANT EXECUTE ON FUNCTION public.get_reserved_places_by_trip() TO authenticated;

-- 7. Paramètres globaux du site (contacts publics dynamiques)
CREATE TABLE IF NOT EXISTS site_settings (
    id INTEGER PRIMARY KEY DEFAULT 1,
    instagram_url TEXT NOT NULL DEFAULT 'https://instagram.com/tripzone_oujda',
    whatsapp_number TEXT NOT NULL DEFAULT '212701730174',
    contact_email TEXT NOT NULL DEFAULT 'contact@tripzone.ma',
    contact_phone TEXT NOT NULL DEFAULT '+212 7 01 73 01 74',
    contact_city TEXT NOT NULL DEFAULT 'Oujda, Maroc',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT site_settings_singleton CHECK (id = 1)
);

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read site settings" ON site_settings;
CREATE POLICY "Allow public read site settings"
ON site_settings FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Allow admin manage site settings" ON site_settings;
CREATE POLICY "Allow admin manage site settings"
ON site_settings FOR ALL
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

INSERT INTO site_settings (id)
VALUES (1)
ON CONFLICT (id) DO NOTHING;
